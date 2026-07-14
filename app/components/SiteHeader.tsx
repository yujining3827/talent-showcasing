import Link from "next/link";
import CtaLink from "./CtaLink";

/* 공용 상단 헤더 — 랜딩/고객사례/상세 등 마케팅 페이지에서 동일하게 사용
 * 앵커 링크는 "/#..." 형태라 서브페이지에서도 랜딩 해당 섹션으로 이동한다. */
export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-[#EEF1F5] bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-[60px] max-w-[1360px] items-center justify-between px-5 sm:h-[72px]">
        <Link href="/" className="flex items-center" aria-label="공고마감 by LIKELION">
          <img src="/logo-wordmark.png" alt="공고마감 by LIKELION" className="h-8 w-auto sm:h-10" />
        </Link>
        <div className="flex items-center gap-4 sm:gap-7">
          <nav className="hidden items-center gap-7 md:flex">
            <Link href="/#portfolio" className="text-[15px] font-medium text-[#3A4356] transition hover:text-[#E8590C]">
              포트폴리오 미리보기
            </Link>
            <Link href="/cases" className="text-[15px] font-medium text-[#3A4356] transition hover:text-[#E8590C]">
              고객 사례
            </Link>
          </nav>
          <CtaLink href="/pricing" location="header" className="rounded-sm bg-[#E8590C] px-4 py-2.5 text-[14px] font-semibold text-white transition hover:bg-[#C74E0A] sm:px-6 sm:py-3 sm:text-[15px]">
            인재 추천받기
          </CtaLink>
        </div>
      </div>
    </header>
  );
}
