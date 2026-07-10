import Link from "next/link";
import ContactCTA from "@/app/components/ContactCTA";
import { CASE_STUDIES } from "@/lib/caseStudies";

export const metadata = {
  title: "고객 사례 — 공고마감 by LIKELION",
  description: "베트남 인재가 실제로 작업한 고객 사례를 확인해보세요.",
};

/* 고객 사례 리스트 — 그리팅HR customer-stories 양식 참고한 와꾸 */
export default function CasesPage() {
  return (
    <main className="min-h-screen bg-white text-[#171E2D]">
      {/* 헤더 (pricing 페이지와 동일 패턴) */}
      <header className="sticky top-0 z-50 border-b border-[#EEF1F5] bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-[60px] max-w-[1100px] items-center justify-between px-5 sm:h-[72px]">
          <Link href="/" className="flex items-center" aria-label="공고마감 by LIKELION">
            <img src="/logo-wordmark.png" alt="공고마감 by LIKELION" className="h-8 w-auto sm:h-9" />
          </Link>
          <Link href="/pricing" className="rounded-sm bg-[#E8590C] px-4 py-2.5 text-[14px] font-semibold text-white transition hover:bg-[#C74E0A] sm:px-6 sm:py-3 sm:text-[15px]">
            바로 채용하기
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-[1100px] px-5 py-12 md:py-20">
        {/* 타이틀 */}
        <div className="max-w-[680px]">
          <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-[#E8590C]">Customer stories</p>
          <h1 className="mt-3 text-[28px] font-bold leading-[1.3] sm:text-[36px] md:text-[44px]">
            베트남 인재가
            <br />
            실제로 만든 결과물입니다
          </h1>
          <p className="mt-4 text-[15px] leading-[1.7] text-[#5B667A] md:text-[17px]">
            공고마감으로 채용한 기업들의 생생한 작업 사례를 확인해보세요.
          </p>
        </div>

        {/* 핵심 지표 3블록 — ⚠️ 실제 수치 확정 시 교체 */}
        <div className="mt-10 grid grid-cols-1 gap-4 border-y border-[#EEF1F5] py-8 sm:grid-cols-3 md:mt-14">
          {[
            { value: "N주", label: "평균 프로젝트 착수까지" },
            { value: "50%", label: "국내 대비 인건비 절감" },
            { value: "N개", label: "완료된 프로젝트" },
          ].map((m) => (
            <div key={m.label}>
              <p className="text-[26px] font-bold text-[#E8590C] sm:text-[32px]">{m.value}</p>
              <p className="mt-1 text-[13px] text-[#5B667A]">{m.label}</p>
            </div>
          ))}
        </div>

        {/* 사례 카드 그리드 → 상세 라우트 */}
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 md:mt-14 lg:grid-cols-3">
          {CASE_STUDIES.map((c) => (
            <Link
              key={c.slug}
              href={`/cases/${c.slug}`}
              className="group flex flex-col overflow-hidden rounded-xl border border-[#E4E8EF] bg-white transition-shadow hover:shadow-[0_20px_50px_-30px_rgba(10,18,32,0.45)]"
            >
              {/* 썸네일 */}
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
                  <span className="rounded-full bg-[#FFF1E8] px-2.5 py-0.5 text-[11px] font-semibold text-[#E8590C]">{c.company}</span>
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

      <ContactCTA />
    </main>
  );
}
