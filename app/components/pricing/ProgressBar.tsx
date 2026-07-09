/* 2-step 진행률 바 — 부드러운 width 애니메이션 */
export default function ProgressBar({ step, total }: { step: number; total: number }) {
  const percent = Math.round((step / total) * 100);
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-[12px] font-medium text-[#8A93A5]">
        <span>
          Step {step} / {total}
        </span>
        <span>{percent}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-[#F0F2F5]">
        <div className="h-full rounded-full bg-[#E8590C] transition-[width] duration-300 ease-out" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
