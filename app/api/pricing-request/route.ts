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
  consent?: boolean;
  // 특정 인재 문의(상세 페이지 진입) 시
  talentId?: string | null;
  talentName?: string | null;
  talentRole?: string | null;
  interviewSlots?: { date: string; times: string[] }[];
  interviewNote?: string;
};

export async function POST(req: Request) {
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid json" }, { status: 400 });
  }

  const { name, company, contact, roles = [], workType, duration, startTime, industry, jd, jdUrl, jdFileName, consent,
    talentId, talentName, talentRole, interviewSlots = [], interviewNote } = body;

  // 필수: 담당자·기업·연락처·동의
  if (!name?.trim() || !company?.trim() || !contact?.trim() || !consent) {
    return NextResponse.json({ ok: false, error: "필수 항목이 누락되었습니다." }, { status: 400 });
  }

  // 1) Supabase 저장
  //   pricing 전용 프로젝트(PRICING_SUPABASE_*)가 있으면 그걸, 없으면 앱 기본 DB 사용
  const sbUrl = process.env.PRICING_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const sbKey = process.env.PRICING_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY!;
  let saved = false;
  let saveError: string | null = null;
  try {
    const supabase = createClient(sbUrl, sbKey);
    const { error } = await supabase.from("pricing_requests").insert({
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
      consent: true,
      talent_id: talentId || null,
      talent_name: talentName || null,
      talent_role: talentRole || null,
      interview_slots: interviewSlots.length ? interviewSlots : null,
      interview_note: interviewNote || null,
    });
    if (error) saveError = error.message;
    else saved = true;
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
        `• *관심 직무:* ${roles.length ? roles.join(", ") : "-"}`,
        `• *근무:* ${workType || "-"} / ${duration || "-"} / ${startTime || "-"}`,
        `• *업종:* ${industry || "-"}`,
        jdUrl ? `• *JD URL:* ${jdUrl}` : null,
        jdFileName ? `• *JD 파일:* ${jdFileName}` : null,
        jd ? `• *JD:* ${jd.slice(0, 500)}` : null,
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
  return NextResponse.json({ ok: true, saved, slackSent });
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
 *    add column if not exists interview_note text;
 *  -- service_role 로만 insert 하므로 RLS 정책 불필요 (RLS 켜두고 정책 없음 = anon 차단)
 *  alter table public.pricing_requests enable row level security;
 * -------------------------------------------------------------------------- */
