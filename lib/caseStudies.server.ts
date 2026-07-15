import { createClient } from "@supabase/supabase-js";
import { CASE_STUDIES, type CaseStudy } from "./caseStudies";

/* 고객 사례 — 정적(CASE_STUDIES) + DB(case_studies) 병합 조회 (서버 전용)
 *  - DB는 어드민(/gm-admin/cases)에서 추가한 사례. 같은 slug면 DB가 우선.
 *  - DB 조회 실패 시 정적만 반환 (사이트 항상 동작) */

function admin() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
    // Next의 RSC fetch 캐시 우회 — 어드민 추가/삭제가 즉시 반영되도록
    global: { fetch: (url, opts) => fetch(url as RequestInfo, { ...(opts as RequestInit), cache: "no-store" }) },
  });
}

type DbRow = {
  slug: string;
  type: string | null;
  company: string;
  industry: string | null;
  scope: string | null;
  talent_role: string | null;
  title: string;
  summary: string | null;
  thumbnail: string | null;
  images: string[] | null;
  metrics: CaseStudy["metrics"] | null;
  story: CaseStudy["story"] | null;
  blocks: CaseStudy["blocks"] | null;
  quote: string | null;
  quote_by: string | null;
  interview: CaseStudy["interview"] | null;
  site_url: string | null;
};

function fromRow(r: DbRow): CaseStudy {
  return {
    slug: r.slug,
    type: r.type === "talent" ? "talent" : "company",
    company: r.company,
    industry: r.industry || "",
    scope: r.scope || "",
    talentRole: r.talent_role || "",
    title: r.title,
    summary: r.summary || "",
    thumbnail: r.thumbnail || "",
    images: Array.isArray(r.images) ? r.images : [],
    metrics: Array.isArray(r.metrics) ? r.metrics : [],
    story: Array.isArray(r.story) ? r.story : [],
    blocks: Array.isArray(r.blocks) && r.blocks.length ? r.blocks : undefined,
    quote: r.quote || undefined,
    quoteBy: r.quote_by || undefined,
    interview: Array.isArray(r.interview) && r.interview.length ? r.interview : undefined,
    siteUrl: r.site_url || null,
  };
}

async function fetchDbCases(): Promise<CaseStudy[]> {
  try {
    const { data, error } = await admin()
      .from("case_studies")
      .select("*")
      .eq("published", true)
      .order("created_at", { ascending: false });
    if (error || !data) return [];
    return (data as DbRow[]).map(fromRow);
  } catch {
    return [];
  }
}

// 인재 사례(type: "talent") 공통 링크 — 모두 salary-fyi로 연결
const TALENT_CASE_URL = "https://salary-fyi.com/";

export async function getAllCaseStudies(): Promise<CaseStudy[]> {
  const db = await fetchDbCases();
  const seen = new Set(db.map((c) => c.slug));
  // DB(최신) 먼저, 그다음 정적 중 slug 중복 아닌 것
  const merged = [...db, ...CASE_STUDIES.filter((c) => !seen.has(c.slug))];
  // 카드는 모두 유지. 링크(siteUrl)만 정리:
  //  - 인재 사례는 salary-fyi로 통일
  //  - 그 외에는 정상 http(s) URL만 남기고, 아니면 null → 상세 하단 "보러가기" 버튼 숨김
  return merged.map((c) => {
    const siteUrl =
      c.type === "talent"
        ? TALENT_CASE_URL
        : c.siteUrl && /^https?:\/\//i.test(c.siteUrl)
          ? c.siteUrl
          : null;
    return { ...c, siteUrl };
  });
}

export async function getCaseBySlug(slug: string): Promise<CaseStudy | null> {
  const all = await getAllCaseStudies();
  return all.find((c) => c.slug === slug) || null;
}
