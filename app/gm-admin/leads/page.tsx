"use client";

import { useEffect, useMemo, useState } from "react";

/* 인재 상담 리드 대시보드 — pricing_requests(제출 리드 + UTM 유입) 집계 */

type Lead = {
  id: string;
  name: string | null;
  company: string | null;
  contact: string | null;
  roles: string[] | null;
  talent_id: string | null;
  talent_name: string | null;
  talent_role: string | null;
  jd_url: string | null;
  jd_file_url: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  fbclid: string | null;
  status: string | null;
  created_at: string;
};

const fmtDate = (iso: string) => {
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};
const daysAgo = (n: number) => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - n);
  return d;
};

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
              <span className="w-24 shrink-0 truncate text-[13px] text-[#59657A]" title={k}>{k}</span>
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

export default function LeadsDashboard() {
  const [leads, setLeads] = useState<Lead[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/gm-admin/leads")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setLeads(d.leads as Lead[]);
      })
      .catch((e) => setError(String(e)));
  }, []);

  const stats = useMemo(() => {
    if (!leads) return null;
    const t0 = daysAgo(0).getTime();
    const t7 = daysAgo(6).getTime();
    const at = (l: Lead) => new Date(l.created_at).getTime();
    const today = leads.filter((l) => at(l) >= t0).length;
    const week = leads.filter((l) => at(l) >= t7).length;
    const talent = leads.filter((l) => l.talent_id).length;

    const countBy = (key: (l: Lead) => string | null | undefined) => {
      const m = new Map<string, number>();
      for (const l of leads) {
        const v = (key(l) || "").trim() || "(직접/미표기)";
        m.set(v, (m.get(v) || 0) + 1);
      }
      return Array.from(m.entries()).sort((a, b) => b[1] - a[1]).slice(0, 8);
    };

    const trend: { label: string; count: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const start = daysAgo(i).getTime();
      const end = daysAgo(i - 1).getTime();
      const c = leads.filter((l) => at(l) >= start && at(l) < end).length;
      const d = daysAgo(i);
      trend.push({ label: `${d.getMonth() + 1}/${d.getDate()}`, count: c });
    }

    return {
      total: leads.length,
      today,
      week,
      talent,
      general: leads.length - talent,
      bySource: countBy((l) => l.utm_source),
      byCampaign: countBy((l) => l.utm_campaign),
      trend,
    };
  }, [leads]);

  const trendMax = Math.max(1, ...(stats?.trend.map((t) => t.count) || [1]));

  return (
    <div className="mx-auto max-w-[1100px] px-6 py-8">
      <div className="flex items-baseline justify-between">
        <div>
          <h1 className="text-[24px] font-bold text-[#171E2D]">인재 상담 리드</h1>
          <p className="mt-1 text-[13px] text-[#8A93A5]">제출 전환 + UTM 유입 현황 · 접수 후 1시간 내 컨택용</p>
        </div>
        <a href="/api/gm-admin/leads" target="_blank" rel="noopener noreferrer" className="text-[12px] font-medium text-[#8A93A5] hover:text-[#E8590C]">
          원본 JSON ↗
        </a>
      </div>

      {error && <p className="mt-6 rounded-md bg-[#FEF3F2] px-4 py-3 text-[13px] text-[#D92D20]">불러오기 실패: {error}</p>}
      {!leads && !error && <p className="mt-10 text-center text-[14px] text-[#9AA3B2]">불러오는 중…</p>}

      {stats && (
        <>
          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            <Kpi label="총 리드" value={stats.total} accent />
            <Kpi label="오늘" value={stats.today} />
            <Kpi label="최근 7일" value={stats.week} />
            <Kpi
              label="인재 문의 / 일반"
              value={`${stats.talent} / ${stats.general}`}
              sub={stats.total ? `인재 문의 ${Math.round((stats.talent / stats.total) * 100)}%` : undefined}
            />
          </div>

          <div className="mt-4 rounded-xl border border-[#E9ECF2] bg-white p-5">
            <p className="text-[14px] font-bold text-[#171E2D]">최근 14일 추이</p>
            <div className="mt-5 flex items-end gap-1.5" style={{ height: 96 }}>
              {stats.trend.map((t, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
                  <div className="flex w-full flex-1 items-end">
                    <div
                      className="w-full rounded-t bg-[#E8590C]/85"
                      style={{ height: `${(t.count / trendMax) * 100}%`, minHeight: t.count ? 3 : 0 }}
                      title={`${t.label}: ${t.count}건`}
                    />
                  </div>
                  <span className="text-[9px] text-[#AEB6C4]">{t.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <Breakdown title="유입 소스 (utm_source)" rows={stats.bySource} />
            <Breakdown title="캠페인 (utm_campaign)" rows={stats.byCampaign} />
          </div>

          <div className="mt-4 overflow-hidden rounded-xl border border-[#E9ECF2] bg-white">
            <p className="border-b border-[#F1F3F7] px-5 py-4 text-[14px] font-bold text-[#171E2D]">최근 리드</p>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[13px]">
                <thead>
                  <tr className="border-b border-[#F1F3F7] text-[11px] uppercase tracking-wide text-[#9AA3B2]">
                    <th className="px-5 py-3 font-medium">접수</th>
                    <th className="px-3 py-3 font-medium">담당자 · 기업</th>
                    <th className="px-3 py-3 font-medium">연락처</th>
                    <th className="px-3 py-3 font-medium">유형</th>
                    <th className="px-3 py-3 font-medium">유입</th>
                    <th className="px-5 py-3 font-medium">JD</th>
                  </tr>
                </thead>
                <tbody>
                  {(leads || []).slice(0, 50).map((l) => (
                    <tr key={l.id} className="border-b border-[#F5F6F9] last:border-0">
                      <td className="whitespace-nowrap px-5 py-3 text-[#59657A]">{fmtDate(l.created_at)}</td>
                      <td className="px-3 py-3">
                        <span className="font-semibold text-[#171E2D]">{l.name || "-"}</span>
                        <span className="text-[#8A93A5]"> · {l.company || "-"}</span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-[#3A4356]">{l.contact || "-"}</td>
                      <td className="px-3 py-3">
                        {l.talent_id ? (
                          <span className="rounded-full bg-[#FFF1E8] px-2 py-0.5 text-[11px] font-semibold text-[#E8590C]" title={l.talent_name || ""}>
                            인재 문의
                          </span>
                        ) : (
                          <span className="rounded-full bg-[#F1F3F7] px-2 py-0.5 text-[11px] font-medium text-[#8A93A5]">일반</span>
                        )}
                      </td>
                      <td className="px-3 py-3 text-[12px] text-[#59657A]">
                        {l.utm_source ? `${l.utm_source}${l.utm_campaign ? ` · ${l.utm_campaign}` : ""}` : "-"}
                      </td>
                      <td className="px-5 py-3">
                        {l.jd_file_url ? (
                          <a href={l.jd_file_url} target="_blank" rel="noopener noreferrer" className="font-medium text-[#E8590C] hover:underline">PDF</a>
                        ) : l.jd_url ? (
                          <a href={l.jd_url} target="_blank" rel="noopener noreferrer" className="font-medium text-[#E8590C] hover:underline">링크</a>
                        ) : (
                          <span className="text-[#C4CBD6]">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
