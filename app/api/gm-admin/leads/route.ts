import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

/* 인재 상담 리드(pricing_requests) 조회 — /gm-admin 대시보드용
 *  - pricing 전용 프로젝트(PRICING_SUPABASE_*) 우선, 없으면 메인 DB 폴백 (제출 저장과 동일 소스)
 *  - /gm-admin/* 은 미들웨어(비밀번호 쿠키)로 보호됨 */
function getPricingAdmin() {
  const url = process.env.PRICING_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.PRICING_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export async function GET() {
  const supabase = getPricingAdmin();
  const { data, error } = await supabase
    .from("pricing_requests")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(2000);

  if (error) return NextResponse.json({ error: error.message, leads: [] }, { status: 500 });
  return NextResponse.json({ leads: data || [] });
}
