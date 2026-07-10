/* ============================================================================
 *  고객 사례(Case Studies) 데이터
 *  ⚠️ 와꾸용 스켈레톤 — 실제 사례가 확정되면 아래 배열만 교체하면 됩니다.
 *   - thumbnail/images: public/cases/<slug>/ 에 이미지 넣고 경로 지정
 *   - interview: 그리팅HR 인터뷰 양식(질문/답변). 답변은 placeholder.
 *   - siteUrl: 실제 구축한 사이트 (있으면 상세 하단에 "사이트 보러가기" 노출)
 * ========================================================================== */

export type CaseMetric = { value: string; label: string };
export type CaseQA = { q: string; a: string };

export type CaseStudy = {
  slug: string;
  company: string; // 고객사 이름
  industry: string; // 업종
  scope: string; // 작업 범위 (예: D2C 쇼핑몰 구축)
  talentRole: string; // 투입된 인재 직무
  title: string; // 리스트/상세 제목 — 성과 중심 한 줄
  summary: string; // 카드/상세 상단 요약 한 줄
  thumbnail: string; // 대표 이미지
  images: string[]; // 상세 본문 갤러리
  metrics: CaseMetric[]; // 핵심 지표 3개
  quote: string; // 대표 인용구 (pull quote)
  quoteBy: string; // 인용 담당자
  interview: CaseQA[]; // 인터뷰 Q&A 본문
  siteUrl?: string | null;
};

export const CASE_STUDIES: CaseStudy[] = [
  {
    slug: "doruri",
    company: "도루리",
    industry: "F&B · D2C 커머스",
    scope: "브랜드 쇼핑몰 구축 · 운영",
    talentRole: "웹 개발 · 디자인",
    title: "프리미엄 육포 브랜드 '도루리', 베트남 인재와 자사몰을 완성하다",
    summary: "제품 기획부터 상세페이지·프로모션 운영까지, 베트남 인재가 실제로 구축한 D2C 쇼핑몰 사례입니다.",
    thumbnail: "/cases/doruri/doruri-1.png",
    images: ["/cases/doruri/doruri-2.jpg", "/cases/doruri/doruri-3.jpg"],
    metrics: [
      { value: "N주", label: "쇼핑몰 오픈까지 걸린 기간" },
      { value: "50%", label: "국내 대비 절감된 인건비" },
      { value: "N건", label: "런칭 후 운영·개선 작업" },
    ],
    quote: "여기에 고객사의 대표 코멘트가 한 문장 들어갑니다. 실제 후기가 확정되면 교체하세요.",
    quoteBy: "도루리 · 담당자",
    interview: [
      {
        q: "어떤 작업을 맡기셨나요?",
        a: "답변 placeholder — 작업 배경과 요청 범위(쇼핑몰 구축, 상세페이지, 프로모션 배너 등)가 들어갈 자리입니다.",
      },
      {
        q: "베트남 인재와의 협업은 어땠나요?",
        a: "답변 placeholder — 커뮤니케이션 방식, 작업 속도, 품질에 대한 실제 경험담이 들어갈 자리입니다.",
      },
      {
        q: "결과물에 만족하시나요?",
        a: "답변 placeholder — 결과물 평가와 비용 대비 만족도, 추천 의사가 들어갈 자리입니다.",
      },
    ],
    siteUrl: "https://doruri.com/",
  },
  {
    slug: "case-2",
    company: "고객사 B",
    industry: "업종 placeholder",
    scope: "작업 범위 placeholder",
    talentRole: "직무 placeholder",
    title: "사례 제목이 들어갈 자리입니다 — 성과 중심 한 줄",
    summary: "사례 요약 한 줄이 들어갈 자리입니다.",
    thumbnail: "",
    images: [],
    metrics: [
      { value: "N%", label: "지표 placeholder" },
      { value: "N주", label: "지표 placeholder" },
      { value: "N건", label: "지표 placeholder" },
    ],
    quote: "대표 인용구 placeholder.",
    quoteBy: "고객사 B · 담당자",
    interview: [
      { q: "어떤 작업을 맡기셨나요?", a: "답변 placeholder." },
      { q: "베트남 인재와의 협업은 어땠나요?", a: "답변 placeholder." },
      { q: "결과물에 만족하시나요?", a: "답변 placeholder." },
    ],
    siteUrl: null,
  },
  {
    slug: "case-3",
    company: "고객사 C",
    industry: "업종 placeholder",
    scope: "작업 범위 placeholder",
    talentRole: "직무 placeholder",
    title: "사례 제목이 들어갈 자리입니다 — 성과 중심 한 줄",
    summary: "사례 요약 한 줄이 들어갈 자리입니다.",
    thumbnail: "",
    images: [],
    metrics: [
      { value: "N%", label: "지표 placeholder" },
      { value: "N주", label: "지표 placeholder" },
      { value: "N건", label: "지표 placeholder" },
    ],
    quote: "대표 인용구 placeholder.",
    quoteBy: "고객사 C · 담당자",
    interview: [
      { q: "어떤 작업을 맡기셨나요?", a: "답변 placeholder." },
      { q: "베트남 인재와의 협업은 어땠나요?", a: "답변 placeholder." },
      { q: "결과물에 만족하시나요?", a: "답변 placeholder." },
    ],
    siteUrl: null,
  },
];

export function getCaseBySlug(slug: string) {
  return CASE_STUDIES.find((c) => c.slug === slug) || null;
}
