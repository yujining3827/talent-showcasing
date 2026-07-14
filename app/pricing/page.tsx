"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { EMPTY_FORM, type PricingForm } from "@/app/components/pricing/types";
import ProgressBar from "@/app/components/pricing/ProgressBar";
import StepInterview from "@/app/components/pricing/StepInterview";
import StepOne from "@/app/components/pricing/StepOne";
import StepTwo from "@/app/components/pricing/StepTwo";
import SiteFooter from "@/app/components/SiteFooter";
import SiteHeader from "@/app/components/SiteHeader";
import { HERO_TALENTS, type HeroTalent } from "@/lib/heroTalents";
import { gtmPush, getStoredUtm } from "@/lib/gtm";

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
  const [proceeding, setProceeding] = useState(false);
  const [leadId, setLeadId] = useState<string | null>(null); // 1뎁스 제출 시 생성된 리드 id
  const [done, setDone] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  // 상세 페이지 "이 인재 채용 문의하기"로 진입 시 talent 정보(쿼리) → 맨 앞 면접일정 스텝 추가
  const [talent, setTalent] = useState<{ id: string; name: string; role: string } | null>(null);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const id = p.get("talentId");
    if (id) setTalent({ id, name: p.get("talentName") || "", role: p.get("talentRole") || "" });
  }, []);

  // 폼 첫 입력·선택 시 lead_form_open 1회 발화
  const formOpenedRef = useRef(false);
  const patch = (p: Partial<PricingForm>) => {
    if (!formOpenedRef.current) {
      formOpenedRef.current = true;
      gtmPush("lead_form_open", { is_talent_inquiry: !!talent });
    }
    setForm((prev) => ({ ...prev, ...p }));
  };

  // Step 2 진입 시 lead_form_step2 1회 발화
  const step2FiredRef = useRef(false);
  useEffect(() => {
    if (step === 2 && !step2FiredRef.current) {
      step2FiredRef.current = true;
      gtmPush("lead_form_step2", { is_talent_inquiry: !!talent });
    }
  }, [step, talent]);

  // 진입 경로에 따라 스텝 구성 (talent 문의: 면접일정→채용요건→담당자 / 일반: 채용요건→담당자)
  const isTalentInquiry = !!talent;
  // 하드코딩 히어로 인재면 상세 요약을 함께 노출 (뎁스1에서 다시 보여주기)
  const talentData: HeroTalent | null = talent ? HERO_TALENTS.find((t) => t.id === talent.id) ?? null : null;
  // 인재 문의: [인재요약+담당자정보 → 채용요건+JD(제출)] / 일반: [채용요건 → 담당자정보(제출)]
  const steps = isTalentInquiry ? (["interview", "requirements"] as const) : (["requirements", "contact"] as const);
  const total = steps.length;
  const stepKey = steps[step - 1];
  const isLast = step === total;

  const contactOk = !!(form.name.trim() && form.company.trim() && form.contact.trim() && form.consent);
  const canGoNext = stepKey === "interview" ? contactOk : stepKey === "requirements" ? form.roles.length > 0 : false;
  const canSubmit = contactOk;

  function resetForm() {
    setForm(EMPTY_FORM);
    setJdFile(null);
    setStep(1);
    setLeadId(null);
    setDone(false);
    setSubmitError(null);
  }

  // 1뎁스(인재 문의) 제출하기 → 담당자 정보로 리드 즉시 생성 + Slack 접수 알림 → 2뎁스(요건)로 이동
  // (2뎁스에서 이탈해도 리드는 이미 접수됨)
  async function handleProceed() {
    if (!contactOk || proceeding) return;
    setProceeding(true);
    setSubmitError(null);
    try {
      const payload = {
        name: form.name,
        company: form.company,
        contact: form.contact,
        consent: form.consent,
        talentId: talent?.id ?? null,
        talentName: talent?.name ?? null,
        talentRole: talent?.role ?? null,
        ...getStoredUtm(),
      };
      const res = await fetch("/api/pricing-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const d = await res.json().catch(() => ({}));
      if (res.ok && d.id) setLeadId(d.id);
      gtmPush("lead_submit", { is_talent_inquiry: true, talent_id: talent?.id ?? null });
    } catch {
      /* 생성 실패해도 2뎁스로 진행 — 최종 제출에서 재시도(POST) */
    } finally {
      setProceeding(false);
      setStep((s) => s + 1);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isLast) {
      if (canGoNext) setStep(step + 1); // Enter/다음 → 다음 스텝
      return;
    }
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      if (leadId) {
        // 1뎁스에서 이미 접수된 리드 → 채용 요건(+JD)만 업데이트(PATCH)
        const payload = {
          id: leadId,
          name: form.name,
          company: form.company,
          roles: form.roles,
          workType: form.workType,
          duration: form.duration,
          startTime: form.startTime,
          industry: form.industry,
          jd: form.jd,
          jdUrl: form.jdUrl,
          jdFileName: jdFile?.name ?? null,
        };
        const fd = new FormData();
        fd.append("data", JSON.stringify(payload));
        if (jdFile) fd.append("jdFile", jdFile);
        const res = await fetch("/api/pricing-request", { method: "PATCH", body: fd });
        if (!res.ok) throw new Error((await res.json().catch(() => ({})))?.error || "제출에 실패했습니다.");
        setDone(true);
      } else {
        // 일반 플로우(또는 1뎁스 생성 실패) → 전체 POST (DB + Slack)
        const payload = {
          ...form,
          jdFileName: jdFile?.name ?? null,
          talentId: talent?.id ?? null,
          talentName: talent?.name ?? null,
          talentRole: talent?.role ?? null,
          interviewSlots: isTalentInquiry ? form.interviewSlots.filter((s) => s.date && s.times.length > 0) : [],
          ...getStoredUtm(),
        };
        const fd = new FormData();
        fd.append("data", JSON.stringify(payload));
        if (jdFile) fd.append("jdFile", jdFile);
        const res = await fetch("/api/pricing-request", { method: "POST", body: fd });
        if (!res.ok) throw new Error((await res.json().catch(() => ({})))?.error || "제출에 실패했습니다.");
        setDone(true);
        gtmPush("lead_submit", { is_talent_inquiry: !!talent, talent_id: talent?.id ?? null });
      }
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "제출 중 문제가 발생했어요. 잠시 후 다시 시도해주세요.");
    } finally {
      setSubmitting(false);
    }
  }

  // 제출 완료 — 헤더만 있는 전체 화면
  if (done) {
    return (
      <main className="flex min-h-screen flex-col bg-white text-[#171E2D]">
        <header className="border-b border-[#EEF1F5]">
          <div className="mx-auto flex h-[72px] max-w-[1100px] items-center justify-between px-5">
            <Link href="/" className="flex items-center" aria-label="공고마감 by LIKELION">
              <img src="/logo-wordmark.png" alt="공고마감 by LIKELION" className="h-9 w-auto" />
            </Link>
          </div>
        </header>
        <div className="flex flex-1 flex-col items-center justify-center px-5 py-20 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#FFF1E8] text-[36px] text-[#E8590C]">✓</div>
          <h1 className="mt-7 text-[30px] font-bold text-[#171E2D] md:text-[36px]">제출이 완료되었어요</h1>
          <p className="mt-3 max-w-[460px] text-[16px] leading-[1.7] text-[#5B667A]">
            제출해주신 내용을 꼼꼼히 검토해,
            <br />
            딱 맞는 인재를 곧 제안드릴게요.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/"
              className="inline-flex h-12 items-center justify-center rounded-md bg-[#E8590C] px-7 text-[15px] font-semibold text-white transition hover:bg-[#C74E0A]"
            >
              홈으로 돌아가기
            </Link>
            <button
              type="button"
              onClick={resetForm}
              className="inline-flex h-12 items-center justify-center rounded-md border border-[#E1E5EC] px-7 text-[15px] font-semibold text-[#3A4356] transition hover:border-[#E8590C] hover:text-[#E8590C]"
            >
              새로 작성하기
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white text-[#171E2D]">
      <SiteHeader />

      <div className="mx-auto grid max-w-[1100px] grid-cols-1 gap-12 px-5 py-16 md:grid-cols-[0.9fr_1.1fr] md:py-24">
        {/* 좌: 소개 */}
        <div className="md:pt-6">
          <Link href="/" className="mb-4 inline-flex items-center text-[14px] font-medium text-[#59657A] transition hover:text-[#E8590C]">
            ← 홈으로
          </Link>
          <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-[#E8590C]">
            {isTalentInquiry ? "인재 상담 요청" : "인재 추천 요청"}
          </p>
          <h1 className="mt-3 text-[32px] font-bold leading-[1.25] text-[#171E2D] md:text-[40px]">
            인건비 50%,
            <br />
            검증된 인재를 만나보세요
          </h1>
          {isTalentInquiry ? (
            <p className="mt-5 text-[16px] leading-[1.7] text-[#5B667A]">
              관심 있는 인재를 선택 후
              <br />
              담당자 정보를 남겨주시면
              <br />
              인재 정보를 메일로 전달 드립니다.
              <br />
              <span className="text-[14px] font-semibold text-[#E8590C]">(채용비용, 면접 가능일, 출근 희망일)</span>
            </p>
          ) : (
            <p className="mt-5 text-[16px] leading-[1.7] text-[#5B667A]">
              간단한 정보만 남겨주시면 담당자가 빠르게 연락드립니다. <br />
              찾으시는 인재의 JD까지 남겨주시면,
              <br /> 조건에 맞는
              <span className="font-semibold text-[#E8590C]"> 맞춤 추천 인재</span>를 메일로 보내드려요.
            </p>
          )}
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
          <form onSubmit={handleSubmit} className="flex flex-col">
              {/* 스텝 콘텐츠 (전환 애니메이션) */}
              <div key={step} className="animate-step-in">
                {stepKey === "interview" ? (
                  <StepInterview
                    form={form}
                    patch={patch}
                    onProceed={handleProceed}
                    submitting={proceeding}
                    canSubmit={canSubmit}
                    talentName={talent?.name}
                    talentRole={talent?.role}
                    talentData={talentData}
                  />
                ) : stepKey === "requirements" ? (
                  <StepOne
                    form={form}
                    patch={patch}
                    jdFile={jdFile}
                    setJdFile={setJdFile}
                    onNext={() => canGoNext && setStep(step + 1)}
                    canNext={canGoNext}
                    isLast={isLast}
                    onPrev={() => setStep(step - 1)}
                    submitting={submitting}
                    canSubmit={canSubmit}
                  />
                ) : (
                  <StepTwo
                    form={form}
                    patch={patch}
                    onPrev={() => setStep(step - 1)}
                    submitting={submitting}
                    canSubmit={canSubmit}
                  />
                )}
              </div>

              {submitError && isLast && (
                <p className="mt-4 rounded-md bg-[#FEF3F2] px-3.5 py-2.5 text-[13px] font-medium text-[#D92D20]">{submitError}</p>
              )}

              {/* 진행률 — 일반 플로우에서만 (talent 문의는 1뎁스 제출이라 생략) */}
              {!isTalentInquiry && (
                <div className="mt-8 border-t border-[#F1F3F7] pt-6">
                  <ProgressBar step={step} total={total} />
                </div>
              )}
            </form>
        </div>
      </div>
      <SiteFooter />
    </main>
  );
}
