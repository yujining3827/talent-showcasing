import Link from "next/link";
import CtaLink from "./CtaLink";
import HeaderChatButton from "./HeaderChatButton";

/* 공용 상단 헤더 — 랜딩/고객사례/상세 등 마케팅 페이지에서 동일하게 사용
 * 앵커 링크는 "/#..." 형태라 서브페이지에서도 랜딩 해당 섹션으로 이동한다.
 * 모바일(<md): 로고 중앙 + 우측 채팅 버튼 / 데스크톱(md+): 로고 좌 + 네비 + 인재 추천받기 */
export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-[#EEF1F5] bg-white/90 backdrop-blur">
      {/* 모바일 — 좌 여백 / 로고 중앙 / 우 채팅 */}
      <div className="relative flex h-[56px] items-center justify-center px-5 md:hidden">
        <Link href="/" aria-label="공고마감 by LIKELION">
          <img src="/logo-wordmark.png" alt="공고마감 by LIKELION" className="h-6 w-auto" />
        </Link>
        <div className="absolute right-4">
          <HeaderChatButton />
        </div>
      </div>

      {/* 데스크톱/태블릿 — 기존 레이아웃 */}
      <div className="mx-auto hidden h-[72px] max-w-[1360px] items-center justify-between px-5 md:flex">
        <Link href="/" className="flex items-center" aria-label="공고마감 by LIKELION">
          <img src="/logo-wordmark.png" alt="공고마감 by LIKELION" className="h-10 w-auto" />
        </Link>
        <div className="flex items-center gap-7">
          <nav className="flex items-center gap-7">
            <Link href="/#portfolio" className="text-[15px] font-medium text-[#3A4356] transition hover:text-[#E8590C]">
              포트폴리오 미리보기
            </Link>
            <Link href="/cases" className="text-[15px] font-medium text-[#3A4356] transition hover:text-[#E8590C]">
              고객 사례
            </Link>
          </nav>
          <CtaLink href="/pricing" location="header" className="rounded-sm bg-[#E8590C] px-6 py-3 text-[15px] font-semibold text-white transition hover:bg-[#C74E0A]">
            인재 추천받기
          </CtaLink>
        </div>
      </div>
    </header>
  );
}
