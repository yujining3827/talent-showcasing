"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
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
        {/* public/hero.mp4가 있으면 재생, 없으면 poster(사진)가 그대로 보인다 — scripts/generate-hero-video.mjs로 생성 */}
        <video autoPlay muted loop playsInline poster="/stock/team-main.jpg" className="h-full w-full object-cover">
          <source src="/hero.mp4" type="video/mp4" />
        </video>
        {/* 인물이 우측에 몰린 푸티지 — 좌측을 어둡게 깔아 텍스트 존/영상 존을 분리 */}
        <div className="absolute inset-0 bg-black/50 md:bg-[linear-gradient(90deg,rgba(0,0,0,0.8)_0%,rgba(0,0,0,0.5)_36%,rgba(0,0,0,0.06)_68%)]" />
        {/* 카피는 좌측 세로 중앙에 확정 앵커 */}
        <div className="absolute inset-0 flex items-center">
          <div className="mx-auto w-full max-w-[1200px] px-5">
            <OriginBand />
            {/* 패러데이 문법: 장벽 제거(채용X·선불X) → 원하는 것(직무) → 즉시 행동 */}
            <h1 className="mt-6 max-w-[640px] break-keep text-[30px] font-extrabold leading-[1.28] tracking-[-0.01em] text-white [text-shadow:0_2px_20px_rgba(0,0,0,0.4)] sm:text-[42px] md:text-[52px]">
              채용 없이, 선불 0원으로
              <RollingRole />
              지금 바로 써보세요
            </h1>
            <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-6">
              <CtaLink href="/pricing" location="hero" className="inline-flex h-12 items-center justify-center rounded-lg bg-[#E8590C] px-8 text-[16px] font-semibold text-white transition hover:bg-[#C74E0A] sm:h-[52px] sm:px-10 sm:text-[17px]">
                2주 무료로 시작하기
              </CtaLink>
              <p className="text-[13px] text-white/70 sm:text-[14px]">검증된 베트남 인재 20,000명 · 인건비 국내 대비 50% 절감</p>
            </div>
          </div>
        </div>
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
          2주 무료로 시작하기
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
          2주 무료로 시작하기
        </CtaLink>
      </div>
    </div>
  );
}

// 출신 회사 → 로고 파일(public/). 파일 있는 회사만 카드에 노출.
// className: 로고별 크기 오버라이드 (여백/비율 달라서 개별 조정, 기본 h-9)
const COMPANY_LOGOS: Record<string, { src: string; className?: string }> = {
  samsung: { src: "/samsung.svg" },
  vng: { src: "/VNG.webp" },
  "fpt software": { src: "/FPT%20Software.webp", className: "h-[52px]" },
  fpt: { src: "/FPT%20Software.webp", className: "h-[52px]" },
  grab: { src: "/Grab.png" },
  google: { src: "/google.png" },
  kpmg: { src: "/KPMG.webp" },
  nab: { src: "/NAB.svg" },
  mondelez: { src: "/Mondelez.png", className: "h-14" },
  prudential: { src: "/Prudential.webp" },
  moatable: { src: "/Moatable.png" },
  "moatable inc.": { src: "/Moatable.png" },
};
function companyLogo(company: string | null): { src: string; className?: string } | null {
  if (!company) return null;
  return COMPANY_LOGOS[company.trim().toLowerCase()] ?? null;
}

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

// 상세형 인재 카드 — 사진 + 검증 배지 + 경력/어학/기술/학력 + 출신 로고
function FeaturedCandidatePanel({ talent }: { talent: ShowcaseTalent }) {
  return (
    <Link
      href={`/showcase/${talent.id}`}
      className="z-10 flex flex-col overflow-hidden rounded-xl bg-white shadow-[0_24px_70px_-38px_rgba(10,18,32,0.5)] ring-1 ring-[#EDE6DA] transition-shadow duration-300 hover:shadow-[0_30px_80px_-38px_rgba(232,89,12,0.4)] sm:flex-row"
    >
      <div className="relative h-[300px] w-full sm:h-auto sm:w-[42%]">
        <TalentPhoto talent={talent} large />
        <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-[#E8590C]">
          <VerifiedIcon color="#E8590C" />
          검증됨
        </div>
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 pt-10">
          <p className="text-[17px] font-semibold text-white">{talent.name}</p>
          <p className="mt-0.5 text-[12px] text-white/85">
            {talent.role}
            {talent.yoeYears ? ` · ${talent.yoeYears}년차` : ""}
          </p>
        </div>
      </div>
      <div className="relative flex-1 p-6">
        {(() => {
          const logo = companyLogo(talent.company);
          if (!logo) return null;
          return (
            <div className="absolute right-10 top-[46px] flex h-14 items-center">
              <img src={logo.src} alt={talent.company ?? ""} className={`w-auto max-w-[150px] object-contain ${logo.className ?? "h-9"}`} />
            </div>
          );
        })()}
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#E8590C]">지금 트라이얼 가능</p>
        <p className="mt-2 pr-[156px] text-[19px] font-semibold leading-[1.4] text-[#171E2D]">
          {(talent.headline || `검증된 ${talent.role || "테크"} 전문가`).split("/n").map((line, i) => (
            <span key={i} className="block">
              {line.trim()}
            </span>
          ))}
        </p>
        <p className="mt-1 text-[13px] text-[#59657A]">경력·어학·포트폴리오 검증을 마친 후보입니다.</p>
        <div className="mt-8 flex flex-col gap-6">
          <div className="flex items-start justify-between gap-4 px-4">
            <span className="shrink-0 pt-0.5 text-[12px] font-semibold text-[#9AA3B2]">경력</span>
            <span className="text-right text-[15px] font-bold leading-[1.4] text-[#E8590C]">
              {talent.yoeYears ? `${talent.yoeYears}년차` : "신입"}
              {talent.company ? ` · ${talent.company}` : ""}
            </span>
          </div>
          <div className="flex items-start justify-between gap-4 px-4">
            <span className="shrink-0 pt-0.5 text-[12px] font-semibold text-[#9AA3B2]">어학 · 소통</span>
            <span className="text-right text-[15px] font-bold leading-[1.4] text-[#E8590C]">
              {talent.language ? talent.language : <span className="font-medium italic text-[#9AA3B2]">조사 중</span>}
            </span>
          </div>
          {talent.skills?.length > 0 && (
            <div className="flex items-start justify-between gap-4 px-4">
              <span className="shrink-0 pt-0.5 text-[12px] font-semibold text-[#9AA3B2]">기술</span>
              <div className="flex flex-wrap justify-end gap-1.5">
                {talent.skills.slice(0, 4).map((skill) => (
                  <span key={skill} className="rounded-full bg-[#F1F3F7] px-2.5 py-0.5 text-[12px] font-medium text-[#5B667A]">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
          <div className="flex items-start justify-between gap-4 px-4">
            <span className="shrink-0 pt-0.5 text-[12px] font-semibold text-[#9AA3B2]">학력</span>
            <span className="text-right text-[13px] leading-[1.5] text-[#5B667A]">{talent.school || "확인 중"}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

// 패러데이식 인재 브라우저 — 좌상단 직군 탭 → 아래에 상세형 인재 카드
const TALENT_CATEGORIES = ["전체", "개발", "디자인", "마케팅"];

function categoryOf(role: string): string {
  const r = (role || "").toLowerCase();
  if (/design/.test(r)) return "디자인";
  if (/market|growth|social|content|seo|brand/.test(r)) return "마케팅";
  return "개발";
}

function TalentBrowser({ talents }: { talents: ShowcaseTalent[] }) {
  const [category, setCategory] = useState("전체");
  if (talents.length === 0) return null;
  const filtered = category === "전체" ? talents : talents.filter((t) => categoryOf(t.role) === category);
  return (
    <section id="talent-preview" className="bg-[#F7F8FA] scroll-mt-[64px]">
      <div className="mx-auto max-w-[1000px] px-5 py-14 md:py-20">
        {/* 탭은 좌상단 고정 */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {TALENT_CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={`rounded-full px-5 py-2.5 text-[15px] font-semibold transition sm:px-6 sm:py-3 sm:text-[16px] ${
                category === c ? "bg-[#191714] text-white" : "bg-white text-[#6B7280] ring-1 ring-[#E5E8EE] hover:text-[#191714]"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="mt-8 flex flex-col gap-5 md:mt-10 md:gap-6">
          {filtered.slice(0, 4).map((talent) => (
            <FeaturedCandidatePanel key={talent.id} talent={talent} />
          ))}
        </div>
        {filtered.length === 0 && (
          <p className="mt-10 text-[15px] text-[#8A93A5]">해당 직군 인재는 상담으로 바로 소개해드립니다.</p>
        )}
      </div>
    </section>
  );
}

export default function LandingPage() {
  // 브라우저는 큐레이션된 히어로 인재(경력·어학 데이터 완비)만 사용 — 출신·연차 점수순
  const browserTalents = useMemo(() => {
    return [...HERO_TALENTS].sort((a, b) => {
      const aScore = Number(a.schoolElite) * 3 + Number(a.companyElite) * 3 + (a.yoeYears || 0) / 10;
      const bScore = Number(b.schoolElite) * 3 + Number(b.companyElite) * 3 + (b.yoeYears || 0) / 10;
      return bScore - aScore;
    });
  }, []);

  return (
    <main className="min-h-screen bg-white pb-[76px] md:pb-0">
      <SiteHeader />
      <Hero />
      {/* 히어로 바로 아래: 직군 탭으로 인재 브라우징 (패러데이의 차량 브라우저 자리) */}
      <TalentBrowser talents={browserTalents} />
      <FeaturedTalentCarousel />
      <CaseStudiesPreview />
      <FinalCta />
      <SiteFooter />
      <MobileStickyCta />
    </main>
  );
}
