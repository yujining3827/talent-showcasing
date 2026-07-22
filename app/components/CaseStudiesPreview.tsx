"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { CASE_STUDIES, type CaseStudy } from "@/lib/caseStudies";

// 랜딩 미리보기는 '기업 후기'만 (인재 후기는 노출 안 함)
const companyOnly = (list: CaseStudy[]) => list.filter((c) => (c.type || "company") === "company").slice(0, 6);

function ChevronIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d={direction === "left" ? "M15 18l-6-6 6-6" : "M9 18l6-6-6-6"} />
    </svg>
  );
}

/* 랜딩 — 만족 증거 배너 + PROOF 3단 + 사례 캐러셀. 정적 + DB(어드민 추가분) 병합. */
export default function CaseStudiesPreview() {
  // 정적 사례로 즉시 렌더 후, DB 병합본으로 교체 (깜빡임 방지)
  const [cases, setCases] = useState<CaseStudy[]>(companyOnly(CASE_STUDIES));
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start" }, [
    Autoplay({ delay: 3600, stopOnInteraction: false, stopOnMouseEnter: false }),
  ]);

  useEffect(() => {
    fetch("/api/cases")
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d.cases)) setCases(companyOnly(d.cases as CaseStudy[]));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    emblaApi?.reInit();
  }, [cases, emblaApi]);

  if (cases.length === 0) return null;

  return (
    <section id="cases" className="bg-[#F6F1E9] scroll-mt-[84px]">
      <div className="mx-auto max-w-[1360px] px-5 py-12 md:py-16">
        {/* 사례 캐러셀 */}
        <div className="flex items-center justify-between">
          <p className="text-[15px] font-bold text-[#191714] sm:text-[17px]">실제 프로젝트 사례</p>
          <Link href="/cases" className="inline-flex items-center gap-1 text-[14px] font-semibold text-[#E8590C] transition hover:text-[#C74E0A]">
            전체 사례 보기
            <span aria-hidden>→</span>
          </Link>
        </div>
        <div className="relative mt-5">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex">
              {cases.map((c) => (
                <div key={c.slug} className="min-w-0 shrink-0 basis-full pr-3 sm:basis-[420px] sm:pr-5">
                  <Link
                    href={`/cases/${c.slug}`}
                    className="group flex h-full flex-col overflow-hidden rounded-xl border border-[#E4E8EF] bg-white transition-shadow hover:shadow-[0_20px_50px_-30px_rgba(10,18,32,0.45)]"
                  >
                    <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#F1F3F7]">
                      {c.thumbnail ? (
                        <img
                          src={c.thumbnail}
                          alt={c.company}
                          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.05]"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#F1F3F7] to-[#DDE3EC]">
                          <span className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#AEB6C4]">사례 준비 중</span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${c.type === "talent" ? "bg-[#E6F7EE] text-[#12A150]" : "bg-[#FFF1E8] text-[#E8590C]"}`}>{c.company}</span>
                        <span className="text-[12px] text-[#8A93A5]">{c.industry}</span>
                      </div>
                      {/* 클릭 전에 판단 재료 먼저: 활용 영역 → 투입 인재 → 진행 범위 → 실질 결과 */}
                      <div className="mt-3.5 flex flex-col gap-2">
                        <div className="flex items-baseline gap-3">
                          <span className="w-[58px] shrink-0 text-[11px] font-semibold text-[#9AA3B2]">활용 영역</span>
                          <div className="flex flex-wrap gap-1.5">
                            {(c.talentRole || "").split("·").map((r) => r.trim()).filter(Boolean).map((r) => (
                              <span key={r} className="rounded-full bg-[#F1F3F7] px-2 py-0.5 text-[11px] font-medium text-[#5B667A]">{r}</span>
                            ))}
                          </div>
                        </div>
                        {c.teamSize && (
                          <div className="flex items-baseline gap-3">
                            <span className="w-[58px] shrink-0 text-[11px] font-semibold text-[#9AA3B2]">투입 인재</span>
                            <span className="text-[13px] font-medium text-[#3A4356]">{c.teamSize}</span>
                          </div>
                        )}
                        <div className="flex items-baseline gap-3">
                          <span className="w-[58px] shrink-0 text-[11px] font-semibold text-[#9AA3B2]">진행 범위</span>
                          <span className="text-[13px] font-medium text-[#3A4356]">{c.scope}</span>
                        </div>
                        <div className="flex items-baseline gap-3">
                          <span className="w-[58px] shrink-0 text-[11px] font-semibold text-[#9AA3B2]">결과</span>
                          <span className="text-[13px] font-bold text-[#E8590C]">{c.result || c.summary}</span>
                        </div>
                      </div>
                      <span className="mt-auto inline-flex items-center gap-1 pt-4 text-[13px] font-semibold text-[#E8590C]">
                        {c.quoteBy ? `${c.quoteBy.split("·")[1]?.trim() || c.company} 인터뷰 보기` : "사례 자세히 보기"}
                        <span aria-hidden>→</span>
                      </span>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
          {cases.length > 1 && (
            <>
              <button
                type="button"
                aria-label="이전 사례 보기"
                onClick={() => emblaApi?.scrollPrev()}
                className="absolute left-2 top-1/2 z-20 flex -translate-y-1/2 items-center justify-center rounded-full bg-white/95 p-2 text-[#3A4356] shadow-[0_8px_20px_-8px_rgba(10,18,32,0.4)] transition hover:text-[#E8590C] md:left-0 md:-translate-x-1/2 md:p-2.5"
              >
                <ChevronIcon direction="left" />
              </button>
              <button
                type="button"
                aria-label="다음 사례 보기"
                onClick={() => emblaApi?.scrollNext()}
                className="absolute right-2 top-1/2 z-20 flex -translate-y-1/2 items-center justify-center rounded-full bg-white/95 p-2 text-[#3A4356] shadow-[0_8px_20px_-8px_rgba(10,18,32,0.4)] transition hover:text-[#E8590C] md:right-0 md:translate-x-1/2 md:p-2.5"
              >
                <ChevronIcon direction="right" />
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
