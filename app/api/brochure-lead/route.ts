import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

/* 서비스 소개서 접수 → 이메일로 PDF 첨부 발송
 *  - brochure_leads(기업명·담당자·이메일) 저장 (메인 DB, 이메일은 contact 컬럼)
 *  - 입력한 이메일로 소개서 PDF 첨부 발송 (Resend)
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

// 발신 주소 — Resend에서 도메인 인증 후 우리 도메인 사용 (인증 전엔 onboarding@resend.dev로 본인에게만 테스트 가능)
const RESEND_FROM = process.env.RESEND_FROM || "공고마감 <onboarding@resend.dev>";

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

    // PDF는 용량이 커서 첨부 대신 다운로드 링크로 발송 (메일 첨부 한도/수신 제한 회피)
    const downloadUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${BROCHURE_BUCKET}/${encodeURIComponent(pdfPath)}?download=${encodeURIComponent(pdfName)}`;
    const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://ggmg.ai.kr";

    const html = `
      <div style="margin:0;padding:0;background:#F4F5F7;font-family:'Apple SD Gothic Neo','Pretendard',-apple-system,BlinkMacSystemFont,sans-serif;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F4F5F7;padding:40px 12px;">
          <tr><td align="center">
            <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="width:100%;max-width:560px;background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 24px 60px -30px rgba(10,18,32,0.35);">
              <tr><td style="height:5px;background:#E8590C;line-height:5px;font-size:0;">&nbsp;</td></tr>
              <tr><td align="center" style="padding:34px 32px 0;">
                <img src="https://ggmg.ai.kr/logo-wordmark.png" alt="공고마감" height="26" style="height:26px;display:block;border:0;" />
              </td></tr>
              <tr><td align="center" style="padding:26px 44px 0;">
                <p style="margin:0;font-size:12px;font-weight:700;letter-spacing:0.14em;color:#E8590C;text-transform:uppercase;">Service Brochure</p>
                <h1 style="margin:12px 0 0;font-size:25px;line-height:1.35;font-weight:800;color:#171E2D;">${name.trim()}님,<br />요청하신 소개서를 보내드립니다</h1>
                <p style="margin:16px 0 0;font-size:15px;line-height:1.75;color:#5B667A;">검증된 글로벌 인재를 <strong style="color:#171E2D;">인건비 최대 60% 절감</strong>으로.<br />공고마감 서비스 소개서를 확인해보세요.</p>
              </td></tr>
              <tr><td style="padding:28px 44px 0;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FAFAFB;border:1px solid #EEF0F3;border-radius:14px;">
                  <tr><td style="padding:16px 22px;">
                    <p style="margin:0;padding:7px 0;font-size:14.5px;color:#3A4356;"><span style="color:#E8590C;font-weight:800;">✓</span>&nbsp;&nbsp;인건비 최대 60% 절감, 역량은 그대로</p>
                    <p style="margin:0;padding:7px 0;font-size:14.5px;color:#3A4356;"><span style="color:#E8590C;font-weight:800;">✓</span>&nbsp;&nbsp;상위 대학·전 직장 검증 인재</p>
                    <p style="margin:0;padding:7px 0;font-size:14.5px;color:#3A4356;"><span style="color:#E8590C;font-weight:800;">✓</span>&nbsp;&nbsp;월 구독형 · 평균 3주 내 채용</p>
                  </td></tr>
                </table>
              </td></tr>
              <tr><td align="center" style="padding:32px 44px 4px;">
                <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
                  <tr><td align="center" style="border-radius:12px;background:#E8590C;box-shadow:0 10px 24px -10px rgba(232,89,12,0.6);">
                    <a href="${downloadUrl}" style="display:inline-block;padding:16px 42px;font-size:16px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:12px;">서비스 소개서 다운로드 →</a>
                  </td></tr>
                </table>
              </td></tr>
              <tr><td style="padding:30px 44px 0;">
                <div style="border-top:1px solid #EEF0F3;"></div>
              </td></tr>
              <tr><td align="center" style="padding:24px 44px 0;">
                <p style="margin:0 0 16px;font-size:14.5px;line-height:1.7;color:#5B667A;">인재 채용이 필요하거나 궁금한 점이 있으신가요?</p>
                <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
                  <tr>
                    <td align="center" style="border-radius:12px;border:1.5px solid #E8590C;background:#ffffff;">
                      <a href="${siteUrl}/pricing" style="display:inline-block;padding:12px 24px;font-size:14.5px;font-weight:700;color:#E8590C;text-decoration:none;border-radius:12px;white-space:nowrap;">인재 추천받기</a>
                    </td>
                    <td style="width:10px;line-height:1px;font-size:1px;">&nbsp;</td>
                    <td align="center" style="border-radius:12px;border:1.5px solid #E8590C;background:#ffffff;">
                      <a href="${siteUrl}/?chat=1" style="display:inline-block;padding:12px 24px;font-size:14.5px;font-weight:700;color:#E8590C;text-decoration:none;border-radius:12px;white-space:nowrap;">1:1 상담하기</a>
                    </td>
                  </tr>
                </table>
              </td></tr>
              <tr><td style="padding:28px 44px 34px;">
                <div style="border-top:1px solid #EEF0F3;padding-top:20px;text-align:center;">
                  <p style="margin:0;font-size:13px;font-weight:700;color:#171E2D;">공고마감 <span style="color:#8A95A1;font-weight:500;">by LIKELION</span></p>
                  <p style="margin:7px 0 0;font-size:12px;color:#AEB6C4;">검증된 글로벌 인재 구독 · <a href="https://ggmg.ai.kr" style="color:#8A95A1;text-decoration:underline;">ggmg.ai.kr</a></p>
                </div>
              </td></tr>
            </table>
          </td></tr>
        </table>
      </div>
      `;

    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: RESEND_FROM,
        to: [to],
        subject: "[공고마감] 요청하신 서비스 소개서를 보내드립니다",
        html,
      }),
    });
    if (!resendRes.ok) {
      const detail = await resendRes.text().catch(() => "");
      throw new Error(`Resend ${resendRes.status}: ${detail.slice(0, 200)}`);
    }
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
