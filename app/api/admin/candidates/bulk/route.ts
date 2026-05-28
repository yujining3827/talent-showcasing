import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { updateTalentVerification } from "@/lib/create-talent-card";

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function PATCH(req: NextRequest) {
  const { ids, action, value } = await req.json();

  if (!ids || !Array.isArray(ids) || ids.length === 0 || !action) {
    return NextResponse.json({ success: false, error: "ids and action required" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  if (action === "change_status") {
    const { error } = await supabase
      .from("candidates")
      .update({ pipeline_status: value, updated_at: new Date().toISOString() })
      .in("id", ids);
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

    // talent verification 업데이트
    for (const id of ids) {
      await updateTalentVerification(supabase, id, value);
    }
    return NextResponse.json({ success: true, updated: ids.length });
  }

  if (action === "assign_jd") {
    const { error } = await supabase
      .from("candidates")
      .update({ applied_job: value || null, updated_at: new Date().toISOString() })
      .in("id", ids);
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, updated: ids.length });
  }

  if (action === "delete") {
    // 각 후보자의 연관 데이터 삭제
    for (const id of ids) {
      const { data: candidate } = await supabase
        .from("candidates")
        .select("talent_id")
        .eq("id", id)
        .single();

      const { data: sessions } = await supabase
        .from("interview_sessions")
        .select("id")
        .eq("candidate_id", id);

      if (sessions && sessions.length > 0) {
        const sessionIds = sessions.map((s: { id: string }) => s.id);
        await supabase.from("interview_responses").delete().in("session_id", sessionIds);
        await supabase.from("interview_sessions").delete().eq("candidate_id", id);
      }

      if (candidate?.talent_id) {
        await supabase.from("talent_favorites").delete().eq("talent_id", candidate.talent_id);
        await supabase.from("candidates").update({ talent_id: null }).eq("id", id);
        await supabase.from("talents").delete().eq("id", candidate.talent_id);
      }

      await supabase.from("candidates").delete().eq("id", id);
    }
    return NextResponse.json({ success: true, deleted: ids.length });
  }

  return NextResponse.json({ success: false, error: "unknown action" }, { status: 400 });
}
