import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

/* gm-admin 1:1 채팅 목록 — /gm-admin 미들웨어(비밀번호)로 보호됨
 *  - 메인 DB service_role. 어드민 세션 없이 접근(gm-admin 비번 인증) */
function admin() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: (url, opts) => fetch(url as RequestInfo, { ...(opts as RequestInit), cache: "no-store" }) },
  });
}

export async function GET() {
  const supabase = admin();

  const { data: threads, error } = await supabase
    .from("chat_threads")
    .select("*")
    .order("last_message_at", { ascending: false })
    .limit(200);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const ids = (threads || []).map((t) => t.id);
  if (ids.length === 0) return NextResponse.json({ threads: [] });

  // 안읽음(방문자 발신 + read_at null)
  const { data: unread } = await supabase
    .from("chat_messages")
    .select("thread_id")
    .in("thread_id", ids)
    .eq("sender", "visitor")
    .is("read_at", null);
  const unreadMap = new Map<string, number>();
  for (const u of unread || []) unreadMap.set(u.thread_id, (unreadMap.get(u.thread_id) || 0) + 1);

  // 마지막 메시지 미리보기
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

  return NextResponse.json({
    threads: (threads || []).map((t) => ({
      ...t,
      unread_count: unreadMap.get(t.id) || 0,
      last_message: previewMap.get(t.id) || null,
    })),
  });
}
