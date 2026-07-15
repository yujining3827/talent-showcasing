import Link from "next/link";
import SiteHeader from "@/app/components/SiteHeader";

export const metadata = {
  title: "준비중입니다 · 공고마감",
  description: "해당 자료는 현재 준비 중입니다.",
};

export default function ComingSoonPage() {
  return (
    <main className="min-h-screen bg-white text-[#171E2D]">
      <SiteHeader />

      <div className="mx-auto flex max-w-[560px] flex-col items-center px-5 py-28 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#FFF1E8] text-[#E8590C]">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
            <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <h1 className="mt-7 text-[28px] font-bold tracking-[-0.01em]">준비중입니다</h1>
        <p className="mt-4 text-[15.5px] leading-[1.7] text-[#5B667A]">
          해당 인재의 이력서·포트폴리오 원본은 현재 준비 중입니다.
          <br />
          자세한 내용이 필요하시면 문의해 주세요.
        </p>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex h-12 items-center rounded-sm bg-[#E8590C] px-7 text-[15px] font-semibold text-white transition hover:bg-[#D24E08]"
          >
            인재 목록으로
          </Link>
          <Link
            href="/pricing"
            className="inline-flex h-12 items-center rounded-sm border border-[#E1E5EC] px-7 text-[15px] font-semibold text-[#171E2D] transition hover:border-[#E8590C] hover:text-[#E8590C]"
          >
            인재 문의하기
          </Link>
        </div>
      </div>
    </main>
  );
}
