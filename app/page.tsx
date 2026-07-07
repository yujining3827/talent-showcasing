"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ProfileCard } from "@/app/components/showcase/ProfileCard";

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

function VerifiedIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2.75 14.4 5.2l3.42-.47.58 3.4 3.05 1.58-1.56 3.06 1.56 3.05-3.05 1.58-.58 3.4-3.42-.47L12 21.25 9.6 18.8l-3.42.47-.58-3.4-3.05-1.58 1.56-3.06-1.56-3.05L5.6 6.6l.58-3.4 3.42.47L12 2.75Z" fill="#087E62" />
      <path d="m8.5 12.2 2.1 2.1 4.9-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function StatBlock({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="text-[26px] font-semibold text-[#171E2D]">{value}</p>
      <p className="mt-1 text-[12px] text-[#59657A]">{label}</p>
    </div>
  );
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-md border border-[#E4E8EF] bg-[#F7F8FB] p-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8A93A5]">{label}</p>
      <div className="mt-1.5 text-[15px] font-semibold text-[#1B2233]">{children}</div>
    </div>
  );
}

function FeaturedCandidatePanel({ talent }: { talent: ShowcaseTalent }) {
  return (
    <div className="z-10 flex flex-col overflow-hidden bg-white shadow-[0_24px_70px_-38px_rgba(10,18,32,0.5)] sm:flex-row">
      <div className="relative h-[300px] w-full sm:h-auto sm:w-[42%]">
        <TalentPhoto talent={talent} large />
        <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-[#087E62]">
          <VerifiedIcon />
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
      <div className="flex-1 p-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#124FE3]">이달의 검증 인재</p>
        <p className="mt-2 text-[19px] font-semibold text-[#171E2D]">{talent.headline || `검증된 ${talent.role || "테크"} 전문가`}</p>
        <p className="mt-1 text-[13px] text-[#59657A]">경력과 실무 역량을 먼저 확인합니다.</p>
        <div className="mt-5 flex flex-col gap-3">
          <InfoRow label="경력">
            {talent.yoeYears ? `${talent.yoeYears}년차` : "신입"}
            {talent.company ? ` · ${talent.company}` : ""}
          </InfoRow>
          {talent.skills?.length > 0 && (
            <InfoRow label="기술">
              <div className="flex flex-wrap gap-1.5">
                {talent.skills.slice(0, 4).map((skill) => (
                  <span key={skill} className="rounded-full bg-[#EEF1F6] px-2.5 py-1 text-[12px] font-medium text-[#3A4356]">
                    {skill}
                  </span>
                ))}
              </div>
            </InfoRow>
          )}
          <InfoRow label="학력">{talent.school || "확인 중"}</InfoRow>
        </div>
      </div>
    </div>
  );
}

const CAMPUS_PROOF = [
  {
    tag: "VKU campus",
    location: "Da Nang",
    short: "VKU",
    full: "Vietnam-Korea University of ICT",
    pool: "한국-베트남 ICT 협력 기반의 대학 풀",
    desc: "협력 네트워크를 통해 IT 전공자와 프로젝트 경험자를 먼저 검토합니다.",
  },
  {
    tag: "HUTECH campus",
    location: "Ho Chi Minh City",
    short: "HUTECH",
    full: "Ho Chi Minh City University of Technology",
    pool: "실무형 공학/IT 전공자 풀",
    desc: "현지 산학형 교육 기반으로 주니어부터 미들급 개발자 후보를 확보합니다.",
  },
  {
    tag: "UEH campus",
    location: "Ho Chi Minh City",
    short: "UEH",
    full: "University of Economics Ho Chi Minh City",
    pool: "데이터/비즈니스 이해도가 있는 후보군",
    desc: "경제대 출신 후보는 운영, 데이터, PM 성향의 역할까지 함께 검토하기 좋습니다.",
  },
  {
    tag: "FPT University campus",
    location: "Hanoi / HCMC / Da Nang",
    short: "FPT University",
    full: "Software-focused talent pipeline",
    pool: "소프트웨어 교육 기반 후보군",
    desc: "FPT Software 생태계와 연결되는 개발자 후보를 선별해 비교합니다.",
  },
];

function VerificationProofBanner({ eliteSchoolShare }: { eliteSchoolShare: number | null }) {
  return (
    <div className="bg-[#171E2D] px-5 py-10">
      <div className="mx-auto flex max-w-[1360px] flex-col gap-6">
        <div>
          <p className="text-[22px] font-semibold text-white">상위 대학 출신을 먼저 봅니다.</p>
          {eliteSchoolShare !== null && (
            <p className="mt-1 text-[13px] text-white/60">
              현재 노출 중인 인재 풀의 <span className="font-semibold text-white">{eliteSchoolShare}%</span>가 상위권 대학 출신입니다.
            </p>
          )}
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {CAMPUS_PROOF.map((campus) => (
            <div key={campus.short} className="rounded-md border border-white/10 bg-white/5 p-4">
              <p className="text-[11px] text-white/45">
                {campus.tag} · {campus.location}
              </p>
              <p className="mt-2 text-[19px] font-bold text-white">{campus.short}</p>
              <p className="mt-0.5 text-[12px] text-white/70">{campus.full}</p>
              <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#8FE3C4]">{campus.pool}</p>
              <p className="mt-1 text-[12.5px] leading-[1.55] text-white/70">{campus.desc}</p>
              <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/35">Campus proof</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TalentStripCard({ talent, selected, onSelect }: { talent: ShowcaseTalent; selected: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`grid min-w-[300px] grid-cols-[112px_1fr] overflow-hidden border bg-white p-0 text-left transition hover:border-[#124FE3] hover:shadow-[0_16px_45px_-30px_rgba(18,79,227,0.9)] ${
        selected ? "border-[#124FE3] shadow-[0_16px_45px_-30px_rgba(18,79,227,0.9)]" : "border-[#D8DEE8]"
      }`}
    >
      <div className="min-h-[132px] bg-[#D8DEE8]">
        <TalentPhoto talent={talent} />
      </div>
      <div className="min-w-0 p-4">
        <p className="truncate text-[16px] font-semibold text-[#30394C]">{talent.name}</p>
        <p className="mt-1 flex items-center gap-1 text-[13px] text-[#59657A]">
          <VerifiedIcon />
          <span className="min-w-0 truncate">{talent.role}</span>
        </p>
        <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#778195]">경력</p>
        <p className="mt-1 truncate text-[14px] font-semibold text-[#1B2233]">
          {talent.yoeYears ? `${talent.yoeYears}년차` : "신입"}
          {talent.company ? ` · ${talent.company}` : ""}
          {talent.school ? ` · ${talent.school}` : ""}
        </p>
      </div>
    </button>
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
  onSelect,
}: {
  talents: ShowcaseTalent[];
  selectedId: string | null;
  onSelect: (id: string) => void;
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
        className="absolute left-0 top-1/2 z-30 hidden -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 p-2 text-[#8A93A5] opacity-0 shadow-[0_6px_16px_-8px_rgba(10,18,32,0.35)] transition duration-200 hover:bg-white hover:text-[#124FE3] group-hover:opacity-100 md:flex"
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
                onSelect={() => onSelect(talent.id)}
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
        className="absolute right-0 top-1/2 z-30 hidden -translate-y-1/2 translate-x-1/2 items-center justify-center rounded-full bg-white/80 p-2 text-[#8A93A5] opacity-0 shadow-[0_6px_16px_-8px_rgba(10,18,32,0.35)] transition duration-200 hover:bg-white hover:text-[#124FE3] group-hover:opacity-100 md:flex"
      >
        <ChevronIcon direction="right" />
      </button>
    </div>
  );
}

function Hero({
  talents,
  total,
  eliteSchoolShare,
}: {
  talents: ShowcaseTalent[];
  total: number;
  eliteSchoolShare: number | null;
}) {
  const heroTalents = talents.slice(0, 10);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const featured = heroTalents.find((t) => t.id === selectedId) || heroTalents[0] || null;

  return (
    <section className="relative isolate overflow-hidden bg-[#D9DEE8] text-[#192133]">
      <div className="mx-auto flex h-[64px] max-w-[1360px] items-center justify-between px-5">
        <Link href="/" className="flex items-center gap-2 text-[18px] font-semibold tracking-tight">
          <img src="/logo.png" alt="KTC Support" className="h-7 w-7 rounded" />
          KTC Talent
        </Link>
        <nav className="hidden items-center gap-7 text-[14px] font-medium text-[#3E485B]">
          <Link href="/talents">Talent</Link>
          <a href="#trust">Trust</a>
          <a href="#talent-preview">Showcase</a>
        </nav>
        <Link href="/login" className="rounded-sm bg-[#124FE3] px-5 py-2.5 text-[14px] font-semibold text-white transition hover:bg-[#0F3FBB]">
          Start hiring
        </Link>
      </div>

      <div className="absolute left-1/2 top-0 z-10 hidden -translate-x-1/2 rounded-b-[34px] border border-[#AEB8CA] bg-[#D2D8E4]/80 px-2 py-1 shadow-[0_20px_45px_-25px_rgba(25,33,51,0.45)] md:flex">
        <span className="px-5 py-3 text-[14px] font-semibold text-[#687287]">I&apos;m looking for</span>
        <span className="rounded-[28px] border-2 border-[#124FE3] bg-white px-6 py-3 text-[14px] font-semibold text-[#124FE3] shadow-[0_12px_30px_-20px_rgba(18,79,227,0.75)]">Talent</span>
        <span className="px-6 py-3 text-[14px] font-semibold text-[#293244]">Consulting & Services</span>
      </div>

      <div className="relative mx-auto grid max-w-[1360px] grid-cols-1 gap-10 px-5 pb-16 pt-20 md:grid-cols-[1fr_1.15fr] md:items-center md:gap-8 md:pb-20 md:pt-24">
        <div className="z-10 max-w-[640px]">
          <div className="mb-5 inline-flex items-center gap-1.5 rounded-full bg-white/70 px-3 py-1.5 text-[13px] font-semibold text-[#087E62]">
            <VerifiedIcon />
            검증된 베트남 개발자
          </div>
          <h1 className="text-[40px] font-semibold leading-[1.15] tracking-normal text-[#171E2D] md:text-[52px]">
            실력을 검증한<br />베트남 개발자,<br />합리적으로 지금 채용하세요
          </h1>
          <p className="mt-6 max-w-[640px] text-[18px] leading-[1.65] text-[#30394C]">
            학력이나 회사 이름이 아니라 경력, 실무 프로젝트, 보유 기술까지 KTC가 직접 검증한 프로필만 보여드립니다. 몇 초 만에 후보자의 실력을 확인하세요.
          </p>
          <div className="mt-8 grid grid-cols-3 gap-5 border-t border-[#BCC5D4] pt-6">
            <StatBlock value={total > 0 ? `${total}명+` : "다수"} label="검증 완료된 인재 풀" />
            <StatBlock value="2주" label="후보 전달까지 소요 기간" />
            <StatBlock value="6단계" label="이력·경력·기술 검증 절차" />
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a href="#talent-preview" className="inline-flex h-14 items-center justify-center rounded-sm bg-[#124FE3] px-9 text-[17px] font-semibold text-white transition hover:bg-[#0F3FBB]">
              후보 보기
            </a>
            <Link href="/login" className="inline-flex h-14 items-center justify-center rounded-sm border border-[#AEB8CA] bg-white/30 px-8 text-[16px] font-semibold text-[#1D2638] transition hover:bg-white/60">
              상담 요청
            </Link>
          </div>
        </div>

        {featured ? <FeaturedCandidatePanel talent={featured} /> : <div className="hidden md:block" />}

        <div className="z-20 md:col-span-2">
          <TalentStrip talents={heroTalents} selectedId={featured?.id ?? null} onSelect={setSelectedId} />
        </div>
      </div>

      <VerificationProofBanner eliteSchoolShare={eliteSchoolShare} />
    </section>
  );
}

function CandidateStory({ talent }: { talent: ShowcaseTalent }) {
  const journey = [
    talent.school ? { label: "학력", value: talent.school } : null,
    talent.company ? { label: "경력", value: `${talent.company}${talent.yoeYears ? ` · ${talent.yoeYears}년차` : ""}` } : null,
    talent.skills?.length ? { label: "기술", value: talent.skills.slice(0, 5).join(", ") } : null,
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <section className="bg-white">
      <div className="mx-auto grid max-w-[1360px] grid-cols-1 gap-10 px-5 py-24 md:grid-cols-[0.85fr_1fr] md:items-center">
        <div className="relative h-[420px] w-full overflow-hidden bg-[#D8DEE8]">
          <TalentPhoto talent={talent} large />
        </div>
        <div>
          <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-[#124FE3]">Why hire {talent.name}</p>
          <h2 className="mt-3 text-[30px] font-semibold leading-[1.25] tracking-normal text-[#171E2D] md:text-[38px]">
            {talent.headline || `${talent.yoeYears ? `${talent.yoeYears}년차 ` : ""}${talent.role} 전문가`}
          </h2>
          <p className="mt-4 text-[16px] leading-[1.75] text-[#5B667A]">
            {talent.company ? `${talent.company}에서의 실무 경험과 ` : ""}검증된 기술 스택을 바탕으로, 합류 즉시 기여할 수 있는 후보입니다. 이력서 한 장이 아니라 커리어 여정 전체를 확인하세요.
          </p>
          <div className="mt-8 flex flex-col gap-4 border-t border-[#E6E9EF] pt-6">
            {journey.map((step) => (
              <div key={step.label} className="flex gap-4">
                <span className="w-16 flex-shrink-0 text-[12px] font-semibold uppercase tracking-[0.1em] text-[#8A93A5]">{step.label}</span>
                <span className="text-[15px] font-medium text-[#1B2233]">{step.value}</span>
              </div>
            ))}
          </div>
          <a href="#talent-preview" className="mt-8 inline-flex h-12 items-center justify-center rounded-sm bg-[#124FE3] px-7 text-[15px] font-semibold text-white transition hover:bg-[#0F3FBB]">
            {talent.name} 프로필 자세히 보기
          </a>
        </div>
      </div>
    </section>
  );
}

function ContactCTA() {
  return (
    <section className="bg-[#124FE3]">
      <div className="mx-auto flex max-w-[1360px] flex-col items-start gap-6 px-5 py-20 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-[28px] font-semibold leading-[1.3] text-white md:text-[36px]">
            마음에 드는 인재를 찾으셨나요?<br />지금 상담을 요청하세요.
          </h2>
          <p className="mt-3 max-w-[520px] text-[16px] leading-[1.6] text-white/80">
            검증된 후보 프로필을 확인하고, 2주 안에 실제 후보자를 제안받아 보세요.
          </p>
        </div>
        <Link href="/login" className="inline-flex h-14 flex-shrink-0 items-center justify-center rounded-sm bg-white px-9 text-[16px] font-semibold text-[#124FE3] transition hover:bg-white/90">
          상담 요청하기
        </Link>
      </div>
    </section>
  );
}

function TrustLogos() {
  const logos = ["Samsung", "FPT Software", "Grab", "VNG", "KPMG", "Vietnam National University"];
  return (
    <section className="border-b border-[#E6E9EF] bg-white">
      <div className="mx-auto max-w-[1360px] px-5 py-12">
        <p className="text-center text-[12px] font-semibold uppercase tracking-[0.18em] text-[#8A93A5]">Signals that hiring teams can trust</p>
        <div className="mt-7 grid grid-cols-2 gap-3 md:grid-cols-6">
          {logos.map((logo) => (
            <div key={logo} className="flex h-16 items-center justify-center border border-[#E8EBF1] bg-[#FAFBFC] px-3 text-center text-[14px] font-semibold text-[#3A4356]">
              {logo}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TalentPreview({ talents }: { talents: ShowcaseTalent[] }) {
  return (
    <section id="talent-preview" className="bg-[#F7F8FA] scroll-mt-[64px]">
      <div className="mx-auto max-w-[1360px] px-5 py-24">
        <div className="max-w-[680px]">
          <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-[#124FE3]">Curated talent showcase</p>
          <h2 className="mt-3 text-[34px] font-semibold tracking-normal text-[#171E2D] md:text-[44px]">출신과 검증 정보가 먼저 보이는 인재 카드</h2>
          <p className="mt-4 text-[17px] leading-[1.7] text-[#5B667A]">대학교, 이전 회사, 공개 동의, 사진 품질을 기준으로 신뢰할 수 있는 프로필을 우선 노출합니다.</p>
        </div>
        {talents.length > 0 ? (
          <div className="mt-12 grid grid-cols-1 gap-5 lg:grid-cols-2">
            {talents.slice(0, 6).map((talent) => (
              <ProfileCard key={talent.id} t={talent} />
            ))}
          </div>
        ) : (
          <p className="mt-12 text-[15px] text-[#697386]">검증된 인재 데이터를 불러오는 중입니다.</p>
        )}
      </div>
    </section>
  );
}
export default function LandingPage() {
  const [talents, setTalents] = useState<ShowcaseTalent[]>([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetch("/api/showcase")
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data.talents) && data.talents.length > 0) {
          setTalents(data.talents);
          setTotal(typeof data.total === "number" ? data.total : data.talents.length);
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

  const eliteSchoolShare = useMemo(() => {
    if (talents.length === 0) return null;
    return Math.round((talents.filter((t) => t.schoolElite).length / talents.length) * 100);
  }, [talents]);

  const featured = premiumTalents[0] || null;

  return (
    <main className="min-h-screen bg-white">
      <Hero talents={premiumTalents} total={total} eliteSchoolShare={eliteSchoolShare} />
      <TrustLogos />
      {featured && <CandidateStory talent={featured} />}
      <TalentPreview talents={premiumTalents} />
      <ContactCTA />
    </main>
  );
}




