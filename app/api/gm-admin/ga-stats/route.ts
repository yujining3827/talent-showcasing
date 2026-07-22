import { NextResponse } from "next/server";
import { google } from "googleapis";

export const dynamic = "force-dynamic";

/* GA4 웹 트래픽 요약 — /gm-admin 미들웨어로 보호됨
 *  - 기존 구글 서비스계정(GOOGLE_SERVICE_ACCOUNT_EMAIL / GOOGLE_PRIVATE_KEY) 재사용 (analytics.readonly 스코프)
 *  - GA4_PROPERTY_ID(숫자 속성 ID) 필요. 서비스계정에 해당 속성 '뷰어' 권한 부여돼 있어야 함
 *  - 미설정 시 { configured: false } 반환 (페이지에서 안내 표시) */

const PROPERTY_ID = process.env.GA4_PROPERTY_ID;

const num = (v: unknown) => Number(v ?? 0) || 0;

export async function GET() {
  if (!PROPERTY_ID || !process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
    return NextResponse.json({ configured: false });
  }

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: (process.env.GOOGLE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/analytics.readonly"],
    });
    const analyticsdata = google.analyticsdata({ version: "v1beta", auth });
    const property = `properties/${PROPERTY_ID}`;

    const { data } = await analyticsdata.properties.batchRunReports({
      property,
      requestBody: {
        requests: [
          // 0) 최근 7일 총계
          {
            dateRanges: [{ startDate: "7daysAgo", endDate: "today" }],
            metrics: [{ name: "activeUsers" }, { name: "sessions" }, { name: "screenPageViews" }, { name: "newUsers" }],
          },
          // 1) 채널별 세션 (최근 7일)
          {
            dateRanges: [{ startDate: "7daysAgo", endDate: "today" }],
            dimensions: [{ name: "sessionDefaultChannelGroup" }],
            metrics: [{ name: "sessions" }],
            orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
            limit: "8",
          },
          // 2) 일자별 세션 (최근 14일 추이)
          {
            dateRanges: [{ startDate: "14daysAgo", endDate: "today" }],
            dimensions: [{ name: "date" }],
            metrics: [{ name: "sessions" }],
            orderBys: [{ dimension: { dimensionName: "date" } }],
          },
        ],
      },
    });

    const reports = data.reports || [];
    const totalRow = reports[0]?.rows?.[0]?.metricValues || [];
    const totals = {
      activeUsers: num(totalRow[0]?.value),
      sessions: num(totalRow[1]?.value),
      pageViews: num(totalRow[2]?.value),
      newUsers: num(totalRow[3]?.value),
    };

    const byChannel: [string, number][] = (reports[1]?.rows || []).map((r) => [
      r.dimensionValues?.[0]?.value || "(기타)",
      num(r.metricValues?.[0]?.value),
    ]);

    const trend = (reports[2]?.rows || []).map((r) => {
      const d = r.dimensionValues?.[0]?.value || ""; // YYYYMMDD
      return { label: `${Number(d.slice(4, 6))}/${Number(d.slice(6, 8))}`, sessions: num(r.metricValues?.[0]?.value) };
    });

    return NextResponse.json({ configured: true, range: "최근 7일", totals, byChannel, trend });
  } catch (e) {
    const message = e instanceof Error ? e.message : "GA4 조회 실패";
    console.error("[ga-stats] error:", message);
    return NextResponse.json({ configured: true, error: message }, { status: 200 });
  }
}
