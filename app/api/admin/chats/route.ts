import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

// GET: 대화방 목록 (최근 메시지 미리보기 + 안읽음 수 + 담당자 이름)
export async function GET() {
  const supabase = getSupabaseAdmin();

  const { data: threads, error } = await supabase
    .from("chat_threads")
    .select("*")
    .order("last_message_at", { ascending: false })
    .limit(200);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const ids = (threads || []).map((t) => t.id);
  if (ids.length === 0) return NextResponse.json({ threads: [] });

  // 안읽음(방문자 발신 + read_at null) 카운트
  const { data: unread } = await supabase
    .from("chat_messages")
    .select("thread_id")
    .in("thread_id", ids)
    .eq("sender", "visitor")
    .is("read_at", null);
  const unreadMap = new Map<string, number>();
  for (const u of unread || []) unreadMap.set(u.thread_id, (unreadMap.get(u.thread_id) || 0) + 1);

  // 마지막 메시지 미리보기 (스레드당 1개)
  const { data: lastMsgs } = await supabase
    .from("chat_messages")
    .select("thread_id, sender, body, created_at")
    .in("thread_id", ids)
    .order("id", { ascending: false })
    .limit(600);
  const previewMap = new Map<string, { sender: string; body: string }>();
  for (const m of lastMsgs || []) {
    if (!previewMap.has(m.thread_id)) previewMap.set(m.thread_id, { sender: m.sender, body: m.body });
  }

  // 담당 어드민 이름
  const adminIds = Array.from(new Set((threads || []).map((t) => t.assigned_admin).filter(Boolean)));
  const nameMap = new Map<string, string>();
  if (adminIds.length > 0) {
    const { data: profiles } = await supabase
      .from("user_profiles")
      .select("id, name, email")
      .in("id", adminIds);
    for (const p of profiles || []) nameMap.set(p.id, p.name || p.email);
  }

  return NextResponse.json({
    threads: (threads || []).map((t) => ({
      ...t,
      unread_count: unreadMap.get(t.id) || 0,
      last_message: previewMap.get(t.id) || null,
      assigned_admin_name: t.assigned_admin ? nameMap.get(t.assigned_admin) || null : null,
    })),
  });
}
