"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { CASE_STUDIES, type CaseStudy } from "@/lib/caseStudies";

// 랜딩 미리보기는 '기업 후기'만 (인재 후기는 노출 안 함)
const companyOnly = (list: CaseStudy[]) => list.filter((c) => (c.type || "company") === "company").slice(0, 6);

const PROOF_STATS = [
  {
    label: "평균 협업 기간",
    value: "9개월+",
    meaning: "장기 협업",
  },
  {
    label: "재채용률",
    value: "83%",
    meaning: "연장·추가 채용",
  },
  {
    label: "기업 만족도",
    value: "4.5+",
    meaning: "도입 기업 설문",
  },
];

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
        <div className="overflow-hidden border border-[#282622] bg-[#282622]">
          <div className="relative aspect-[4/3] overflow-hidden bg-[#2A2119] sm:aspect-[16/8] md:aspect-[16/7]">
            <Image
              src="/eor-staffing-operations-v1.png"
              alt="한국 기업과 글로벌 실무팀을 연결하는 EOR 및 스태핑 운영"
              fill
              sizes="(min-width: 768px) 1360px, 100vw"
              quality={88}
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(20,14,10,0.78)_0%,rgba(20,14,10,0.42)_38%,rgba(20,14,10,0.04)_72%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(20,14,10,0.5)_0%,transparent_48%)]" />
            <div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-8 md:p-10">
              <h2 className="max-w-[650px] break-keep text-[27px] font-extrabold leading-[1.2] sm:text-[38px] md:text-[48px]">
                함께한 기업 10곳 중 8곳은
                <br />
                다시 채용합니다
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-3 bg-[#F15A24] text-[#191714]">
            {PROOF_STATS.map((stat, index) => (
              <div key={stat.label} className={`min-w-0 px-3 py-4 sm:px-6 sm:py-6 md:px-8 md:py-7 ${index > 0 ? "border-l border-black/30" : ""}`}>
                <p className="text-[29px] font-extrabold leading-none sm:text-[44px] md:text-[58px]">{stat.value}</p>
                <p className="mt-2 break-keep text-[10px] font-extrabold leading-[1.25] sm:text-[13px] md:text-[14px]">{stat.label}</p>
                <p className="mt-1 hidden text-[11px] font-semibold text-black/62 sm:block md:text-[12px]">{stat.meaning}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 사례 캐러셀 */}
        <div className="mt-10 flex items-center justify-between md:mt-14">
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
