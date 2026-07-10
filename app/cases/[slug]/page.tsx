import Link from "next/link";
import { notFound } from "next/navigation";
import ContactCTA from "@/app/components/ContactCTA";
import { CASE_STUDIES, getCaseBySlug } from "@/lib/caseStudies";

export function generateStaticParams() {
  return CASE_STUDIES.map((c) => ({ slug: c.slug }));
}

/* 고객 사례 상세 — 그리팅HR 인터뷰 양식 참고한 와꾸 (Q&A + 인용구 + 갤러리) */
export default function CaseDetailPage({ params }: { params: { slug: string } }) {
  const c = getCaseBySlug(params.slug);
  if (!c) notFound();

  return (
    <main className="min-h-screen bg-white text-[#171E2D]">
      {/* 헤더 */}
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

      <article className="mx-auto max-w-[820px] px-5 py-10 md:py-16">
        {/* 상단: 뒤로가기 + 메타 */}
        <Link href="/cases" className="inline-flex items-center text-[14px] font-medium text-[#59657A] transition hover:text-[#E8590C]">
          ← 고객 사례 전체 보기
        </Link>

        <div className="mt-6 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-[#FFF1E8] px-3 py-1 text-[12px] font-semibold text-[#E8590C]">{c.company}</span>
          <span className="rounded-full bg-[#F1F3F7] px-3 py-1 text-[12px] font-medium text-[#5B667A]">{c.industry}</span>
          <span className="rounded-full bg-[#F1F3F7] px-3 py-1 text-[12px] font-medium text-[#5B667A]">{c.scope}</span>
          <span className="rounded-full bg-[#F1F3F7] px-3 py-1 text-[12px] font-medium text-[#5B667A]">{c.talentRole}</span>
        </div>

        <h1 className="mt-5 text-[26px] font-bold leading-[1.35] sm:text-[32px] md:text-[38px]">{c.title}</h1>
        <p className="mt-4 text-[15px] leading-[1.7] text-[#5B667A] md:text-[17px]">{c.summary}</p>

        {/* 대표 이미지 */}
        <div className="mt-8 overflow-hidden rounded-xl bg-[#F1F3F7]">
          {c.thumbnail ? (
            <img src={c.thumbnail} alt={c.company} className="w-full object-cover" />
          ) : (
            <div className="flex aspect-[16/9] w-full items-center justify-center bg-gradient-to-br from-[#F1F3F7] to-[#DDE3EC]">
              <span className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#AEB6C4]">대표 이미지 준비 중</span>
            </div>
          )}
        </div>

        {/* 핵심 지표 3블록 */}
        <div className="mt-8 grid grid-cols-1 gap-4 rounded-xl border border-[#EEF1F5] bg-[#FAFBFC] p-6 sm:grid-cols-3 md:p-8">
          {c.metrics.map((m) => (
            <div key={m.label}>
              <p className="text-[24px] font-bold text-[#E8590C] sm:text-[28px]">{m.value}</p>
              <p className="mt-1 text-[13px] text-[#5B667A]">{m.label}</p>
            </div>
          ))}
        </div>

        {/* 인터뷰 Q&A 본문 */}
        <div className="mt-12 flex flex-col gap-10 md:mt-16">
          {c.interview.map((qa, i) => (
            <section key={qa.q}>
              <h2 className="text-[19px] font-bold leading-[1.4] text-[#171E2D] sm:text-[22px]">
                Q. {qa.q}
              </h2>
              <p className="mt-3 text-[15px] leading-[1.8] text-[#3A4356] md:text-[16px]">{qa.a}</p>

              {/* 첫 번째 답변 뒤에 대표 인용구 (pull quote) */}
              {i === 0 && (
                <blockquote className="mt-8 border-l-4 border-[#E8590C] bg-[#FFF6EF] px-5 py-5 md:px-7">
                  <p className="text-[17px] font-semibold leading-[1.6] text-[#171E2D] sm:text-[19px]">“{c.quote}”</p>
                  <footer className="mt-3 text-[13px] text-[#8A93A5]">{c.quoteBy}</footer>
                </blockquote>
              )}

              {/* 두 번째 답변 뒤에 작업물 갤러리 */}
              {i === 1 && c.images.length > 0 && (
                <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {c.images.map((src) => (
                    <div key={src} className="overflow-hidden rounded-xl bg-[#F1F3F7]">
                      <img src={src} alt={`${c.company} 작업물`} className="w-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>

        {/* 실제 사이트 링크 */}
        {c.siteUrl && (
          <a
            href={c.siteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-12 inline-flex h-12 items-center justify-center gap-2 rounded-sm border border-[#E1E5EC] px-6 text-[15px] font-semibold text-[#171E2D] transition hover:border-[#E8590C] hover:text-[#E8590C]"
          >
            실제 구축한 사이트 보러가기
            <span aria-hidden>↗</span>
          </a>
        )}
      </article>

      <ContactCTA />
    </main>
  );
}
