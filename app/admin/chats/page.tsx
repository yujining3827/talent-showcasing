"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

/* ============================================================================
 *  어드민 1:1 채팅 인박스 — 좌측 대화 목록 + 우측 대화창
 *  - 실시간: Supabase Realtime(postgres_changes, 어드민 SELECT 정책) + 10초 폴링 백업
 *  - 담당 배정: 선착순 — "내가 대응하기" 클릭 또는 첫 답장 시 자동 배정
 * ========================================================================== */

type ThreadRow = {
  id: string;
  visitor_name: string | null;
  visitor_contact: string | null;
  status: "open" | "assigned" | "closed";
  assigned_admin: string | null;
  assigned_admin_name: string | null;
  origin_path: string | null;
  created_at: string;
  last_message_at: string;
  unread_count: number;
  last_message: { sender: string; body: string } | null;
};

type ChatMessage = {
  id: number;
  sender: "visitor" | "admin";
  admin_id: string | null;
  body: string;
  created_at: string;
};

type Tab = "all" | "unassigned" | "mine" | "closed";

// 어드민 API 인증 헤더 — 구글 로그인 세션의 access token (없으면 null)
async function authHeaders(): Promise<Record<string, string> | null> {
  const { data: { session } } = await supabase.auth.getSession();
  return session ? { Authorization: `Bearer ${session.access_token}` } : null;
}

function visitorLabel(t: ThreadRow) {
  return t.visitor_name || `방문자 #${t.id.slice(0, 4)}`;
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "방금";
  if (min < 60) return `${min}분 전`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}시간 전`;
  return new Date(iso).toLocaleDateString("ko-KR", { month: "short", day: "numeric" });
}

function timeLabel(iso: string) {
  return new Date(iso).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
}

export default function AdminChatsPage() {
  const [threads, setThreads] = useState<ThreadRow[]>([]);
  const [tab, setTab] = useState<Tab>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [selectedThread, setSelectedThread] = useState<ThreadRow | null>(null);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [adminId, setAdminId] = useState<string | null>(null);

  const selectedIdRef = useRef<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      const el = scrollRef.current;
      if (el) el.scrollTop = el.scrollHeight;
    });
  }, []);

  const fetchThreads = useCallback(async () => {
    const headers = await authHeaders();
    if (!headers) return;
    const res = await fetch("/api/admin/chats", { headers });
    if (!res.ok) return;
    const data = await res.json();
    setThreads(data.threads || []);
  }, []);

  const fetchMessages = useCallback(
    async (threadId: string) => {
      const headers = await authHeaders();
      if (!headers) return;
      const res = await fetch(`/api/admin/chats/${threadId}`, { headers });
      if (!res.ok) return;
      const data = await res.json();
      if (selectedIdRef.current !== threadId) return; // 다른 방으로 이동한 경우 무시
      setMessages(data.messages || []);
      scrollToBottom();
      // 읽음 처리 반영 (뱃지 갱신)
      setThreads((prev) => prev.map((t) => (t.id === threadId ? { ...t, unread_count: 0 } : t)));
      window.dispatchEvent(new CustomEvent("chat-read"));
    },
    [scrollToBottom]
  );

  // 초기: 어드민 id + 목록
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) setAdminId(session.user.id);
    });
    fetchThreads();
  }, [fetchThreads]);

  // 실시간 구독 + 폴링 백업
  useEffect(() => {
    const channel = supabase
      .channel("admin-live-chat")
      .on("postgres_changes", { event: "*", schema: "public", table: "chat_messages" }, (payload) => {
        fetchThreads();
        const threadId = (payload.new as { thread_id?: string })?.thread_id;
        if (threadId && selectedIdRef.current === threadId) fetchMessages(threadId);
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "chat_threads" }, () => {
        fetchThreads();
      })
      .subscribe();

    const interval = setInterval(fetchThreads, 10000);
    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [fetchThreads, fetchMessages]);

  function selectThread(t: ThreadRow) {
    setSelectedId(t.id);
    selectedIdRef.current = t.id;
    setSelectedThread(t);
    setMessages([]);
    fetchMessages(t.id);
  }

  // 목록 갱신 시 선택된 스레드 정보도 동기화
  useEffect(() => {
    if (!selectedId) return;
    const fresh = threads.find((t) => t.id === selectedId);
    if (fresh) setSelectedThread(fresh);
  }, [threads, selectedId]);

  async function sendReply() {
    const text = reply.trim();
    if (!text || !selectedId || sending) return;
    setSending(true);
    try {
      const headers = await authHeaders();
      if (!headers) {
        alert("로그인 세션을 확인할 수 없습니다. 다시 로그인해주세요.");
        window.location.href = "/login";
        return;
      }
      const res = await fetch(`/api/admin/chats/${selectedId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...headers },
        body: JSON.stringify({ body: text }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        alert(`전송에 실패했습니다 (${res.status})${err?.error ? `: ${err.error}` : ""}`);
        return;
      }
      setReply("");
      await fetchMessages(selectedId);
      fetchThreads();
    } finally {
      setSending(false);
    }
  }

  async function patchThread(action: "assign" | "close") {
    if (!selectedId) return;
    const headers = await authHeaders();
    if (!headers) {
      alert("로그인 세션을 확인할 수 없습니다. 다시 로그인해주세요.");
      window.location.href = "/login";
      return;
    }
    const res = await fetch(`/api/admin/chats/${selectedId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify({ action }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => null);
      alert(`처리에 실패했습니다 (${res.status})${err?.error ? `: ${err.error}` : ""}`);
      return;
    }
    fetchThreads();
  }

  const counts = {
    all: threads.filter((t) => t.status !== "closed").length,
    unassigned: threads.filter((t) => t.status === "open").length,
    mine: threads.filter((t) => t.assigned_admin === adminId && t.status !== "closed").length,
    closed: threads.filter((t) => t.status === "closed").length,
  };

  const visible = threads.filter((t) => {
    if (tab === "all") return t.status !== "closed";
    if (tab === "unassigned") return t.status === "open";
    if (tab === "mine") return t.assigned_admin === adminId && t.status !== "closed";
    return t.status === "closed";
  });

  const TABS: { key: Tab; label: string }[] = [
    { key: "all", label: `전체 ${counts.all}` },
    { key: "unassigned", label: `미배정 ${counts.unassigned}` },
    { key: "mine", label: `내 담당 ${counts.mine}` },
    { key: "closed", label: `종료 ${counts.closed}` },
  ];

  function statusChip(t: ThreadRow) {
    if (t.status === "closed") return <span className="rounded-full bg-[#F2F4F6] px-2 py-[1px] text-[10.5px] font-semibold text-[#8B95A1]">종료</span>;
    if (t.status === "assigned")
      return <span className="rounded-full bg-[#E7F5FF] px-2 py-[1px] text-[10.5px] font-semibold text-[#1971C2]">{t.assigned_admin === adminId ? "내 담당" : `${t.assigned_admin_name || "어드민"} 대응 중`}</span>;
    return <span className="rounded-full bg-[#FFF1E8] px-2 py-[1px] text-[10.5px] font-semibold text-[#E8590C]">미배정</span>;
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-[22px] font-medium tracking-tight text-gray-900">1:1 채팅</h1>
        <span className="text-[12px] text-[#8B95A1]">사이트 방문자 실시간 상담</span>
      </div>

      <div className="grid min-h-[600px] grid-cols-1 overflow-hidden rounded-2xl border-[0.5px] border-gray-200/80 bg-white md:grid-cols-[300px_1fr]">
        {/* 좌: 대화 목록 */}
        <div className="flex max-h-[70vh] flex-col border-b border-gray-100 md:max-h-none md:border-b-0 md:border-r">
          <div className="flex gap-1.5 overflow-x-auto border-b border-gray-100 p-3 scrollbar-hide">
            {TABS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`whitespace-nowrap rounded-full px-3 py-1.5 text-[12px] transition-colors ${
                  tab === key ? "bg-[#191F28] text-white" : "bg-[#F2F4F6] text-[#6B7684] hover:bg-[#E5E8EB]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto">
            {visible.length === 0 && (
              <p className="px-4 py-10 text-center text-[13px] text-[#8B95A1]">대화가 없습니다</p>
            )}
            {visible.map((t) => (
              <button
                key={t.id}
                onClick={() => selectThread(t)}
                className={`block w-full border-b border-gray-50 px-4 py-3 text-left transition-colors ${
                  selectedId === t.id ? "bg-[#FFF6EF]" : "hover:bg-[#FAFBFC]"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-[13.5px] font-semibold text-[#191F28]">{visitorLabel(t)}</span>
                  <span className="flex items-center gap-1.5">
                    {t.unread_count > 0 && (
                      <span className="flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-[#E03131] px-1 text-[10px] font-bold text-white">
                        {t.unread_count}
                      </span>
                    )}
                    <span className="whitespace-nowrap text-[11px] text-[#B0B8C1]">{timeAgo(t.last_message_at)}</span>
                  </span>
                </div>
                {t.last_message && (
                  <p className="mt-0.5 truncate text-[12px] text-[#8B95A1]">
                    {t.last_message.sender === "admin" ? "↩ " : ""}
                    {t.last_message.body}
                  </p>
                )}
                <div className="mt-1.5">{statusChip(t)}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 우: 대화창 */}
        {!selectedThread ? (
          <div className="flex items-center justify-center p-10">
            <p className="text-[13px] text-[#8B95A1]">왼쪽에서 대화를 선택하세요</p>
          </div>
        ) : (
          <div className="flex max-h-[75vh] flex-col md:max-h-none">
            {/* 대화 헤더 */}
            <div className="flex flex-wrap items-center gap-2 border-b border-gray-100 px-5 py-3.5">
              <div className="min-w-0">
                <p className="text-[14.5px] font-semibold text-[#191F28]">{visitorLabel(selectedThread)}</p>
                <p className="truncate text-[11.5px] text-[#8B95A1]">
                  {selectedThread.visitor_contact ? `연락처: ${selectedThread.visitor_contact} · ` : "연락처 미등록 · "}
                  {selectedThread.origin_path ? `${selectedThread.origin_path}에서 시작` : "사이트 방문"}
                </p>
              </div>
              <div className="ml-auto flex items-center gap-2">
                {statusChip(selectedThread)}
                {selectedThread.status === "open" && (
                  <button
                    onClick={() => patchThread("assign")}
                    className="rounded-lg bg-[#E8590C] px-3.5 py-2 text-[12.5px] font-semibold text-white transition hover:bg-[#C74E0A]"
                  >
                    내가 대응하기
                  </button>
                )}
                {selectedThread.status !== "closed" && (
                  <button
                    onClick={() => patchThread("close")}
                    className="rounded-lg border border-gray-200 px-3.5 py-2 text-[12.5px] text-[#6B7684] transition hover:border-gray-300"
                  >
                    상담 종료
                  </button>
                )}
              </div>
            </div>

            {/* 메시지 */}
            <div ref={scrollRef} className="min-h-[300px] flex-1 overflow-y-auto px-5 py-4">
              {messages.map((m) =>
                m.sender === "visitor" ? (
                  <div key={m.id} className="mb-3 flex flex-col items-start">
                    <div className="max-w-[75%] rounded-2xl rounded-bl-md bg-[#F1F3F7] px-3.5 py-2.5">
                      <p className="whitespace-pre-wrap text-[13.5px] leading-[1.6] text-[#191F28]">{m.body}</p>
                    </div>
                    <span className="mt-1 text-[10.5px] text-[#B0B8C1]">방문자 · {timeLabel(m.created_at)}</span>
                  </div>
                ) : (
                  <div key={m.id} className="mb-3 flex flex-col items-end">
                    <div className="max-w-[75%] rounded-2xl rounded-br-md bg-[#E8590C] px-3.5 py-2.5">
                      <p className="whitespace-pre-wrap text-[13.5px] leading-[1.6] text-white">{m.body}</p>
                    </div>
                    <span className="mt-1 text-[10.5px] text-[#B0B8C1]">
                      {m.admin_id === adminId ? "나" : "어드민"} · {timeLabel(m.created_at)}
                    </span>
                  </div>
                )
              )}
            </div>

            {/* 답장 입력 */}
            <div className="border-t border-gray-100 px-4 py-3">
              {selectedThread.status === "closed" ? (
                <p className="py-1 text-center text-[12.5px] text-[#8B95A1]">종료된 상담입니다. 답장하면 다시 열립니다.</p>
              ) : null}
              <div className="flex items-end gap-2">
                <textarea
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                      e.preventDefault();
                      sendReply();
                    }
                  }}
                  rows={1}
                  placeholder="답장을 입력하세요 (Enter 전송)"
                  className="max-h-28 flex-1 resize-none rounded-xl border border-gray-200 px-3.5 py-2.5 text-[13.5px] outline-none focus:border-[#E8590C]"
                />
                <button
                  onClick={sendReply}
                  disabled={!reply.trim() || sending}
                  className="h-[42px] rounded-xl bg-[#E8590C] px-4 text-[13px] font-semibold text-white transition hover:bg-[#C74E0A] disabled:opacity-40"
                >
                  전송
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
