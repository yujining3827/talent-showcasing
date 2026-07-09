"use client";

import Link from "next/link";
import { useState } from "react";
import { EMPTY_FORM, type PricingForm } from "@/app/components/pricing/types";
import ProgressBar from "@/app/components/pricing/ProgressBar";
import StepOne from "@/app/components/pricing/StepOne";
import StepTwo from "@/app/components/pricing/StepTwo";

/* ============================================================================
 *  가격 알아보기 / 인재 추천 요청 — 2-step 위저드
 *  - 폼 상태는 하나(PricingForm)로 관리, 스텝 전환해도 유지
 *  - TODO(추후): handleSubmit 안에서 Supabase 저장 + JD 있으면 추천 메일 발송 연동
 * ========================================================================== */
export default function PricingPage() {
  const [form, setForm] = useState<PricingForm>(EMPTY_FORM);
  const [step, setStep] = useState(1);
  const [jdFile, setJdFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const patch = (p: Partial<PricingForm>) => setForm((prev) => ({ ...prev, ...p }));

  // Step1 필수: 관심 직무(1개+) / Step2 필수: 성함·기업명·연락처
  const canNext = form.roles.length > 0;
  const canSubmit = !!(form.name.trim() && form.company.trim() && form.contact.trim());
  const hasJd = !!form.jdUrl.trim() || !!jdFile;

  function resetForm() {
    setForm(EMPTY_FORM);
    setJdFile(null);
    setStep(1);
    setDone(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (step === 1) {
      if (canNext) setStep(2); // Enter 입력 시에도 다음 단계로
      return;
    }
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    // TODO(추후): Supabase 저장 + (JD 있으면) 추천 인재 메일 발송
    //   payload = { ...form, jdType, jdFileName: jdFile?.name }
    await new Promise((r) => setTimeout(r, 500));
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
            채용비 50%,
            <br />
            검증된 인재를 만나보세요
          </h1>
          <p className="mt-5 text-[16px] leading-[1.7] text-[#5B667A]">
            간단한 정보만 남겨주시면 담당자가 빠르게 연락드립니다. <br />
            찾으시는 인재의 JD까지 남겨주시면,
            <br /> 조건에 맞는
            <span className="font-semibold text-[#E8590C]"> 맞춤 추천 인재</span>를 메일로 보내드려요.
          </p>
          <ul className="mt-8 space-y-3">
            {[
              "개발·마케팅·디자인·영업·CS 전 직군 채용",
              "채용 부담 없는 월 구독형 요금",
              "하루 8시간·주 40시간 풀타임 단독 채용",
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

        {/* 우: 스텝 폼 카드 */}
        <div className="rounded-2xl border border-[#EEF1F5] bg-white p-7 shadow-[0_24px_70px_-42px_rgba(10,18,32,0.5)] md:p-8">
          {done ? (
            <div className="flex min-h-[480px] flex-col items-center justify-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#FFF1E8] text-[28px] text-[#E8590C]">✓</div>
              <h2 className="mt-5 text-[22px] font-bold text-[#171E2D]">제출이 완료되었어요</h2>
              <p className="mt-2 text-[15px] leading-[1.6] text-[#5B667A]">
                담당자가 빠르게 연락드리겠습니다.
                <br />
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
            <form onSubmit={handleSubmit} className="flex flex-col">
              {/* 스텝 콘텐츠 (전환 애니메이션) */}
              <div key={step} className="animate-step-in">
                {step === 1 ? (
                  <StepOne form={form} patch={patch} onNext={() => canNext && setStep(2)} canNext={canNext} />
                ) : (
                  <StepTwo
                    form={form}
                    patch={patch}
                    jdFile={jdFile}
                    setJdFile={setJdFile}
                    onPrev={() => setStep(1)}
                    submitting={submitting}
                    canSubmit={canSubmit}
                  />
                )}
              </div>

              {/* 진행률 */}
              <div className="mt-8 border-t border-[#F1F3F7] pt-6">
                <ProgressBar step={step} total={2} />
              </div>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
