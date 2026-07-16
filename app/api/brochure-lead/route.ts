import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import nodemailer from "nodemailer";

export const dynamic = "force-dynamic";

/* 서비스 소개서 접수 → 이메일로 PDF 첨부 발송
 *  - brochure_leads(기업명·담당자·이메일) 저장 (메인 DB, 이메일은 contact 컬럼)
 *  - 입력한 이메일로 소개서 PDF 첨부 발송 (Gmail/nodemailer)
 *  - Slack 알림
 *  ⚠️ 테이블 SQL은 파일 하단 주석 참고 */
type Body = {
  company?: string;
  name?: string;
  email?: string;
  consent?: boolean;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  utm_content?: string | null;
  fbclid?: string | null;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// 소개서 PDF ('brochure' 버킷). 활성본은 _active.json 마커가 가리킴 (gm-admin에서 관리)
const BROCHURE_BUCKET = "brochure";
const ACTIVE_MARKER = "_active.json";
const DEFAULT_PDF_PATH = "gonggomagam-service-brochure.pdf"; // 마커 없을 때 폴백
const DEFAULT_PDF_NAME = "공고마감_베트남인재채용_서비스소개서.pdf";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
});

export async function POST(req: Request) {
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid request" }, { status: 400 });
  }
  const { company, name, email, consent, utm_source, utm_medium, utm_campaign, utm_content, fbclid } = body;

  if (!company?.trim() || !name?.trim() || !email?.trim() || !consent) {
    return NextResponse.json({ ok: false, error: "기업명·담당자·이메일·동의는 필수입니다." }, { status: 400 });
  }
  const to = email.trim();
  if (!EMAIL_RE.test(to)) {
    return NextResponse.json({ ok: false, error: "이메일 형식을 확인해주세요." }, { status: 400 });
  }

  // brochure_leads 는 메인 DB에 저장 (이메일은 contact 컬럼에 저장)
  const sbUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const sbKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(sbUrl, sbKey);

  // 1) 리드 저장 (best-effort — 실패해도 메일 발송은 진행)
  let saved = false;
  try {
    const { error } = await supabase.from("brochure_leads").insert({
      company: company.trim(),
      name: name.trim(),
      contact: to,
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

  // 2) 입력한 이메일로 소개서 PDF 첨부 발송 (핵심 — 실패 시 사용자에게 에러 반환)
  let sent = false;
  try {
    // 활성 소개서 결정 (gm-admin의 _active.json 마커 → 없으면 기본 파일)
    let pdfPath = DEFAULT_PDF_PATH;
    let pdfName = DEFAULT_PDF_NAME;
    try {
      const { data: marker } = await supabase.storage.from(BROCHURE_BUCKET).download(ACTIVE_MARKER);
      if (marker) {
        const cfg = JSON.parse(await marker.text());
        if (cfg?.path) {
          pdfPath = String(cfg.path);
          pdfName = String(cfg.name || cfg.path.replace(/^\d+-/, ""));
        }
      }
    } catch {
      /* 마커 없음 → 기본 파일 사용 */
    }

    const { data: pdfBlob, error: dlErr } = await supabase.storage.from(BROCHURE_BUCKET).download(pdfPath);
    if (dlErr || !pdfBlob) throw new Error(dlErr?.message || "PDF download failed");
    const pdfBuffer = Buffer.from(await pdfBlob.arrayBuffer());

    await transporter.sendMail({
      from: `"공고마감" <${process.env.GMAIL_USER}>`,
      to,
      subject: "[공고마감] 요청하신 서비스 소개서를 보내드립니다",
      html: `
        <div style="font-family: 'Apple SD Gothic Neo', 'Pretendard', sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 20px; color: #191F28;">
          <h2 style="font-size: 20px; margin: 0 0 12px;">${name.trim()}님, 안녕하세요.</h2>
          <p style="font-size: 15px; line-height: 1.7; color: #4E5968; margin: 0 0 20px;">
            요청하신 <strong>공고마감 서비스 소개서</strong>를 첨부해 보내드립니다.<br />
            검토하시고 궁금한 점은 회신 주시면 담당자가 안내드리겠습니다.
          </p>
          <div style="background: #F9FAFB; border-radius: 12px; padding: 14px 16px; font-size: 14px; color: #6B7684;">
            📎 첨부: ${pdfName}
          </div>
          <p style="font-size: 13px; color: #8B95A1; margin: 24px 0 0;">공고마감 by LIKELION</p>
        </div>
      `,
      attachments: [{ filename: pdfName, content: pdfBuffer, contentType: "application/pdf" }],
    });
    sent = true;
  } catch (e) {
    console.error("[brochure-lead] mail error:", e);
  }

  // 3) Slack 알림
  const webhook = process.env.SLACK_WEBHOOK_URL;
  if (webhook) {
    const lines = [
      "📄 *서비스 소개서 이메일 발송 요청*",
      `• *기업:* ${company}  |  *담당자:* ${name}`,
      `• *이메일:* ${to}`,
      utm_source || utm_campaign ? `• *유입:* ${utm_source || "-"} / ${utm_medium || "-"} / ${utm_campaign || "-"}` : null,
      !sent ? "⚠️ (메일 발송 실패 — 수동 발송 필요)" : null,
      !saved ? "⚠️ (DB 저장 실패)" : null,
    ].filter(Boolean);
    try {
      await fetch(webhook, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: lines.join("\n") }) });
    } catch (e) {
      console.error("[brochure-lead] slack error:", e);
    }
  }

  // 메일 발송 성공해야 성공 처리 (사용자는 이메일로 받으므로)
  if (!sent) {
    return NextResponse.json({ ok: false, error: "메일 발송에 실패했어요. 잠시 후 다시 시도하거나 문의해주세요." }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
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
