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
            파트너들은 이미
            <br />
            인건비를 <span className="text-[#E8590C]">최대 60%</span>까지
            <br />
            줄이고 있습니다
          </h2>
          <Link
            href="/cases"
            className="inline-flex shrink-0 items-center gap-1 pb-1 text-[14px] font-semibold text-[#E8590C] transition hover:text-[#C74E0A]"
          >
            전체 사례 보기
            <span aria-hidden>→</span>
          </Link>
        </div>

        {/* 스탯 밴드 — 레퍼런스의 58/60/61% 트리트먼트 */}
        <div className="mt-10 grid grid-cols-1 gap-6 border-t border-[#E3D9C9] pt-8 sm:grid-cols-3 md:mt-14 md:pt-10">
          {[
            { value: "60%", caption: "최대 인건비 절감" },
            { value: "20,000명", caption: "검증 베트남 인재 풀" },
            { value: "2주", caption: "무료 트라이얼" },
          ].map((stat) => (
            <div key={stat.caption}>
              <p className="text-[36px] font-extrabold leading-none tracking-[-0.01em] text-[#191714] sm:text-[44px]">{stat.value}</p>
              <p className="mt-2 text-[13px] text-[#6F675C] sm:text-[14px]">{stat.caption}</p>
            </div>
          ))}
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
    </section>
  );
}
