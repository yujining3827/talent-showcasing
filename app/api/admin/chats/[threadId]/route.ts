import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

// GET: 스레드 메시지 전체 + 방문자 메시지 읽음 처리
export async function GET(_req: NextRequest, { params }: { params: { threadId: string } }) {
  const supabase = getSupabaseAdmin();

  const { data: thread } = await supabase
    .from("chat_threads")
    .select("*")
    .eq("id", params.threadId)
    .maybeSingle();
  if (!thread) return NextResponse.json({ error: "not found" }, { status: 404 });

  const { data: messages, error } = await supabase
    .from("chat_messages")
    .select("id, sender, admin_id, body, created_at")
    .eq("thread_id", params.threadId)
    .order("id", { ascending: true })
    .limit(500);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // 읽음 처리 (안읽음 뱃지 해제)
  await supabase
    .from("chat_messages")
    .update({ read_at: new Date().toISOString() })
    .eq("thread_id", params.threadId)
    .eq("sender", "visitor")
    .is("read_at", null);

  return NextResponse.json({ thread, messages: messages || [] });
}

// POST: 어드민 답장 — 미배정 스레드면 답장한 어드민에게 자동 배정
export async function POST(req: NextRequest, { params }: { params: { threadId: string } }) {
  const { body, adminId } = await req.json();
  const text = typeof body === "string" ? body.trim().slice(0, 2000) : "";
  if (!text || !adminId) {
    return NextResponse.json({ error: "body, adminId required" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data: thread } = await supabase
    .from("chat_threads")
    .select("id, assigned_admin, status")
    .eq("id", params.threadId)
    .maybeSingle();
  if (!thread) return NextResponse.json({ error: "not found" }, { status: 404 });

  const { data: msg, error } = await supabase
    .from("chat_messages")
    .insert({ thread_id: thread.id, sender: "admin", admin_id: adminId, body: text })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabase
    .from("chat_threads")
    .update({
      last_message_at: new Date().toISOString(),
      assigned_admin: thread.assigned_admin || adminId,
      status: "assigned",
    })
    .eq("id", thread.id);

  return NextResponse.json({ message: msg });
}

// PATCH: { action: "assign" | "close", adminId }
export async function PATCH(req: NextRequest, { params }: { params: { threadId: string } }) {
  const { action, adminId } = await req.json();
  const supabase = getSupabaseAdmin();

  if (action === "assign") {
    if (!adminId) return NextResponse.json({ error: "adminId required" }, { status: 400 });
    const { error } = await supabase
      .from("chat_threads")
      .update({ assigned_admin: adminId, status: "assigned" })
      .eq("id", params.threadId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  if (action === "close") {
    const { error } = await supabase
      .from("chat_threads")
      .update({ status: "closed" })
      .eq("id", params.threadId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "unknown action" }, { status: 400 });
}
