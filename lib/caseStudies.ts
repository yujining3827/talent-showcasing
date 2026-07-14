/* ============================================================================
 *  고객 사례(Case Studies) 데이터
 *  - CASE_STUDIES: 공개 사례만. 사이트에 노출된다.
 *  - DRAFT_CASE_STUDIES: 내용 미확정 스켈레톤. 실제 사례가 확정되면
 *    내용을 채운 뒤 CASE_STUDIES로 옮긴다. (미완성 상태로 노출 금지)
 *  - story: 회사 시점의 사실 서술. quote/interview는 실제 고객 발화가
 *    확보된 사례에만 넣는다 — 임의로 지어 넣지 말 것.
 * ========================================================================== */

export type CaseMetric = { value: string; label: string };
export type CaseQA = { q: string; a: string };
export type CaseSection = { title: string; body: string };

// 본문 블록 — 텍스트/이미지를 원하는 순서로 배치 (어드민 작성분)
export type ContentBlock =
  | { type: "text"; title?: string; body: string }
  | { type: "image"; url: string; caption?: string };

export type CaseType = "company" | "talent"; // 기업 후기 / 인재 후기

export type CaseStudy = {
  slug: string;
  type: CaseType; // 후기 유형 (기본 company)
  company: string; // 고객사 이름
  industry: string; // 업종
  scope: string; // 작업 범위 (예: D2C 쇼핑몰 구축)
  talentRole: string; // 투입된 인재 직무
  title: string; // 리스트/상세 제목 — 성과 중심 한 줄
  summary: string; // 카드/상세 상단 요약 한 줄
  thumbnail: string; // 대표 이미지
  images: string[]; // 상세 본문 갤러리
  metrics: CaseMetric[]; // 핵심 지표 (0~3개, 실측만)
  story: CaseSection[]; // 본문(레거시) — 프로젝트 서술. blocks 없을 때 사용
  blocks?: ContentBlock[]; // 본문(신규) — 텍스트/이미지 순서 배치. 있으면 이걸 우선 렌더
  quote?: string; // 대표 인용구 — 실제 고객 코멘트 확보 시에만
  quoteBy?: string;
  interview?: CaseQA[]; // 실제 인터뷰 확보 시에만
  siteUrl?: string | null;
};

export const CASE_STUDIES: CaseStudy[] = [
  {
    slug: "doruri",
    type: "company",
    company: "도르리",
    industry: "F&B · D2C 커머스",
    scope: "브랜드 쇼핑몰 구축 · 운영",
    talentRole: "웹 개발 · 디자인",
    title: "프리미엄 육포 브랜드 '도르리', 베트남 인재와 자사몰을 완성하다",
    summary: "제품 기획부터 상세페이지·프로모션 운영까지, 베트남 인재가 실제로 구축한 D2C 쇼핑몰 사례입니다.",
    thumbnail: "/cases/doruri/doruri-1.png",
    images: ["/cases/doruri/doruri-2.jpg", "/cases/doruri/doruri-3.jpg"],
    metrics: [
      { value: "50%", label: "국내 대비 인건비 수준" },
      { value: "구축 → 운영", label: "원스톱 진행 범위" },
    ],
    story: [
      {
        title: "프로젝트 배경",
        body: "도르리는 프리미엄 육포를 만드는 D2C 브랜드입니다. 자사몰을 새로 구축하고 런칭 이후 상세페이지·프로모션까지 이어서 운영할 수 있는 웹 개발·디자인 리소스가 필요했고, 공고마감이 검증된 베트남 인재를 매칭해 프로젝트를 함께 진행했습니다.",
      },
      {
        title: "어떤 작업을 진행했나요",
        body: "브랜드 자사몰 구축을 중심으로, 제품 상세페이지 제작과 프로모션 배너·이벤트 페이지 디자인까지 웹 개발과 디자인을 한 사람이 엔드투엔드로 담당했습니다. 기획 의도를 반영한 브랜드 톤의 페이지를 만들고, 런칭 이후에도 운영 과정에서 나오는 개선 요청을 반영했습니다.",
      },
      {
        title: "결과",
        body: "자사몰(doruri.com)이 오픈해 실제로 운영되고 있습니다. 국내 채용 대비 절반 수준의 인건비로 구축부터 운영까지 끊김 없이 진행한 사례입니다.",
      },
    ],
    siteUrl: "https://doruri.com/",
  },
];

/* 미확정 스켈레톤 — 내용 확정 전까지 사이트에 노출하지 않는다 */
export const DRAFT_CASE_STUDIES: CaseStudy[] = [];

export function getCaseBySlug(slug: string) {
  return CASE_STUDIES.find((c) => c.slug === slug) || null;
}
