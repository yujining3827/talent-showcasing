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
    <section id="cases" className="bg-[#F6F1E9] scroll-mt-[84px]">
      <div className="mx-auto max-w-[1360px] px-5 py-16 md:py-28">
        {/* 에디토리얼 챕터 헤더 — 빅 스테이트먼트 + 스탯 */}
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between md:gap-10">
          <h2 className="max-w-[720px] break-keep text-[30px] font-extrabold leading-[1.22] tracking-[-0.01em] text-[#191714] sm:text-[40px] md:text-[52px]">
            베트남 인재,
            <br />
            이렇게 쓰고 있습니다
          </h2>
          <Link
            href="/cases"
            className="inline-flex shrink-0 items-center gap-1 pb-1 text-[14px] font-semibold text-[#E8590C] transition hover:text-[#C74E0A]"
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
                {/* 클릭 전에 판단 재료 먼저: 활용 영역 → 실질 결과 → 인터뷰 유무 */}
                <div className="mt-3.5 flex flex-col gap-2">
                  <div className="flex items-baseline gap-3">
                    <span className="w-[58px] shrink-0 text-[11px] font-semibold text-[#9AA3B2]">활용 영역</span>
                    <div className="flex flex-wrap gap-1.5">
                      {(c.talentRole || "").split("·").map((r) => r.trim()).filter(Boolean).map((r) => (
                        <span key={r} className="rounded-full bg-[#F1F3F7] px-2 py-0.5 text-[11px] font-medium text-[#5B667A]">{r}</span>
                      ))}
                    </div>
                  </div>
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
          ))}
        </div>
      </div>
    </section>
  );
}
