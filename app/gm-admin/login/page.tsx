"use client";

import { useState } from "react";

export default function GmAdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!password || loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/gm-admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "로그인에 실패했습니다.");
      }
      const params = new URLSearchParams(window.location.search);
      window.location.href = params.get("next") || "/gm-admin";
    } catch (err) {
      setError(err instanceof Error ? err.message : "로그인 실패");
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F7F8FA] px-5">
      <form onSubmit={submit} className="w-full max-w-[380px] rounded-2xl border border-[#EEF1F5] bg-white p-8 shadow-[0_24px_70px_-42px_rgba(10,18,32,0.5)]">
        <div className="flex items-center gap-2">
          <img src="/logo-wordmark.png" alt="공고마감" className="h-8 w-auto" />
        </div>
        <h1 className="mt-6 text-[20px] font-bold text-[#171E2D]">공고마감 관리자</h1>
        <p className="mt-1 text-[13px] text-[#8A93A5]">비밀번호를 입력해주세요.</p>

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="비밀번호"
          autoFocus
          className="mt-5 w-full rounded-md border border-[#E1E5EC] bg-white px-3.5 py-3 text-[15px] text-[#1B2233] transition focus:border-[#E8590C] focus:outline-none focus:ring-2 focus:ring-[#E8590C]/15"
        />
        {error && <p className="mt-3 text-[13px] font-medium text-[#D92D20]">{error}</p>}

        <button
          type="submit"
          disabled={!password || loading}
          className="mt-5 w-full rounded-md bg-[#E8590C] py-3.5 text-[15px] font-semibold text-white transition hover:bg-[#C74E0A] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loading ? "확인 중…" : "로그인"}
        </button>
      </form>
    </main>
  );
}
