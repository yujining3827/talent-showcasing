import CtaLink from "./CtaLink";

/* 하단 CTA(푸터) — 랜딩/상세 등 여러 페이지 공용 */
export default function ContactCTA() {
  return (
    <section className="bg-[#242832]">
      <div className="mx-auto flex max-w-[1360px] flex-col items-start gap-6 px-5 py-14 md:flex-row md:items-center md:justify-between md:py-20">
        <div>
          <h2 className="text-[24px] font-semibold leading-[1.3] text-white sm:text-[28px] md:text-[36px]">
            마음에 드는 인재를 찾으셨나요?
            <br />
            지금 상담을 요청하세요.
          </h2>
          <p className="mt-3 max-w-[520px] text-[16px] leading-[1.6] text-white/70">
            검증된 후보 프로필을 확인하고, 2주 안에 실제 후보자를 제안받아 보세요.
          </p>
        </div>
        <CtaLink
          href="/pricing"
          location="contact-cta"
          className="inline-flex h-14 w-full flex-shrink-0 items-center justify-center rounded-sm bg-[#E8590C] px-9 text-[16px] font-semibold text-white transition hover:bg-[#C74E0A] sm:w-auto"
        >
          인재 추천받기
        </CtaLink>
      </div>
    </section>
  );
}
