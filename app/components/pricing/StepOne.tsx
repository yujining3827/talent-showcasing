import { Field, Chip, ChipGroup } from "./ui";
import Accordion from "./Accordion";
import Dropdown from "./Dropdown";
import { ROLE_OPTIONS, WORKTYPE_OPTIONS, DURATION_OPTIONS, STARTTIME_OPTIONS, INDUSTRY_OPTIONS, inputClass, type PricingForm } from "./types";

type Props = {
  form: PricingForm;
  patch: (p: Partial<PricingForm>) => void;
  jdFile: File | null;
  setJdFile: (f: File | null) => void;
  onNext: () => void;
  canNext: boolean;
  // 마지막 스텝일 때(인재 문의 플로우) — 이전/제출 버튼으로 렌더
  isLast?: boolean;
  onPrev?: () => void;
  submitting?: boolean;
  canSubmit?: boolean;
};

/* Step — 채용 요건: 핵심 조건(관심직무·근무기간) + 아코디언(추가 조건: 근무형태·시점·업종·인재 JD) */
export default function StepOne({ form, patch, jdFile, setJdFile, onNext, canNext, isLast, onPrev, submitting, canSubmit }: Props) {
  const toggleRole = (r: string) =>
    patch({ roles: form.roles.includes(r) ? form.roles.filter((x) => x !== r) : [...form.roles, r] });
  const pickSingle = (key: "workType" | "duration" | "startTime", v: string) => patch({ [key]: form[key] === v ? "" : v });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-[19px] font-bold text-[#171E2D]">
          {isLast ? (
            <>
              <span className="text-[#E8590C]">(선택)</span> 이런 인재를 찾고 있어요
            </>
          ) : (
            "채용 요건"
          )}
        </h2>
        <p className="mt-1 text-[14px] leading-[1.5] text-[#8A93A5]">
          {isLast ? (
            <>
              찾고 계신 인재 정보를 남겨주시면,
              <br />
              요건에 맞는 인재를 함께 추천드립니다
            </>
          ) : (
            <>
              어떤 인재를 찾으시나요?
              <br />
              핵심 조건만 먼저 선택해주세요.
            </>
          )}
        </p>
      </div>

      {/* 핵심 조건 (항상 노출) */}
      <Field label="관심 직무" required={!isLast} hint="복수 선택 가능">
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
      <Accordion title="추가 조건">
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

        {/* 인재 JD — URL + PDF 첨부 둘 다 노출 (남겨주시면 맞춤 추천에 활용) */}
        <Field label="인재 JD" hint="URL 또는 PDF">
          <div className="flex flex-col gap-3">
            <input
              type="url"
              className={inputClass}
              value={form.jdUrl}
              onChange={(e) => patch({ jdUrl: e.target.value })}
              placeholder="https://notion.so/... 채용공고 · JD 링크"
            />
            <label className="flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-md border border-dashed border-[#D6DBE3] bg-[#FAFBFC] px-4 py-6 text-center transition hover:border-[#E8590C] hover:bg-[#FFF8F3]">
              <span className="text-[13px] font-semibold text-[#3A4356]">{jdFile ? jdFile.name : "PDF 파일 첨부"}</span>
              <span className="text-[12px] text-[#AEB6C4]">{jdFile ? "다른 파일로 변경하려면 클릭" : "PDF · 최대 10MB"}</span>
              <input type="file" accept="application/pdf,.pdf" className="hidden" onChange={(e) => setJdFile(e.target.files?.[0] ?? null)} />
            </label>
          </div>
        </Field>
      </Accordion>

      {isLast ? (
        <div className="mt-1 flex items-center gap-3">
          <button
            type="button"
            onClick={onPrev}
            className="inline-flex items-center justify-center rounded-md border border-[#E1E5EC] px-6 py-4 text-[15px] font-semibold text-[#3A4356] transition hover:border-[#E8590C] hover:text-[#E8590C]"
          >
            ← 이전
          </button>
          <button
            type="submit"
            disabled={!canSubmit || submitting}
            className="inline-flex flex-1 items-center justify-center rounded-md bg-[#E8590C] px-6 py-4 text-[16px] font-semibold text-white transition hover:bg-[#C74E0A] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {submitting ? "제출 중…" : "건너뛰기"}
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={onNext}
          disabled={!canNext}
          className="mt-1 inline-flex items-center justify-center rounded-md bg-[#E8590C] px-6 py-4 text-[16px] font-semibold text-white transition hover:bg-[#C74E0A] disabled:cursor-not-allowed disabled:opacity-40"
        >
          다음 →
        </button>
      )}
    </div>
  );
}
