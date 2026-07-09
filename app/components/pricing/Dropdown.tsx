import { inputClass } from "./types";

/* 스타일 드롭다운 (네이티브 select + 커스텀 chevron) */
export default function Dropdown({
  value,
  onChange,
  options,
  placeholder = "선택",
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputClass} cursor-pointer appearance-none pr-10 ${value ? "text-[#1B2233]" : "text-[#AEB6C4]"}`}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o} value={o} className="text-[#1B2233]">
            {o}
          </option>
        ))}
      </select>
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8A93A5]"
      >
        <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}
