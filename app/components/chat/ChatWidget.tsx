"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/* ============================================================================
 *  방문자 1:1 채팅 위젯 — FAB 클릭으로 열림
 *  - 익명 시작: visitorId(랜덤 uuid)를 localStorage에 저장해 식별
 *  - 폴링(2.5초)으로 새 메시지 수신 (열려있는 동안만)
 *  - 어드민 응답 3분 없음 → "상담 몰림" 안내 / 6분 없음 → 연락처 남기기 유도
 * ========================================================================== */

type ChatMessage = {
  id: number;
  sender: "visitor" | "admin";
  body: string;
  created_at: string;
};

const VISITOR_KEY = "ggmg_chat_visitor";
const THREAD_KEY = "ggmg_chat_thread";
const POLL_MS = 2500;
const BUSY_MS = 3 * 60 * 1000; // 3분: 상담 몰림 안내
const CONTACT_MS = 6 * 60 * 1000; // 6분: 연락처 유도

function getVisitorId(): string {
  let id = localStorage.getItem(VISITOR_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(VISITOR_KEY, id);
  }
  return id;
}

function timeLabel(iso: string) {
  return new Date(iso).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
}

export default function ChatWidget({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [hasContact, setHasContact] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactName, setContactName] = useState("");
  const [contactValue, setContactValue] = useState("");
  const [contactSaved, setContactSaved] = useState(false);

  const threadIdRef = useRef<string | null>(null);
  const visitorIdRef = useRef<string>("");
  const lastIdRef = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      const el = scrollRef.current;
      if (el) el.scrollTop = el.scrollHeight;
    });
  }, []);

  // 폴링: 새 메시지 수신
  const poll = useCallback(async () => {
    const threadId = threadIdRef.current;
    if (!threadId) return;
    try {
      const res = await fetch(
        `/api/chat?threadId=${threadId}&visitorId=${visitorIdRef.current}&after=${lastIdRef.current}`
      );
      if (!res.ok) return;
      const data = await res.json();
      setHasContact(!!data.thread?.hasContact);
      if (Array.isArray(data.messages) && data.messages.length > 0) {
        setMessages((prev) => {
          const seen = new Set(prev.map((m) => m.id));
          const fresh = data.messages.filter((m: ChatMessage) => !seen.has(m.id));
          return fresh.length ? [...prev, ...fresh] : prev;
        });
        lastIdRef.current = Math.max(lastIdRef.current, ...data.messages.map((m: ChatMessage) => m.id));
        scrollToBottom();
      }
    } catch {
      /* 네트워크 오류는 다음 폴링에서 재시도 */
    } finally {
      setNow(Date.now());
    }
  }, [scrollToBottom]);

  // 열릴 때: 식별값 준비 + 기존 대화 복원 + 폴링 시작
  useEffect(() => {
    if (!open) return;
    visitorIdRef.current = getVisitorId();
    const saved = localStorage.getItem(THREAD_KEY);
    if (saved && !threadIdRef.current) {
      threadIdRef.current = saved;
      lastIdRef.current = 0;
      setMessages([]);
    }
    poll();
    const id = setInterval(poll, POLL_MS);
    return () => clearInterval(id);
  }, [open, poll]);

  async function send() {
    const text = input.trim();
    if (!text || sending) return;
    setSending(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visitorId: visitorIdRef.current,
          threadId: threadIdRef.current,
          body: text,
          path: window.location.pathname,
        }),
      });
      if (!res.ok) return;
      const data = await res.json();
      threadIdRef.current = data.threadId;
      localStorage.setItem(THREAD_KEY, data.threadId);
      if (data.message) {
        setMessages((prev) => [...prev, data.message]);
        lastIdRef.current = Math.max(lastIdRef.current, data.message.id);
      }
      setInput("");
      setNow(Date.now());
      scrollToBottom();
    } finally {
      setSending(false);
    }
  }

  async function saveContact() {
    const contact = contactValue.trim();
    if (!contact || !threadIdRef.current) return;
    const res = await fetch("/api/chat", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        visitorId: visitorIdRef.current,
        threadId: threadIdRef.current,
        name: contactName,
        contact,
      }),
    });
    if (res.ok) {
      setHasContact(true);
      setContactSaved(true);
      setShowContactForm(false);
    }
  }

  // 대기 상태 계산: 마지막 방문자 메시지 이후 어드민 응답이 없을 때 경과 시간
  const lastVisitorMsg = [...messages].reverse().find((m) => m.sender === "visitor");
  const answeredAfter = lastVisitorMsg
    ? messages.some((m) => m.sender === "admin" && m.id > lastVisitorMsg.id)
    : true;
  const waitMs = lastVisitorMsg && !answeredAfter ? now - new Date(lastVisitorMsg.created_at).getTime() : 0;
  const showBusy = waitMs >= BUSY_MS;
  const nudgeContact = waitMs >= CONTACT_MS && !hasContact && !contactSaved;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9998] sm:inset-auto sm:bottom-[104px] sm:right-6 sm:h-[540px] sm:w-[372px]">
      <div className="flex h-full w-full flex-col overflow-hidden bg-white shadow-[0_24px_70px_-20px_rgba(10,18,32,0.45)] sm:rounded-2xl sm:border sm:border-[#EEF1F5]">
        {/* 헤더 */}
        <div className="flex items-center gap-2.5 border-b border-[#F1F3F7] bg-white px-4 py-3.5">
          <span className="h-2 w-2 rounded-full bg-[#12B76A]" />
          <div className="min-w-0">
            <p className="text-[14.5px] font-bold text-[#171E2D]">공고마감 1:1 상담</p>
            <p className="text-[11.5px] text-[#8A93A5]">보통 몇 분 안에 답변드려요</p>
          </div>
          <button
            type="button"
            aria-label="채팅 닫기"
            onClick={onClose}
            className="ml-auto flex h-8 w-8 items-center justify-center rounded-lg text-[#8A93A5] transition hover:bg-[#F1F3F7]"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M4 4l8 8M12 4l-8 8" />
            </svg>
          </button>
        </div>

        {/* 메시지 영역 */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
          {/* 환영 메시지 (고정 안내) */}
          <div className="mb-3 max-w-[85%] rounded-2xl rounded-bl-md bg-[#FFF1E8] px-3.5 py-2.5">
            <p className="text-[13.5px] leading-[1.6] text-[#171E2D]">
              안녕하세요! 공고마감입니다 🙌
              <br />
              궁금한 내용을 남겨주시면 담당자가 바로 답변드려요.
            </p>
          </div>

          {messages.map((m) =>
            m.sender === "visitor" ? (
              <div key={m.id} className="mb-3 flex flex-col items-end">
                <div className="max-w-[85%] rounded-2xl rounded-br-md bg-[#E8590C] px-3.5 py-2.5">
                  <p className="whitespace-pre-wrap text-[13.5px] leading-[1.6] text-white">{m.body}</p>
                </div>
                <span className="mt-1 text-[10.5px] text-[#AEB6C4]">{timeLabel(m.created_at)}</span>
              </div>
            ) : (
              <div key={m.id} className="mb-3 flex flex-col items-start">
                <div className="max-w-[85%] rounded-2xl rounded-bl-md bg-[#F1F3F7] px-3.5 py-2.5">
                  <p className="whitespace-pre-wrap text-[13.5px] leading-[1.6] text-[#171E2D]">{m.body}</p>
                </div>
                <span className="mt-1 text-[10.5px] text-[#AEB6C4]">공고마감 매니저 · {timeLabel(m.created_at)}</span>
              </div>
            )
          )}

          {/* 3분 경과: 상담 몰림 안내 */}
          {showBusy && (
            <div className="mb-3 rounded-xl border border-[#F2DFD1] bg-[#FFF9F5] px-3.5 py-2.5">
              <p className="text-[12.5px] leading-[1.6] text-[#7A4A21]">
                지금 상담이 몰리고 있어요. 순서대로 답변드리고 있으니 잠시만 기다려주세요 🙏
              </p>
            </div>
          )}

          {/* 6분 경과: 연락처 유도 */}
          {nudgeContact && !showContactForm && (
            <div className="mb-3 rounded-xl border border-[#F2DFD1] bg-[#FFF9F5] px-3.5 py-3">
              <p className="text-[12.5px] leading-[1.6] text-[#7A4A21]">
                답변이 늦어지고 있어요. 연락처를 남겨주시면 확인 후 바로 연락드릴게요.
              </p>
              <button
                type="button"
                onClick={() => setShowContactForm(true)}
                className="mt-2 rounded-lg bg-[#E8590C] px-3.5 py-1.5 text-[12.5px] font-semibold text-white transition hover:bg-[#C74E0A]"
              >
                연락처 남기기
              </button>
            </div>
          )}

          {/* 연락처 입력 폼 */}
          {showContactForm && (
            <div className="mb-3 rounded-xl border border-[#EEF1F5] bg-white p-3.5 shadow-sm">
              <p className="text-[12.5px] font-semibold text-[#171E2D]">연락처를 남겨주세요</p>
              <input
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="성함 (선택)"
                className="mt-2 w-full rounded-lg border border-[#E1E5EC] px-3 py-2 text-[13px] outline-none focus:border-[#E8590C]"
              />
              <input
                value={contactValue}
                onChange={(e) => setContactValue(e.target.value)}
                placeholder="이메일 또는 전화번호"
                className="mt-1.5 w-full rounded-lg border border-[#E1E5EC] px-3 py-2 text-[13px] outline-none focus:border-[#E8590C]"
              />
              <div className="mt-2 flex gap-1.5">
                <button
                  type="button"
                  onClick={saveContact}
                  disabled={!contactValue.trim()}
                  className="flex-1 rounded-lg bg-[#E8590C] py-2 text-[12.5px] font-semibold text-white transition hover:bg-[#C74E0A] disabled:opacity-40"
                >
                  남기기
                </button>
                <button
                  type="button"
                  onClick={() => setShowContactForm(false)}
                  className="rounded-lg border border-[#E1E5EC] px-3 py-2 text-[12.5px] text-[#5B667A]"
                >
                  취소
                </button>
              </div>
            </div>
          )}

          {contactSaved && (
            <div className="mb-3 rounded-xl bg-[#F1F3F7] px-3.5 py-2.5">
              <p className="text-[12.5px] text-[#5B667A]">연락처가 전달됐어요. 확인 후 연락드릴게요!</p>
            </div>
          )}
        </div>

        {/* 입력 바 */}
        <div className="border-t border-[#F1F3F7] bg-white px-3 py-3">
          <div className="flex items-end gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                  e.preventDefault();
                  send();
                }
              }}
              rows={1}
              placeholder="메시지를 입력하세요"
              className="max-h-24 flex-1 resize-none rounded-xl border border-[#E1E5EC] px-3.5 py-2.5 text-[13.5px] outline-none focus:border-[#E8590C]"
            />
            <button
              type="button"
              onClick={send}
              disabled={!input.trim() || sending}
              aria-label="전송"
              className="flex h-[42px] w-[42px] items-center justify-center rounded-xl bg-[#E8590C] text-white transition hover:bg-[#C74E0A] disabled:opacity-40"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z" />
              </svg>
            </button>
          </div>
          {!hasContact && !contactSaved && messages.length > 0 && !showContactForm && (
            <button
              type="button"
              onClick={() => setShowContactForm(true)}
              className="mt-1.5 text-[11.5px] text-[#8A93A5] underline-offset-2 hover:text-[#E8590C] hover:underline"
            >
              자리를 비우시나요? 연락처를 남겨주시면 답변을 보내드려요
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
