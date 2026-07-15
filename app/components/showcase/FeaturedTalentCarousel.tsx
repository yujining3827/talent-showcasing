"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";

/* ============================================================================
 *  Featured Talent 캐러셀 데이터
 *  ⚠️ 여기만 수정하면 카드가 추가/변경됩니다.
 *   - image: 대표 이미지 경로 (null 이면 Placeholder UI 표시)
 *   - role:  직무 (카드 하단 큰 텍스트)
 *   - skills: 핵심 기술스택 칩
 *   - link:  포트폴리오 링크 (있으면 카드 클릭 시 새 탭으로 열림)
 * ========================================================================== */
export type FeaturedTalent = {
  id: string;
  role: string; // 직무 (카드 상단 작은 라벨)
  title: string; // 프로젝트 제목 (카드 큰 타이틀)
  category: string; // 대분류 (칩 필터용): 개발 · 디자인 · QA · 인공지능 · 마케팅
  skills: string[];
  image?: string | null;
  link?: string | null;
};

// 칩 노출 순서 (해당 카테고리에 카드가 있을 때만 칩 표시)
export const PORTFOLIO_CATEGORIES = ["개발", "디자인", "QA", "인공지능", "마케팅"];

// ⚠️ 이미지 파일은 public/portfolio/ 아래에 아래 파일명으로 저장하세요.
//   리다이렉트 링크(link)는 추후 연결 예정 — 지금은 전부 null.
//   (기존 Cao Thanh Hung Figma 링크 보관용:
//    https://www.figma.com/proto/qFUpJXy9VQx44VuGtJ6OO6/CAO-THANH-HUNG-PORTFOLIO?page-id=0%3A1&node-id=928-154820&starting-point-node-id=903%3A2 )
export const FEATURED_TALENTS: FeaturedTalent[] = [
  { id: "ft-qa", role: "Senior QA Engineer", title: "테스트 자동화 · 품질 대시보드", category: "개발", skills: ["Test Automation", "Jira", "API Testing"], image: "/portfolio/qa.png", link: null },
  { id: "ft-fullstack", role: "Full-stack Developer", title: "SaaS 어드민 대시보드 구축", category: "개발", skills: ["React", "Node.js", "TypeScript"], image: "/portfolio/fullstack.png", link: null },
  { id: "ft-package", role: "Package Designer", title: "그루밍 브랜드 LE NORD 패키지 디자인", category: "디자인", skills: ["Packaging", "Branding", "Print"], image: "/portfolio/package_design.png", link: null },
  // 잠시 숨김 처리 (추후 복구 시 주석 해제)
  // { id: "ft-graphic", role: "Graphic Designer", title: "문화·F&B 브랜드·포스터 그래픽", category: "디자인", skills: ["Branding", "Editorial", "Print"], image: "/portfolio/poster_design.png", link: null },
  { id: "ft-uiux", role: "UX/UI Designer", title: "커머스 앱 UX/UI 리디자인", category: "디자인", skills: ["Figma", "Wireframing", "Design System"], image: "/portfolio/uiux.png", link: null },
  { id: "ft-senior-uiux", role: "Senior UX/UI Designer", title: "핀테크 앱 FinMate UX/UI 디자인", category: "디자인", skills: ["Figma", "Design System", "Prototyping"], image: "/portfolio/senior_uiux.png", link: null },
  { id: "ft-cardnews", role: "Content Designer", title: "이벤트·리테일 SNS 카드뉴스·포스터", category: "디자인", skills: ["Social Media", "Card News", "Poster"], image: "/portfolio/cardnews_design.png", link: null },
  { id: "ft-frontend", role: "Front End Developer", title: "React 포트폴리오 웹사이트", category: "개발", skills: ["React", "TypeScript", "Next.js"], image: "/portfolio/frontend.png", link: null },
  { id: "ft-product-design", role: "Product Marketer", title: "뷰티 브랜드 스킨케어 런칭 캠페인", category: "마케팅", skills: ["Campaign Strategy", "Paid Ads", "ROAS"], image: "/portfolio/product-design.png", link: null },
  { id: "ft-growth", role: "Growth Marketer", title: "이커머스 퍼포먼스 광고·전환 최적화", category: "마케팅", skills: ["Performance", "GA4", "ROAS"], image: "/portfolio/growth.png", link: null },
  { id: "ft-influencer", role: "Influencer Marketer", title: "뷰티 인플루언서 마케팅 캠페인", category: "마케팅", skills: ["Influencer", "Instagram", "Social Media"], image: "/portfolio/influence_marketing.png", link: null },
  { id: "ft-backend", role: "Senior Backend Developer", title: "MSA 백엔드 아키텍처 설계", category: "개발", skills: ["AWS", "Kafka", "Kubernetes"], image: "/portfolio/backend.png", link: null },
  { id: "ft-beauty-social", role: "Social Marketer", title: "그루밍 브랜드 SNS·커머스 마케팅", category: "마케팅", skills: ["Social Media", "E-commerce", "Content"], image: "/portfolio/beauty_social.png", link: null },
  { id: "ft-housing", role: "Product Designer", title: "부동산 플랫폼 nhapho123 UX/UI", category: "디자인", skills: ["Figma", "Web Design", "Mobile App"], image: "/portfolio/housing_service_design.png", link: null },
];

/* ---- 개별 카드 ---- */
function TalentCard({ talent }: { talent: FeaturedTalent }) {
  const [imgFailed, setImgFailed] = useState(false);
  const cardClass =
    "group relative block aspect-[16/10] overflow-hidden rounded-xl bg-[#EEF1F6] shadow-[0_12px_40px_-28px_rgba(10,18,32,0.5)] transition-shadow duration-300 hover:shadow-[0_28px_60px_-30px_rgba(232,89,12,0.45)]";

  const inner = (
    <>
      {/* 대표 이미지 / Placeholder (이미지 없거나 로드 실패 시 폴백) */}
      {talent.image && !imgFailed ? (
        <img
          src={talent.image}
          alt={talent.role}
          onError={() => setImgFailed(true)}
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#F1F3F7] to-[#DDE3EC] transition-transform duration-500 ease-out group-hover:scale-[1.06]">
          <span className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#AEB6C4]">Placeholder</span>
        </div>
      )}

      {/* 링크 있으면 우상단 외부링크 표시 */}
      {talent.link && (
        <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-[#E8590C] shadow-sm transition group-hover:bg-[#E8590C] group-hover:text-white">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M7 17 17 7M17 7H9M17 7v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      )}

      {/* 하단 그라디언트 오버레이 */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[62%] bg-gradient-to-t from-black/85 via-black/45 to-transparent" />

      {/* 텍스트 (이미지 하단) — 직무 라벨 + 프로젝트 타이틀 */}
      <div className="absolute inset-x-0 bottom-0 p-5">
        <p className="text-[11.5px] font-semibold uppercase tracking-[0.14em] text-white/70">{talent.role}</p>
        <h3 className="mt-1 text-[19px] font-bold leading-[1.3] text-white">{talent.title}</h3>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {talent.skills.map((skill) => (
            <span
              key={skill}
              className="rounded-full border border-white/20 bg-white/15 px-2.5 py-1 text-[12px] font-medium text-white backdrop-blur-sm"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>
    </>
  );

  if (talent.link) {
    return (
      <a href={talent.link} target="_blank" rel="noopener noreferrer" className={cardClass} aria-label={`${talent.role} 포트폴리오 보기`}>
        {inner}
      </a>
    );
  }
  return <article className={cardClass}>{inner}</article>;
}

/* ---- 대분류 칩 (세그먼트 컨트롤) ---- */
function CategoryChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`shrink-0 whitespace-nowrap rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-all duration-200 sm:px-4 sm:py-2 sm:text-[13.5px] ${
        active ? "bg-white text-[#E8590C] shadow-[0_2px_8px_-2px_rgba(10,18,32,0.2)]" : "text-[#8A93A5] hover:text-[#3A4356]"
      }`}
    >
      {label}
    </button>
  );
}

type FeaturedTalentCarouselProps = {
  talents?: FeaturedTalent[];
  eyebrow?: string;
  title?: string;
  description?: string;
  autoplayDelay?: number;
};

export default function FeaturedTalentCarousel({
  talents = FEATURED_TALENTS,
  eyebrow = "Featured talent",
  title = "직무별 포트폴리오 미리보기",
  description = "실제 인재들의 대표 작업물을 직무별로 넘겨보며 가볍게 확인하세요.",
  autoplayDelay = 2500,
}: FeaturedTalentCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "start", dragFree: false, containScroll: "trimSnaps" },
    [Autoplay({ delay: autoplayDelay, stopOnInteraction: false, stopOnMouseEnter: true })]
  );

  // 대분류 칩 필터 — 카드가 있는 카테고리만 노출
  const categories = useMemo(
    () => ["전체", ...PORTFOLIO_CATEGORIES.filter((c) => talents.some((t) => t.category === c))],
    [talents]
  );
  const [activeCategory, setActiveCategory] = useState("전체");
  const filtered = useMemo(
    () => (activeCategory === "전체" ? talents : talents.filter((t) => t.category === activeCategory)),
    [talents, activeCategory]
  );

  // loop 캐러셀이라 화살표는 항상 활성 (양 끝 비활성 처리 불필요)
  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  // 카테고리 전환 시 슬라이드 재계산 + 처음으로
  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.reInit();
    emblaApi.scrollTo(0, true);
  }, [emblaApi, activeCategory]);

  return (
    <section id="portfolio" className="bg-white scroll-mt-[84px]">
      <div className="mx-auto max-w-[1360px] px-5 py-14 md:py-24">
        {/* 헤더 (좌: 타이틀 / 우: 칩 세그먼트 + 화살표) */}
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between md:gap-10">
          <div className="max-w-[560px]">
            <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-[#E8590C]">{eyebrow}</p>
            <h2 className="mt-3 text-[26px] font-semibold tracking-normal text-[#171E2D] sm:text-[34px] md:text-[44px]">{title}</h2>
            <p className="mt-4 text-[15px] leading-[1.7] text-[#5B667A] md:text-[17px]">{description}</p>
          </div>

          {/* 우측 — 세그먼트 칩 (모바일: 넘치면 가로 스크롤, 줄바꿈 없음) */}
          <div className="w-full md:w-auto">
            <div className="inline-flex max-w-full items-center gap-1 overflow-x-auto rounded-full border border-[#ECEFF3] bg-[#F5F6F8] p-1 scrollbar-hide">
              {categories.map((cat) => (
                <CategoryChip key={cat} label={cat} active={cat === activeCategory} onClick={() => setActiveCategory(cat)} />
              ))}
            </div>
          </div>
        </div>

        {/* 캐러셀 (호버 시 양 끝 화살표 노출 — hero 슬라이드 방식) */}
        {/* group/carousel: 화살표 노출 전용 (카드 줌은 각 카드의 group으로 분리) */}
        <div className="group/carousel relative mt-8 md:mt-12">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="-ml-5 flex touch-pan-y">
              {filtered.map((talent) => (
                <div
                  key={talent.id}
                  className="min-w-0 shrink-0 grow-0 basis-[85%] pl-5 sm:basis-1/2 lg:basis-1/2 xl:basis-1/3"
                >
                  <TalentCard talent={talent} />
                </div>
              ))}
            </div>
          </div>

          {/* 오버레이 화살표 — hero 슬라이드처럼 작게 양 끝에 걸쳐서, 데스크톱 호버 시 노출 */}
          <button
            type="button"
            onClick={scrollPrev}
            aria-label="이전"
            className="absolute left-0 top-1/2 z-30 hidden -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 p-2 text-[#8A93A5] opacity-0 shadow-[0_6px_16px_-8px_rgba(10,18,32,0.35)] backdrop-blur transition duration-200 hover:bg-white hover:text-[#E8590C] group-hover/carousel:opacity-100 md:flex"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            type="button"
            onClick={scrollNext}
            aria-label="다음"
            className="absolute right-0 top-1/2 z-30 hidden -translate-y-1/2 translate-x-1/2 items-center justify-center rounded-full bg-white/80 p-2 text-[#8A93A5] opacity-0 shadow-[0_6px_16px_-8px_rgba(10,18,32,0.35)] backdrop-blur transition duration-200 hover:bg-white hover:text-[#E8590C] group-hover/carousel:opacity-100 md:flex"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
