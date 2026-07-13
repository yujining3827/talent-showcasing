import SiteHeader from "@/app/components/SiteHeader";
import SiteFooter from "@/app/components/SiteFooter";

export const metadata = {
  title: "개인정보처리방침 — 공고마감 by LIKELION",
  description: "공고마감 서비스의 개인정보 수집·이용에 관한 안내입니다.",
};

/* 개인정보처리방침 — 인재 추천 요청 폼에서 수집하는 항목 기준.
 * 수집 항목·목적이 바뀌면 이 문서도 함께 갱신할 것. */
export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white text-[#171E2D]">
      <SiteHeader />

      <article className="mx-auto max-w-[820px] px-5 py-12 md:py-16">
        <h1 className="text-[28px] font-bold sm:text-[34px]">개인정보처리방침</h1>
        <p className="mt-4 text-[15px] leading-[1.8] text-[#5B667A]">
          공고마감(이하 &ldquo;서비스&rdquo;)은 인재 추천 상담을 위해 최소한의 개인정보를 수집하며, 아래 기준에 따라 처리합니다.
        </p>

        <div className="mt-10 flex flex-col gap-8">
          <section>
            <h2 className="text-[19px] font-bold">1. 수집하는 개인정보 항목</h2>
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-[15px] leading-[1.8] text-[#3A4356]">
              <li>필수: 성함, 기업명, 연락처(전화번호 또는 이메일)</li>
              <li>선택: 채용 공고·JD(URL 또는 PDF 파일), 관심 직무, 근무 조건 등 상담에 필요한 정보</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[19px] font-bold">2. 수집·이용 목적</h2>
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-[15px] leading-[1.8] text-[#3A4356]">
              <li>인재 추천 상담 및 담당자 연락</li>
              <li>요청하신 조건에 맞는 후보자 제안</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[19px] font-bold">3. 보유 및 이용 기간</h2>
            <p className="mt-3 text-[15px] leading-[1.8] text-[#3A4356]">
              수집 목적 달성 시(상담 종료 시)까지 보유하며, 이후 지체 없이 파기합니다. 단, 관계 법령에 따라 보존이 필요한 경우 해당 기간 동안 보관합니다.
            </p>
          </section>

          <section>
            <h2 className="text-[19px] font-bold">4. 동의 거부 권리</h2>
            <p className="mt-3 text-[15px] leading-[1.8] text-[#3A4356]">
              개인정보 수집·이용에 동의하지 않으실 수 있습니다. 다만 필수 항목에 동의하지 않으시면 인재 추천 상담 서비스 이용이 제한됩니다.
            </p>
          </section>

          <section>
            <h2 className="text-[19px] font-bold">5. 문의처</h2>
            <p className="mt-3 text-[15px] leading-[1.8] text-[#3A4356]">
              개인정보 처리에 관한 문의: ceo_office@likelion.net
            </p>
          </section>
        </div>
      </article>

      <SiteFooter />
    </main>
  );
}
