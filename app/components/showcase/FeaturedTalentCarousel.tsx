"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";

/* ============================================================================
 *  Featured Talent 캐러셀 데이터
 *  ⚠️ 여기만 수정하면 카드가 추가/변경됩니다.
 *   - image: 대표 이미지 경로 (null 이면 Placeholder UI 표시)
 *   - role:  직무 (카드 하단 큰 텍스트)
 *   - skills: 핵심 기술스택 칩
 * ========================================================================== */
export type FeaturedTalent = {
  id: string;
  role: string;
  skills: string[];
  image?: string | null;
};

export const FEATURED_TALENTS: FeaturedTalent[] = [
  { id: "ft-1", role: "Senior Backend Engineer", skills: ["Spring Boot", "AWS", "Kubernetes"], image: null },
  { id: "ft-2", role: "Frontend Engineer", skills: ["React", "TypeScript", "Next.js"], image: null },
  { id: "ft-3", role: "Product Designer", skills: ["Figma", "Design System", "UX Research"], image: null },
  { id: "ft-4", role: "AI / ML Engineer", skills: ["PyTorch", "LLM", "RAG"], image: null },
  { id: "ft-5", role: "Growth Marketer", skills: ["Performance", "GA4", "SQL"], image: null },
  { id: "ft-6", role: "Product Manager", skills: ["Roadmap", "Analytics", "A/B Test"], image: null },
];

/* ---- 개별 카드 ---- */
function TalentCard({ talent }: { talent: FeaturedTalent }) {
  return (
    <article className="group relative aspect-[4/3] overflow-hidden rounded-xl bg-[#EEF1F6] shadow-[0_12px_40px_-28px_rgba(10,18,32,0.5)] transition-shadow duration-300 hover:shadow-[0_28px_60px_-30px_rgba(232,89,12,0.45)]">
      {/* 대표 이미지 / Placeholder */}
      {talent.image ? (
        <img
          src={talent.image}
          alt={talent.role}
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#F1F3F7] to-[#DDE3EC] transition-transform duration-500 ease-out group-hover:scale-[1.06]">
          <span className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#AEB6C4]">Placeholder</span>
        </div>
      )}

      {/* 하단 그라디언트 오버레이 */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[62%] bg-gradient-to-t from-black/85 via-black/45 to-transparent" />

      {/* 텍스트 (이미지 하단) */}
      <div className="absolute inset-x-0 bottom-0 p-5">
        <h3 className="text-[18px] font-bold leading-[1.3] text-white">{talent.role}</h3>
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
    </article>
  );
}

/* ---- 좌우 화살표 ---- */
function ArrowButton({ direction, onClick, disabled }: { direction: "prev" | "next"; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={direction === "prev" ? "이전" : "다음"}
      className="flex h-11 w-11 items-center justify-center rounded-full border border-[#E4E8EF] bg-white text-[#59657A] shadow-[0_6px_16px_-8px_rgba(10,18,32,0.35)] transition hover:border-[#E8590C] hover:text-[#E8590C] disabled:cursor-not-allowed disabled:opacity-40"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d={direction === "prev" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
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
  autoplayDelay = 4000,
}: FeaturedTalentCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "start", dragFree: false, containScroll: "trimSnaps" },
    [Autoplay({ delay: autoplayDelay, stopOnInteraction: false, stopOnMouseEnter: true })]
  );

  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanPrev(emblaApi.canScrollPrev());
    setCanNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect).on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect).off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  return (
    <section id="portfolio" className="bg-white scroll-mt-[84px]">
      <div className="mx-auto max-w-[1360px] px-5 py-24">
        {/* 헤더 + 화살표 */}
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-[680px]">
            <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-[#E8590C]">{eyebrow}</p>
            <h2 className="mt-3 text-[34px] font-semibold tracking-normal text-[#171E2D] md:text-[44px]">{title}</h2>
            <p className="mt-4 text-[17px] leading-[1.7] text-[#5B667A]">{description}</p>
          </div>
          <div className="flex shrink-0 gap-2.5">
            <ArrowButton direction="prev" onClick={scrollPrev} disabled={!canPrev} />
            <ArrowButton direction="next" onClick={scrollNext} disabled={!canNext} />
          </div>
        </div>

        {/* 캐러셀 뷰포트 */}
        <div className="mt-12 overflow-hidden" ref={emblaRef}>
          <div className="-ml-5 flex touch-pan-y">
            {talents.map((talent) => (
              <div
                key={talent.id}
                className="min-w-0 shrink-0 grow-0 basis-[85%] pl-5 sm:basis-1/2 lg:basis-1/2 xl:basis-1/3"
              >
                <TalentCard talent={talent} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
