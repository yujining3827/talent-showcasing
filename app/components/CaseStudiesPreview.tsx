"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CASE_STUDIES, type CaseStudy } from "@/lib/caseStudies";

// 랜딩 미리보기는 '기업 후기'만 3개 고정 (인재 후기는 노출 안 함)
const companyOnly = (list: CaseStudy[]) => list.filter((c) => (c.type || "company") === "company").slice(0, 3);

/* 랜딩 — 고객 사례 미리보기 (기업 후기 상위 3개). 정적 + DB(어드민 추가분) 병합. */
export default function CaseStudiesPreview() {
  // 정적 사례로 즉시 렌더 후, DB 병합본으로 교체 (깜빡임 방지)
  const [cases, setCases] = useState<CaseStudy[]>(companyOnly(CASE_STUDIES));

  useEffect(() => {
    fetch("/api/cases")
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d.cases)) setCases(companyOnly(d.cases as CaseStudy[]));
      })
      .catch(() => {});
  }, []);

  if (cases.length === 0) return null;

  return (
    <section id="cases" className="bg-white scroll-mt-[84px]">
      <div className="mx-auto hidden max-w-[1360px] px-5 py-24 md:block">
        {/* 헤더 + 전체 보기 */}
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between md:gap-10">
          <div className="max-w-[680px]">
            <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-[#E8590C]">고객 사례</p>
            <h2 className="mt-3 text-[26px] font-semibold tracking-normal text-[#171E2D] sm:text-[34px] md:text-[44px]">
              공고마감으로 완성한 실제 프로젝트
            </h2>
            <p className="mt-4 text-[15px] leading-[1.7] text-[#5B667A] md:text-[17px]">
              검증된 베트남 인재가 실제 고객사와 함께 만든 결과물을 확인해보세요.
            </p>
          </div>
          <Link
            href="/cases"
            className="inline-flex shrink-0 items-center gap-1 text-[14px] font-semibold text-[#E8590C] transition hover:text-[#C74E0A]"
          >
            전체 사례 보기
            <span aria-hidden>→</span>
          </Link>
        </div>

        {/* 사례 카드 (상위 3개) */}
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 md:mt-12 lg:grid-cols-3">
          {cases.map((c) => (
            <Link
              key={c.slug}
              href={`/cases/${c.slug}`}
              className="group flex flex-col overflow-hidden rounded-xl border border-[#E4E8EF] bg-white transition-shadow hover:shadow-[0_20px_50px_-30px_rgba(10,18,32,0.45)]"
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
                <p className="mt-2.5 text-[17px] font-semibold leading-[1.45] text-[#171E2D]">{c.title}</p>
                <p className="mt-2 text-[13px] leading-[1.6] text-[#5B667A]">{c.summary}</p>
                <span className="mt-auto inline-flex items-center gap-1 pt-4 text-[13px] font-semibold text-[#E8590C]">
                  사례 자세히 보기
                  <span aria-hidden>→</span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* 모바일 — 컴팩트 가로 카드 */}
      <div className="px-5 py-11 md:hidden">
        <p className="text-center text-[12px] font-semibold uppercase tracking-[0.14em] text-[#E8590C]">고객 사례</p>
        <h2 className="mt-2 text-center text-[22px] font-bold leading-[1.4] text-[#171E2D]">
          공고마감으로 완성한
          <br />
          실제 프로젝트
        </h2>
        <div className="mt-6 flex flex-col gap-3">
          {cases.map((c) => (
            <Link
              key={c.slug}
              href={`/cases/${c.slug}`}
              className="flex gap-3.5 overflow-hidden rounded-2xl border border-[#EDEFF3] bg-white p-3 transition active:scale-[0.995]"
            >
              <div className="relative h-[76px] w-[104px] shrink-0 overflow-hidden rounded-xl bg-[#F1F3F7]">
                {c.thumbnail ? (
                  <img src={c.thumbnail} alt={c.company} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#F1F3F7] to-[#DDE3EC]">
                    <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#AEB6C4]">준비중</span>
                  </div>
                )}
              </div>
              <div className="flex min-w-0 flex-1 flex-col justify-center">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="rounded-full bg-[#FFF1E8] px-2 py-0.5 text-[10.5px] font-semibold text-[#E8590C]">{c.company}</span>
                  <span className="truncate text-[11px] text-[#8A93A5]">{c.industry}</span>
                </div>
                <p className="mt-1.5 line-clamp-2 text-[14px] font-bold leading-[1.4] text-[#171E2D]">{c.title}</p>
              </div>
            </Link>
          ))}
        </div>
        <Link href="/cases" className="mt-6 flex items-center justify-center gap-1 text-[14px] font-semibold text-[#E8590C]">
          전체 사례 보기 <span aria-hidden>→</span>
        </Link>
      </div>
    </section>
  );
}
