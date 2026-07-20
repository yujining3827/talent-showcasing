"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ProfileCard } from "@/app/components/showcase/ProfileCard";
import FeaturedTalentCarousel from "@/app/components/showcase/FeaturedTalentCarousel";
import CtaLink from "@/app/components/CtaLink";
import BrochureModal from "@/app/components/BrochureModal";
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

// 출신 회사 → 로고 파일(public/). 파일 있는 회사만 카드에 노출.
// className: 로고별 크기 오버라이드 (여백/비율 달라서 개별 조정, 기본 h-5)
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

function FeaturedCandidatePanel({ talent }: { talent: ShowcaseTalent }) {
  return (
    <Link
      href={`/showcase/${talent.id}`}
      className="z-10 flex flex-col overflow-hidden rounded-xl bg-white shadow-[0_24px_70px_-38px_rgba(10,18,32,0.5)] transition-shadow duration-300 hover:shadow-[0_30px_80px_-38px_rgba(232,89,12,0.4)] sm:flex-row"
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
        {/* 출신 회사 로고 — 헤드라인 라인 우측에 선명하게 (파일 있는 회사만, 세로 중앙 정렬) */}
        {(() => {
          const logo = companyLogo(talent.company);
          if (!logo) return null;
          return (
            <div className="absolute right-10 top-[46px] flex h-14 items-center">
              <img src={logo.src} alt={talent.company ?? ""} className={`w-auto max-w-[150px] object-contain ${logo.className ?? "h-9"}`} />
            </div>
          );
        })()}
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#E8590C]">이달의 검증 인재</p>
        <p className="mt-2 pr-[156px] text-[19px] font-semibold leading-[1.4] text-[#171E2D]">
          {(talent.headline || `검증된 ${talent.role || "테크"} 전문가`).split("/n").map((line, i) => (
            <span key={i} className="block">
              {line.trim()}
            </span>
          ))}
        </p>
        <p className="mt-1 text-[13px] text-[#59657A]">경력과 실무 역량을 먼저 확인합니다.</p>
        {/* 경력·어학(강조·주황 값) / 기술·학력(보조·회색) — 간격/패딩 균일 */}
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


function TalentStripCard({ talent, selected }: { talent: ShowcaseTalent; selected: boolean }) {
  return (
    <Link
      href={`/showcase/${talent.id}`}
      className={`grid min-w-[300px] grid-cols-[112px_1fr] overflow-hidden border bg-white p-0 text-left transition hover:border-[#E8590C] hover:shadow-[0_16px_45px_-30px_rgba(232,89,12,0.9)] ${
        selected ? "border-[#E8590C] shadow-[0_16px_45px_-30px_rgba(232,89,12,0.9)]" : "border-[#D8DEE8]"
      }`}
    >
      <div className="min-h-[132px] bg-[#D8DEE8]">
        <TalentPhoto talent={talent} />
      </div>
      <div className="min-w-0 p-4">
        <p className="truncate text-[16px] font-semibold text-[#30394C]">{talent.name}</p>
        <p className="mt-1 flex items-center gap-1 text-[13px] text-[#59657A]">
          <VerifiedIcon color="#E8590C" />
          <span className="min-w-0 truncate">{talent.role}</span>
        </p>
        <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#778195]">경력</p>
        <p className="mt-1 truncate text-[14px] font-semibold text-[#1B2233]">
          {talent.yoeYears ? `${talent.yoeYears}년차` : "신입"}
          {talent.company ? ` · ${talent.company}` : ""}
        </p>
      </div>
    </Link>
  );
}

function ChevronIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d={direction === "left" ? "M15 18l-6-6 6-6" : "M9 18l6-6-6-6"} />
    </svg>
  );
}

function TalentStrip({
  talents,
  selectedId,
}: {
  talents: ShowcaseTalent[];
  selectedId: string | null;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);

  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 8;
    if (direction === "right" && atEnd) {
      el.scrollTo({ left: 0, behavior: "smooth" });
    } else {
      el.scrollBy({ left: direction === "left" ? -320 : 320, behavior: "smooth" });
    }
  };

  useEffect(() => {
    if (paused || talents.length === 0) return;
    const id = setInterval(() => scroll("right"), 2800);
    return () => clearInterval(id);
  }, [paused, talents.length]);

  return (
    <div className="group relative" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <button
        type="button"
        aria-label="이전 인재 보기"
        onClick={() => scroll("left")}
        className="absolute left-0 top-1/2 z-30 hidden -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 p-2 text-[#8A93A5] opacity-0 shadow-[0_6px_16px_-8px_rgba(10,18,32,0.35)] transition duration-200 hover:bg-white hover:text-[#E8590C] group-hover:opacity-100 md:flex"
      >
        <ChevronIcon direction="left" />
      </button>
      <div ref={scrollRef} className="flex gap-4 overflow-x-auto scroll-smooth pb-2 scrollbar-hide">
        {talents.length > 0
          ? talents.map((talent) => (
              <TalentStripCard
                key={talent.id}
                talent={talent}
                selected={talent.id === selectedId}
              />
            ))
          : Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="grid min-w-[300px] grid-cols-[112px_1fr] overflow-hidden border border-[#D8DEE8] bg-white">
                <div className="h-[132px] bg-[#D8DEE8]" />
                <div className="p-4">
                  <div className="h-4 w-28 bg-[#E5E9F0]" />
                  <div className="mt-3 h-3 w-20 bg-[#E5E9F0]" />
                  <div className="mt-6 h-3 w-16 bg-[#E5E9F0]" />
                  <div className="mt-2 h-4 w-36 bg-[#E5E9F0]" />
                </div>
              </div>
            ))}
      </div>
      <button
        type="button"
        aria-label="다음 인재 보기"
        onClick={() => scroll("right")}
        className="absolute right-0 top-1/2 z-30 hidden -translate-y-1/2 translate-x-1/2 items-center justify-center rounded-full bg-white/80 p-2 text-[#8A93A5] opacity-0 shadow-[0_6px_16px_-8px_rgba(10,18,32,0.35)] transition duration-200 hover:bg-white hover:text-[#E8590C] group-hover:opacity-100 md:flex"
      >
        <ChevronIcon direction="right" />
      </button>
    </div>
  );
}

function Hero({
  talents,
}: {
  talents: ShowcaseTalent[];
}) {
  const heroTalents = talents.slice(0, 10);
  const [brochureOpen, setBrochureOpen] = useState(false);
  // 큰 카드는 항상 최상위 인재 고정. 스트립 카드 클릭은 상세로 바로 이동(선택 반영 없음)
  const featured = heroTalents[0] || null;

  return (
    <section className="relative isolate overflow-hidden bg-white text-[#192133]">
      <BrochureModal open={brochureOpen} onClose={() => setBrochureOpen(false)} />
      <div className="relative mx-auto grid max-w-[1360px] grid-cols-1 gap-5 px-5 pb-12 pt-8 md:grid-cols-[1fr_1.15fr] md:items-center md:gap-8 md:pb-20 md:pt-12">
        <div className="z-10 max-w-[640px]">
          <p className="inline-flex items-center gap-2 rounded-full border border-[#E7D8C7] bg-white/70 px-3.5 py-2 text-[13px] font-semibold text-[#A44C16]">
            <VerifiedIcon color="#E8590C" />
            세상에 없던 안심매칭
          </p>
          {/* 위계: 조건(회색·세미볼드) → 숫자(오렌지)·오퍼(진검정 엑스트라볼드)만 강조 */}
          <h1 className="mt-7 text-[32px] font-semibold leading-[1.24] tracking-[-0.01em] text-[#3A4356] sm:text-[38px] md:text-[46px]">
            인건비 최대 <span className="font-extrabold text-[#E8590C]">60%↓</span>
            <br />
            역량은 그대로.
            <br />
            <span className="font-extrabold text-[#111827]">최상위 글로벌 인재 구독</span>
          </h1>
          <p className="mt-6 max-w-[560px] text-[17px] leading-[1.75] text-[#4B5565] md:text-[20px]">
            검증된 글로벌 인재를 월 구독으로, 필요할 때 부담 없이 채용하세요.
          </p>
          {/* 모바일: 인재 카드를 첫 화면(헤드라인 바로 아래)에 노출 */}
          {featured && (
            <div className="mt-6 md:hidden">
              <FeaturedCandidatePanel talent={featured} />
            </div>
          )}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <CtaLink href="/pricing?form=1" location="hero" className="inline-flex h-14 items-center justify-center rounded-md bg-[#E8590C] px-8 text-[16px] font-semibold text-white shadow-[0_22px_46px_-26px_rgba(232,89,12,0.9)] transition hover:bg-[#C74E0A]">
              무료로 인재 추천받기
            </CtaLink>
            <button type="button" onClick={() => setBrochureOpen(true)} className="inline-flex h-14 items-center justify-center rounded-md border border-[#CFC7BB] bg-white/70 px-8 text-[16px] font-semibold text-[#1F2937] transition hover:bg-white">
              서비스 소개서 받아보기
            </button>
          </div>
          <div className="mt-10 grid max-w-[560px] grid-cols-3 divide-x divide-[#DED4C8] border-y border-[#DED4C8] py-5">
            <div className="pr-5">
              <p className="text-[28px] font-bold text-[#E8590C]">20,000+</p>
              <p className="mt-1 text-[12px] leading-[1.4] text-[#6B7280]">베트남 현지 네트워크</p>
            </div>
            <div className="px-5">
              <p className="text-[28px] font-bold text-[#111827]">32%</p>
              <p className="mt-1 text-[12px] leading-[1.4] text-[#6B7280]">최상위권 대학 출신</p>
            </div>
            <div className="pl-5">
              <p className="text-[28px] font-bold text-[#111827]">주 40시간</p>
              <p className="mt-1 text-[12px] leading-[1.4] text-[#6B7280]">풀타임 단독 채용</p>
            </div>
          </div>
        </div>

        <div className="hidden md:block">{featured ? <FeaturedCandidatePanel talent={featured} /> : null}</div>

        <div className="z-20 mt-4 md:col-span-2 md:mt-8">
          <TalentStrip talents={heroTalents} selectedId={featured?.id ?? null} />
        </div>
      </div>
    </section>
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

/* ============================================================================
 *  Mobile 전용 랜딩 (< md). 데스크톱/태블릿(md+)은 기존 레이아웃 그대로 유지.
 *  섹션 순서: Hero → 출신 기업 로고 → 핵심 수치 → 대표 인재 카드(컴팩트) → Featured → 사례
 *  기존 컴포넌트(TrustLogos·FeaturedTalentCarousel·CaseStudiesPreview·CtaLink·BrochureModal)
 *  재사용 + 모바일 컴팩트 카드(MobileTalentCard)는 TalentPhoto·companyLogo 재활용.
 * ========================================================================== */
/* 모바일 컴팩트 인재 카드 — 사진 썸네일 + 핵심 정보 (큰 FeaturedCandidatePanel 대신) */
function MobileTalentCard({ t }: { t: ShowcaseTalent }) {
  const logo = companyLogo(t.company);
  return (
    <Link href={`/showcase/${t.id}`} className="flex gap-3.5 rounded-2xl border border-[#EBEEF3] bg-white p-3 transition active:scale-[0.99]">
      <div className="relative h-[112px] w-[88px] shrink-0 overflow-hidden rounded-xl bg-[#EEF1F6]">
        <TalentPhoto talent={t} />
        <span className="absolute left-1.5 top-1.5 rounded-full bg-white/95 px-2 py-[3px] text-[9.5px] font-bold text-[#E8590C] shadow-sm">검증</span>
      </div>
      <div className="flex min-w-0 flex-1 flex-col py-0.5">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-[15px] font-bold text-[#171E2D]">{t.name}</p>
          {logo && <img src={logo.src} alt={t.company ?? ""} className={`w-auto max-w-[62px] shrink-0 object-contain ${logo.className ?? "h-4"}`} />}
        </div>
        <p className="mt-0.5 truncate text-[12.5px] text-[#59657A]">
          {t.role}
          {t.yoeYears ? ` · ${t.yoeYears}년차` : ""}
        </p>
        <div className="mt-auto pt-2">
          <p className="truncate text-[12.5px] font-bold text-[#E8590C]">{t.company || "경력 확인 중"}</p>
          <p className="mt-0.5 truncate text-[11.5px] text-[#8A93A5]">{t.school || "학력 확인 중"}</p>
        </div>
      </div>
    </Link>
  );
}

/* 모바일 Hero용 대표 인재 카드 — 가로형(사진 왼쪽 세로 썸네일) + 출신 기업(로고·"삼성 출신") 강조 */
function MobileHeroTalentCard({ t }: { t: ShowcaseTalent }) {
  const headline = t.headline || `검증된 ${t.role || "테크"} 전문가`;
  return (
    <Link
      href={`/showcase/${t.id}`}
      className="flex gap-4 overflow-hidden rounded-2xl border border-[#EDEFF3] bg-white pr-4 shadow-[0_22px_50px_-30px_rgba(10,18,32,0.5)] transition active:scale-[0.995]"
    >
      <div className="relative h-[160px] w-[118px] shrink-0 overflow-hidden bg-[#EEF1F6]">
        <TalentPhoto talent={t} />
        <span className="absolute left-2 top-2 flex items-center gap-0.5 rounded-full bg-white/95 px-1.5 py-[3px] text-[9.5px] font-bold text-[#E8590C] shadow-sm">
          <VerifiedIcon color="#E8590C" />검증
        </span>
      </div>
      <div className="flex min-w-0 flex-1 flex-col py-3.5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#E8590C]">이달의 검증 인재</p>
        <p className="mt-2 text-[17px] font-extrabold leading-[1.35] text-[#171E2D]">
          {headline.split("/n").map((line, i) => (
            <span key={i} className="block">
              {line.trim()}
            </span>
          ))}
        </p>
        <div className="mt-auto space-y-0.5 pt-2.5">
          <p className="truncate text-[12.5px] font-semibold text-[#3A4356]">
            {t.name}
            {t.yoeYears ? ` · ${t.yoeYears}년차` : ""}
          </p>
          {t.language && <p className="truncate text-[12px] font-bold text-[#E8590C]">{t.language}</p>}
          <p className="truncate text-[11.5px] text-[#8A93A5]">{t.school || "학력 확인 중"}</p>
        </div>
      </div>
    </Link>
  );
}

/* 모바일용 출신 기업 로고 — 웹처럼 슬라이딩(마퀴), 여백만 타이트하게 (데스크톱 TrustLogos는 그대로) */
function MobileTrustLogos() {
  const logos: { name: string; src: string }[] = [
    { name: "Samsung", src: "/samsung.svg" },
    { name: "FPT Software", src: "/FPT%20Software.webp" },
    { name: "Grab", src: "/Grab.png" },
    { name: "Google", src: "/google.png" },
    { name: "VNG", src: "/VNG.webp" },
    { name: "KPMG", src: "/KPMG.webp" },
  ];
  return (
    <section className="bg-white pb-8 pt-5">
      <div className="relative flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
        {[0, 1].map((dup) => (
          <div key={dup} className="animate-marquee flex shrink-0 items-center" aria-hidden={dup === 1}>
            {logos.map((logo) => (
              <div key={logo.name} className="flex shrink-0 items-center pr-12">
                <img src={logo.src} alt={logo.name} className="h-9 w-auto object-contain" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}

/* 모바일 스태핑 상품 — 3개 티어(재택 기준), 스탠다드 추천 강조. 내부 원가/수익 정보는 비노출 */
function MobilePricing() {
  const tiers = [
    {
      name: "베이직",
      price: "99",
      level: "국내 인턴 ~ 사원급",
      points: ["원격 풀타임 단독 채용", "하루 8시간 · 주 40시간"],
      featured: false,
    },
    {
      name: "스탠다드",
      price: "139",
      level: "국내 사원 ~ 대리급",
      points: ["실무 즉시 투입 가능", "하루 8시간 · 주 40시간"],
      featured: true,
    },
    {
      name: "프리미엄",
      price: "189",
      level: "국내 대리 · 과장급 이상",
      points: ["시니어 · 리드 역량", "하루 8시간 · 주 40시간"],
      featured: false,
    },
  ];
  return (
    <section className="border-t border-[#EFEAE2] bg-[#FBFAF8] px-5 py-9">
      <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#E8590C]">스태핑 상품</p>
      <h2 className="mt-2 text-[22px] font-bold leading-[1.35] text-[#171E2D]">
        채용 부담 없는<br />월 구독형 요금
      </h2>
      <p className="mt-2 text-[13px] leading-[1.6] text-[#8A93A5]">원격(재택) 기준 · 하루 8시간 · 주 40시간 풀타임 단독 채용</p>

      <div className="mt-5 flex flex-col gap-2.5">
        {tiers.map((t) => (
          <div
            key={t.name}
            className={`rounded-2xl border p-3.5 ${
              t.featured
                ? "border-[#E8590C] bg-white shadow-[0_16px_36px_-24px_rgba(232,89,12,0.55)]"
                : "border-[#EDE7DE] bg-white"
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 text-[15px] font-bold text-[#171E2D]">
                  {t.name}
                  {t.featured && (
                    <span className="rounded-full bg-[#E8590C] px-1.5 py-0.5 text-[10px] font-bold text-white">⭐ 추천</span>
                  )}
                </p>
                <p className="mt-0.5 text-[11.5px] text-[#8A93A5]">{t.level}</p>
              </div>
              <p className="shrink-0 text-[22px] font-extrabold leading-none text-[#111827]">
                {t.price}
                <span className="ml-0.5 text-[13px] font-semibold text-[#5B667A]">만원/월</span>
              </p>
            </div>
            <p className="mt-2.5 text-[12px] leading-[1.5] text-[#8A93A5]">{t.points.join(" · ")}</p>
          </div>
        ))}
      </div>

      <p className="mt-4 text-[12px] leading-[1.6] text-[#9AA3B2]">
        오피스 출근 옵션은 별도 문의 · 요금은 채용 조건에 따라 조정될 수 있어요.
      </p>
      <CtaLink
        href="/pricing?form=1"
        location="mobile-pricing"
        className="mt-5 flex h-[54px] items-center justify-center rounded-xl bg-[#E8590C] text-[16px] font-bold text-white shadow-[0_16px_36px_-18px_rgba(232,89,12,0.9)] transition active:scale-[0.99]"
      >
        내게 맞는 요금 추천받기
      </CtaLink>
    </section>
  );
}

/* 상단 프로모 밴드 — 7월 한정 2주 무료 */
function MobilePromoBar() {
  return (
    <div className="bg-[#111827] px-5 py-2.5 text-center text-[13px] font-semibold text-white">
      🎁 7월 한정 · <span className="text-[#FFB27A]">2주 무료 체험</span>으로 먼저 만나보세요
    </div>
  );
}

/* 왜 베트남 — 헤딩 + 젊은 인재 강조 카드 (국가 비교표 제거) */
function MobileWhyVietnam() {
  return (
    <section className="bg-[#FBFAF8] px-5 py-11">
      <p className="text-center text-[12px] font-semibold uppercase tracking-[0.14em] text-[#E8590C]">왜 하필 베트남일까요?</p>
      <h2 className="mt-2 text-center text-[22px] font-bold leading-[1.4] text-[#171E2D]">
        상위권 대학 출신에
        <br />
        <span className="text-[#E8590C]">영어까지 능통한</span> 고역량 인재
      </h2>
      <p className="mt-3 text-center text-[13.5px] leading-[1.7] text-[#8A93A5]">
        글로벌 기업을 선호하고, 한국 기업에서
        <br />
        열정적으로 일하기를 원합니다.
      </p>
      <div className="mt-6 flex flex-col gap-2.5">
        {[
          { ic: "🎓", t: "상위권 대학 출신", d: "베트남 명문대 출신의 검증된 인재" },
          { ic: "🗣️", t: "영어 업무 가능", d: "IELTS·TOEIC 검증으로 실무 소통 원활" },
          { ic: "🇰🇷", t: "한국 기업 선호", d: "글로벌 기업 지향 + 한국 문화 친화" },
        ].map((f) => (
          <div key={f.t} className="flex items-center gap-4 rounded-2xl border border-[#EDEFF3] bg-white py-4 pl-6 pr-5">
            <span className="text-[22px]">{f.ic}</span>
            <div className="min-w-0">
              <p className="text-[14.5px] font-bold text-[#171E2D]">{f.t}</p>
              <p className="mt-0.5 text-[12.5px] leading-[1.5] text-[#8A93A5]">{f.d}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* 왜 공고마감 — 멋사 6년차 + 핵심 혜택 + 보장 */
function MobileWhyGgmg() {
  const benefits = [
    { ic: "🆓", t: "채용 전까지 전부 무료", d: "인재 추천·면접·통역 지원까지 채용 전 단계는 모두 0원." },
    { ic: "🔄", t: "무약정 + 무료 교체", d: "장기 계약 강제 없음. 핏이 안 맞으면 추가 비용 없이 교체." },
    { ic: "🛡️", t: "고용행정·보안 대행", d: "급여·세무·4대보험·NDA까지 6년차 현지 법인이 직접 처리." },
  ];
  return (
    <section className="bg-white px-5 py-10">
      <h2 className="text-center text-[22px] font-bold leading-[1.4] text-[#171E2D]">
        베트남 채용, 왜 <span className="text-[#E8590C]">공고마감</span>일까요?
      </h2>
      <p className="mt-3 text-center text-[15px] font-bold leading-[1.55] text-[#171E2D]">
        국내 최고 IT 인재 커뮤니티
        <br />
        <span className="text-[#E8590C]">멋쟁이사자처럼</span>이 만들었습니다.
      </p>
      <div className="mt-3 flex justify-center">
        <span className="rounded-full bg-[#FFF1E8] px-3 py-1.5 text-[12.5px] font-bold text-[#E8590C]">🇻🇳 베트남 법인 6년차</span>
      </div>
      <p className="mt-4 text-center text-[13.5px] leading-[1.75] text-[#5B667A]">
        6년 전부터 베트남 현지에서 IT 교육을 해왔습니다.
        <br />
        수많은 인재를 직접 길러낸 <b className="text-[#171E2D]">우리가, 가장 잘 압니다.</b>
      </p>
      <div className="mt-6 flex flex-col gap-2.5">
        {benefits.map((b) => (
          <div key={b.t} className="flex gap-3 rounded-2xl border border-[#EDEFF3] bg-[#FBFAF8] p-4">
            <span className="text-[20px]">{b.ic}</span>
            <div>
              <p className="text-[14.5px] font-bold text-[#171E2D]">{b.t}</p>
              <p className="mt-0.5 text-[13px] leading-[1.55] text-[#8A93A5]">{b.d}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-2xl border border-[#F1D9C6] bg-[#FFF7F1] p-4 text-center">
        <p className="text-[14px] leading-[1.7] text-[#3A4356]">
          인재 추천부터 면접·처우 협의까지 <b className="text-[#E8590C]">전 과정, 불만족 시 비용 0원.</b>
        </p>
        <p className="mt-1.5 text-[12.5px] font-bold text-[#171E2D]">공고마감은 자신 있습니다.</p>
      </div>
    </section>
  );
}

/* TWIST — 교체 말고 추가로 + 무료 체험 CTA (클로징) */
function MobileTwist() {
  return (
    <section className="bg-[#171E2D] px-5 py-11 text-white">
      <div className="text-center">
        <span className="inline-block rounded-full bg-[#E8590C] px-3 py-1 text-[12px] font-bold">2주 무료 채용</span>
        <h2 className="mt-4 text-[23px] font-bold leading-[1.4]">
          사람을 <span className="text-[#FFB27A]">바꾸지</span> 마세요.
          <br />딱 한 명만 <span className="text-[#FFB27A]">추가로</span> 써보세요.
        </h2>
        <p className="mt-3 text-[14px] leading-[1.75] text-white/70">
          인력 교체는 나중에. 리스크 없이 <b className="text-white">2주 무료</b>로 먼저 겪어보고 결정하세요.
        </p>
      </div>
      <div className="mt-8 text-center">
        <p className="text-[14px] leading-[1.7] text-white/70">
          직무·연차만 남기면 평균 1주 내 맞춤 인재를 추천드립니다.
          <br />
          채용 전 단계는 100% 무료입니다.
        </p>
        <CtaLink
          href="/pricing?form=1"
          location="mobile-final"
          className="mt-5 flex h-[54px] items-center justify-center rounded-xl bg-[#E8590C] text-[16px] font-bold text-white shadow-[0_16px_36px_-18px_rgba(232,89,12,0.9)] transition active:scale-[0.99]"
        >
          2주 무료 체험 신청하기
        </CtaLink>
      </div>
    </section>
  );
}

/* FAQ — 아코디언 */
function MobileFaq() {
  const faqs: [string, string][] = [
    ["채용까지 얼마나 걸리나요?", "직무·연차를 남겨주시면 평균 1주 내로 맞춤 인재를 추천드리고, 통상 2~3주 내 투입이 가능합니다."],
    ["계약·정산은 어떻게 하나요?", "인보이스 한 장으로 월 정산, 세금계산서를 발행합니다. 현지 급여·세무·4대보험은 현지 법인이 처리합니다."],
    ["정보보안·지식재산권(IP)은 안전한가요?", "NDA 체결과 데이터 접근 관리를 지원하며, 작업 산출물의 지식재산권은 고객사에 귀속됩니다."],
    ["시차·근무시간은 어떻게 맞추나요?", "베트남은 한국과 시차 2시간으로 거의 실시간 협업이 가능하며, 한국 근무시간 기준 주 40시간 풀타임으로 일합니다."],
    ["언어(소통)는 괜찮나요?", "비즈니스 영어 가능 인재(IELTS·TOEIC 검증) + 한국어 통역·PM + AI 번역툴까지 제공해 언어 장벽 없이 협업합니다."],
    ["최소 계약 기간이 있나요?", "무약정 월 구독이라 언제든 종료 가능하고, 핏이 안 맞으면 추가 비용 없이 무료 교체해 드립니다. 채용 전 단계는 100% 무료입니다."],
  ];
  return (
    <section className="bg-white px-5 py-10">
      <p className="text-center text-[12px] font-semibold uppercase tracking-[0.14em] text-[#E8590C]">자주 묻는 질문</p>
      <h2 className="mt-2 text-center text-[22px] font-bold text-[#171E2D]">FAQ</h2>
      <div className="mt-5 flex flex-col gap-2.5">
        {faqs.map(([q, a], i) => (
          <details key={i} className="group rounded-2xl border border-[#EDEFF3] bg-[#FBFAF8] p-4" open={i === 0}>
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-[14.5px] font-bold text-[#171E2D]">
              {q}
              <span className="shrink-0 text-[20px] leading-none text-[#E8590C] transition group-open:rotate-45">+</span>
            </summary>
            <p className="mt-2.5 text-[13.5px] leading-[1.7] text-[#5B667A]">{a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

/* 하단 고정 CTA 바 — 모바일 전용(md:hidden 래퍼 안에서 렌더). 채팅은 헤더로 이동해 풀폭 사용 */
function MobileStickyCta({ visible }: { visible: boolean }) {
  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-[#EDEFF3] bg-white/95 px-4 py-2.5 backdrop-blur-md shadow-[0_-8px_24px_rgba(28,39,76,0.12)] transition-all duration-300 ${
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-full opacity-0"
      }`}
    >
      <CtaLink
        href="/pricing?form=1"
        location="mobile-sticky"
        className="animate-cta-glow flex h-[50px] items-center justify-center gap-2 rounded-xl bg-[#E8590C] text-[15.5px] font-bold text-white"
      >
        <span className="rounded-full bg-white/20 px-2 py-[3px] text-[11px] font-extrabold">🎁 2주 무료</span>
        2주 무료 체험 신청
      </CtaLink>
    </div>
  );
}

function MobileLanding({ heroTalents }: { heroTalents: ShowcaseTalent[] }) {
  const [brochureOpen, setBrochureOpen] = useState(false);
  const top = heroTalents.slice(0, 10);
  const heroCards = top.slice(0, 4);
  const [heroIdx, setHeroIdx] = useState(0);
  useEffect(() => {
    if (heroCards.length <= 1) return;
    const id = setInterval(() => setHeroIdx((i) => (i + 1) % heroCards.length), 3500);
    return () => clearInterval(id);
  }, [heroCards.length]);
  // 히어로 CTA가 화면 위로 벗어나면 하단 고정 바 노출
  const heroCtaRef = useRef<HTMLDivElement>(null);
  const [showSticky, setShowSticky] = useState(false);
  useEffect(() => {
    const check = () => {
      const el = heroCtaRef.current;
      if (el) setShowSticky(el.getBoundingClientRect().bottom < 0);
    };
    check();
    // capture:true → window·내부 컨테이너 스크롤 모두 감지 (프리뷰/디바이스 환경 견고)
    window.addEventListener("scroll", check, { passive: true, capture: true });
    window.addEventListener("resize", check);
    return () => {
      window.removeEventListener("scroll", check, { capture: true });
      window.removeEventListener("resize", check);
    };
  }, []);
  const primaryCta =
    "flex h-[54px] items-center justify-center rounded-xl bg-[#E8590C] text-[16px] font-bold text-white shadow-[0_16px_36px_-18px_rgba(232,89,12,0.9)] transition active:scale-[0.99]";

  return (
    <div>
      <BrochureModal open={brochureOpen} onClose={() => setBrochureOpen(false)} />

      {/* 1. Hero — 인건비 60%↓ + 실제 인재 순환 + 2주 무료 */}
      <section className="bg-white px-5 pb-9 pt-11">
        <h1 className="text-center text-[28px] font-extrabold leading-[1.3] tracking-[-0.02em] text-[#171E2D]">
          <span className="text-[#E8590C]">베트남 개발자 채용</span>
          <br />
          직접 경험하고 만들었습니다.
        </h1>
        <p className="mt-3 text-center text-[15px] leading-[1.6] text-[#5B667A]">
          <b className="text-[#111827]">2주 무료</b>로 함께 일해본 뒤 결정하세요.
        </p>
        {heroCards.length > 0 && (
          <div className="mt-10">
            <div key={heroCards[heroIdx].id} className="animate-testimonial">
              <MobileHeroTalentCard t={heroCards[heroIdx]} />
            </div>
            {heroCards.length > 1 && (
              <div className="mt-3.5 flex justify-center gap-1.5">
                {heroCards.map((c, i) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setHeroIdx(i)}
                    aria-label={`인재 ${i + 1} 보기`}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === heroIdx ? "w-5 bg-[#E8590C]" : "w-1.5 bg-[#D8DEE2]"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        )}
        <CtaLink href="/pricing?form=1" location="mobile-hero" className={`mt-6 ${primaryCta}`}>2주 무료 체험 시작 · 0원</CtaLink>
        <div ref={heroCtaRef} aria-hidden className="h-px w-full" />
        <p className="mt-3 text-center text-[12.5px] text-[#9AA3B2]">무약정 · 언제든 종료 · 채용 전 100% 무료</p>
      </section>

      {/* 2. 출신 기업 로고 */}
      <MobileTrustLogos />

      {/* 3. 왜 베트남 */}
      <MobileWhyVietnam />

      {/* 4. 고객 사례 — 왜 베트남 바로 밑 (주장 → 증거) */}
      <CaseStudiesPreview />

      {/* 왜 공고마감 — 잠시 숨김 (복구: false → true) */}
      {false && <MobileWhyGgmg />}

      {/* 7. 구독 요금 — 인재 리스트 위로 */}
      <MobilePricing />

      {/* 8. 더 많은 검증 인재 */}
      {top.length > 1 && (
        <section className="bg-white px-5 pb-5 pt-10">
          <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#E8590C]">엄선된 인재 쇼케이스</p>
          <h2 className="mt-2 text-[22px] font-bold leading-[1.35] text-[#171E2D]">
            출신·검증이 먼저 보이는
            <br />
            검증된 인재를 만나보세요
          </h2>
          <div className="mt-5 flex flex-col gap-3">
            {top.slice(1, 4).map((t) => (
              <MobileTalentCard key={t.id} t={t} />
            ))}
          </div>
        </section>
      )}

      {/* 9. 포폴 미리보기 */}
      <FeaturedTalentCarousel />

      {/* 11. FAQ */}
      <MobileFaq />

      {/* 12. 클로징 — TWIST(교체 말고 추가) + 무료 체험 CTA 합침 */}
      <MobileTwist />

      {/* 하단 고정 CTA 바 — 히어로 CTA가 화면에서 사라지면 등장 */}
      <MobileStickyCta visible={showSticky} />
    </div>
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
    <main className="min-h-screen bg-white">
      {/* 모바일 프로모 밴드 — 헤더 위(스크롤 시 사라지고 헤더만 고정) */}
      <div className="md:hidden">
        <MobilePromoBar />
      </div>
      <SiteHeader />
      {/* 데스크톱/태블릿 (md+) — 기존 레이아웃 그대로 (절대 변경 없음) */}
      <div className="hidden md:block">
        <Hero talents={heroTalents} />
        <TrustLogos />
        <FeaturedTalentCarousel />
        <TalentPreview talents={premiumTalents} />
        <CaseStudiesPreview />
      </div>
      {/* 모바일 (< md) — 전용 랜딩 */}
      <div className="md:hidden">
        <MobileLanding heroTalents={heroTalents} />
      </div>
      <SiteFooter />
      {/* 모바일 하단 고정 CTA 바 가림 방지 스페이서 */}
      <div aria-hidden className="h-[68px] md:hidden" />
    </main>
  );
}




