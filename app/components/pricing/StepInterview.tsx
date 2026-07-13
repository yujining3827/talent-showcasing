import { Field, Chip, ChipGroup } from "./ui";
import { inputClass, INTERVIEW_TIMES, type PricingForm } from "./types";

type Props = {
  form: PricingForm;
  patch: (p: Partial<PricingForm>) => void;
  onNext: () => void;
  canNext: boolean;
  talentName?: string;
  talentRole?: string;
};

/* Step (인재 특정 문의) — 가능한 면접 일정: 날짜별 시간대 복수 선택 + 면접방식 + 요청사항 */
export default function StepInterview({ form, patch, onNext, canNext, talentName, talentRole }: Props) {
  const slots = form.interviewSlots;
  const setSlot = (i: number, next: PricingForm["interviewSlots"][number]) =>
    patch({ interviewSlots: slots.map((s, idx) => (idx === i ? next : s)) });
  const addDate = () => patch({ interviewSlots: [...slots, { date: "", times: [] }] });
  const removeDate = (i: number) => patch({ interviewSlots: slots.filter((_, idx) => idx !== i) });
  const toggleTime = (i: number, t: string) => {
    const s = slots[i];
    setSlot(i, { ...s, times: s.times.includes(t) ? s.times.filter((x) => x !== t) : [...s.times, t] });
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-[19px] font-bold text-[#171E2D]">가능한 면접 시간</h2>
        {talentName && (
          <>
            <p className="mt-1 text-[14px] text-[#8A93A5]">
              <span className="font-semibold text-[#E8590C]">{talentName}</span>
              {talentRole ? ` · ${talentRole}` : ""} 인터뷰 일정을 입력해주세요.
            </p>
            <p className="mt-1.5 text-[13px] leading-[1.6] text-[#AEB6C4]">
              혹시 이 인재의 채용이 어렵더라도, 비슷한 조건의 인재를 함께 추천드릴게요.
            </p>
          </>
        )}
      </div>

      {/* 날짜별 카드 */}
      <div className="flex flex-col gap-4">
        {slots.map((slot, i) => (
          <div key={i} className="rounded-xl border border-[#E1E5EC] p-4">
            <div className="flex items-center gap-2">
              <input
                type="date"
                className={inputClass}
                value={slot.date}
                onChange={(e) => setSlot(i, { ...slot, date: e.target.value })}
              />
              {slots.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeDate(i)}
                  aria-label="날짜 삭제"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-[#E1E5EC] text-[#8A93A5] transition hover:border-[#E8590C] hover:text-[#E8590C]"
                >
                  ✕
                </button>
              )}
            </div>
            <div className="mt-3">
              <ChipGroup>
                {INTERVIEW_TIMES.map((t) => (
                  <Chip key={t} label={t} selected={slot.times.includes(t)} onClick={() => toggleTime(i, t)} />
                ))}
              </ChipGroup>
            </div>
          </div>
        ))}
      </div>

      {/* 날짜 추가 */}
      <button
        type="button"
        onClick={addDate}
        className="rounded-md border border-dashed border-[#D6DBE3] bg-[#FAFBFC] py-3.5 text-[14px] font-semibold text-[#59657A] transition hover:border-[#E8590C] hover:text-[#E8590C]"
      >
        + 날짜 추가
      </button>

      {/* 요청사항 */}
      <Field label="요청사항" hint="선택">
        <textarea
          className={`${inputClass} min-h-[92px] resize-none`}
          placeholder="예: 가능하면 오후 시간대 선호합니다"
          value={form.interviewNote}
          onChange={(e) => patch({ interviewNote: e.target.value })}
        />
      </Field>

      <p className="text-[12px] leading-[1.6] text-[#B4BBC7]">
        가능한 시간대를 여러 개 선택하실수록 면접 조율이 빨라져요.
      </p>

      <button
        type="button"
        onClick={onNext}
        disabled={!canNext}
        className="mt-1 inline-flex items-center justify-center rounded-md bg-[#E8590C] px-6 py-4 text-[16px] font-semibold text-white transition hover:bg-[#C74E0A] disabled:cursor-not-allowed disabled:opacity-40"
      >
        다음 →
      </button>
    </div>
  );
}
