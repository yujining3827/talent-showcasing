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
  // 어학/소통 능력 (예: "영어 업무 가능 · 한국어 초급", "TOEIC 850"). 데이터 없으면 "조사 중" 노출
  language?: string | null;
};

const HERO_TALENTS: ShowcaseTalent[] = [
  {
    id: "hero-1",
    name: "Trần Minh Hưng",
    role: "QA Engineer",
    headline: "삼성 출신 시니어 QA 엔지니어",
    photo_url: "/HERO%20PROFILE.png",
    school: "Ho Chi Minh University of Technology",
    schoolElite: true,
    schoolTier: "top",
    company: "Samsung",
    companyElite: true,
    companyDomain: "samsung.com",
    yoeYears: 5,
    location: "Ho Chi Minh City",
    skills: ["Manual Testing", "API Testing", "Test Case Design", "Agile/Scrum"],
  },
  {
    id: "hero-2",
    name: "Vo Huynh Yen Nhi",
    role: "Embedded Software Developer",
    headline: "FPT Software 출신 임베디드 개발자",
    photo_url: null,
    school: "Ho Chi Minh City University of Technology and Education",
    schoolElite: false,
    schoolTier: null,
    company: "FPT Software",
    companyElite: true,
    companyDomain: "fpt-software.com",
    yoeYears: 5,
    location: "Nha Trang",
    skills: ["C++", "C#", "Swift", "Arduino"],
  },
  {
    id: "hero-3",
    name: "Cao Thanh Hung",
    role: "UX/UI Designer",
    headline: "VNG 출신 시니어 UX/UI 디자이너",
    photo_url: null,
    school: "Can Tho University",
    schoolElite: false,
    schoolTier: null,
    company: "VNG",
    companyElite: true,
    companyDomain: "vng.com.vn",
    yoeYears: 8,
    location: "Ho Chi Minh City",
    skills: ["User Research", "Design Systems", "Team Leadership"],
  },
  {
    id: "hero-4",
    name: "Phạm Gia Tuấn Khải",
    role: "AI/ML Engineer",
    headline: "컴퓨터 비전·NLP 전문 AI 엔지니어",
    photo_url: null,
    school: "University of Science, VNU-HCM",
    schoolElite: true,
    schoolTier: "top",
    company: "Aniday",
    companyElite: false,
    companyDomain: null,
    yoeYears: 1,
    location: "Ho Chi Minh City",
    skills: ["Computer Vision", "NLP", "RAG", "Gemini API", "Elasticsearch"],
  },
  {
    id: "hero-5",
    name: "Tong Tat Thanh",
    role: "Full-stack Developer",
    headline: "헬스케어·핀테크 백엔드 엔지니어",
    photo_url: null,
    school: "University of Science, VNU-HCM",
    schoolElite: true,
    schoolTier: "top",
    company: "Fullerton Health Vietnam",
    companyElite: false,
    companyDomain: null,
    yoeYears: 4,
    location: "Ho Chi Minh City",
    skills: ["Node.js", "NestJS", "MySQL", "Redis", "Microservices"],
  },
  {
    id: "hero-6",
    name: "Võ Minh Toàn",
    role: "Front End Developer",
    headline: "React·Vue 프론트엔드 엔지니어",
    photo_url: null,
    school: "Ho Chi Minh University of Technology",
    schoolElite: true,
    schoolTier: "top",
    company: "Moatable Inc.",
    companyElite: false,
    companyDomain: null,
    yoeYears: 3,
    location: "Ho Chi Minh City",
    skills: ["React", "Vue", "Remix", "Pinia/Jotai"],
  },
  {
    id: "hero-7",
    name: "Victor Hoang",
    role: "Full-Stack Engineer",
    headline: "한국 기업 프로젝트 경험 보유 풀스택 엔지니어",
    photo_url: null,
    school: "University of Engineering and Technology (VNU), Hanoi",
    schoolElite: true,
    schoolTier: "top",
    company: "SotaTek",
    companyElite: true,
    companyDomain: null,
    yoeYears: 3,
    location: "Hanoi",
    skills: ["Next.js", "TypeScript", "PostgreSQL", "Prisma"],
  },
];

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
          <InfoRow label="어학 · 소통">
            {talent.language ? (
              talent.language
            ) : (
              <span className="font-medium italic text-[#9AA3B2]">조사 중</span>
            )}
          </InfoRow>
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
            세상에 없던 안심매칭
          </div>
          <h1 className="text-[40px] font-bold leading-[1.15] tracking-normal text-[#171E2D] md:text-[52px]">
            채용비는 반값,<br />검증 기준은 그대로. <br />안심하고 채용하세요.
          </h1>
          <p className="mt-6 max-w-[640px] text-[24px] leading-[1.65] text-[#30394C]">
            국내 최다 보유 베트남 인재 반값 안심 매칭 
          </p>
          <div className="mt-4 flex flex-wrap gap-x-3 gap-y-1.5 text-[16px] font-medium text-[#124FE3]">
            <span>#반값채용</span>
            <span>#국내최다보유</span>
            <span>#검증완료</span>
          </div>
          <div className="mt-8 grid grid-cols-3 gap-5 border-t border-[#BCC5D4] pt-6">
            <StatBlock value={total > 0 ? `${total}명+` : "다수"} label="검증 완료된 인재 풀" />
            <StatBlock value="2주" label="후보 전달까지 소요 기간" />
            <StatBlock value="6단계" label="이력·경력·기술 검증 절차" />
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a href="#talent-preview" className="inline-flex h-14 items-center justify-center rounded-sm bg-[#124FE3] px-9 text-[17px] font-semibold text-white transition hover:bg-[#0F3FBB]">
              가격 알아보기
            </a>
            <Link href="/login" className="inline-flex h-14 items-center justify-center rounded-sm border border-[#AEB8CA] bg-white/30 px-8 text-[16px] font-semibold text-[#1D2638] transition hover:bg-white/60">
              포트폴리오 미리보기
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
// ============================================================================
//  직무별 포트폴리오 예시 섹션
//  ⚠️ 내일 실제 소스 채울 곳 — 아래 items 배열만 교체하면 됨.
//   - thumbnail: 이미지 URL (없으면 자동으로 플레이스홀더 표시)
//   - link: 포트폴리오 원본 URL (behance/github/canva/notion 등)
//   - 실데이터 후보: user_profiles.portfolio_url(34명), projects(186명)
// ============================================================================
type PortfolioItem = {
  name: string; // 인재 이름 (또는 "익명 디자이너" 등)
  title: string; // 대표 작업/프로젝트 제목
  summary: string; // 한 줄 설명
  tags: string[]; // 사용 툴/스택
  thumbnail?: string | null; // 미리보기 이미지 URL
  link?: string | null; // 포트폴리오 링크
};

type PortfolioSection = {
  key: string;
  label: string; // 한글 직무명
  eyebrow: string; // 영문 라벨
  desc: string; // 섹션 설명
  accent: string; // 강조 색 (hex)
  tint: string; // 썸네일 배경 틴트 (hex)
  items: PortfolioItem[];
};

const PORTFOLIO_SECTIONS: PortfolioSection[] = [
  {
    key: "design",
    label: "디자인",
    eyebrow: "Design",
    desc: "UI/UX, 브랜딩, 그래픽 등 실제 작업물을 통해 감도와 완성도를 바로 확인하세요.",
    accent: "#D6336C",
    tint: "#FCE7F0",
    items: [
      { name: "예시 준비 중", title: "포트폴리오 예시 준비 중", summary: "내일 실제 디자인 포트폴리오가 들어갈 자리입니다.", tags: ["Figma", "Behance"], thumbnail: null, link: null },
      { name: "예시 준비 중", title: "포트폴리오 예시 준비 중", summary: "UI/UX · 브랜딩 작업물 예시", tags: ["UI/UX", "Branding"], thumbnail: null, link: null },
      { name: "예시 준비 중", title: "포트폴리오 예시 준비 중", summary: "그래픽 · 비주얼 디자인 예시", tags: ["Graphic"], thumbnail: null, link: null },
    ],
  },
  {
    key: "marketing",
    label: "마케팅",
    eyebrow: "Marketing",
    desc: "퍼포먼스·콘텐츠·그로스 등 실제 캠페인 성과와 산출물을 가볍게 살펴보세요.",
    accent: "#E8590C",
    tint: "#FFE8D9",
    items: [
      { name: "예시 준비 중", title: "포트폴리오 예시 준비 중", summary: "내일 실제 마케팅 포트폴리오가 들어갈 자리입니다.", tags: ["Performance", "Growth"], thumbnail: null, link: null },
      { name: "예시 준비 중", title: "포트폴리오 예시 준비 중", summary: "콘텐츠 · SNS 운영 성과 예시", tags: ["Content", "SNS"], thumbnail: null, link: null },
      { name: "예시 준비 중", title: "포트폴리오 예시 준비 중", summary: "캠페인 기획 · 데이터 분석 예시", tags: ["Campaign"], thumbnail: null, link: null },
    ],
  },
  {
    key: "developer",
    label: "개발자",
    eyebrow: "Developer",
    desc: "프론트·백엔드·AI 등 실제 프로젝트와 코드베이스로 구현 역량을 확인하세요.",
    accent: "#1971C2",
    tint: "#DDEBFB",
    items: [
      { name: "예시 준비 중", title: "포트폴리오 예시 준비 중", summary: "내일 실제 개발 포트폴리오가 들어갈 자리입니다.", tags: ["React", "GitHub"], thumbnail: null, link: null },
      { name: "예시 준비 중", title: "포트폴리오 예시 준비 중", summary: "백엔드 · API 프로젝트 예시", tags: ["Node.js", "API"], thumbnail: null, link: null },
      { name: "예시 준비 중", title: "포트폴리오 예시 준비 중", summary: "AI/데이터 프로젝트 예시", tags: ["AI", "Data"], thumbnail: null, link: null },
    ],
  },
  {
    key: "pm",
    label: "PM",
    eyebrow: "Product Manager",
    desc: "제품 기획·전략·실행까지, 실제 프로덕트를 어떻게 이끌었는지 확인하세요.",
    accent: "#0CA678",
    tint: "#D6F5EA",
    items: [
      { name: "예시 준비 중", title: "포트폴리오 예시 준비 중", summary: "내일 실제 PM 포트폴리오가 들어갈 자리입니다.", tags: ["Product", "Strategy"], thumbnail: null, link: null },
      { name: "예시 준비 중", title: "포트폴리오 예시 준비 중", summary: "제품 기획 · 로드맵 예시", tags: ["Roadmap"], thumbnail: null, link: null },
      { name: "예시 준비 중", title: "포트폴리오 예시 준비 중", summary: "그로스 · 지표 개선 사례 예시", tags: ["Growth", "Metrics"], thumbnail: null, link: null },
    ],
  },
];

function PortfolioThumb({ item, section }: { item: PortfolioItem; section: PortfolioSection }) {
  const [failed, setFailed] = useState(false);
  if (item.thumbnail && !failed) {
    return (
      <img
        src={item.thumbnail}
        alt={item.title}
        onError={() => setFailed(true)}
        className="h-full w-full object-cover"
      />
    );
  }
  // 이미지 없을 때: 직무 틴트 배경 + "예시 준비 중" 라벨
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2" style={{ backgroundColor: section.tint }}>
      <span className="text-[13px] font-semibold uppercase tracking-[0.14em]" style={{ color: section.accent }}>
        {section.eyebrow}
      </span>
      <span className="text-[12px] font-medium text-[#8A93A5]">예시 준비 중</span>
    </div>
  );
}

function PortfolioCard({ item, section }: { item: PortfolioItem; section: PortfolioSection }) {
  const CardInner = (
    <>
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#F1F3F7]">
        <PortfolioThumb item={item} section={section} />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-2">
          <span className="inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold" style={{ backgroundColor: section.tint, color: section.accent }}>
            {section.label}
          </span>
          <span className="text-[12px] font-medium text-[#8A93A5]">{item.name}</span>
        </div>
        <p className="mt-2.5 text-[16px] font-semibold text-[#171E2D]">{item.title}</p>
        <p className="mt-1 text-[13px] leading-[1.6] text-[#5B667A]">{item.summary}</p>
        {item.tags?.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {item.tags.slice(0, 4).map((tag) => (
              <span key={tag} className="rounded-md bg-[#EEF1F6] px-2 py-0.5 text-[11px] font-medium text-[#3A4356]">
                {tag}
              </span>
            ))}
          </div>
        )}
        {item.link && (
          <span className="mt-4 inline-flex items-center gap-1 text-[13px] font-semibold" style={{ color: section.accent }}>
            포트폴리오 보기
            <span aria-hidden>→</span>
          </span>
        )}
      </div>
    </>
  );

  const cardClass =
    "group flex flex-col overflow-hidden rounded-xl border border-[#E4E8EF] bg-white transition-shadow hover:shadow-[0_20px_50px_-30px_rgba(10,18,32,0.45)]";

  if (item.link) {
    return (
      <a href={item.link} target="_blank" rel="noopener noreferrer" className={cardClass}>
        {CardInner}
      </a>
    );
  }
  return <div className={cardClass}>{CardInner}</div>;
}

function PortfolioShowcase() {
  const [activeKey, setActiveKey] = useState(PORTFOLIO_SECTIONS[0].key);
  const active = PORTFOLIO_SECTIONS.find((s) => s.key === activeKey) || PORTFOLIO_SECTIONS[0];

  return (
    <section id="portfolio" className="bg-white scroll-mt-[64px]">
      <div className="mx-auto max-w-[1360px] px-5 py-24">
        <div className="max-w-[680px]">
          <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-[#124FE3]">Portfolio by role</p>
          <h2 className="mt-3 text-[34px] font-semibold tracking-normal text-[#171E2D] md:text-[44px]">직무별 실제 포트폴리오 예시</h2>
          <p className="mt-4 text-[17px] leading-[1.7] text-[#5B667A]">
            디자인 · 마케팅 · 개발 · PM, 원하는 직무를 선택해 실제 작업물을 가볍게 확인하세요.
          </p>
        </div>

        {/* 직무 칩 (탭) */}
        <div className="mt-10 flex flex-wrap gap-2.5">
          {PORTFOLIO_SECTIONS.map((section) => {
            const on = section.key === activeKey;
            return (
              <button
                key={section.key}
                type="button"
                onClick={() => setActiveKey(section.key)}
                aria-pressed={on}
                className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[14px] font-semibold transition-colors"
                style={
                  on
                    ? { backgroundColor: section.accent, borderColor: section.accent, color: "#fff" }
                    : { backgroundColor: "#fff", borderColor: "#E0E4EC", color: "#3A4356" }
                }
              >
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: on ? "#fff" : section.accent }} aria-hidden />
                {section.label}
              </button>
            );
          })}
        </div>

        {/* 선택된 직무 */}
        <div className="mt-10">
          <div className="flex items-baseline gap-3 border-b border-[#E6E9EF] pb-3">
            <h3 className="text-[22px] font-semibold text-[#171E2D]">{active.label}</h3>
            <span className="text-[13px] font-medium uppercase tracking-[0.12em] text-[#8A93A5]">{active.eyebrow}</span>
          </div>
          <p className="mt-3 max-w-[720px] text-[14px] leading-[1.6] text-[#5B667A]">{active.desc}</p>
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {active.items.map((item, i) => (
              <PortfolioCard key={`${active.key}-${i}`} item={item} section={active} />
            ))}
          </div>
        </div>
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

  const heroTalents = useMemo(() => {
    return [...HERO_TALENTS].sort((a, b) => {
      const aScore = Number(a.schoolElite) * 3 + Number(a.companyElite) * 3 + (a.yoeYears || 0) / 10;
      const bScore = Number(b.schoolElite) * 3 + Number(b.companyElite) * 3 + (b.yoeYears || 0) / 10;
      return bScore - aScore;
    });
  }, []);

  const eliteSchoolShare = useMemo(() => {
    if (talents.length === 0) return null;
    return Math.round((talents.filter((t) => t.schoolElite).length / talents.length) * 100);
  }, [talents]);

  const featured = premiumTalents[0] || null;

  return (
    <main className="min-h-screen bg-white">
      <Hero talents={heroTalents} total={total} eliteSchoolShare={eliteSchoolShare} />
      <TrustLogos />
      {featured && <CandidateStory talent={featured} />}
      <PortfolioShowcase />
      <TalentPreview talents={premiumTalents} />
      <ContactCTA />
    </main>
  );
}




