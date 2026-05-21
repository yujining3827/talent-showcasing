import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// 세션 리스트 (각 세션의 답변 수 포함)
export async function GET(req: NextRequest) {
  const supabase = getSupabaseAdmin();
  const candidateId = req.nextUrl.searchParams.get("candidateId");

  let query = supabase.from("interview_sessions").select("*").order("created_at", { ascending: false });
  if (candidateId) {
    query = query.eq("candidate_id", candidateId);
  }
  const { data: sessions } = await query;

  const sessionList = sessions || [];

  // candidate_id가 있는 세션에서 phone, talent_id, cv_url 조회
  const candidateIds = [...new Set(sessionList.filter(s => s.candidate_id).map(s => s.candidate_id))];

  let phoneMap: Record<string, string> = {};
  let talentIdMap: Record<string, string> = {};
  let cvUrlMap: Record<string, string> = {};
  if (candidateIds.length > 0) {
    const { data: candidates } = await supabase
      .from("candidates")
      .select("id, phone, talent_id, cv_url")
      .in("id", candidateIds);
    if (candidates) {
      phoneMap = Object.fromEntries(candidates.filter((c) => c.phone).map((c) => [c.id, c.phone]));
      talentIdMap = Object.fromEntries(candidates.filter((c) => c.talent_id).map((c) => [c.id, c.talent_id]));
      cvUrlMap = Object.fromEntries(candidates.filter((c) => c.cv_url).map((c) => [c.id, c.cv_url]));
    }
  }

  // talent_id → ovr_score (스크리닝 점수) 조회
  const talentIds = [...new Set(Object.values(talentIdMap))];
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

  // 답변 수 조회 (in_progress, abandoned 세션용) + phone 보충
  const sessionsWithCount = await Promise.all(
    sessionList.map(async (s) => {
      const phone = s.candidate_phone || phoneMap[s.candidate_id] || null;
      const talentId = talentIdMap[s.candidate_id];
      const screeningScore = talentId ? (screeningScoreMap[talentId] ?? null) : null;
      const cvUrl = cvUrlMap[s.candidate_id] || null;
      if (s.status === "in_progress" || s.status === "abandoned") {
        const { count } = await supabase
          .from("interview_responses")
          .select("*", { count: "exact", head: true })
          .eq("session_id", s.id);
        return { ...s, candidate_phone: phone, screening_score: screeningScore, cv_url: cvUrl, response_count: count || 0 };
      }
      return { ...s, candidate_phone: phone, screening_score: screeningScore, cv_url: cvUrl };
    })
  );

  return NextResponse.json({ success: true, sessions: sessionsWithCount });
}

// 코드 발급
const CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
function generateCode() {
  let code = "KTC-";
  for (let i = 0; i < 6; i++) code += CHARS[Math.floor(Math.random() * CHARS.length)];
  return code;
}

interface CandidateEntry {
  candidate_name?: string;
  candidate_email?: string;
  applied_company?: string;
  applied_position?: string;
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const supabase = getSupabaseAdmin();

  // candidates 배열이 있으면 각각 코드 발급
  const candidates: CandidateEntry[] = body.candidates || [];
  // candidates가 없으면 count만큼 빈 코드 발급
  const count = candidates.length > 0 ? candidates.length : Math.min(Math.max(1, parseInt(body.count, 10) || 1), 100);

  const results: { code: string; candidate_name?: string; candidate_email?: string; applied_company?: string; applied_position?: string }[] = [];

  for (let i = 0; i < count; i++) {
    let code = generateCode();
    let attempts = 0;
    while (attempts < 5) {
      const { data: existing } = await supabase
        .from("interview_sessions").select("id").eq("access_code", code).maybeSingle();
      if (!existing) break;
      code = generateCode();
      attempts++;
    }

    const entry = candidates[i] || {};
    const insertData: Record<string, string> = {
      access_code: code,
      status: "pending",
    };
    if (entry.candidate_name) insertData.candidate_name = entry.candidate_name;
    if (entry.candidate_email) insertData.candidate_email = entry.candidate_email;
    if (entry.applied_company) insertData.applied_company = entry.applied_company;
    if (entry.applied_position) insertData.applied_position = entry.applied_position;
    if (body.deadline) insertData.deadline = body.deadline;

    const { error } = await supabase.from("interview_sessions").insert(insertData);
    if (!error) results.push({ code, ...entry });
  }

  return NextResponse.json({ success: true, results, codes: results.map(r => r.code) });
}
