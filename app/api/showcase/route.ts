import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createHash } from "crypto";
import { isEliteSchool, isEliteCompany } from "@/lib/prestige";
// 비전 큐레이션 결과 — 빌드 타임 import (Vercel 서버리스에서도 항상 번들에 포함됨)
import PHOTO_VERDICTS from "@/data/photo-verdicts.json";

function loadVerdicts(): Record<string, { headshot?: boolean; quality?: number; good?: boolean }> {
  return PHOTO_VERDICTS as Record<string, { headshot?: boolean; quality?: number; good?: boolean }>;
}

export const dynamic = "force-dynamic";

// 스킬 필드가 배열/콤마텍스트 뭐든 배열로
function toSkills(v: unknown): string[] {
  if (Array.isArray(v)) return v.map(String).filter(Boolean).slice(0, 6);
  if (typeof v === "string") return v.split(/[,;·]/).map((s) => s.trim()).filter(Boolean).slice(0, 6);
  return [];
}

// 학교/대학은 회사가 아님 → 회사 목록에서 제외
function isSchoolLike(s: string): boolean {
  return /universit|college|institute|academy|đại học|dai hoc|trường|hoc vien|học viện|polytechnic|school/i.test(s);
}
// experiences(jsonb)에서 회사명 목록 추출 (학교 제외)
function extractCompanies(v: unknown): string[] {
  let arr: unknown = v;
  if (typeof v === "string") { try { arr = JSON.parse(v); } catch { return []; } }
  if (!Array.isArray(arr)) return [];
  return arr
    .map((e) => {
      const o = e as Record<string, unknown>;
      return String((o?.company || o?.company_name || o?.employer || o?.organization || o?.name || "")).trim();
    })
    .filter((c) => c && !isSchoolLike(c));
}
// 대표 회사: 글로벌/인지도 기업이 있으면 그걸, 없으면 가장 최근(첫번째)
function pickBestCompany(companies: string[]): string | null {
  const elite = companies.find((c) => isEliteCompany(c));
  return elite || companies[0] || null;
}

// 인지도 기업 → 로고 도메인 (Clearbit). 없으면 로고 대신 텍스트/학교 노출
const COMPANY_DOMAINS: Record<string, string> = {
  "fpt": "fpt.com", "fpt software": "fpt.com", "fpt corporation": "fpt.com",
  "kpmg": "kpmg.com", "amazon": "amazon.com", "amazon web services": "amazon.com", "aws": "amazon.com",
  "google": "google.com", "meta": "meta.com", "facebook": "meta.com", "microsoft": "microsoft.com",
  "apple": "apple.com", "samsung": "samsung.com", "lg": "lg.com", "intel": "intel.com", "bosch": "bosch.com",
  "ibm": "ibm.com", "oracle": "oracle.com", "grab": "grab.com", "shopee": "shopee.com", "lazada": "lazada.com",
  "vng": "vng.com.vn", "viettel": "viettel.com.vn", "vnpay": "vnpay.vn", "momo": "momo.vn", "tiki": "tiki.vn",
  "cmc global": "cmcglobal.com.vn", "nashtech": "nashtechglobal.com", "kms": "kms-technology.com",
  "kms technology": "kms-technology.com", "tma": "tma.vn", "katalon": "katalon.com",
  "naver": "naver.com", "line": "line.me", "uber": "uber.com", "tiktok": "tiktok.com", "bytedance": "bytedance.com",
};
function companyDomain(name: string | null, verified: string | null): string | null {
  if (verified && /\./.test(verified)) return verified.replace(/^https?:\/\//, "").replace(/\/.*$/, "");
  if (!name) return null;
  const words = name.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
  for (const key of Object.keys(COMPANY_DOMAINS)) {
    const kw = key.split(/[^a-z0-9]+/).filter(Boolean);
    if (kw.every((w) => words.includes(w))) return COMPANY_DOMAINS[key];
  }
  return null;
}

export interface ShowcaseTalent {
  id: string;
  name: string;
  role: string;
  headline: string | null;
  photo_url: string | null;
  school: string | null;
  schoolElite: boolean;     // 명문대 여부
  schoolTier: string | null;
  company: string | null;   // 대표/전 직장 (Ex-)
  companyElite: boolean;    // 글로벌/인지도 기업 여부
  companyDomain: string | null; // 로고용 도메인
  yoeYears: number | null;
  location: string | null;
  skills: string[];
}

// 소스: FYI(MVP) user_profiles 중 이력서 공개(is_resume_public) 동의한 인재만
// 서비스 키 사용 시 RLS를 우회하므로 동의 필터를 쿼리에 반드시 명시한다
export async function GET() {
  const url = process.env.MVP_SUPABASE_URL;
  const key = process.env.MVP_SUPABASE_SERVICE_KEY || process.env.MVP_SUPABASE_ANON_KEY;
  if (!url || !key) return NextResponse.json({ error: "MVP env missing", total: 0, talents: [] });

  const sb = createClient(url, key);
  const { data, error } = await sb
    .from("user_profiles")
    .select("id,full_name,headline,position,photo_url,university,verified_school_name,verified_school_tier,representative_tier,current_company,verified_company_name,verified_company_domain,experiences,yoe_months,location,skills")
    .eq("is_resume_public", true)
    .not("photo_url", "is", null)
    .limit(2000);

  if (error) return NextResponse.json({ error: error.message, total: 0, talents: [] });

  const verdicts = loadVerdicts();

  const mapped: ShowcaseTalent[] = (data || []).map((p) => {
    const companies = extractCompanies(p.experiences);
    const vco = p.verified_company_name && !isSchoolLike(p.verified_company_name) ? p.verified_company_name : null;
    const cco = p.current_company && !isSchoolLike(p.current_company) ? p.current_company : null;
    const company = vco || pickBestCompany(companies) || cco || null;
    const school = p.verified_school_name || p.university || null;
    // 사람 헤드샷이면 노출 (산/단체/빈사진만 제거, 자연스러운 것도 포함)
    const v = verdicts[String(p.id)];
    const goodPhoto = v?.headshot === true && (v?.quality ?? 0) >= 3;
    return {
      id: String(p.id),
      name: p.full_name || "익명",
      role: p.position || "기타",
      headline: p.headline || null,
      photo_url: goodPhoto ? (p.photo_url || null) : null,
      school,
      schoolElite: isEliteSchool(school),
      schoolTier: p.verified_school_tier || p.representative_tier || null,
      company,
      companyElite: isEliteCompany(company) || companies.some(isEliteCompany),
      companyDomain: companyDomain(company, p.verified_company_domain),
      yoeYears: p.yoe_months != null ? Math.round(Number(p.yoe_months) / 12) : null,
      location: p.location || null,
      skills: toSkills(p.skills),
    };
  });

  // 기준: 좋은 사진(비전 통과) + 크레덴셜(학교나 회사) 있음. 명문/글로벌은 하드필터 대신 정렬 우선.
  // 내부/테스트 프로필(Likelion 등) 제외
  const isInternal = (t: ShowcaseTalent) => /likelion/i.test(`${t.company || ""} ${t.school || ""} ${t.name || ""}`);
  const talents = mapped.filter((t) => t.photo_url && (t.school || t.company) && !isInternal(t));

  // 프리미엄 정렬: 명문대 티어 > 명문대 > 글로벌기업 > 경력연차 (엘리트가 위로)
  const score = (t: ShowcaseTalent) =>
    (t.schoolTier === "top" ? 8 : 0) + (isEliteSchool(t.school) ? 4 : 0) + (isEliteCompany(t.company) ? 3 : 0) + (t.yoeYears || 0) / 100;
  talents.sort((a, b) => score(b) - score(a));

  // 키 지문(해시) + JWT payload(ref/role) — 시크릿 아님, 키가 맞는 프로젝트/역할인지 확인용
  let keyRef: string | null = null;
  let keyRole: string | null = null;
  try {
    const payload = JSON.parse(Buffer.from((key || "").split(".")[1] || "", "base64").toString("utf8"));
    keyRef = payload?.ref ?? null;
    keyRole = payload?.role ?? null;
  } catch { /* noop */ }

  return NextResponse.json({
    total: talents.length,
    talents,
    // ⚠️ 임시 디버그 (원인 확인용, 시크릿 없음) — 해결되면 제거
    _debug: {
      urlHost: (url || "").replace("https://", "").split(".")[0],
      keyLen: (key || "").length,
      keyHash: createHash("sha256").update(key || "").digest("hex").slice(0, 10),
      keyRef,
      keyRole,
      rawCount: data?.length ?? 0,
      verdictsCount: Object.keys(verdicts).length,
      withPhoto: mapped.filter((t) => t.photo_url).length,
      afterFilter: talents.length,
    },
  });
}
