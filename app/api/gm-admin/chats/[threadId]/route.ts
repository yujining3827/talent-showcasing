import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

/* gm-admin 채팅 스레드 — /gm-admin 미들웨어(비밀번호)로 보호됨
 *  gm-admin은 개별 어드민 계정이 없으므로 admin_id/assigned_admin 은 null (sender='admin'로 구분) */
function admin() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: (url, opts) => fetch(url as RequestInfo, { ...(opts as RequestInit), cache: "no-store" }) },
  });
}

// GET: 스레드 메시지 + 방문자 메시지 읽음 처리
export async function GET(_req: Request, { params }: { params: { threadId: string } }) {
  const supabase = admin();
  const { data: thread } = await supabase.from("chat_threads").select("*").eq("id", params.threadId).maybeSingle();
  if (!thread) return NextResponse.json({ error: "not found" }, { status: 404 });

  const { data: messages, error } = await supabase
    .from("chat_messages")
    .select("id, sender, admin_id, body, created_at")
    .eq("thread_id", params.threadId)
    .order("id", { ascending: true })
    .limit(500);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabase
    .from("chat_messages")
    .update({ read_at: new Date().toISOString() })
    .eq("thread_id", params.threadId)
    .eq("sender", "visitor")
    .is("read_at", null);

  return NextResponse.json({ thread, messages: messages || [] });
}

// POST: 답장 (admin_id 없음)
export async function POST(req: Request, { params }: { params: { threadId: string } }) {
  const supabase = admin();
  const { body } = await req.json();
  const text = typeof body === "string" ? body.trim().slice(0, 2000) : "";
  if (!text) return NextResponse.json({ error: "body required" }, { status: 400 });

  const { data: thread } = await supabase.from("chat_threads").select("id, status").eq("id", params.threadId).maybeSingle();
  if (!thread) return NextResponse.json({ error: "not found" }, { status: 404 });

  const { data: msg, error } = await supabase
    .from("chat_messages")
    .insert({ thread_id: thread.id, sender: "admin", admin_id: null, body: text })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabase
    .from("chat_threads")
    .update({ last_message_at: new Date().toISOString(), status: "assigned" })
    .eq("id", thread.id);

  return NextResponse.json({ message: msg });
}

// PATCH: { action: "assign" | "close" }
export async function PATCH(req: Request, { params }: { params: { threadId: string } }) {
  const supabase = admin();
  const { action } = await req.json();
  const status = action === "assign" ? "assigned" : action === "close" ? "closed" : null;
  if (!status) return NextResponse.json({ error: "unknown action" }, { status: 400 });

  const { error } = await supabase.from("chat_threads").update({ status }).eq("id", params.threadId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
