"use client";

import { useEffect, useMemo, useState } from "react";
import { ProfileCard } from "@/app/components/showcase/ProfileCard";
import FeaturedTalentCarousel from "@/app/components/showcase/FeaturedTalentCarousel";
import CtaLink from "@/app/components/CtaLink";
import CaseStudiesPreview from "@/app/components/CaseStudiesPreview";
import SiteHeader from "@/app/components/SiteHeader";
import SiteFooter from "@/app/components/SiteFooter";

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

// 출신 밴드 — 글로벌 대기업만, 사진 위 화이트 단색으로 작게
// h: 로고별 시각적 무게 보정
const ORIGIN_LOGOS: { name: string; src: string; h: string }[] = [
  { name: "삼성", src: "/samsung-wordmark.svg", h: "h-3 sm:h-3.5" },
  { name: "구글", src: "/google.png", h: "h-4 sm:h-5" },
  { name: "Grab", src: "/Grab.png", h: "h-3.5 sm:h-4" },
  { name: "KPMG", src: "/KPMG.webp", h: "h-3.5 sm:h-4" },
  { name: "Mondelez", src: "/Mondelez.png", h: "h-4 sm:h-5" },
];

function OriginBand() {
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 sm:gap-x-7">
      {ORIGIN_LOGOS.map((logo) => (
        <img key={logo.name} src={logo.src} alt={logo.name} className={`${logo.h} w-auto object-contain opacity-70 brightness-0 invert`} />
      ))}
    </div>
  );
}

// 기업이 실제로 뽑는 포지션 — 인재 풀에 실존하는 직무만
const ROLLING_ROLES = [
  "프론트엔드 개발자",
  "백엔드 개발자",
  "QA 엔지니어",
  "AI 엔지니어",
  "UX/UI 디자이너",
  "소셜 마케터",
  "그로스 마케터",
];

// 드랍다운처럼 직무가 돌아가는 슬롯 — H1의 회전 축은 출신이 아니라 포지션
function RollingRole() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const cycle = setInterval(() => setIndex((i) => (i + 1) % ROLLING_ROLES.length), 2000);
    return () => clearInterval(cycle);
  }, []);

  return (
    <span className="block h-[1.3em] overflow-hidden">
      <span key={index} className="animate-logo-in block text-[#FF7A2F]">
        {ROLLING_ROLES[index]}
      </span>
    </span>
  );
}

// 시네마틱 풀블리드 히어로 — 사진이 곧 히어로 (레퍼런스: 리멤버 푸조 광고)
// 레이어: 풀사이즈 사진 → 하단 그라데이션 → 좌하단 카피 + CTA
function Hero() {
  return (
    <section className="relative">
      <div className="relative h-[76vh] min-h-[540px] w-full overflow-hidden md:h-[84vh]">
        <img src="/stock/team-main.jpg" alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/5" />
        <div className="absolute inset-x-0 bottom-0">
          <div className="mx-auto max-w-[1200px] px-5 pb-12 md:pb-16">
            <OriginBand />
            <h1 className="mt-6 max-w-[720px] break-keep text-[30px] font-extrabold leading-[1.28] tracking-[-0.01em] text-white [text-shadow:0_2px_20px_rgba(0,0,0,0.4)] sm:text-[42px] md:text-[52px]">
              우리가 보유한 20,000명의
              <RollingRole />
              2주일 무료로 써보세요
            </h1>
            <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-6">
              <CtaLink href="/pricing" location="hero" className="inline-flex h-12 items-center justify-center rounded-lg bg-[#E8590C] px-8 text-[16px] font-semibold text-white transition hover:bg-[#C74E0A] sm:h-[52px] sm:px-10 sm:text-[17px]">
                무료 트라이얼 시작하기
              </CtaLink>
              <p className="text-[13px] text-white/70 sm:text-[14px]">평균 인건비, 국내 대비 50% 절감</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// 구독 조건 스트립 — 패러데이식: 조건 세 개, 군더더기 없이
function SubscriptionStrip() {
  const items = [
    { title: "2주 무료", desc: "트라이얼로 먼저 써보고" },
    { title: "월 구독", desc: "채용 부담 없이 인건비만" },
    { title: "언제든 중단", desc: "위약금 없음" },
  ];
  return (
    <section className="border-y border-[#EDE6DA] bg-white">
      <div className="mx-auto grid max-w-[1200px] grid-cols-1 divide-y divide-[#EDE6DA] px-5 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {items.map((item) => (
          <div key={item.title} className="flex items-baseline gap-3 py-6 sm:flex-col sm:gap-1.5 sm:px-8 sm:py-9 sm:first:pl-0">
            <p className="text-[22px] font-extrabold text-[#191714] sm:text-[26px]">{item.title}</p>
            <p className="text-[14px] text-[#6F675C] sm:text-[15px]">{item.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// 마지막 전환 밴드 — 오렌지 그라데이션 에디토리얼 블록
function FinalCta() {
  return (
    <section className="bg-[#F6F1E9] px-5 py-14 md:py-20">
      <div className="mx-auto flex max-w-[1200px] flex-col items-center gap-8 rounded-[32px] bg-[radial-gradient(140%_140%_at_15%_0%,#FF9D5C,#E8590C_65%)] px-6 py-14 text-center md:py-20">
        <h2 className="break-keep text-[26px] font-extrabold leading-[1.3] text-white sm:text-[36px] md:text-[44px]">
          지금 신청하면
          <br />
          2주는 무료입니다
        </h2>
        <CtaLink href="/pricing" location="final-band" className="inline-flex h-12 items-center justify-center rounded-lg bg-white px-8 text-[16px] font-bold text-[#E8590C] transition hover:bg-[#FFF3EA] sm:h-[52px] sm:px-10 sm:text-[17px]">
          무료 트라이얼 시작하기
        </CtaLink>
      </div>
    </section>
  );
}

// 모바일 하단 고정 CTA — 히어로(첫 화면)를 지나 스크롤했을 때만 등장 (첫 화면 CTA는 히어로 버튼 하나)
// 우측 72px은 채팅 FAB(bottom-4 right-4) 자리
function MobileStickyCta() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 0.7);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-[#E2E8F0] bg-white/95 px-4 py-3 backdrop-blur transition-transform duration-300 md:hidden ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="mr-[72px]">
        <CtaLink href="/pricing" location="sticky-bottom" className="flex h-12 w-full items-center justify-center rounded-md bg-[#E8590C] text-[15px] font-semibold text-white">
          무료 트라이얼 시작하기
        </CtaLink>
      </div>
    </div>
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

  return (
    <main className="min-h-screen bg-white pb-[76px] md:pb-0">
      <SiteHeader />
      <Hero />
      <SubscriptionStrip />
      {/* 순서: 인재 먼저 보여주고 → 개발/디자인/마케팅 영역 탭 */}
      <TalentPreview talents={premiumTalents} />
      <FeaturedTalentCarousel />
      <CaseStudiesPreview />
      <FinalCta />
      <SiteFooter />
      <MobileStickyCta />
    </main>
  );
}
