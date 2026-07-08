"use client";

import Link from "next/link";
import { useState } from "react";

/* ============================================================================
 *  가격 알아보기 / 인재 추천 요청 폼
 *  - 현재는 폼 UI만 (제출 시 완료 화면).
 *  - TODO(추후): handleSubmit 안에서 Supabase 저장 + JD 있으면 추천 메일 발송 연동.
 * ========================================================================== */

type PricingForm = {
  name: string;
  company: string;
  contact: string;
  role: string;
  jd: string;
};

const EMPTY_FORM: PricingForm = { name: "", company: "", contact: "", role: "", jd: "" };

function Field({
  label,
  required,
  children,
  hint,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="text-[13px] font-semibold text-[#3A4356]">
        {label}
        {required && <span className="ml-0.5 text-[#E8590C]">*</span>}
      </span>
      {hint && <span className="mt-0.5 block text-[12px] text-[#8A93A5]">{hint}</span>}
      <div className="mt-2">{children}</div>
    </label>
  );
}

const inputClass =
  "w-full rounded-md border border-[#E1E5EC] bg-white px-3.5 py-3 text-[15px] text-[#1B2233] placeholder:text-[#AEB6C4] transition focus:border-[#E8590C] focus:outline-none focus:ring-2 focus:ring-[#E8590C]/15";

export default function PricingPage() {
  const [form, setForm] = useState<PricingForm>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const update = (key: keyof PricingForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const canSubmit = form.name.trim() && form.company.trim() && form.contact.trim() && form.role.trim() && !submitting;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);

    // TODO(추후): Supabase 저장 + (form.jd 있으면) 추천 인재 메일 발송 API 연동
    //   await fetch("/api/pricing-inquiry", { method: "POST", body: JSON.stringify(form) })
    await new Promise((r) => setTimeout(r, 500)); // 임시: 제출 감 흉내

    setSubmitting(false);
    setDone(true);
  }

  return (
    <main className="min-h-screen bg-white text-[#171E2D]">
      {/* 헤더 */}
      <header className="border-b border-[#EEF1F5]">
        <div className="mx-auto flex h-[72px] max-w-[1100px] items-center justify-between px-5">
          <Link href="/" className="flex items-center" aria-label="공고마감 by LIKELION">
            <img src="/logo-wordmark.png" alt="공고마감 by LIKELION" className="h-9 w-auto" />
          </Link>
          <Link href="/" className="text-[14px] font-medium text-[#59657A] transition hover:text-[#E8590C]">
            ← 홈으로
          </Link>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1100px] grid-cols-1 gap-12 px-5 py-16 md:grid-cols-[0.9fr_1.1fr] md:py-24">
        {/* 좌: 소개 */}
        <div className="md:pt-6">
          <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-[#E8590C]">Get started</p>
          <h1 className="mt-3 text-[32px] font-bold leading-[1.25] text-[#171E2D] md:text-[40px]">
            채용비 반값,<br />검증된 인재를 만나보세요
          </h1>
          <p className="mt-5 text-[16px] leading-[1.7] text-[#5B667A]">
            간단한 정보만 남겨주시면 담당자가 빠르게 연락드립니다. 찾으시는 인재의 JD까지 남겨주시면, 조건에 맞는
            <span className="font-semibold text-[#E8590C]"> 맞춤 추천 인재</span>를 메일로 보내드려요.
          </p>
          <ul className="mt-8 space-y-3">
            {["국내 대비 최대 50% 절감된 채용 비용", "800+ 검증된 베트남 IT 인재 풀", "2주 내 맞춤 후보 전달"].map((t) => (
              <li key={t} className="flex items-start gap-2.5 text-[15px] text-[#3A4356]">
                <span className="mt-[3px] flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#E8590C] text-[10px] font-bold text-white">✓</span>
                {t}
              </li>
            ))}
          </ul>
        </div>

        {/* 우: 폼 / 완료 */}
        <div className="rounded-2xl border border-[#EEF1F5] bg-white p-7 shadow-[0_24px_70px_-42px_rgba(10,18,32,0.5)] md:p-8">
          {done ? (
            <div className="flex min-h-[420px] flex-col items-center justify-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#FFF1E8] text-[28px] text-[#E8590C]">✓</div>
              <h2 className="mt-5 text-[22px] font-bold text-[#171E2D]">제출이 완료되었어요</h2>
              <p className="mt-2 text-[15px] leading-[1.6] text-[#5B667A]">
                담당자가 빠르게 연락드리겠습니다.<br />
                {form.jd.trim() ? "남겨주신 JD 기반 추천 인재도 메일로 보내드릴게요." : "감사합니다."}
              </p>
              <button
                type="button"
                onClick={() => {
                  setForm(EMPTY_FORM);
                  setDone(false);
                }}
                className="mt-7 rounded-md border border-[#E1E5EC] px-5 py-2.5 text-[14px] font-semibold text-[#3A4356] transition hover:border-[#E8590C] hover:text-[#E8590C]"
              >
                새로 작성하기
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Field label="성함" required>
                  <input className={inputClass} value={form.name} onChange={update("name")} placeholder="홍길동" />
                </Field>
                <Field label="기업명" required>
                  <input className={inputClass} value={form.company} onChange={update("company")} placeholder="(주)공고마감" />
                </Field>
              </div>
              <Field label="연락처" required hint="전화번호 또는 이메일">
                <input className={inputClass} value={form.contact} onChange={update("contact")} placeholder="010-0000-0000 / name@company.com" />
              </Field>
              <Field label="관심 직무" required hint="예: 백엔드 2명, 프론트엔드 1명">
                <input className={inputClass} value={form.role} onChange={update("role")} placeholder="찾으시는 직무와 인원을 적어주세요" />
              </Field>
              <Field label="인재 JD" hint="선택 · 작성해주시면 조건에 맞는 추천 인재를 메일로 보내드려요">
                <textarea
                  className={`${inputClass} min-h-[120px] resize-y`}
                  value={form.jd}
                  onChange={update("jd")}
                  placeholder="주요 업무, 필요 기술스택, 경력 요건 등을 자유롭게 적어주세요"
                />
              </Field>

              <button
                type="submit"
                disabled={!canSubmit}
                className="mt-1 inline-flex items-center justify-center rounded-md bg-[#E8590C] px-6 py-4 text-[16px] font-semibold text-white transition hover:bg-[#C74E0A] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {submitting ? "제출 중…" : "제출하기"}
              </button>
              <p className="text-center text-[12px] text-[#AEB6C4]">제출 시 담당자가 남겨주신 연락처로 회신드립니다.</p>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
