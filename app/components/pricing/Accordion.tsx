"use client";

import { useState, type ReactNode } from "react";

/* 접힘/펼침 아코디언 — height(grid-rows) + opacity 250ms 전환, 화살표 회전 */
export default function Accordion({ title, children }: { title: ReactNode; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center gap-2 py-1 text-left text-[14px] font-semibold text-[#3A4356] transition hover:text-[#E8590C]"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
          className={`transition-transform duration-200 ${open ? "rotate-90" : ""}`}
        >
          <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {title}
      </button>

      <div className={`grid transition-all duration-[250ms] ease-out ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
        <div className="overflow-hidden">
          <div className="flex flex-col gap-5 pt-5">{children}</div>
        </div>
      </div>
    </div>
  );
}
