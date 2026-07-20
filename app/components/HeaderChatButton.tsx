"use client";

/* 모바일 헤더 우측 채팅 버튼 — 클릭 시 전역 FloatingChatbotButton에 open-chat 이벤트 전달 */
export default function HeaderChatButton() {
  return (
    <button
      type="button"
      aria-label="1:1 상담 채팅"
      onClick={() => window.dispatchEvent(new Event("open-chat"))}
      className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FFF1E8] text-[#E8590C] transition active:scale-95"
    >
      <svg width="20" height="20" viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <path
          d="M12 10h24a5 5 0 0 1 5 5v13a5 5 0 0 1-5 5h-8l-4 5-4-5h-8a5 5 0 0 1-5-5V15a5 5 0 0 1 5-5Z"
          fill="currentColor"
        />
        <circle cx="16.5" cy="21.5" r="2.5" fill="#FFF1E8" />
        <circle cx="24" cy="21.5" r="2.5" fill="#FFF1E8" />
        <circle cx="31.5" cy="21.5" r="2.5" fill="#FFF1E8" />
      </svg>
    </button>
  );
}
