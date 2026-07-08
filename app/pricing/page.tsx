"use client";

import Link from "next/link";
import { useState } from "react";

/* ============================================================================
 *  가격 알아보기 / 인재 추천 요청 폼
 *  - 현재는 폼 UI만 (제출 시 완료 화면).
 *  - TODO(추후): handleSubmit 안에서 Supabase 저장 + JD 있으면 추천 메일 발송 연동.
 * ========================================================================== */

type JdType = "text" | "url" | "file";

type PricingForm = {
  name: string;
  company: string;
  contact: string;
  role: string;
  jd: string; // 텍스트 JD
  jdUrl: string; // URL JD
};

const EMPTY_FORM: PricingForm = { name: "", company: "", contact: "", role: "", jd: "", jdUrl: "" };

const JD_TABS: { key: JdType; label: string }[] = [
  { key: "text", label: "텍스트" },
  { key: "url", label: "URL" },
  { key: "file", label: "PDF 첨부" },
];

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
  const [jdType, setJdType] = useState<JdType>("text");
  const [jdFile, setJdFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const update = (key: keyof PricingForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const hasJd =
    (jdType === "text" && !!form.jd.trim()) ||
    (jdType === "url" && !!form.jdUrl.trim()) ||
    (jdType === "file" && !!jdFile);

  const canSubmit = form.name.trim() && form.company.trim() && form.contact.trim() && form.role.trim() && !submitting;

  function resetForm() {
    setForm(EMPTY_FORM);
    setJdType("text");
    setJdFile(null);
    setDone(false);
  }

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
        </div>
      </header>

      <div className="mx-auto grid max-w-[1100px] grid-cols-1 gap-12 px-5 py-16 md:grid-cols-[0.9fr_1.1fr] md:py-24">
        {/* 좌: 소개 */}
        <div className="md:pt-6">
          <Link href="/" className="mb-4 inline-flex items-center text-[14px] font-medium text-[#59657A] transition hover:text-[#E8590C]">
            ← 홈으로
          </Link>
          <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-[#E8590C]">Get started</p>
          <h1 className="mt-3 text-[32px] font-bold leading-[1.25] text-[#171E2D] md:text-[40px]">
            채용비 반값,<br />검증된 인재를 만나보세요
          </h1>
          <p className="mt-5 text-[16px] leading-[1.7] text-[#5B667A]">
            간단한 정보만 남겨주시면 담당자가 빠르게 연락드립니다. <br />찾으시는 인재의 JD까지 남겨주시면,<br /> 조건에 맞는
            <span className="font-semibold text-[#E8590C]"> 맞춤 추천 인재</span>를 메일로 보내드려요.
          </p>
          <ul className="mt-8 space-y-3">
            {[
              "개발·마케팅·디자인·영업·CS 전 직군 채용",
              "채용 부담 없는 월 구독형 요금",
              "하루 8시간·주 40시간 풀타임 단독 고용",
              "고학력·유사 경력의 검증된 인재",
              "평균 3주 내 채용 완료",
            ].map((t) => (
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
                {hasJd ? "남겨주신 JD 기반 추천 인재도 메일로 보내드릴게요." : "감사합니다."}
              </p>
              <button
                type="button"
                onClick={resetForm}
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
              <div>
                <div className="flex items-baseline justify-between">
                  <span className="text-[13px] font-semibold text-[#3A4356]">인재 JD</span>
                  <span className="text-[12px] text-[#8A93A5]">선택 · 남겨주시면 추천 인재를 메일로 보내드려요</span>
                </div>

                {/* 입력 방식 탭: 텍스트 / URL / PDF */}
                <div className="mt-2 flex gap-1 rounded-lg bg-[#F4F6F9] p-1">
                  {JD_TABS.map((tab) => {
                    const on = jdType === tab.key;
                    return (
                      <button
                        key={tab.key}
                        type="button"
                        onClick={() => setJdType(tab.key)}
                        aria-pressed={on}
                        className={`flex-1 rounded-md py-2 text-[13px] font-semibold transition ${
                          on ? "bg-white text-[#E8590C] shadow-[0_1px_4px_-1px_rgba(10,18,32,0.2)]" : "text-[#8A93A5] hover:text-[#3A4356]"
                        }`}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>

                {/* 방식별 입력 */}
                <div className="mt-3">
                  {jdType === "text" && (
                    <textarea
                      className={`${inputClass} min-h-[120px] resize-y`}
                      value={form.jd}
                      onChange={update("jd")}
                      placeholder="주요 업무, 필요 기술스택, 경력 요건 등을 자유롭게 적어주세요"
                    />
                  )}
                  {jdType === "url" && (
                    <input
                      type="url"
                      className={inputClass}
                      value={form.jdUrl}
                      onChange={update("jdUrl")}
                      placeholder="https://notion.so/... 채용공고 · JD 링크"
                    />
                  )}
                  {jdType === "file" && (
                    <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed border-[#D6DBE3] bg-[#FAFBFC] px-4 py-7 text-center transition hover:border-[#E8590C] hover:bg-[#FFF8F3]">
                      <span className="text-[13px] font-semibold text-[#3A4356]">
                        {jdFile ? jdFile.name : "PDF 파일 선택"}
                      </span>
                      <span className="text-[12px] text-[#AEB6C4]">{jdFile ? "다른 파일로 변경하려면 클릭" : "PDF · 최대 10MB"}</span>
                      <input
                        type="file"
                        accept="application/pdf,.pdf"
                        className="hidden"
                        onChange={(e) => setJdFile(e.target.files?.[0] ?? null)}
                      />
                    </label>
                  )}
                </div>
              </div>

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
