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

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// 방문자 소유 검증: threadId + visitorId(localStorage 비밀값) 쌍이 맞아야 접근 허용
async function getOwnedThread(supabase: ReturnType<typeof getSupabaseAdmin>, threadId: string, visitorId: string) {
  const { data } = await supabase
    .from("chat_threads")
    .select("id, visitor_id, visitor_name, visitor_contact, status, assigned_admin, last_message_at")
    .eq("id", threadId)
    .eq("visitor_id", visitorId)
    .maybeSingle();
  return data;
}

// POST: 메시지 전송 (스레드 없으면 생성)
export async function POST(req: NextRequest) {
  const { visitorId, threadId, body, path } = await req.json();

  if (!visitorId || !UUID_RE.test(visitorId)) {
    return NextResponse.json({ error: "invalid visitorId" }, { status: 400 });
  }
  const text = typeof body === "string" ? body.trim().slice(0, 2000) : "";
  if (!text) return NextResponse.json({ error: "body required" }, { status: 400 });

  const supabase = getSupabaseAdmin();
  let thread = threadId && UUID_RE.test(threadId) ? await getOwnedThread(supabase, threadId, visitorId) : null;

  if (!thread) {
    const { data: created, error } = await supabase
      .from("chat_threads")
      .insert({ visitor_id: visitorId, origin_path: typeof path === "string" ? path.slice(0, 200) : null })
      .select()
      .single();
    if (error || !created) {
      return NextResponse.json({ error: error?.message || "thread create failed" }, { status: 500 });
    }
    thread = created;
  }
  if (!thread) return NextResponse.json({ error: "thread not found" }, { status: 404 });

  const { data: msg, error: msgErr } = await supabase
    .from("chat_messages")
    .insert({ thread_id: thread.id, sender: "visitor", body: text })
    .select()
    .single();
  if (msgErr) return NextResponse.json({ error: msgErr.message }, { status: 500 });

  // 종료된 방에 다시 말 걸면 재오픈
  const nextStatus = thread.status === "closed" ? (thread.assigned_admin ? "assigned" : "open") : thread.status;
  await supabase
    .from("chat_threads")
    .update({ last_message_at: new Date().toISOString(), status: nextStatus })
    .eq("id", thread.id);

  return NextResponse.json({ threadId: thread.id, message: msg });
}

// GET: 메시지 폴링 — ?threadId=&visitorId=&after=<마지막 메시지 id>
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const threadId = searchParams.get("threadId") || "";
  const visitorId = searchParams.get("visitorId") || "";
  const after = Number(searchParams.get("after") || 0);

  if (!UUID_RE.test(threadId) || !UUID_RE.test(visitorId)) {
    return NextResponse.json({ error: "invalid params" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const thread = await getOwnedThread(supabase, threadId, visitorId);
  if (!thread) return NextResponse.json({ error: "not found" }, { status: 404 });

  const { data: messages, error } = await supabase
    .from("chat_messages")
    .select("id, sender, body, created_at")
    .eq("thread_id", threadId)
    .gt("id", after)
    .order("id", { ascending: true })
    .limit(200);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    thread: { status: thread.status, hasContact: !!thread.visitor_contact },
    messages: messages || [],
  });
}

// PATCH: 방문자 연락처 저장
export async function PATCH(req: NextRequest) {
  const { visitorId, threadId, name, contact } = await req.json();

  if (!visitorId || !UUID_RE.test(visitorId) || !threadId || !UUID_RE.test(threadId)) {
    return NextResponse.json({ error: "invalid params" }, { status: 400 });
  }
  const contactText = typeof contact === "string" ? contact.trim().slice(0, 100) : "";
  if (!contactText) return NextResponse.json({ error: "contact required" }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const thread = await getOwnedThread(supabase, threadId, visitorId);
  if (!thread) return NextResponse.json({ error: "not found" }, { status: 404 });

  const { error } = await supabase
    .from("chat_threads")
    .update({
      visitor_contact: contactText,
      visitor_name: typeof name === "string" && name.trim() ? name.trim().slice(0, 50) : thread.visitor_name,
    })
    .eq("id", threadId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
