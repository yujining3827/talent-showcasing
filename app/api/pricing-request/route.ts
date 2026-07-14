import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

/* ============================================================================
 *  /pricing 인재 추천 요청 접수
 *   - Supabase(pricing_requests 테이블)에 저장 (service_role)
 *   - Slack Incoming Webhook 으로 담당자에게 즉시 알림
 *  ⚠️ 필요 env:
 *     - 저장: PRICING_SUPABASE_URL + PRICING_SUPABASE_SERVICE_ROLE_KEY (전용 프로젝트)
 *             없으면 NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY 로 폴백
 *     - 알림: SLACK_WEBHOOK_URL
 *  ⚠️ 테이블 생성 SQL은 아래 파일 하단 주석 참고
 * ========================================================================== */
type Body = {
  name?: string;
  company?: string;
  contact?: string;
  roles?: string[];
  workType?: string;
  duration?: string;
  startTime?: string;
  industry?: string;
  jd?: string;
  jdUrl?: string;
  jdFileName?: string | null;
  jdFileUrl?: string | null; // Storage 업로드된 PDF 공개 URL
  consent?: boolean;
  // 특정 인재 문의(상세 페이지 진입) 시
  talentId?: string | null;
  talentName?: string | null;
  talentRole?: string | null;
  interviewSlots?: { date: string; times: string[] }[];
  interviewNote?: string;
  // 유입 추적 (UTM / 광고 클릭 ID)
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  utm_content?: string | null;
  fbclid?: string | null;
};

export async function POST(req: Request) {
  let body: Body;
  let jdFile: File | null = null;
  try {
    const ct = req.headers.get("content-type") || "";
    if (ct.includes("multipart/form-data")) {
      const fd = await req.formData();
      body = JSON.parse(String(fd.get("data") || "{}"));
      const f = fd.get("jdFile");
      if (f && typeof f !== "string") jdFile = f;
    } else {
      body = await req.json();
    }
  } catch {
    return NextResponse.json({ ok: false, error: "invalid request" }, { status: 400 });
  }

  const { name, company, contact, roles = [], workType, duration, startTime, industry, jd, jdUrl, jdFileName, consent,
    talentId, talentName, talentRole, interviewSlots = [], interviewNote,
    utm_source, utm_medium, utm_campaign, utm_content, fbclid } = body;

  // 필수: 담당자·기업·연락처·동의
  if (!name?.trim() || !company?.trim() || !contact?.trim() || !consent) {
    return NextResponse.json({ ok: false, error: "필수 항목이 누락되었습니다." }, { status: 400 });
  }

  // 1) Supabase 저장
  //   pricing 전용 프로젝트(PRICING_SUPABASE_*)가 있으면 그걸, 없으면 앱 기본 DB 사용
  const sbUrl = process.env.PRICING_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const sbKey = process.env.PRICING_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(sbUrl, sbKey);

  // 0) JD PDF 첨부 → Storage(pricing-jd) 업로드 (service_role, RLS 우회). 실패해도 접수는 계속
  let jdFileUrl: string | null = null;
  if (jdFile) {
    try {
      const safe = (jdFile.name || "jd.pdf").replace(/[^\w.\-]+/g, "_");
      const path = `${Date.now()}-${safe}`;
      const buf = new Uint8Array(await jdFile.arrayBuffer());
      const { error: upErr } = await supabase.storage
        .from("pricing-jd")
        .upload(path, buf, { contentType: jdFile.type || "application/pdf", upsert: false });
      if (upErr) console.error("[pricing-request] JD upload error:", upErr.message);
      else jdFileUrl = supabase.storage.from("pricing-jd").getPublicUrl(path).data.publicUrl;
    } catch (e) {
      console.error("[pricing-request] JD upload exception:", e);
    }
  }

  // 1) Supabase 저장
  let saved = false;
  let saveError: string | null = null;
  let insertedId: string | null = null;
  try {
    const { data, error } = await supabase.from("pricing_requests").insert({
      name: name.trim(),
      company: company.trim(),
      contact: contact.trim(),
      roles,
      work_type: workType || null,
      duration: duration || null,
      start_time: startTime || null,
      industry: industry || null,
      jd: jd || null,
      jd_url: jdUrl || null,
      jd_file_name: jdFileName || null,
      jd_file_url: jdFileUrl || null,
      consent: true,
      talent_id: talentId || null,
      talent_name: talentName || null,
      talent_role: talentRole || null,
      interview_slots: interviewSlots.length ? interviewSlots : null,
      interview_note: interviewNote || null,
      utm_source: utm_source || null,
      utm_medium: utm_medium || null,
      utm_campaign: utm_campaign || null,
      utm_content: utm_content || null,
      fbclid: fbclid || null,
    }).select("id").single();
    if (error) saveError = error.message;
    else { saved = true; insertedId = data?.id ?? null; }
  } catch (e) {
    saveError = e instanceof Error ? e.message : String(e);
  }
  if (saveError) console.error("[pricing-request] save error:", saveError);

  // 2) Slack 알림
  let slackSent = false;
  const webhook = process.env.SLACK_WEBHOOK_URL;
  if (webhook) {
    try {
      const slotsText = interviewSlots
        .filter((s) => s.date && s.times.length)
        .map((s) => `${s.date} (${s.times.join(", ")})`)
        .join(" / ");
      const lines = [
        talentName ? "🎯 *특정 인재 채용 문의가 접수되었습니다*" : "🎯 *새 인재 추천 요청이 접수되었습니다*",
        talentName ? `• *문의 인재:* ${talentName}${talentRole ? ` · ${talentRole}` : ""}` : null,
        `• *담당자:* ${name}  |  *기업:* ${company}`,
        `• *연락처:* ${contact}`,
        slotsText ? `• *희망 면접:* ${slotsText}` : null,
        interviewNote ? `• *면접 요청사항:* ${interviewNote}` : null,
        roles.length ? `• *관심 직무:* ${roles.join(", ")}` : null,
        workType || duration || startTime ? `• *근무:* ${workType || "-"} / ${duration || "-"} / ${startTime || "-"}` : null,
        industry ? `• *업종:* ${industry}` : null,
        jdUrl ? `• *JD URL:* ${jdUrl}` : null,
        jdFileUrl ? `• *JD 파일:* ${jdFileName || "첨부"} — ${jdFileUrl}` : jdFileName ? `• *JD 파일:* ${jdFileName} (업로드 실패)` : null,
        jd ? `• *JD:* ${jd.slice(0, 500)}` : null,
        utm_source || utm_campaign ? `• *유입:* ${utm_source || "-"} / ${utm_medium || "-"} / ${utm_campaign || "-"}` : null,
        !saved ? "⚠️ (DB 저장 실패 — Slack으로만 접수됨)" : null,
      ].filter(Boolean);

      const res = await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: lines.join("\n") }),
      });
      slackSent = res.ok;
    } catch (e) {
      console.error("[pricing-request] slack error:", e);
    }
  }

  // DB·Slack 둘 다 실패했을 때만 실패 처리 (하나라도 접수되면 성공)
  if (!saved && !slackSent) {
    return NextResponse.json({ ok: false, error: saveError || "접수에 실패했습니다." }, { status: 500 });
  }
  return NextResponse.json({ ok: true, saved, slackSent, id: insertedId });
}

/* PATCH — 1뎁스에서 생성된 리드에 채용 요건(+JD)을 추가 업데이트 + 후속 Slack
 *  body(json 또는 multipart data): { id, name, company, roles, workType, duration, startTime, industry, jd, jdUrl, jdFileName } */
export async function PATCH(req: Request) {
  let body: Body & { id?: string };
  let jdFile: File | null = null;
  try {
    const ct = req.headers.get("content-type") || "";
    if (ct.includes("multipart/form-data")) {
      const fd = await req.formData();
      body = JSON.parse(String(fd.get("data") || "{}"));
      const f = fd.get("jdFile");
      if (f && typeof f !== "string") jdFile = f;
    } else {
      body = await req.json();
    }
  } catch {
    return NextResponse.json({ ok: false, error: "invalid request" }, { status: 400 });
  }

  const { id, name, company, roles = [], workType, duration, startTime, industry, jd, jdUrl, jdFileName } = body;
  if (!id) return NextResponse.json({ ok: false, error: "id required" }, { status: 400 });

  const sbUrl = process.env.PRICING_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const sbKey = process.env.PRICING_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(sbUrl, sbKey);

  // JD 파일 업로드 (있으면)
  let jdFileUrl: string | null = null;
  if (jdFile) {
    try {
      const safe = (jdFile.name || "jd.pdf").replace(/[^\w.\-]+/g, "_");
      const path = `${Date.now()}-${safe}`;
      const buf = new Uint8Array(await jdFile.arrayBuffer());
      const { error: upErr } = await supabase.storage.from("pricing-jd").upload(path, buf, { contentType: jdFile.type || "application/pdf", upsert: false });
      if (!upErr) jdFileUrl = supabase.storage.from("pricing-jd").getPublicUrl(path).data.publicUrl;
    } catch (e) {
      console.error("[pricing-request PATCH] JD upload:", e);
    }
  }

  // 요건 업데이트 (값 있는 것만)
  const patch: Record<string, unknown> = {};
  if (roles.length) patch.roles = roles;
  if (workType) patch.work_type = workType;
  if (duration) patch.duration = duration;
  if (startTime) patch.start_time = startTime;
  if (industry) patch.industry = industry;
  if (jd) patch.jd = jd;
  if (jdUrl) patch.jd_url = jdUrl;
  if (jdFileName) patch.jd_file_name = jdFileName;
  if (jdFileUrl) patch.jd_file_url = jdFileUrl;

  if (Object.keys(patch).length > 0) {
    await supabase.from("pricing_requests").update(patch).eq("id", id);
  }

  // 후속 Slack (추가된 요건 있을 때만)
  const webhook = process.env.SLACK_WEBHOOK_URL;
  if (webhook && Object.keys(patch).length > 0) {
    const who = [name, company].filter(Boolean).join(" · ");
    const lines = [
      `📝 *위 문의에 채용 요건이 추가되었습니다*${who ? ` (${who})` : ""}`,
      roles.length ? `• *관심 직무:* ${roles.join(", ")}` : null,
      workType || duration || startTime ? `• *근무:* ${workType || "-"} / ${duration || "-"} / ${startTime || "-"}` : null,
      industry ? `• *업종:* ${industry}` : null,
      jdUrl ? `• *JD URL:* ${jdUrl}` : null,
      jdFileUrl ? `• *JD 파일:* ${jdFileName || "첨부"} — ${jdFileUrl}` : null,
    ].filter(Boolean);
    try {
      await fetch(webhook, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: lines.join("\n") }) });
    } catch (e) {
      console.error("[pricing-request PATCH] slack:", e);
    }
  }

  return NextResponse.json({ ok: true });
}

/* ----------------------------------------------------------------------------
 *  Supabase 테이블 생성 SQL (Supabase 대시보드 SQL Editor에서 1회 실행)
 *
 *  create table if not exists public.pricing_requests (
 *    id uuid primary key default gen_random_uuid(),
 *    name text not null,
 *    company text not null,
 *    contact text not null,
 *    roles text[] not null default '{}',
 *    work_type text,
 *    duration text,
 *    start_time text,
 *    industry text,
 *    jd text,
 *    jd_url text,
 *    jd_file_name text,
 *    jd_file_url text,                                     -- Storage 업로드된 PDF 공개 URL
 *    consent boolean not null default false,
 *    talent_id text, talent_name text, talent_role text,   -- 특정 인재 문의
 *    interview_slots jsonb, interview_note text,            -- 희망 면접 일정
 *    status text not null default 'new',
 *    created_at timestamptz not null default now()
 *  );
 *
 *  -- 기존 테이블이 있으면 컬럼만 추가:
 *  alter table public.pricing_requests
 *    add column if not exists talent_id text,
 *    add column if not exists talent_name text,
 *    add column if not exists talent_role text,
 *    add column if not exists interview_slots jsonb,
 *    add column if not exists interview_note text,
 *    add column if not exists jd_file_url text,
 *    add column if not exists utm_source text,
 *    add column if not exists utm_medium text,
 *    add column if not exists utm_campaign text,
 *    add column if not exists utm_content text,
 *    add column if not exists fbclid text;
 *
 *  -- JD PDF 업로드용 Storage 버킷 정책 (버킷 있는 프로젝트 = NEXT_PUBLIC DB 의 SQL Editor)
 *  --   버킷 'pricing-jd' (public) 는 생성되어 있어야 함
 *  create policy "anon upload pricing-jd" on storage.objects
 *    for insert to anon with check (bucket_id = 'pricing-jd');
 *  -- service_role 로만 insert 하므로 RLS 정책 불필요 (RLS 켜두고 정책 없음 = anon 차단)
 *  alter table public.pricing_requests enable row level security;
 * -------------------------------------------------------------------------- */
