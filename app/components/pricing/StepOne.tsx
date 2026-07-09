import { Chip, ChipGroup, InlineField } from "./ui";
import { ROLE_OPTIONS, WORKTYPE_OPTIONS, DURATION_OPTIONS, STARTTIME_OPTIONS, INDUSTRY_OPTIONS, type PricingForm } from "./types";

type Props = {
  form: PricingForm;
  patch: (p: Partial<PricingForm>) => void;
  onNext: () => void;
  canNext: boolean;
};

/* Step 1 — 채용 요건 (관심직무·근무기간·근무시간·채용시점·기업업종 chip) */
export default function StepOne({ form, patch, onNext, canNext }: Props) {
  const toggleRole = (r: string) =>
    patch({ roles: form.roles.includes(r) ? form.roles.filter((x) => x !== r) : [...form.roles, r] });
  const toggleIndustry = (v: string) =>
    patch({ industry: form.industry.includes(v) ? form.industry.filter((x) => x !== v) : [...form.industry, v] });
  const pickSingle = (key: "workType" | "duration" | "startTime", v: string) => patch({ [key]: form[key] === v ? "" : v });

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-[19px] font-bold text-[#171E2D]">채용 요건</h2>
        <p className="mt-1 text-[14px] text-[#8A93A5]">어떤 인재를 찾으시나요? 조건을 선택해주세요.</p>
      </div>

      <InlineField label="관심 직무" required hint="복수 선택">
        <ChipGroup>
          {ROLE_OPTIONS.map((r) => (
            <Chip key={r} label={r} selected={form.roles.includes(r)} onClick={() => toggleRole(r)} />
          ))}
        </ChipGroup>
      </InlineField>

      <InlineField label="근무 기간">
        <ChipGroup>
          {DURATION_OPTIONS.map((v) => (
            <Chip key={v} label={v} selected={form.duration === v} onClick={() => pickSingle("duration", v)} />
          ))}
        </ChipGroup>
      </InlineField>

      <InlineField label="근무 시간">
        <ChipGroup>
          {WORKTYPE_OPTIONS.map((v) => (
            <Chip key={v} label={v} selected={form.workType === v} onClick={() => pickSingle("workType", v)} />
          ))}
        </ChipGroup>
      </InlineField>

      <InlineField label="채용 시점">
        <ChipGroup>
          {STARTTIME_OPTIONS.map((v) => (
            <Chip key={v} label={v} selected={form.startTime === v} onClick={() => pickSingle("startTime", v)} />
          ))}
        </ChipGroup>
      </InlineField>

      <InlineField label="기업 업종" hint="복수 선택">
        <ChipGroup>
          {INDUSTRY_OPTIONS.map((v) => (
            <Chip key={v} label={v} selected={form.industry.includes(v)} onClick={() => toggleIndustry(v)} />
          ))}
        </ChipGroup>
      </InlineField>

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
