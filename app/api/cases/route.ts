import { NextResponse } from "next/server";
import { getAllCaseStudies } from "@/lib/caseStudies.server";

export const dynamic = "force-dynamic";

/* 공개 고객 사례 목록 (정적 + DB 병합) — 랜딩 프리뷰(클라이언트)용 */
export async function GET() {
  const cases = await getAllCaseStudies();
  return NextResponse.json({ cases });
}
