import type { SupabaseClient } from "@supabase/supabase-js";

// 후보자 상태 변경 시 인재 카드 태그 업데이트
export async function updateTalentVerification(
  supabase: SupabaseClient,
  candidateId: string,
  newStatus: string
) {
  // candidate에서 talent_id 가져오기
  const { data: candidate } = await supabase
    .from("candidates")
    .select("talent_id")
    .eq("id", candidateId)
    .single();

  if (!candidate?.talent_id) return;

  const chips: string[] = [];
  if (["passed", "final_passed"].includes(newStatus)) {
    chips.push("서류 합격");
  }

  await supabase
    .from("talents")
    .update({ verification: chips, updated_at: new Date().toISOString() })
    .eq("id", candidate.talent_id);
}
