import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/* Clarity 웹 트래픽 요약 — /gm-admin 미들웨어로 보호됨
 *  - Clarity Data Export API (project-live-insights). 토큰: Clarity Settings → Data Export
 *  - CLARITY_API_TOKEN env 필요. 미설정 시 { configured: false }
 *  - ⚠️ 최근 1~3일만 + 하루 10회 요청 제한 → 3시간 캐시로 호출 최소화 */

type Metric = { metricName?: string; information?: Record<string, unknown>[] };

const num = (v: unknown) => Number(v ?? 0) || 0;
const r1 = (v: unknown) => Math.round(num(v) * 10) / 10;

export async function GET() {
  const token = process.env.CLARITY_API_TOKEN;
  if (!token) return NextResponse.json({ configured: false });

  try {
    const res = await fetch("https://www.clarity.ms/export-data/api/v1/project-live-insights?numOfDays=3", {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 10800 }, // 3시간 캐시 (요청 제한 대응)
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return NextResponse.json({ configured: true, error: `Clarity ${res.status}: ${text.slice(0, 120)}` });
    }
    const data = (await res.json()) as Metric[];

    const first = (name: string) => data.find((m) => m.metricName === name)?.information?.[0] || {};
    const rows = (name: string, key = "name", countKey = "sessionsCount"): [string, number][] =>
      (data.find((m) => m.metricName === name)?.information || []).map(
        (i) => [String(i[key] ?? "(직접/미상)"), num(i[countKey])] as [string, number]
      );

    const traffic = first("Traffic");
    const scroll = first("ScrollDepth");

    return NextResponse.json({
      configured: true,
      range: "최근 3일",
      sessions: num(traffic.totalSessionCount),
      botSessions: num(traffic.totalBotSessionCount),
      users: num(traffic.distinctUserCount),
      pagesPerSession: r1(traffic.pagesPerSessionPercentage),
      avgScrollDepth: r1(scroll.averageScrollDepth),
      rageClicksPct: r1(first("RageClickCount").sessionsWithMetricPercentage),
      deadClicksPct: r1(first("DeadClickCount").sessionsWithMetricPercentage),
      quickBackPct: r1(first("QuickbackClick").sessionsWithMetricPercentage),
      byReferrer: rows("ReferrerUrl"),
      byDevice: rows("Device"),
      byCountry: rows("Country"),
      byOS: rows("OS"),
      popularPages: rows("PopularPages", "url", "visitsCount"),
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Clarity 조회 실패";
    console.error("[clarity-stats] error:", message);
    return NextResponse.json({ configured: true, error: message });
  }
}
