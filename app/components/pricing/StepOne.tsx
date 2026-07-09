import { Field, Chip, ChipGroup } from "./ui";
import Accordion from "./Accordion";
import Dropdown from "./Dropdown";
import { ROLE_OPTIONS, WORKTYPE_OPTIONS, DURATION_OPTIONS, STARTTIME_OPTIONS, INDUSTRY_OPTIONS, type PricingForm } from "./types";

type Props = {
  form: PricingForm;
  patch: (p: Partial<PricingForm>) => void;
  onNext: () => void;
  canNext: boolean;
};

/* Step 1 — 채용 요건: 핵심 조건(관심직무·근무기간) + 아코디언(추가 조건) */
export default function StepOne({ form, patch, onNext, canNext }: Props) {
  const toggleRole = (r: string) =>
    patch({ roles: form.roles.includes(r) ? form.roles.filter((x) => x !== r) : [...form.roles, r] });
  const pickSingle = (key: "workType" | "duration" | "startTime", v: string) => patch({ [key]: form[key] === v ? "" : v });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-[19px] font-bold text-[#171E2D]">채용 요건</h2>
        <p className="mt-1 text-[14px] leading-[1.5] text-[#8A93A5]">
          어떤 인재를 찾으시나요?
          <br />
          핵심 조건만 먼저 선택해주세요.
        </p>
      </div>

      {/* 핵심 조건 (항상 노출) */}
      <Field label="관심 직무" required hint="복수 선택 가능">
        <ChipGroup>
          {ROLE_OPTIONS.map((r) => (
            <Chip key={r} label={r} selected={form.roles.includes(r)} onClick={() => toggleRole(r)} />
          ))}
        </ChipGroup>
      </Field>

      <Field label="근무 기간">
        <ChipGroup>
          {DURATION_OPTIONS.map((v) => (
            <Chip key={v} label={v} selected={form.duration === v} onClick={() => pickSingle("duration", v)} />
          ))}
        </ChipGroup>
      </Field>

      {/* Divider — 핵심 / 추가 조건 구분 */}
      <div className="border-t border-[#EEF1F5]" />

      {/* 추가 조건 (아코디언) */}
      <Accordion
        title={
          <>
            추가 조건 <span className="font-normal text-[#8A93A5]">(선택)</span>
          </>
        }
      >
        <Field label="근무 형태">
          <ChipGroup>
            {WORKTYPE_OPTIONS.map((v) => (
              <Chip key={v} label={v} selected={form.workType === v} onClick={() => pickSingle("workType", v)} />
            ))}
          </ChipGroup>
        </Field>

        <Field label="채용 시점">
          <ChipGroup>
            {STARTTIME_OPTIONS.map((v) => (
              <Chip key={v} label={v} selected={form.startTime === v} onClick={() => pickSingle("startTime", v)} />
            ))}
          </ChipGroup>
        </Field>

        <Field label="기업 업종">
          <Dropdown value={form.industry} onChange={(v) => patch({ industry: v })} options={INDUSTRY_OPTIONS} placeholder="업종 선택" />
        </Field>
      </Accordion>

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
