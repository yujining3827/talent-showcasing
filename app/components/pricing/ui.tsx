import type { ReactNode } from "react";

/* Pricing 폼 공용 UI — 라벨 필드 / 칩 / 칩 그룹 */

export function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: ReactNode }) {
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

// 선택 시 배경 #FF6B00 / 흰 글자 (사이트 Pill 스타일)
export function Chip({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`rounded-full border px-3.5 py-1.5 text-[13.5px] font-medium transition ${
        selected ? "border-[#FF6B00] bg-[#FF6B00] text-white" : "border-[#E1E5EC] bg-white text-[#3A4356] hover:border-[#FFB27F]"
      }`}
    >
      {label}
    </button>
  );
}

export function ChipGroup({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap gap-2">{children}</div>;
}

// 라벨(오른쪽 정렬, 왼쪽 컬럼) + 내용(오른쪽 컬럼) 한 줄 레이아웃
export function InlineField({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5 sm:flex-row sm:items-start sm:gap-4">
      <div className="shrink-0 pt-0.5 sm:w-24 sm:pt-2.5 sm:text-right">
        <span className="text-[13px] font-semibold text-[#3A4356]">
          {label}
          {required && <span className="ml-0.5 text-[#E8590C]">*</span>}
        </span>
        {hint && <span className="mt-0.5 hidden text-[11px] leading-[1.4] text-[#8A93A5] sm:block">{hint}</span>}
      </div>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
