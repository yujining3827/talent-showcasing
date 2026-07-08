import Link from "next/link";

/* 챗봇 페이지 (플레이스홀더 — FAB 클릭 시 이동. 추후 실제 챗봇 UI로 교체) */
export default function ChatbotPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white px-5 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#FF6B00]">
        <svg width="34" height="34" viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <circle cx="35" cy="7.5" r="3" fill="white" />
          <path d="M33 10.5 L29 16" stroke="white" strokeWidth="2.6" strokeLinecap="round" />
          <path d="M12 13h24a5 5 0 0 1 5 5v11a5 5 0 0 1-5 5h-8l-4 5-4-5h-3a5 5 0 0 1-5-5V18a5 5 0 0 1 5-5Z" fill="white" />
          <rect x="19" y="21" width="4.4" height="8" rx="2.2" fill="#FF6B00" />
          <rect x="26.5" y="21" width="4.4" height="8" rx="2.2" fill="#FF6B00" />
        </svg>
      </div>
      <h1 className="mt-6 text-[24px] font-bold text-[#171E2D]">AI 챗봇 준비 중이에요</h1>
      <p className="mt-2 text-[15px] text-[#5B667A]">곧 인재 추천·문의를 도와드릴 챗봇이 열립니다.</p>
      <Link href="/" className="mt-8 rounded-sm bg-[#E8590C] px-6 py-3 text-[15px] font-semibold text-white transition hover:bg-[#C74E0A]">
        홈으로 돌아가기
      </Link>
    </main>
  );
}
