import { InlineField } from "./ui";
import { JD_TABS, inputClass, type JdType, type PricingForm } from "./types";

type Props = {
  form: PricingForm;
  patch: (p: Partial<PricingForm>) => void;
  jdType: JdType;
  setJdType: (t: JdType) => void;
  jdFile: File | null;
  setJdFile: (f: File | null) => void;
  onPrev: () => void;
  submitting: boolean;
  canSubmit: boolean;
};

/* Step 2 — 담당자 정보 (성함·기업명·연락처) + 인재 JD */
export default function StepTwo({ form, patch, jdType, setJdType, jdFile, setJdFile, onPrev, submitting, canSubmit }: Props) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-[19px] font-bold text-[#171E2D]">담당자 정보</h2>
        <p className="mt-1 text-[14px] text-[#8A93A5]">연락받으실 정보를 입력해주세요.</p>
      </div>

      <InlineField label="성함" required>
        <input className={inputClass} value={form.name} onChange={(e) => patch({ name: e.target.value })} placeholder="홍길동" />
      </InlineField>
      <InlineField label="기업명" required>
        <input className={inputClass} value={form.company} onChange={(e) => patch({ company: e.target.value })} placeholder="(주)공고마감" />
      </InlineField>
      <InlineField label="연락처" required hint="전화 또는 이메일">
        <input className={inputClass} value={form.contact} onChange={(e) => patch({ contact: e.target.value })} placeholder="010-0000-0000 / name@company.com" />
      </InlineField>

      {/* 인재 JD — 텍스트 / URL / PDF */}
      <InlineField label="인재 JD" hint="선택">
        <div className="flex gap-1 rounded-lg bg-[#F4F6F9] p-1">
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
        <div className="mt-3">
          {jdType === "text" && (
            <textarea
              className={`${inputClass} min-h-[120px] resize-y`}
              value={form.jd}
              onChange={(e) => patch({ jd: e.target.value })}
              placeholder="주요 업무, 필요 기술스택, 경력 요건 등을 자유롭게 적어주세요"
            />
          )}
          {jdType === "url" && (
            <input type="url" className={inputClass} value={form.jdUrl} onChange={(e) => patch({ jdUrl: e.target.value })} placeholder="https://notion.so/... 채용공고 · JD 링크" />
          )}
          {jdType === "file" && (
            <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed border-[#D6DBE3] bg-[#FAFBFC] px-4 py-7 text-center transition hover:border-[#E8590C] hover:bg-[#FFF8F3]">
              <span className="text-[13px] font-semibold text-[#3A4356]">{jdFile ? jdFile.name : "PDF 파일 선택"}</span>
              <span className="text-[12px] text-[#AEB6C4]">{jdFile ? "다른 파일로 변경하려면 클릭" : "PDF · 최대 10MB"}</span>
              <input type="file" accept="application/pdf,.pdf" className="hidden" onChange={(e) => setJdFile(e.target.files?.[0] ?? null)} />
            </label>
          )}
        </div>
      </InlineField>

      {/* Navigation — 이전 / 제출 */}
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
          {submitting ? "제출 중…" : "제출하기"}
        </button>
      </div>
    </div>
  );
}
