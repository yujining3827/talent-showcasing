"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import CtaLink from "@/app/components/CtaLink";
import { gtmPush, getStoredUtm } from "@/lib/gtm";
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
        베트남 {ROLLING_ROLES[index]}
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
            <h1 className="mt-6 max-w-[640px] break-keep text-[27px] font-extrabold leading-[1.28] tracking-[-0.01em] text-white [text-shadow:0_2px_20px_rgba(0,0,0,0.4)] sm:text-[42px] md:text-[52px]">
              채용 없이, 선불 0원으로
              <RollingRole />
              지금 바로 써보세요
            </h1>
            <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-6">
              <CtaLink href="/pricing" location="hero" className="inline-flex h-12 items-center justify-center rounded-lg bg-[#E8590C] px-8 text-[16px] font-semibold text-white transition hover:bg-[#C74E0A] sm:h-[52px] sm:px-10 sm:text-[17px]">
                70만원 지원받고 인재 보기
              </CtaLink>
              {/* 당위 한 줄(왜 글로벌인가) + 가격 3종 — 모바일 직군당 1행, 데스크톱 한 줄 */}
              <div className="text-[13px] leading-[1.8] text-white/70 sm:text-[14px]">
                <p className="break-keep font-medium text-white/85">
                  채용, 어려우시죠? 글로벌로 넓히면 <span className="font-semibold text-white">같은 실력이 절반 가격</span>입니다
                </p>
                <p className="mt-0.5 flex flex-col sm:mt-0 sm:block">
                  <span className="whitespace-nowrap">즉시 투입 · 평균 3년차 — </span>
                  <span className="whitespace-nowrap">풀스택 개발자 월 <span className="font-semibold text-white">159만원</span></span>
                  <span className="hidden sm:inline"> · </span>
                  <span className="whitespace-nowrap">디자이너 월 <span className="font-semibold text-white">99만원</span></span>
                  <span className="hidden sm:inline"> · </span>
                  <span className="whitespace-nowrap">마케터 월 <span className="font-semibold text-white">149만원</span></span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// 마지막 섹션 — 페이지 안에서 바로 리드 접수 (푸조 광고의 임베디드 시승 신청 폼 구조)
const LEAD_ROLES = ["개발", "디자인", "마케팅", "CS"];

function LeadForm() {
  const [form, setForm] = useState({ company: "", name: "", contact: "", role: "", consent: false });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canSubmit = !!(form.company.trim() && form.name.trim() && form.contact.trim() && form.consent);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/pricing-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          company: form.company,
          contact: form.contact,
          consent: form.consent,
          roles: form.role ? [form.role] : [],
          ...getStoredUtm(),
        }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({})))?.error || "제출에 실패했습니다.");
      gtmPush("lead_submit", { source: "landing-inline" });
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "제출 중 문제가 발생했어요. 잠시 후 다시 시도해주세요.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section id="lead" className="bg-[#F6F1E9] px-5 py-10 md:py-14">
      <div className="mx-auto grid max-w-[1200px] overflow-hidden rounded-[32px] bg-[#17120F] shadow-[0_28px_80px_-42px_rgba(29,20,13,0.65)] md:grid-cols-2">
        <div className="relative flex aspect-square flex-col justify-end overflow-hidden bg-black px-7 py-9 md:px-12 md:py-12">
          <Image
            src="/cta-promo-original.png"
            alt=""
            aria-hidden="true"
            fill
            sizes="(min-width: 768px) 600px, 100vw"
            quality={85}
            className="z-0 object-contain"
          />
          <div className="absolute inset-0 z-10 bg-[linear-gradient(90deg,rgba(13,9,7,0.88)_0%,rgba(13,9,7,0.62)_62%,rgba(13,9,7,0.28)_100%)]" />
          <div className="absolute inset-0 z-10 bg-[linear-gradient(0deg,rgba(13,9,7,0.82)_0%,transparent_62%)]" />
          <p className="relative z-20 mb-auto text-[11px] font-bold uppercase tracking-[0.18em] text-white/70">
            베트남 인재 매칭
          </p>
          <h2 className="relative z-20 max-w-[460px] break-keep text-[28px] font-extrabold leading-[1.24] text-white sm:text-[36px] md:text-[42px]">
            개발자·마케터·디자이너
            <br />
            채용이 고민이시라면,
            <br />
            무료로 <span className="text-[#FF9D5C]">검증된 이력서</span>부터 받아보세요
          </h2>
          <p className="relative z-20 mt-4 text-[14px] font-medium leading-[1.7] text-white/80 md:text-[15px]">
            담당자가 1시간 내 연락드리겠습니다.
          </p>
        </div>
        {done ? (
          <div className="flex flex-col items-center justify-center gap-3 bg-white/95 px-7 py-16 text-center md:px-12">
            <p className="text-[22px] font-extrabold text-[#171E2D]">신청 완료!</p>
            <p className="text-[14px] leading-[1.7] text-[#5B667A]">담당자가 영업일 기준 하루 안에 연락드립니다.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 bg-white/95 px-7 py-10 md:px-12 md:py-14">
            <input
              type="text"
              placeholder="회사명"
              value={form.company}
              onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
              className="h-12 rounded-lg border border-[#E2E8F0] bg-white px-4 text-[15px] text-[#171E2D] outline-none transition focus:border-[#E8590C]"
            />
            <input
              type="text"
              placeholder="담당자 이름"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="h-12 rounded-lg border border-[#E2E8F0] bg-white px-4 text-[15px] text-[#171E2D] outline-none transition focus:border-[#E8590C]"
            />
            <input
              type="text"
              inputMode="tel"
              placeholder="연락처 (휴대폰 또는 이메일)"
              value={form.contact}
              onChange={(e) => setForm((f) => ({ ...f, contact: e.target.value }))}
              className="h-12 rounded-lg border border-[#E2E8F0] bg-white px-4 text-[15px] text-[#171E2D] outline-none transition focus:border-[#E8590C]"
            />
            {/* 직군은 선택사항 — 필수 3개(회사/이름/연락처)만 채우면 제출 가능 */}
            <div className="flex flex-wrap gap-2">
              {LEAD_ROLES.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, role: f.role === r ? "" : r }))}
                  className={`rounded-full px-4 py-2 text-[13px] font-semibold transition ${
                    form.role === r ? "bg-[#191714] text-white" : "bg-[#F3F4F6] text-[#6B7280] hover:text-[#191714]"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
            <label className="flex cursor-pointer items-center gap-2 text-[13px] text-[#5B667A]">
              <input
                type="checkbox"
                checked={form.consent}
                onChange={(e) => setForm((f) => ({ ...f, consent: e.target.checked }))}
                className="h-4 w-4 accent-[#E8590C]"
              />
              개인정보 수집·이용에 동의합니다
            </label>
            {error && <p className="text-[13px] font-medium text-[#D93025]">{error}</p>}
            <button
              type="submit"
              disabled={!canSubmit || submitting}
              className="mt-1 h-[52px] rounded-lg bg-[#E8590C] text-[16px] font-bold text-white transition hover:bg-[#C74E0A] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {submitting ? "접수 중..." : "3일 안에 인재 추천받기"}
            </button>
          </form>
        )}
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
          3일 안에 인재 추천받기
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

// 직무 표기 한국어 통일 — 사전 매핑 + 일반 규칙 폴백
const ROLE_KO: Record<string, string> = {
  "senior qa engineer": "시니어 QA 엔지니어",
  "qa engineer": "QA 엔지니어",
  "ai/ml engineer": "AI/ML 엔지니어",
  "full-stack developer": "풀스택 개발자",
  "front end developer": "프론트엔드 개발자",
  "frontend developer": "프론트엔드 개발자",
  "senior backend developer": "시니어 백엔드 개발자",
  "backend software engineer": "백엔드 엔지니어",
  "backend developer": "백엔드 개발자",
  "senior ux/ui designer": "시니어 UX/UI 디자이너",
  "ux/ui designer": "UX/UI 디자이너",
  "product designer": "프로덕트 디자이너",
  "growth marketing": "그로스 마케터",
  "growth marketer": "그로스 마케터",
  "marketing": "마케터",
  "it support": "IT 서포트",
};

function roleKo(role: string): string {
  const key = (role || "").trim().toLowerCase();
  if (ROLE_KO[key]) return ROLE_KO[key];
  // 일반 규칙: 흔한 영어 직함 단어만 치환
  let r = role || "기타";
  r = r.replace(/senior/i, "시니어").replace(/full[- ]?stack/i, "풀스택").replace(/front[- ]?end/i, "프론트엔드").replace(/back[- ]?end/i, "백엔드");
  r = r.replace(/developer/i, "개발자").replace(/engineer/i, "엔지니어").replace(/designer/i, "디자이너").replace(/marketer|marketing/i, "마케터").replace(/support/i, "서포트");
  return r.replace(/\s+/g, " ").trim();
}

// 카테고리별 더미 기본값 — 데이터 없을 때 카드 양식 통일용 (실데이터 채워지면 자동 대체)
const FALLBACK_LANGUAGE = "영어 업무 가능";
const FALLBACK_SKILLS: Record<string, string[]> = {
  개발: ["Git", "English Docs", "Agile"],
  디자인: ["Figma", "Design System"],
  마케팅: ["Meta Ads", "GA4"],
  CS: ["CS 운영", "VOC 관리"],
};

// 콤팩트 인재 카드 — 캐러셀 슬라이드용 (사진 좌 + 핵심 정보 우, 높이 ~200px)
// 양식 고정: 헤드라인(한국어) + 경력/어학/기술 3행 — 값 없으면 더미로 채워 구조 통일
function CandidateCard({ talent }: { talent: ShowcaseTalent }) {
  const logo = companyLogo(talent.company);
  const role = roleKo(talent.role);
  const category = categoryOf(talent.role);
  const headline =
    talent.headline && /[가-힣]/.test(talent.headline)
      ? talent.headline.replace("/n", " ")
      : `검증된 ${role}`;
  const language = talent.language || FALLBACK_LANGUAGE;
  const skills = talent.skills?.length ? talent.skills : FALLBACK_SKILLS[category] || [];
  const inner = (
    <>
      <div className="relative w-[140px] shrink-0 sm:w-[180px]">
        <TalentPhoto talent={talent} />
        <div className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-[#E8590C]">
          <VerifiedIcon color="#E8590C" />
          검증됨
        </div>
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2.5 pt-8">
          <p className="truncate text-[13px] font-semibold text-white">{talent.name}</p>
          <p className="mt-0.5 truncate text-[11px] text-white/85">{role}</p>
        </div>
      </div>
      <div className="flex min-w-0 flex-1 flex-col p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#E8590C]">지금 트라이얼 가능</p>
          {logo && <img src={logo.src} alt={talent.company ?? ""} className="h-5 w-auto max-w-[90px] shrink-0 object-contain sm:h-6" />}
        </div>
        <p className="mt-1.5 break-keep text-[15px] font-semibold leading-[1.35] text-[#171E2D] sm:text-[16px]">{headline}</p>
        <div className="mt-auto flex flex-col gap-2 pt-3">
          <div className="flex items-baseline justify-between gap-3">
            <span className="shrink-0 text-[11px] font-semibold text-[#9AA3B2]">경력</span>
            <span className="truncate text-right text-[13px] font-bold text-[#E8590C]">
              {talent.yoeYears ? `${talent.yoeYears}년차` : "신입"}
              {talent.company ? ` · ${talent.company}` : ""}
            </span>
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <span className="shrink-0 text-[11px] font-semibold text-[#9AA3B2]">어학</span>
            <span className="truncate text-right text-[13px] font-bold text-[#E8590C]">{language}</span>
          </div>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {skills.slice(0, 3).map((skill) => (
              <span key={skill} className="rounded-full bg-[#F1F3F7] px-2 py-0.5 text-[11px] font-medium text-[#5B667A]">
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>
    </>
  );

  return (
    <Link
      href={`/showcase/${talent.id}`}
      className="flex h-full overflow-hidden rounded-xl bg-white shadow-[0_16px_44px_-30px_rgba(10,18,32,0.45)] ring-1 ring-[#ECEFF3] transition-shadow duration-300 hover:shadow-[0_24px_60px_-30px_rgba(232,89,12,0.45)]"
    >
      {inner}
    </Link>
  );
}

// 패러데이식 인재 브라우저 — 좌상단 직군 탭 → 아래에 인재 카드 연속 롤링
const TALENT_CATEGORIES = ["전체", "개발", "디자인", "마케팅", "CS"];

function categoryOf(role: string): string {
  const r = (role || "").toLowerCase();
  if (/design/.test(r)) return "디자인";
  if (/market|growth|social|content|seo|brand/.test(r)) return "마케팅";
  if (/\bcs\b|customer|support|cx|service/.test(r)) return "CS";
  return "개발";
}

function ChevronIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d={direction === "left" ? "M15 18l-6-6 6-6" : "M9 18l6-6-6-6"} />
    </svg>
  );
}

// 자동 롤링 캐러셀 — 3초마다 한 장씩, 화살표로 즉시 넘기기 가능 (호버해도 계속 돈다)
function TalentCarousel({ talents }: { talents: ShowcaseTalent[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start" }, [
    Autoplay({ delay: 3000, stopOnInteraction: false, stopOnMouseEnter: false }),
  ]);

  return (
    <div className="relative mt-8 md:mt-10">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {talents.map((talent) => (
            <div key={talent.id} className="min-w-0 shrink-0 basis-full pr-3 sm:basis-[540px] sm:pr-5">
              <CandidateCard talent={talent} />
            </div>
          ))}
        </div>
      </div>
      {/* 화살표: 모바일은 안쪽에 작게, 데스크톱은 바깥 반걸침 */}
      <button
        type="button"
        aria-label="이전 인재 보기"
        onClick={() => emblaApi?.scrollPrev()}
        className="absolute left-2 top-1/2 z-20 flex -translate-y-1/2 items-center justify-center rounded-full bg-white/95 p-2 text-[#3A4356] shadow-[0_8px_20px_-8px_rgba(10,18,32,0.4)] transition hover:text-[#E8590C] md:left-0 md:-translate-x-1/2 md:p-2.5"
      >
        <ChevronIcon direction="left" />
      </button>
      <button
        type="button"
        aria-label="다음 인재 보기"
        onClick={() => emblaApi?.scrollNext()}
        className="absolute right-2 top-1/2 z-20 flex -translate-y-1/2 items-center justify-center rounded-full bg-white/95 p-2 text-[#3A4356] shadow-[0_8px_20px_-8px_rgba(10,18,32,0.4)] transition hover:text-[#E8590C] md:right-0 md:translate-x-1/2 md:p-2.5"
      >
        <ChevronIcon direction="right" />
      </button>
    </div>
  );
}

function TalentBrowser({ talents }: { talents: ShowcaseTalent[] }) {
  const [category, setCategory] = useState("전체");
  const filtered = useMemo(
    () => (category === "전체" ? talents : talents.filter((t) => categoryOf(t.role) === category)),
    [category, talents]
  );

  if (talents.length === 0) return null;
  return (
    <section id="talent-preview" className="bg-[#F7F8FA] scroll-mt-[64px]">
      <div className="mx-auto max-w-[1200px] px-5 py-10 md:py-14">
        {/* 탭: 좌상단 세그먼트 컨트롤 — 한 덩어리로 묶어 존재감 있게 */}
        <div className="inline-flex max-w-full items-center gap-1 overflow-x-auto rounded-full bg-white p-1.5 shadow-[0_10px_30px_-18px_rgba(10,18,32,0.35)] ring-1 ring-[#E5E8EE] scrollbar-hide">
          {TALENT_CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={`shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-[14px] font-semibold transition-all duration-200 sm:px-5 sm:py-2.5 sm:text-[15px] ${
                category === c
                  ? "bg-[#E8590C] text-white shadow-[0_8px_18px_-8px_rgba(232,89,12,0.7)]"
                  : "text-[#6B7280] hover:text-[#191714]"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        {filtered.length > 0 ? (
          <TalentCarousel key={category} talents={filtered} />
        ) : (
          <p className="mt-10 text-[15px] text-[#8A93A5]">해당 직군 인재는 상담으로 바로 소개해드립니다.</p>
        )}
      </div>
    </section>
  );
}

export default function LandingPage() {
  const [dbTalents, setDbTalents] = useState<ShowcaseTalent[]>([]);

  // DB 인재는 마케팅/CS만 합류 (사진 퀄리티 확인된 직군) — 개발/디자인은 큐레이션 유지
  useEffect(() => {
    fetch("/api/showcase")
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d.talents)) {
          setDbTalents(d.talents.filter((t: ShowcaseTalent) => ["마케팅", "CS"].includes(categoryOf(t.role))));
        }
      })
      .catch(() => {});
  }, []);

  // 큐레이션 인재(경력·어학 완비) 점수순 + 마케팅/CS DB 인재 뒤에 합류 (이름 중복 제거)
  const browserTalents = useMemo(() => {
    const sorted = [...HERO_TALENTS].sort((a, b) => {
      const aScore = Number(a.schoolElite) * 3 + Number(a.companyElite) * 3 + (a.yoeYears || 0) / 10;
      const bScore = Number(b.schoolElite) * 3 + Number(b.companyElite) * 3 + (b.yoeYears || 0) / 10;
      return bScore - aScore;
    });
    const seen = new Set(sorted.map((t) => (t.name || "").trim().toLowerCase()));
    return sorted.concat(dbTalents.filter((t) => !seen.has((t.name || "").trim().toLowerCase())));
  }, [dbTalents]);

  return (
    <main className="min-h-screen bg-white pb-[76px] md:pb-0">
      <SiteHeader />
      <Hero />
      {/* 히어로 바로 아래: 직군 탭으로 인재 브라우징 (패러데이의 차량 브라우저 자리) */}
      <TalentBrowser talents={browserTalents} />
      <CaseStudiesPreview />
      <LeadForm />
      <SiteFooter />
      <MobileStickyCta />
    </main>
  );
}
