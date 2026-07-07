"use client";

import { useState } from "react";
import type { ShowcaseTalent } from "@/app/api/showcase/route";

const NAVY = "#16213E";
const INDIGO = "#2751E0";
const GREEN = "#1D9E75";
const LOGODEV = process.env.NEXT_PUBLIC_LOGODEV_TOKEN;

function initials(name: string) {
  const p = name.trim().split(/\s+/).filter(Boolean);
  return (p.length >= 2 ? p[0][0] + p[p.length - 1][0] : (name || "?").slice(0, 2)).toUpperCase();
}

function cleanCompany(name: string): string {
  let s = name.replace(/\(.*?\)/g, "").trim();
  s = s.replace(/,?\s*(JSC|Co\.,?\s?Ltd\.?|Corporation|Corp\.?|Company Limited|Company|Ltd\.?|LLC|Inc\.?)\.?$/gi, "").trim();
  s = s.replace(/^(Công ty\s+(TNHH|Cổ phần|CP|MTV)|CÔNG TY(\s+CỔ PHẦN|\s+TNHH)?)\s+/i, "").trim();
  s = s.replace(/\s+(Consultant|Developer|Engineer|Intern|Trainee|Manager|Specialist)$/i, "").trim();
  return s || name;
}

function Avatar({ src, name }: { src: string | null; name: string }) {
  const [err, setErr] = useState(false);
  const proxied = src ? `/api/img?u=${encodeURIComponent(src)}` : null;
  if (!proxied || err) {
    return (
      <div className="w-[132px] self-stretch flex items-center justify-center flex-shrink-0 text-[26px] font-semibold" style={{ background: "#EEF1FF", color: INDIGO }}>
        {initials(name)}
      </div>
    );
  }
  return <img src={proxied} alt="" onError={() => setErr(true)} className="w-[132px] self-stretch object-cover flex-shrink-0" style={{ objectPosition: "center 22%" }} />;
}

// 회사 마크: 도메인 있으면 logo.dev 로고, 실패/없으면 모노그램
function CompanyMark({ domain, name }: { domain: string | null; name: string }) {
  const [err, setErr] = useState(false);
  if (domain && LOGODEV && !err) {
    return <img src={`https://img.logo.dev/${domain}?token=${LOGODEV}&format=png&size=48`} alt="" onError={() => setErr(true)} className="h-[20px] max-w-[110px] object-contain flex-shrink-0" />;
  }
  const ch = (name.trim()[0] || "?").toUpperCase();
  return <div className="w-[20px] h-[20px] rounded flex items-center justify-center text-[11px] font-bold flex-shrink-0" style={{ background: "#EAEEFF", color: INDIGO }}>{ch}</div>;
}

function CapIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={INDIGO} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
      <path d="M22 10L12 5 2 10l10 5 10-5z" /><path d="M6 12v5c0 1 2.5 2.5 6 2.5s6-1.5 6-2.5v-5" />
    </svg>
  );
}

export function ProfileCard({ t }: { t: ShowcaseTalent }) {
  const company = t.company ? cleanCompany(t.company) : null;

  return (
    <div className="group flex bg-white rounded-2xl border border-gray-200 overflow-hidden transition-all duration-150 hover:border-gray-300 hover:shadow-[0_14px_36px_-16px_rgba(22,33,62,0.32)]">
      <Avatar src={t.photo_url} name={t.name} />

      <div className="flex-1 min-w-0 p-4 flex flex-col">
        <p className="text-[16.5px] font-semibold leading-tight truncate" style={{ color: NAVY }}>{t.name}</p>
        <p className="text-[12.5px] text-gray-500 mt-1 leading-snug line-clamp-2">
          {t.headline || t.role}{t.yoeYears ? ` · ${t.yoeYears}년차` : ""}
        </p>

        {/* 양식 통일: 이전 소속(회사 or 신입) + 학력 */}
        <div className="mt-auto pt-3">
          <p className="text-[10px] font-semibold tracking-wide text-gray-400 mb-0.5">이전 소속</p>
          {company ? (
            <div className="flex items-center gap-2">
              <CompanyMark domain={t.companyDomain} name={company} />
              <span className="text-[15px] font-bold leading-tight truncate" style={{ color: NAVY }}>{company}</span>
            </div>
          ) : (
            <span className="text-[14px] font-semibold" style={{ color: "#8B95A1" }}>신입</span>
          )}
          {t.school && (
            <div className="flex items-center gap-1.5 mt-1.5">
              <CapIcon />
              <span className="text-[12px] text-gray-500 truncate">{t.school}</span>
            </div>
          )}
        </div>

        {t.skills?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2.5">
            {t.skills.slice(0, 3).map((skill) => (
              <span key={skill} className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600">
                {skill}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center gap-1.5 mt-3.5 text-[11px]">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
          <span style={{ color: GREEN }} className="font-medium">검증 완료</span>
          {t.location && <span className="ml-auto text-gray-400 truncate max-w-[50%]">{t.location}</span>}
        </div>
      </div>
    </div>
  );
}
