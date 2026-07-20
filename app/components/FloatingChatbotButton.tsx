"use client";

import { useEffect, useState } from "react";
import ChatWidget from "@/app/components/chat/ChatWidget";

/* ============================================================================
 *  Floating Chatbot Button (FAB) — 전 페이지 우측 하단 고정
 *  - 클릭 시 1:1 실시간 채팅 위젯(ChatWidget) 열림/닫힘 토글
 *  - 말풍선: 첫 접속 시(세션당 1회) 3.5초 자동 노출 → 사라짐 / 호버 시 표시
 *  - 아이콘: 로고 모양 흰색 인라인 SVG.
 *    투명 배경 흰색 아이콘이 준비되면 <svg>를
 *    <img src="/chatbot_logo.png" alt="" className="h-9 w-9 object-contain" /> 로 교체.
 * ========================================================================== */
export default function FloatingChatbotButton() {
  const [chatOpen, setChatOpen] = useState(false);
  const [autoShow, setAutoShow] = useState(false); // 첫 접속 자동 노출
  const [hovered, setHovered] = useState(false);

  // ?chat=1 또는 #chat 로 들어오면 채팅 자동 오픈 (이메일 '상담하기' 버튼 등)
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    if (sp.get("chat") === "1" || window.location.hash === "#chat") setChatOpen(true);
  }, []);

  // 헤더(모바일) 채팅 버튼 등에서 open-chat 이벤트로 열기
  useEffect(() => {
    const open = () => setChatOpen(true);
    window.addEventListener("open-chat", open);
    return () => window.removeEventListener("open-chat", open);
  }, []);

  useEffect(() => {
    // 페이지 로드 시 자동 노출 + 이후 9초마다 3초씩 살짝살짝 다시 노출
    setAutoShow(true);
    const hide = setTimeout(() => setAutoShow(false), 3500);
    let inner: ReturnType<typeof setTimeout>;
    const cycle = setInterval(() => {
      setAutoShow(true);
      inner = setTimeout(() => setAutoShow(false), 3000);
    }, 9000);
    return () => {
      clearTimeout(hide);
      clearInterval(cycle);
      clearTimeout(inner);
    };
  }, []);

  const bubbleVisible = (autoShow || hovered) && !chatOpen;

  return (
    <div
      className="fixed bottom-4 right-4 z-[9999] sm:bottom-6 sm:right-6"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <ChatWidget open={chatOpen} onClose={() => setChatOpen(false)} />

      {/* 말풍선 — 모바일에서는 인재 카드 등 콘텐츠를 가려서 데스크톱에서만 노출 */}
      <div
        className={`absolute right-full top-1/2 mr-3 hidden -translate-y-1/2 whitespace-nowrap rounded-2xl border border-[#EEF1F5] bg-white px-4 py-2.5 text-[14px] font-semibold text-[#171E2D] shadow-[0_10px_30px_-8px_rgba(10,18,32,0.25)] transition-all duration-300 ease-out sm:block ${
          bubbleVisible ? "translate-x-0 opacity-100" : "pointer-events-none translate-x-2 opacity-0"
        }`}
      >
        상담사와 1:1로 대화해보세요
        {/* 오른쪽 꼬리 */}
        <span className="absolute right-[-5px] top-1/2 h-2.5 w-2.5 -translate-y-1/2 rotate-45 border-b border-r border-[#EEF1F5] bg-white" />
      </div>

      {/* 버튼 */}
      <button
        type="button"
        aria-label={chatOpen ? "채팅 닫기" : "1:1 상담 열기"}
        onClick={() => setChatOpen((v) => !v)}
        className={`hidden h-[64px] w-[64px] cursor-pointer items-center justify-center rounded-full bg-[#FF6B00] shadow-[0_12px_30px_rgba(255,107,0,0.25)] transition-all duration-200 ease-in-out hover:scale-[1.08] hover:shadow-[0_16px_42px_rgba(255,107,0,0.42)] active:scale-[0.96] md:flex md:h-[76px] md:w-[76px]`}
      >
        {/* 흰색 1:1 대화 아이콘 (말풍선 + 타이핑 점 3개 — 상담사 대화 느낌) */}
        <svg width="40" height="40" viewBox="0 0 48 48" fill="none" aria-hidden="true" className="h-9 w-9 sm:h-10 sm:w-10">
          <path
            d="M12 10h24a5 5 0 0 1 5 5v13a5 5 0 0 1-5 5h-8l-4 5-4-5h-8a5 5 0 0 1-5-5V15a5 5 0 0 1 5-5Z"
            fill="white"
          />
          <circle cx="16.5" cy="21.5" r="2.5" fill="#FF6B00" />
          <circle cx="24" cy="21.5" r="2.5" fill="#FF6B00" />
          <circle cx="31.5" cy="21.5" r="2.5" fill="#FF6B00" />
        </svg>
      </button>
    </div>
  );
}
