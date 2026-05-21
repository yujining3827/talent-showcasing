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

  // candidate_phone이 없는 세션은 candidates 테이블에서 보충
  const sessionList = sessions || [];
  const missingPhoneIds = sessionList
    .filter((s) => !s.candidate_phone && s.candidate_id)
    .map((s) => s.candidate_id);

  let phoneMap: Record<string, string> = {};
  if (missingPhoneIds.length > 0) {
    const { data: candidates } = await supabase
      .from("candidates")
      .select("id, phone")
      .in("id", missingPhoneIds);
    if (candidates) {
      phoneMap = Object.fromEntries(candidates.filter((c) => c.phone).map((c) => [c.id, c.phone]));
    }
  }

  // 답변 수 조회 (in_progress, abandoned 세션용) + phone 보충
  const sessionsWithCount = await Promise.all(
    sessionList.map(async (s) => {
      const phone = s.candidate_phone || phoneMap[s.candidate_id] || null;
      if (s.status === "in_progress" || s.status === "abandoned") {
        const { count } = await supabase
          .from("interview_responses")
          .select("*", { count: "exact", head: true })
          .eq("session_id", s.id);
        return { ...s, candidate_phone: phone, response_count: count || 0 };
      }
      return { ...s, candidate_phone: phone };
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
