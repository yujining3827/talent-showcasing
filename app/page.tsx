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

// 배경 월 타일 — 사진만. 카드 UI 없이 미디어 레이어로만 기능한다
function PhotoTile({ talent }: { talent: ShowcaseTalent }) {
  return (
    <div className="w-full shrink-0 overflow-hidden rounded-lg">
      <div className="aspect-[3/4]">
        <TalentPhoto talent={talent} />
      </div>
    </div>
  );
}

// 히어로 로고 로테이션 — 실제 인재 풀에 있는 출신 회사만 (아래 로고 마퀴와 동일 풀)
// 배경 없이 화이트 단색으로 다크 위에 직접. 슬롯 크기 고정이라 교체 시 들썩이지 않는다
// h: 워드마크마다 시각적 무게가 달라 개별 보정
// 출신 밴드 — 글로벌 대기업만, 화이트 톤으로 상단에 작게 고정
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
    <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 sm:gap-x-7">
      {ORIGIN_LOGOS.map((logo) => (
        <img key={logo.name} src={logo.src} alt={logo.name} className={`${logo.h} w-auto object-contain opacity-60 brightness-0 invert`} />
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
      <span key={index} className="animate-logo-in block text-[#3182F6]">
        {ROLLING_ROLES[index]}
      </span>
    </span>
  );
}

// 풀블리드 배경 월 — 인재 사진이 영상처럼 화면 전체에서 흐르고, 딤 위에 메시지가 뜬다
// (레이어: 사진 월 → 플랫 딤 → 비네트 → 텍스트)
function HeroBackdrop({ talents }: { talents: ShowcaseTalent[] }) {
  const withPhoto = talents.filter((t) => t.photo_url);
  const pool = withPhoto.length > 0 ? withPhoto : talents;
  const columnCount = 5; // md 미만은 CSS로 3열만 노출
  const durations = ["44s", "58s", "50s", "66s", "47s"];
  const columns = Array.from({ length: columnCount }, (_, i) => {
    const rotated = [...pool.slice(i * 2 % pool.length), ...pool.slice(0, i * 2 % pool.length)];
    return rotated;
  });
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
      {/* blur+채도/명도 다운 — 배경 디테일이 텍스트와 선명도 경쟁을 못 하게 (쨍함은 글자만) */}
      <div className="grid h-full scale-[1.03] grid-cols-3 gap-2 blur-[2.5px] brightness-[0.8] saturate-[0.75] md:grid-cols-5 md:gap-3">
        {columns.map((col, i) => (
          <div key={i} className={`overflow-hidden ${i >= 3 ? "hidden md:block" : ""}`}>
            <div
              className="animate-hero-wall flex flex-col gap-2 md:gap-3"
              style={{ animationDuration: durations[i], animationDirection: i % 2 ? "reverse" : "normal" }}
            >
              {[...col, ...col].map((talent, j) => (
                <PhotoTile key={`${talent.id}-${j}`} talent={talent} />
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="absolute inset-0 bg-[#070C18]/78" />
      <div className="absolute inset-0 bg-[radial-gradient(85%_70%_at_50%_50%,rgba(7,12,24,0.6),rgba(7,12,24,0.92))]" />
    </div>
  );
}

function Hero({
  talents,
}: {
  talents: ShowcaseTalent[];
}) {
  const heroTalents = talents.slice(0, 10);

  return (
    <section className="relative isolate overflow-hidden bg-[#070C18] text-white">
      <HeroBackdrop talents={heroTalents} />
      {/* 첫 화면 안에서 전부 끝나는 센터 스테이지 — H1 + 서브 한 줄 + CTA */}
      <div className="relative mx-auto flex min-h-[calc(100vh-60px)] max-w-[720px] flex-col items-center justify-center px-5 py-12 text-center">
        <OriginBand />
        <h1 className="mt-8 break-keep text-[30px] font-extrabold leading-[1.3] tracking-[-0.01em] text-white [text-shadow:0_2px_24px_rgba(0,0,0,0.6)] sm:text-[46px] md:mt-10 md:text-[58px]">
          우리가 보유한 20,000명의
          <RollingRole />
          2주일 무료로 써보세요
        </h1>
        <CtaLink href="/pricing" location="hero" className="animate-cta-pulse mt-10 inline-flex h-12 items-center justify-center rounded-lg bg-[#3182F6] px-8 text-[16px] font-semibold text-white transition hover:bg-[#1B64DA] sm:h-[52px] sm:px-10 sm:text-[17px] md:mt-12">
          무료 트라이얼 시작하기
        </CtaLink>
        <p className="mt-7 break-keep text-[14px] leading-[1.7] text-[#C4CEDD] [text-shadow:0_1px_16px_rgba(0,0,0,0.5)] md:mt-8 md:text-[16px]">
          최상위 베트남 인재의 평균 인건비는 국내 대비 50% 더 저렴합니다.
        </p>
      </div>
    </section>
  );
}

// 모바일 하단 고정 CTA — 우측 72px은 채팅 FAB(bottom-4 right-4) 자리
function MobileStickyCta() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#E2E8F0] bg-white/95 px-4 py-3 backdrop-blur md:hidden">
      <div className="mr-[72px]">
        <CtaLink href="/pricing" location="sticky-bottom" className="flex h-12 w-full items-center justify-center rounded-md bg-[#3182F6] text-[15px] font-semibold text-white">
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
      <FeaturedTalentCarousel />
      <TalentPreview talents={premiumTalents} />
      <CaseStudiesPreview />
      <SiteFooter />
      <MobileStickyCta />
    </main>
  );
}
