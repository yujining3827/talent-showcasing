import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET() {
  const supabase = getSupabaseAdmin();

  // 인터뷰 완료 + human_decision = pass인 세션 조회
  const { data: sessions } = await supabase
    .from("interview_sessions")
    .select("*")
    .eq("human_decision", "pass")
    .order("applied_company", { ascending: true })
    .order("created_at", { ascending: true });

  if (!sessions || sessions.length === 0) {
    return NextResponse.json({ success: true, items: [] });
  }

  // candidate_id로 후보자 정보 조회
  const candidateIds = Array.from(
    new Set(sessions.filter((s) => s.candidate_id).map((s) => s.candidate_id))
  );

  let candidateMap: Record<string, { yoe: string | null; llm_summary: string | null; cv_url: string | null; talent_id: string | null; llm_score: number | null }> = {};
  if (candidateIds.length > 0) {
    const { data: candidates } = await supabase
      .from("candidates")
      .select("id, yoe, llm_summary, cv_url, talent_id, llm_score")
      .in("id", candidateIds);
    if (candidates) {
      candidateMap = Object.fromEntries(
        candidates.map((c) => [c.id, { yoe: c.yoe, llm_summary: c.llm_summary, cv_url: c.cv_url, talent_id: c.talent_id, llm_score: c.llm_score }])
      );
    }
  }

  // talent_id → ovr_score 조회
  const talentIds = Array.from(
    new Set(
      Object.values(candidateMap)
        .filter((c) => c.talent_id)
        .map((c) => c.talent_id!)
    )
  );
  let screeningScoreMap: Record<string, number> = {};
  if (talentIds.length > 0) {
    const { data: talents } = await supabase
      .from("talents")
      .select("id, ovr_score")
      .in("id", talentIds);
    if (talents) {
      screeningScoreMap = Object.fromEntries(talents.map((t) => [t.id, t.ovr_score]));
    }
  }

  // 조합
  const items = sessions.map((s) => {
    const candidate = candidateMap[s.candidate_id] || null;
    const talentId = candidate?.talent_id;
    // talents.ovr_score 우선, 없으면 candidates.llm_score fallback
    let screeningScore: number | null = null;
    if (talentId && screeningScoreMap[talentId] !== undefined) {
      screeningScore = screeningScoreMap[talentId];
    } else if (candidate?.llm_score !== null && candidate?.llm_score !== undefined) {
      screeningScore = candidate.llm_score;
    }

    let strengthsKo: string[] = [];
    if (candidate?.llm_summary) {
      try {
        const summary = JSON.parse(candidate.llm_summary);
        strengthsKo = summary.strengths_ko || summary.strengths_en || summary.strengths || [];
      } catch { /* ignore */ }
    }

    return {
      id: s.id,
      candidate_name: s.candidate_name || "",
      applied_company: s.applied_company || "",
      applied_position: s.applied_position || "",
      yoe: candidate?.yoe || "",
      screening_score: screeningScore,
      strengths_ko: strengthsKo,
      ai_summary: s.ai_summary || "",
      cv_url: candidate?.cv_url || "",
      total_score: s.total_score,
      completed_at: s.completed_at,
    };
  });

  return NextResponse.json({ success: true, items });
}
