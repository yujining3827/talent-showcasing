import { CareerEntry } from "@/lib/types";

export function CareerHistory({ careers }: { careers: CareerEntry[] }) {
  return (
    <div className="bg-white border-[0.5px] border-gray-200/60 rounded-[20px] p-6 mb-3">
      <p className="text-[12px] text-gray-500 mb-4">경력</p>
      {careers.map((career, i) => (
        <div
          key={i}
          className={`flex items-start gap-3.5 ${
            i < careers.length - 1
              ? "pb-3.5 mb-3.5 border-b-[0.5px] border-gray-200/60"
              : ""
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
              career.current ? "bg-blue-500" : "bg-gray-300"
            }`}
          />
          <div>
            <p className="text-[14px] font-medium text-gray-900 mb-1">
              {career.tier}
            </p>
            <p className="text-[13px] text-gray-600">
              {career.position} · {career.startDate} –{" "}
              {career.current ? "현재" : career.endDate}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
