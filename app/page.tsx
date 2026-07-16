"use client";

import { useEffect, useMemo, useState } from "react";
import { ProfileCard } from "@/app/components/showcase/ProfileCard";
import FeaturedTalentCarousel from "@/app/components/showcase/FeaturedTalentCarousel";
import CtaLink from "@/app/components/CtaLink";
import CaseStudiesPreview from "@/app/components/CaseStudiesPreview";
import SiteHeader from "@/app/components/SiteHeader";
import SiteFooter from "@/app/components/SiteFooter";
import { HERO_TALENTS } from "@/lib/heroTalents";

type ShowcaseTalent = {
  id: string;
  name: string;
  role: string;
  headline: string | null;
  photo_url: string | null;
  school: string | null;
  schoolElite: boolean;
  schoolTier: string | null;
  company: string | null;
  companyElite: boolean;
  companyDomain: string | null;
  yoeYears: number | null;
  location: string | null;
  skills: string[];
  // 어학/소통 능력 (예: "영어 업무 가능 · 한국어 초급", "TOEIC 850"). 데이터 없으면 "조사 중" 노출
  language?: string | null;
};

function TalentPhoto({ talent, large = false }: { talent: ShowcaseTalent; large?: boolean }) {
  const [failed, setFailed] = useState(false);
  const src = talent.photo_url || null;

  if (!src || failed) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[#D8DEE8]">
        <img src="/default-profile.png" alt="" className="h-[82%] w-[82%] object-contain" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt=""
      onError={() => setFailed(true)}
      className="h-full w-full object-cover"
      style={{ objectPosition: large ? "center 18%" : "center 22%" }}
    />
  );
}

function VerifiedIcon({ color = "#087E62" }: { color?: string }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2.75 14.4 5.2l3.42-.47.58 3.4 3.05 1.58-1.56 3.06 1.56 3.05-3.05 1.58-.58 3.4-3.42-.47L12 21.25 9.6 18.8l-3.42.47-.58-3.4-3.05-1.58 1.56-3.06-1.56-3.05L5.6 6.6l.58-3.4 3.42.47L12 2.75Z" fill={color} />
      <path d="m8.5 12.2 2.1 2.1 4.9-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// 인재 월 카드 — 장식용(클릭 없음). 사진이 크고 정보는 세 줄만
function WallCard({ talent }: { talent: ShowcaseTalent }) {
  return (
    <div className="w-full shrink-0 overflow-hidden rounded-xl bg-white shadow-[0_18px_50px_-28px_rgba(0,0,0,0.8)]">
      <div className="h-[170px]">
        <TalentPhoto talent={talent} />
      </div>
      <div className="p-3 text-left">
        <p className="flex items-center gap-1 text-[14px] font-semibold text-[#171E2D]">
          <VerifiedIcon color="#E8590C" />
          <span className="truncate">{talent.name}</span>
        </p>
        <p className="mt-0.5 truncate text-[12px] text-[#59657A]">{talent.role}</p>
        <p className="mt-1 truncate text-[12px] font-bold text-[#E8590C]">
          {talent.yoeYears ? `${talent.yoeYears}년차` : "신입"}
          {talent.company ? ` · ${talent.company}` : ""}
        </p>
      </div>
    </div>
  );
}

// 데스크톱 좌/우 인재 월 — 수직 무한 스크롤(트랙 2배 복제 + translateY -50%)
function TalentWallColumn({
  talents,
  duration,
  reverse = false,
  className,
}: {
  talents: ShowcaseTalent[];
  duration: string;
  reverse?: boolean;
  className: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-y-0 hidden w-[240px] overflow-hidden xl:block ${className} [mask-image:linear-gradient(to_bottom,transparent,black_12%,black_88%,transparent)]`}
    >
      <div
        className="animate-hero-wall flex flex-col gap-4"
        style={{ animationDuration: duration, animationDirection: reverse ? "reverse" : "normal" }}
      >
        {[...talents, ...talents].map((talent, index) => (
          <WallCard key={`${talent.id}-${index}`} talent={talent} />
        ))}
      </div>
    </div>
  );
}

function Hero({
  talents,
}: {
  talents: ShowcaseTalent[];
}) {
  const heroTalents = talents.slice(0, 10);
  const leftWall = heroTalents.filter((_, i) => i % 2 === 0);
  const rightWall = heroTalents.filter((_, i) => i % 2 === 1);

  return (
    <section className="relative isolate overflow-hidden bg-[#0B1120] text-white">
      {/* 상단 오렌지 글로우 */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(90%_55%_at_50%_-8%,rgba(232,89,12,0.3),transparent_62%)]" />
      <TalentWallColumn talents={leftWall} duration="52s" className="left-6 2xl:left-16" />
      <TalentWallColumn talents={rightWall} duration="64s" reverse className="right-6 2xl:right-16" />
      {/* 첫 화면 안에서 전부 끝나는 센터 스테이지 — H1 + 서브 한 줄 + CTA */}
      <div className="relative mx-auto flex min-h-[calc(100vh-64px)] max-w-[720px] flex-col items-center justify-center px-5 py-12 text-center">
        <h1 className="break-keep text-[30px] font-extrabold leading-[1.25] tracking-[-0.01em] text-white sm:text-[46px] md:text-[58px]">
          삼성 출신 베트남 인재,
          <br />
          <span className="text-[#FF7A2F]">1주일 공짜로 써보세요</span>
        </h1>
        <p className="mt-5 break-keep text-[16px] leading-[1.7] text-[#B6C0D4] md:text-[19px]">
          마음에 들 때만 채용하세요. 인건비는 절반입니다.
        </p>
        <CtaLink href="/pricing" location="hero" className="mt-9 inline-flex h-16 w-full items-center justify-center rounded-lg bg-[#E8590C] px-12 text-[18px] font-bold text-white shadow-[0_22px_60px_-18px_rgba(232,89,12,0.8)] transition hover:bg-[#C74E0A] sm:w-auto">
          무료 트라이얼 시작하기
        </CtaLink>
        {/* 데스크톱 월이 없는 화면(<xl)에선 카드가 수평으로 흐른다 — 첫 화면 안에서 */}
        <div aria-hidden="true" className="pointer-events-none mt-12 flex w-full overflow-hidden xl:hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
          {[0, 1].map((dup) => (
            <div key={dup} className="animate-marquee flex shrink-0 gap-3 pr-3">
              {heroTalents.map((talent) => (
                <div key={`${talent.id}-${dup}`} className="w-[160px]">
                  <WallCard talent={talent} />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// 모바일 하단 고정 CTA — 우측 72px은 채팅 FAB(bottom-4 right-4) 자리
function MobileStickyCta() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#EFE6DA] bg-white/95 px-4 py-3 backdrop-blur md:hidden">
      <div className="mr-[72px]">
        <CtaLink href="/pricing" location="sticky-bottom" className="flex h-12 w-full items-center justify-center rounded-md bg-[#E8590C] text-[15px] font-semibold text-white">
          무료 트라이얼 시작하기
        </CtaLink>
      </div>
    </div>
  );
}

function TrustLogos() {
  // ⚠️ 로고 이미지: public/에 파일 넣고 src 채우면 이미지로, null이면 텍스트로 표시
  const logos: { name: string; src: string | null }[] = [
    { name: "Samsung", src: "/samsung.svg" },
    { name: "FPT Software", src: "/FPT%20Software.webp" },
    { name: "Grab", src: "/Grab.png" },
    { name: "Google", src: "/google.png" },
    { name: "VNG", src: "/VNG.webp" },
    { name: "KPMG", src: "/KPMG.webp" },
  ];
  return (
    <section className="bg-white">
      <div className="pt-14 pb-16">
        {/* 섹션 의미를 로고보다 먼저 — "고객사 로고"로 오독되지 않도록 라벨 선행 */}
        <p className="mb-10 px-5 text-center text-[15px] font-semibold text-[#3A4356] sm:text-[17px]">
          이런 기업에서 일했던 인재를 제안합니다
        </p>
        {/* 무한 마퀴: 동일 트랙 2개를 나란히 두고 각자 -100% 이동 → 끊김 없이 이어짐 */}
        <div className="relative flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_7%,black_93%,transparent)]">
          {[0, 1].map((dup) => (
            <div key={dup} className="animate-marquee flex shrink-0 items-center" aria-hidden={dup === 1}>
              {logos.map((logo) => (
                <div key={logo.name} className="flex shrink-0 items-center pr-14 sm:pr-24">
                  {logo.src ? (
                    <img src={logo.src} alt={logo.name} className="h-10 w-auto object-contain sm:h-16" />
                  ) : (
                    <span className="whitespace-nowrap text-[16px] font-semibold text-[#3A4356] sm:text-[19px]">{logo.name}</span>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TalentPreview({ talents }: { talents: ShowcaseTalent[] }) {
  // 데이터가 없으면 섹션 자체를 감춘다 — "불러오는 중" 상태를 고객에게 노출하지 않음
  if (talents.length === 0) return null;
  return (
    <section id="talent-preview" className="bg-[#F7F8FA] scroll-mt-[64px]">
      <div className="mx-auto max-w-[1360px] px-5 py-14 md:py-24">
        <div className="max-w-[720px]">
          <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-[#E8590C]">엄선된 인재 쇼케이스</p>
          <h2 className="mt-3 text-[26px] font-semibold tracking-normal text-[#171E2D] sm:text-[34px] md:text-[44px]">출신과 검증 정보가 먼저 보이는 인재 카드</h2>
          <p className="mt-4 text-[15px] leading-[1.7] text-[#5B667A] md:text-[17px]">대학교, 이전 회사, 공개 동의, 사진 품질을 기준으로 신뢰할 수 있는 프로필을 우선 노출합니다.</p>
        </div>
        <div className="mt-8 grid grid-cols-1 gap-4 md:mt-12 md:gap-5 lg:grid-cols-2">
          {talents.slice(0, 6).map((talent) => (
            <ProfileCard key={talent.id} t={talent} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default function LandingPage() {
  const [talents, setTalents] = useState<ShowcaseTalent[]>([]);

  useEffect(() => {
    fetch("/api/showcase")
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data.talents) && data.talents.length > 0) {
          setTalents(data.talents);
        }
      })
      .catch(() => setTalents([]));
  }, []);

  const premiumTalents = useMemo(() => {
    return [...talents].sort((a, b) => {
      const aScore = Number(a.schoolElite) * 3 + Number(a.companyElite) * 3 + (a.yoeYears || 0) / 10;
      const bScore = Number(b.schoolElite) * 3 + Number(b.companyElite) * 3 + (b.yoeYears || 0) / 10;
      return bScore - aScore;
    });
  }, [talents]);

  const heroTalents = useMemo(() => {
    return [...HERO_TALENTS].sort((a, b) => {
      const aScore = Number(a.schoolElite) * 3 + Number(a.companyElite) * 3 + (a.yoeYears || 0) / 10;
      const bScore = Number(b.schoolElite) * 3 + Number(b.companyElite) * 3 + (b.yoeYears || 0) / 10;
      return bScore - aScore;
    });
  }, []);

  return (
    <main className="min-h-screen bg-white pb-[76px] md:pb-0">
      <SiteHeader />
      <Hero talents={heroTalents} />
      <TrustLogos />
      <FeaturedTalentCarousel />
      <TalentPreview talents={premiumTalents} />
      <CaseStudiesPreview />
      <SiteFooter />
      <MobileStickyCta />
    </main>
  );
}
