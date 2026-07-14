import Link from "next/link";
import { notFound } from "next/navigation";
import ContactCTA from "@/app/components/ContactCTA";
import SiteHeader from "@/app/components/SiteHeader";
import SiteFooter from "@/app/components/SiteFooter";
import { getCaseBySlug } from "@/lib/caseStudies.server";

// 정적 사례 + DB 사례를 함께 읽으므로 요청 시 렌더 (어드민 추가분 즉시 반영)
export const dynamic = "force-dynamic";

/* 고객 사례 상세 — 회사 시점 스토리 서술 + (확보 시) 고객 인용구 + 갤러리 */
export default async function CaseDetailPage({ params }: { params: { slug: string } }) {
  const c = await getCaseBySlug(params.slug);
  if (!c) notFound();

  return (
    <main className="min-h-screen bg-white text-[#171E2D]">
      <SiteHeader />

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
        {c.thumbnail && (
          <div className="mt-8 overflow-hidden rounded-xl bg-[#F1F3F7]">
            <img src={c.thumbnail} alt={c.company} className="w-full object-cover" />
          </div>
        )}

        {/* 핵심 지표 — 실측 지표가 있을 때만 */}
        {c.metrics.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-x-14 gap-y-6 rounded-xl border border-[#EEF1F5] bg-[#FAFBFC] p-6 md:p-8">
            {c.metrics.map((m) => (
              <div key={m.label}>
                <p className="text-[24px] font-bold text-[#E8590C] sm:text-[28px]">{m.value}</p>
                <p className="mt-1 text-[13px] text-[#5B667A]">{m.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* 본문 — 스토리 서술 */}
        <div className="mt-12 flex flex-col gap-10 md:mt-16">
          {c.story.map((section, i) => (
            <section key={section.title}>
              <h2 className="text-[19px] font-bold leading-[1.4] text-[#171E2D] sm:text-[22px]">{section.title}</h2>
              <p className="mt-3 text-[15px] leading-[1.8] text-[#3A4356] md:text-[16px]">{section.body}</p>

              {/* 실제 고객 인용구가 확보된 경우에만 첫 섹션 뒤에 노출 */}
              {i === 0 && c.quote && (
                <blockquote className="mt-8 border-l-4 border-[#E8590C] bg-[#FFF6EF] px-5 py-5 md:px-7">
                  <p className="text-[17px] font-semibold leading-[1.6] text-[#171E2D] sm:text-[19px]">“{c.quote}”</p>
                  <footer className="mt-3 text-[13px] text-[#8A93A5]">{c.quoteBy}</footer>
                </blockquote>
              )}

              {/* 두 번째 섹션 뒤에 작업물 갤러리 */}
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
      <SiteFooter />
    </main>
  );
}
