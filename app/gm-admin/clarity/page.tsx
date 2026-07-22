"use client";

import { useEffect, useState } from "react";

/* Clarity 요약 — 웹 트래픽/행동 대시보드 (Clarity Data Export API · 최근 3일)
 *  실시간 세션 재생/히트맵은 Clarity 대시보드에서, 여기선 요약 수치만 */

type ClarityStats = {
  configured: boolean;
  error?: string;
  range?: string;
  sessions?: number;
  botSessions?: number;
  users?: number;
  pagesPerSession?: number;
  rageClicksPct?: number;
  deadClicksPct?: number;
  quickBackPct?: number;
  avgScrollDepth?: number;
  byReferrer?: [string, number][];
  byDevice?: [string, number][];
  byCountry?: [string, number][];
  byOS?: [string, number][];
  popularPages?: [string, number][];
};

const CLARITY_URL = "https://clarity.microsoft.com/projects/view/xn4g70ja06/dashboard";

function Kpi({ label, value, sub, accent }: { label: string; value: string | number; sub?: string; accent?: boolean }) {
  return (
    <div className="rounded-xl border border-[#E9ECF2] bg-white p-5">
      <p className="text-[12px] font-medium text-[#8A93A5]">{label}</p>
      <p className={`mt-1.5 text-[28px] font-bold leading-none ${accent ? "text-[#E8590C]" : "text-[#171E2D]"}`}>{value}</p>
      {sub && <p className="mt-1.5 text-[12px] text-[#9AA3B2]">{sub}</p>}
    </div>
  );
}

function Breakdown({ title, rows }: { title: string; rows: [string, number][] }) {
  const max = Math.max(1, ...rows.map(([, c]) => c));
  return (
    <div className="rounded-xl border border-[#E9ECF2] bg-white p-5">
      <p className="text-[14px] font-bold text-[#171E2D]">{title}</p>
      {rows.length === 0 ? (
        <p className="mt-4 text-[13px] text-[#9AA3B2]">데이터 없음</p>
      ) : (
        <ul className="mt-4 flex flex-col gap-2.5">
          {rows.map(([k, c]) => (
            <li key={k} className="flex items-center gap-3">
              <span className="w-28 shrink-0 truncate text-[13px] text-[#59657A]" title={k}>{k}</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#F1F3F7]">
                <div className="h-full rounded-full bg-[#E8590C]" style={{ width: `${(c / max) * 100}%` }} />
              </div>
              <span className="w-8 shrink-0 text-right text-[13px] font-semibold text-[#3A4356]">{c}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function ClarityDashboard() {
  const [c, setC] = useState<ClarityStats | null>(null);

  useEffect(() => {
    fetch("/api/gm-admin/clarity-stats")
      .then((r) => r.json())
      .then((d) => setC(d as ClarityStats))
      .catch(() => setC({ configured: false }));
  }, []);

  return (
    <div className="mx-auto max-w-[1100px] px-6 py-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-bold text-[#171E2D]">Clarity 요약</h1>
          <p className="mt-1 text-[13px] text-[#8A93A5]">웹 트래픽 · 행동 지표 · {c?.range || "최근 3일"} (세션 재생/히트맵은 Clarity 대시보드에서)</p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={CLARITY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md bg-[#E8590C] px-4 py-2.5 text-[13px] font-semibold text-white transition hover:bg-[#C74E0A]"
          >
            Clarity 대시보드 열기 ↗
          </a>
          <a
            href="https://analytics.google.com/analytics/web/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md border border-[#E8590C] bg-white px-4 py-2.5 text-[13px] font-semibold text-[#E8590C] transition hover:bg-[#FFF6EF]"
          >
            GA4 대시보드 ↗
          </a>
        </div>
      </div>

      {c === null ? (
        <p className="mt-10 text-center text-[14px] text-[#9AA3B2]">불러오는 중…</p>
      ) : !c.configured ? (
        <p className="mt-6 rounded-md bg-[#F9FAFB] px-4 py-3 text-[13px] text-[#8A93A5]">
          Clarity 연동 설정이 필요합니다. (환경변수 <span className="font-mono">CLARITY_API_TOKEN</span> — Clarity Settings → Data Export에서 생성)
        </p>
      ) : c.error ? (
        <p className="mt-6 rounded-md bg-[#FEF3F2] px-4 py-3 text-[13px] text-[#D92D20]">Clarity 오류: {c.error}</p>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            <Kpi label="세션" value={c.sessions ?? 0} accent />
            <Kpi label="순 방문자" value={c.users ?? 0} />
            <Kpi label="페이지 / 세션" value={c.pagesPerSession ?? 0} />
            <Kpi label="봇 세션(제외됨)" value={c.botSessions ?? 0} />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
            <Kpi label="분노 클릭" value={`${c.rageClicksPct ?? 0}%`} sub="rage click 세션" />
            <Kpi label="죽은 클릭" value={`${c.deadClicksPct ?? 0}%`} sub="dead click 세션" />
            <Kpi label="즉시 back" value={`${c.quickBackPct ?? 0}%`} sub="quick back 세션" />
            <Kpi label="평균 스크롤" value={`${c.avgScrollDepth ?? 0}%`} />
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <Breakdown title="유입 (Referrer)" rows={c.byReferrer || []} />
            <Breakdown title="기기" rows={c.byDevice || []} />
            <Breakdown title="국가" rows={c.byCountry || []} />
            <Breakdown title="OS" rows={c.byOS || []} />
          </div>

          <div className="mt-4">
            <Breakdown title="인기 페이지" rows={(c.popularPages || []).map(([u, n]) => [u.replace(/^https?:\/\//, ""), n] as [string, number])} />
          </div>

          <p className="mt-4 text-[12px] text-[#AEB6C4]">※ Clarity Data Export API는 최근 3일 · 하루 10회 제한이라 3시간 캐시로 갱신됩니다.</p>
        </>
      )}
    </div>
  );
}
