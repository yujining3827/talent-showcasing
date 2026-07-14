import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

/* 서비스 소개서 다운로드 리드 접수
 *  - brochure_leads(기업명·담당자·연락처) 저장 (메인 DB)
 *  - Slack 알림 + 소개서 PDF 공개 URL 반환 (클라이언트가 다운로드)
 *  ⚠️ 테이블 SQL은 파일 하단 주석 참고 */
type Body = {
  company?: string;
  name?: string;
  contact?: string;
  consent?: boolean;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  utm_content?: string | null;
  fbclid?: string | null;
};

// 소개서 PDF (메인 DB Storage 'brochure' 버킷, 공개). ?download 로 강제 다운로드
const PDF_URL = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/brochure/gonggomagam-service-brochure.pdf?download=${encodeURIComponent("공고마감_베트남인재채용_서비스소개서.pdf")}`;

export async function POST(req: Request) {
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid request" }, { status: 400 });
  }
  const { company, name, contact, consent, utm_source, utm_medium, utm_campaign, utm_content, fbclid } = body;

  if (!company?.trim() || !name?.trim() || !contact?.trim() || !consent) {
    return NextResponse.json({ ok: false, error: "기업명·담당자·연락처·동의는 필수입니다." }, { status: 400 });
  }

  // brochure_leads 는 메인 DB에 저장 (테이블도 메인 프로젝트에 생성돼 있음)
  const sbUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const sbKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(sbUrl, sbKey);

  // 1) 저장
  let saved = false;
  try {
    const { error } = await supabase.from("brochure_leads").insert({
      company: company.trim(),
      name: name.trim(),
      contact: contact.trim(),
      consent: true,
      utm_source: utm_source || null,
      utm_medium: utm_medium || null,
      utm_campaign: utm_campaign || null,
      utm_content: utm_content || null,
      fbclid: fbclid || null,
    });
    if (error) console.error("[brochure-lead] save error:", error.message);
    else saved = true;
  } catch (e) {
    console.error("[brochure-lead] save exception:", e);
  }

  // 2) Slack
  const webhook = process.env.SLACK_WEBHOOK_URL;
  if (webhook) {
    const lines = [
      "📄 *서비스 소개서 다운로드 요청*",
      `• *기업:* ${company}  |  *담당자:* ${name}`,
      `• *연락처:* ${contact}`,
      utm_source || utm_campaign ? `• *유입:* ${utm_source || "-"} / ${utm_medium || "-"} / ${utm_campaign || "-"}` : null,
      !saved ? "⚠️ (DB 저장 실패 — Slack으로만 접수됨)" : null,
    ].filter(Boolean);
    try {
      await fetch(webhook, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: lines.join("\n") }) });
    } catch (e) {
      console.error("[brochure-lead] slack error:", e);
    }
  }

  // 필수값 통과했으면 소개서는 항상 내려준다 (다운로드 우선 UX)
  return NextResponse.json({ ok: true, pdfUrl: PDF_URL });
}

/* ----------------------------------------------------------------------------
 *  테이블 SQL (메인 프로젝트 SQL Editor에서 1회 실행)
 *  create table if not exists public.brochure_leads (
 *    id uuid primary key default gen_random_uuid(),
 *    company text not null,
 *    name text not null,
 *    contact text not null,
 *    consent boolean not null default false,
 *    utm_source text, utm_medium text, utm_campaign text, utm_content text, fbclid text,
 *    created_at timestamptz not null default now()
 *  );
 *  alter table public.brochure_leads enable row level security;  -- service_role만 접근
 * -------------------------------------------------------------------------- */
