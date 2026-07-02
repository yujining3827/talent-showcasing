"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
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

function TalentPhotoPlaceholder({ large = false }: { large?: boolean }) {
  return (
    <div className="flex h-full w-full items-center justify-center bg-[#C9D1DE]">
      <div className={`${large ? "h-56 w-56" : "h-16 w-16"} rounded-full border border-white/50 bg-white/35`} />
    </div>
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

function MiniMap() {
  const dots = Array.from({ length: 120 }, (_, i) => {
    const x = (i % 20) * 10 + 8;
    const y = Math.floor(i / 20) * 10 + 8;
    const visible = (i * 7) % 11 !== 0 && (x < 70 || x > 105 || y < 46) && !(x > 150 && y > 38);
    return visible ? <circle key={i} cx={x} cy={y} r="1.8" fill="#CBD2DD" /> : null;
  });

  return (
    <svg viewBox="0 0 210 72" className="h-[78px] w-full" aria-hidden="true">
      {dots}
      <circle cx="77" cy="34" r="6" fill="#124FE3" opacity="0.14" />
      <circle cx="77" cy="34" r="3" fill="#124FE3" />
    </svg>
  );
}

function CredentialCard({ talent }: { talent: ShowcaseTalent }) {
  return (
    <div className="relative w-full max-w-[330px] bg-white p-7 shadow-[0_24px_70px_-38px_rgba(10,18,32,0.5)]">
      <MiniMap />
      <div className="mt-4">
        <p className="text-[18px] font-semibold text-[#1147D9]">{talent.name}</p>
        <div className="mt-2 flex items-center gap-1.5 text-[13px] font-semibold text-[#087E62]">
          <VerifiedIcon />
          Verified expert in {talent.role || "Technology"}
        </div>
        <p className="mt-2 text-[13px] text-[#566174]">{talent.headline || talent.role}</p>
      </div>
      <div className="mt-7">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#677084]">Previously at</p>
        <p className="mt-1 truncate text-[31px] font-semibold tracking-tight text-[#1B2233]">{talent.company || "Global Tech"}</p>
      </div>
      <div className="absolute -bottom-7 left-0 h-7 w-7 bg-white [clip-path:polygon(0_0,100%_0,100%_100%)]" />
    </div>
  );
}

function TalentStripCard({ talent, active }: { talent: ShowcaseTalent; active: boolean }) {
  return (
    <div className={`grid min-w-[300px] grid-cols-[112px_1fr] overflow-hidden border bg-white transition ${active ? "border-[#124FE3] shadow-[0_16px_45px_-30px_rgba(18,79,227,0.9)]" : "border-[#D8DEE8]"}`}>
      <div className="h-[132px] bg-[#D8DEE8]">
        <TalentPhoto talent={talent} />
      </div>
      <div className="min-w-0 p-4">
        <p className="truncate text-[16px] font-semibold text-[#30394C]">{talent.name}</p>
        <p className="mt-1 truncate text-[13px] text-[#59657A]">{talent.role}</p>
        <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#778195]">Education</p>
        <p className="mt-1 truncate text-[14px] font-semibold text-[#1B2233]">{talent.school || "Top university"}</p>
      </div>
    </div>
  );
}

function Hero({ talents }: { talents: ShowcaseTalent[] }) {
  const heroTalents = talents.slice(0, 4);
  const featured = heroTalents[0] || null;

  return (
    <section className="relative isolate overflow-hidden bg-[#D9DEE8] text-[#192133]">
      <div className="mx-auto flex h-[64px] max-w-[1180px] items-center justify-between px-5">
        <Link href="/" className="flex items-center gap-2 text-[18px] font-semibold tracking-tight">
          <img src="/logo.png" alt="KTC Support" className="h-7 w-7 rounded" />
          KTC Talent
        </Link>
        <nav className="hidden items-center gap-7 text-[14px] font-medium text-[#3E485B]">
          <Link href="/talents">Talent</Link>
          <a href="#trust">Trust</a>
          <a href="#talent-preview">Showcase</a>
        </nav>
        <Link href="/login" className="rounded-sm bg-[#0ACB87] px-5 py-2.5 text-[14px] font-semibold text-white transition hover:bg-[#08B979]">
          Start hiring
        </Link>
      </div>

      <div className="absolute left-1/2 top-0 z-10 hidden -translate-x-1/2 rounded-b-[34px] border border-[#AEB8CA] bg-[#D2D8E4]/80 px-2 py-1 shadow-[0_20px_45px_-25px_rgba(25,33,51,0.45)] md:flex">
        <span className="px-5 py-3 text-[14px] font-semibold text-[#687287]">I&apos;m looking for</span>
        <span className="rounded-[28px] border-2 border-[#124FE3] bg-white px-6 py-3 text-[14px] font-semibold text-[#124FE3] shadow-[0_12px_30px_-20px_rgba(18,79,227,0.75)]">Talent</span>
        <span className="px-6 py-3 text-[14px] font-semibold text-[#293244]">Consulting & Services</span>
      </div>

      <div className="relative mx-auto grid min-h-[690px] max-w-[1180px] grid-cols-1 px-5 pb-0 pt-14 md:grid-cols-[0.95fr_0.75fr_0.58fr] md:items-center md:gap-7 md:pt-8">
        <div className="z-10 max-w-[530px] pb-10 md:pb-24">
          <p className="mb-5 text-[12px] font-semibold uppercase tracking-[0.18em] text-[#5B667A]">Vetted global talent network</p>
          <h1 className="text-[44px] font-semibold leading-[1.08] tracking-normal text-[#171E2D] md:text-[58px]">
            Hire top talent with verified credentials
          </h1>
          <p className="mt-6 max-w-[560px] text-[18px] leading-[1.65] text-[#30394C]">
            KTC showcases vetted Vietnamese professionals with verified university, company, interview, and portfolio signals so hiring teams can judge credibility in seconds.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <a href="#talent-preview" className="inline-flex h-14 items-center justify-center rounded-sm bg-[#0ACB87] px-9 text-[17px] font-semibold text-white transition hover:bg-[#08B979]">
              View Talent
            </a>
            <Link href="/login" className="inline-flex h-14 items-center justify-center rounded-sm border border-[#AEB8CA] bg-white/30 px-8 text-[16px] font-semibold text-[#1D2638] transition hover:bg-white/60">
              Request shortlist
            </Link>
          </div>
          <div id="trust" className="mt-10 hidden grid-cols-3 gap-5 border-t border-[#BCC5D4] pt-6 sm:grid">
            <div>
              <p className="text-[22px] font-semibold text-[#171E2D]">Top school</p>
              <p className="mt-1 text-[12px] text-[#59657A]">Verified education</p>
            </div>
            <div>
              <p className="text-[22px] font-semibold text-[#171E2D]">Ex-company</p>
              <p className="mt-1 text-[12px] text-[#59657A]">Career provenance</p>
            </div>
            <div>
              <p className="text-[22px] font-semibold text-[#171E2D]">Interview</p>
              <p className="mt-1 text-[12px] text-[#59657A]">Reviewed profile</p>
            </div>
          </div>
        </div>

        <div className="pointer-events-none relative z-0 hidden h-full min-h-[610px] items-end justify-center md:flex">
          <div className="absolute bottom-0 h-[540px] w-[430px] overflow-hidden">
            {featured ? <TalentPhoto talent={featured} large /> : <TalentPhotoPlaceholder large />}
            <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#D9DEE8] via-[#D9DEE8]/88 to-transparent" />
          </div>
        </div>

        {featured && (
          <div className="z-10 hidden justify-self-end md:block">
            <CredentialCard talent={featured} />
          </div>
        )}

        <div className="z-20 -mx-5 mt-6 overflow-hidden border-t border-[#C5CDDA] bg-[#D9DEE8]/90 py-5 md:col-span-3 md:mt-[-112px] md:border-t-0 md:bg-transparent md:py-0">
          <div className="flex gap-4 overflow-x-auto px-5 pb-2 scrollbar-hide md:justify-center">
            {heroTalents.length > 0
              ? heroTalents.map((talent, index) => (
                  <TalentStripCard key={talent.id} talent={talent} active={index === 0} />
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
        </div>
      </div>
    </section>
  );
}

function TrustLogos() {
  const logos = ["Samsung", "FPT Software", "Grab", "VNG", "KPMG", "Vietnam National University"];
  return (
    <section className="border-b border-[#E6E9EF] bg-white">
      <div className="mx-auto max-w-[1180px] px-5 py-12">
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
      <div className="mx-auto max-w-[1180px] px-5 py-24">
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
    <main className="min-h-screen bg-white">
      <Hero talents={premiumTalents} />
      <TrustLogos />
      <TalentPreview talents={premiumTalents} />
    </main>
  );
}




