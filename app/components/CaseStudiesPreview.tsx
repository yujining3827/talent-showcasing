"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { CASE_STUDIES, type CaseStudy } from "@/lib/caseStudies";

// 랜딩 미리보기는 '기업 후기'만 (인재 후기는 노출 안 함)
const companyOnly = (list: CaseStudy[]) => list.filter((c) => (c.type || "company") === "company").slice(0, 6);

// 만족 증거 3단 — FYI 덱 PROOF 섹션 이식 (수치·인용은 덱 기준, 광고 전 실측 확정 필요)
const PROOFS = [
  {
    value: "9개월+",
    label: "평균 근속 기간",
    note: "단기 용역이 아닌 장기 협업 중심",
    company: "Lomen · 2025·2026년 연속 채용",
    quote: "성과는 그대로인데 비용이 줄었어요",
  },
  {
    value: "83%",
    label: "재채용률",
    note: "계약 만료 후 연장 또는 추가 채용",
    company: "Nexacode · 2025·2026년 연속 채용",
    quote: "인재 역량이 기대 이상이었습니다",
  },
  {
    value: "4.5+",
    label: "기업 만족도",
    note: "도입 기업 설문 기준",
    company: "MnF Solution · 2025·2026년 연속 채용",
    quote: "경험해보고 신뢰가 생겨 올해도 재진행합니다",
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
        {/* 만족 증거 배너 — 오렌지 그라데이션 위 빅 스테이트먼트 */}
        <div className="rounded-[28px] bg-[radial-gradient(140%_140%_at_15%_0%,#FF9D5C,#E8590C_70%)] px-6 py-12 text-center md:py-16">
          <h2 className="mx-auto max-w-[820px] break-keep text-[26px] font-extrabold leading-[1.3] text-white sm:text-[36px] md:text-[44px]">
            다시 채용했다는 것,
            <br />
            가장 확실한 만족의 증거입니다
          </h2>
        </div>

        {/* PROOF 3단 — 수치 + 근거 + 실기업 인용 */}
        <div className="mt-10 grid grid-cols-1 gap-9 sm:grid-cols-3 sm:gap-8 md:mt-14">
          {PROOFS.map((proof, i) => (
            <div key={proof.label}>
              <div className="flex items-start justify-between gap-3">
                <p className="text-[36px] font-extrabold leading-none tracking-[-0.01em] text-[#191714] sm:text-[42px]">{proof.value}</p>
                <span className="rounded-full bg-[#191714] px-2.5 py-1 text-[10px] font-bold tracking-[0.08em] text-white">PROOF {i + 1}</span>
              </div>
              <p className="mt-2 text-[14px] font-semibold text-[#3A4356]">{proof.label}</p>
              <p className="mt-1 text-[13px] font-medium text-[#E8590C]">{proof.note}</p>
              <div className="mt-4 border-t border-[#E3D9C9] pt-3.5">
                <p className="text-[13px] font-bold text-[#191714]">{proof.company}</p>
                <p className="mt-1 text-[13px] leading-[1.6] text-[#6F675C]">“{proof.quote}”</p>
              </div>
            </div>
          ))}
        </div>

        {/* 사례 캐러셀 */}
        <div className="mt-12 flex items-center justify-between md:mt-16">
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
