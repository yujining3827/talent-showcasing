"use client";

import { useState } from "react";
import Link from "next/link";
import { gtmPush, getStoredUtm } from "@/lib/gtm";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* 서비스 소개서 받아보기 — 기업명·담당자·이메일 받고, 입력한 이메일로 소개서 PDF 발송 */
export default function BrochureModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [company, setCompany] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const canSubmit = !!(company.trim() && name.trim() && EMAIL_RE.test(email.trim()) && consent);
  const inputCls =
    "w-full rounded-md border border-[#E1E5EC] bg-white px-3.5 py-3 text-[15px] text-[#1B2233] placeholder:text-[#AEB6C4] transition focus:border-[#E8590C] focus:outline-none focus:ring-2 focus:ring-[#E8590C]/15";

  function close() {
    onClose();
    // 상태 초기화 (다음 오픈 대비)
    setTimeout(() => {
      setCompany("");
      setName("");
      setEmail("");
      setConsent(false);
      setDone(false);
      setError(null);
    }, 200);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/brochure-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company, name, email, consent, ...getStoredUtm() }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok || !d.ok) throw new Error(d.error || "요청에 실패했습니다.");
      gtmPush("lead_submit", { form: "brochure" });
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "요청 중 문제가 발생했어요.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-5" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/40" onClick={close} />
      <div className="relative w-full max-w-[400px] rounded-2xl bg-white p-7 shadow-[0_30px_90px_-30px_rgba(10,18,32,0.6)]">
        <button onClick={close} aria-label="닫기" className="absolute right-4 top-4 text-[20px] leading-none text-[#AEB6C4] transition hover:text-[#171E2D]">
          ×
        </button>

        {done ? (
          <div className="py-6 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#FFF1E8] text-[30px] text-[#E8590C]">✓</div>
            <h2 className="mt-5 text-[19px] font-bold text-[#171E2D]">이메일로 소개서를 보내드렸어요</h2>
            <p className="mt-2 text-[14px] leading-[1.6] text-[#5B667A]">
              <span className="font-semibold text-[#3A4356]">{email.trim()}</span> 로 소개서 PDF를 보냈습니다.<br />
              메일이 안 보이면 스팸함도 확인해주세요.
            </p>
            <button
              onClick={close}
              className="mt-5 inline-flex h-11 items-center justify-center rounded-md bg-[#E8590C] px-6 text-[14px] font-semibold text-white transition hover:bg-[#C74E0A]"
            >
              확인
            </button>
          </div>
        ) : (
          <form onSubmit={submit}>
            <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#E8590C]">서비스 소개서</p>
            <h2 className="mt-1.5 text-[20px] font-bold text-[#171E2D]">공고마감 소개서 받아보기</h2>
            <p className="mt-1.5 text-[13.5px] leading-[1.6] text-[#8A93A5]">간단한 정보만 남겨주시면 입력하신 이메일로 소개서를 보내드려요.</p>

            <div className="mt-5 flex flex-col gap-3">
              <input className={inputCls} value={company} onChange={(e) => setCompany(e.target.value)} placeholder="기업명" autoFocus />
              <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="담당자명" />
              <input className={inputCls} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="이메일" />
            </div>

            <label className="mt-4 flex cursor-pointer items-start gap-2.5">
              <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-[3px] h-4 w-4 shrink-0 cursor-pointer accent-[#E8590C]" />
              <span className="text-[12.5px] leading-[1.55] text-[#59657A]">
                <span className="font-semibold text-[#3A4356]">[필수]</span> 소개서 발송·상담을 위한 개인정보 수집·이용에 동의합니다.{" "}
                <Link href="/privacy" target="_blank" className="underline underline-offset-2 hover:text-[#E8590C]">
                  자세히
                </Link>
              </span>
            </label>

            {error && <p className="mt-3 text-[13px] font-medium text-[#D92D20]">{error}</p>}

            <button
              type="submit"
              disabled={!canSubmit || submitting}
              className="mt-5 w-full rounded-md bg-[#E8590C] py-3.5 text-[15px] font-semibold text-white transition hover:bg-[#C74E0A] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {submitting ? "처리 중…" : "소개서 받기"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
