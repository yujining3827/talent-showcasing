import Link from "next/link";
import CtaLink from "./CtaLink";

/* 공용 푸터 — 서비스 정보·링크·개인정보처리방침. B2B 신뢰용 최소 구성.
 * ⚠️ 사업자등록번호 등 법정 표기는 실값 확정 후 추가한다(임의 기재 금지). */
export default function SiteFooter() {
  return (
    <footer className="border-t border-[#EEF1F5] bg-[#F7F8FA]">
      <div className="mx-auto max-w-[1360px] px-5 py-12 md:py-14">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div>
            <img src="/logo-wordmark.png" alt="공고마감 by LIKELION" className="h-8 w-auto" />
            <p className="mt-3 max-w-[420px] text-[13px] leading-[1.7] text-[#8A93A5]">
              검증된 베트남 인재를 국내 인건비의 절반 수준으로 채용하는
              <br />
              프리미엄 인재 매칭 서비스입니다.
            </p>
          </div>
          <nav className="flex flex-col gap-2.5 text-[14px] text-[#5B667A]">
            <Link href="/cases" className="transition hover:text-[#E8590C]">
              고객 사례
            </Link>
            <CtaLink href="/pricing" location="footer" className="transition hover:text-[#E8590C]">
              인재 추천받기
            </CtaLink>
            <Link href="/privacy" className="transition hover:text-[#E8590C]">
              개인정보처리방침
            </Link>
          </nav>
        </div>
        <div className="mt-10 flex flex-col gap-2 border-t border-[#E7EBF1] pt-6 text-[12.5px] text-[#9AA3B2] sm:flex-row sm:items-center sm:justify-between">
          <p>문의 · ceo_office@likelion.net</p>
          <div className="flex items-center gap-4">
            <p>© {new Date().getFullYear()} LIKELION. All rights reserved.</p>
            <Link href="/admin/chats" className="transition hover:text-[#5B667A]">
              관리자
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
