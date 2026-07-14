"use client";

import { useState } from "react";
import { Field, Chip, ChipGroup } from "./ui";
import Dropdown from "./Dropdown";
import { WORKTYPE_OPTIONS, DURATION_OPTIONS, STARTTIME_OPTIONS, INDUSTRY_OPTIONS, inputClass, type PricingForm } from "./types";

type RoleCategory = {
  label: string;
  description: string;
  iconBg: string;
  iconColor: string;
  icon: "code" | "palette" | "megaphone" | "headset";
  options: string[];
};

const ROLE_CATEGORIES: RoleCategory[] = [
  {
    label: "개발",
    description: "서비스 구현, 자동화, 데이터/AI까지",
    iconBg: "bg-[#EDF3FF]",
    iconColor: "text-[#3B6FE0]",
    icon: "code",
    options: ["백엔드", "프론트엔드", "풀스택", "모바일 앱", "QA/테스트", "DevOps/인프라", "데이터 엔지니어", "AI/ML", "자동화/RPA", "워드프레스/쇼피파이", "유지보수"],
  },
  {
    label: "디자인",
    description: "브랜드, 제품 화면, 판매 소재 제작",
    iconBg: "bg-[#F5EFFF]",
    iconColor: "text-[#8A5CE0]",
    icon: "palette",
    options: ["브랜딩", "상세페이지", "UI/UX", "프로덕트 디자인", "웹 디자인", "배너/광고 소재", "편집 디자인", "영상/모션"],
  },
  {
    label: "마케팅",
    description: "성과 광고, 콘텐츠, 채널 운영",
    iconBg: "bg-[#EAF8F0]",
    iconColor: "text-[#1D9E75]",
    icon: "megaphone",
    options: ["퍼포먼스", "SEO", "콘텐츠 마케팅", "카드뉴스", "소셜 운영", "인플루언서", "CRM/메시지", "마케팅 자동화", "시장 리서치"],
  },
  {
    label: "CS/운영",
    description: "고객 응대와 반복 운영 업무",
    iconBg: "bg-[#FFF4E8]",
    iconColor: "text-[#E8940C]",
    icon: "headset",
    options: ["채팅 CS", "전화/메일 CS", "쇼핑몰 운영", "주문/배송 관리", "리뷰 관리", "커뮤니티 운영", "운영 루틴", "데이터 입력/검수"],
  },
];

function CategoryIcon({ type, className }: { type: RoleCategory["icon"]; className?: string }) {
  const common = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, className };
  if (type === "code") {
    return (
      <svg {...common}>
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    );
  }
  if (type === "palette") {
    return (
      <svg {...common}>
        <path d="M12 22a10 10 0 110-20 10 9 0 0110 9 5 5 0 01-5 5h-2.2a2 2 0 00-1.5 3.3c.3.4.5.8.5 1.3a1.9 1.9 0 01-1.8 1.4z" />
        <circle cx="7.5" cy="11.5" r="0.5" />
        <circle cx="12" cy="7.5" r="0.5" />
        <circle cx="16.5" cy="11.5" r="0.5" />
      </svg>
    );
  }
  if (type === "megaphone") {
    return (
      <svg {...common}>
        <path d="M3 11l18-7-4 14-6-3-3 4v-5z" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d="M3 18v-6a9 9 0 0118 0v6" />
      <path d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3z" />
    </svg>
  );
}

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

/* Step — 채용 요건: 관심직무(카테고리 카드)·근무기간 + 근무형태·시점·업종·인재 JD */
export default function StepOne({ form, patch, jdFile, setJdFile, onNext, canNext, isLast, onPrev, submitting, canSubmit }: Props) {
  const toggleRole = (r: string) =>
    patch({ roles: form.roles.includes(r) ? form.roles.filter((x) => x !== r) : [...form.roles, r] });
  const pickSingle = (key: "workType" | "duration" | "startTime", v: string) => patch({ [key]: form[key] === v ? "" : v });

  // 관심 직무 — 탭으로 카테고리 전환 (영역 높이 고정, 옵션이 늘어도 안 길어짐)
  const [activeCategory, setActiveCategory] = useState(ROLE_CATEGORIES[0].label);
  const currentCategory = ROLE_CATEGORIES.find((c) => c.label === activeCategory) ?? ROLE_CATEGORIES[0];

  // 2뎁스(선택)에서 하나라도 입력·선택했는지 → 버튼 라벨 건너뛰기/제출하기
  const hasInput =
    form.roles.length > 0 ||
    !!form.workType ||
    !!form.duration ||
    !!form.startTime ||
    !!form.industry ||
    !!form.jdUrl.trim() ||
    !!jdFile;

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
        {/* 카테고리 탭 — 4개가 항상 한 줄에 보이고, 선택 수는 탭 배지로 표시 */}
        <div className="grid grid-cols-4 gap-1.5">
          {ROLE_CATEGORIES.map((category) => {
            const active = category.label === activeCategory;
            const selectedCount = category.options.filter((role) => form.roles.includes(role)).length;
            return (
              <button
                key={category.label}
                type="button"
                onClick={() => setActiveCategory(category.label)}
                aria-pressed={active}
                className={`relative flex flex-col items-center gap-1.5 rounded-xl border px-1 py-2.5 transition ${
                  active ? "border-[#171E2D] bg-[#171E2D]" : "border-[#E8ECF2] bg-white hover:border-[#C9D0DB]"
                }`}
              >
                <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${category.iconBg} ${category.iconColor}`}>
                  <CategoryIcon type={category.icon} />
                </span>
                <span className={`text-[12.5px] font-semibold ${active ? "text-white" : "text-[#5B667A]"}`}>
                  {category.label}
                </span>
                {selectedCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#E8590C] px-1 text-[10.5px] font-bold text-white">
                    {selectedCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        {/* 활성 카테고리의 세부 직무 */}
        <div className="mt-2 rounded-xl border border-[#E8ECF2] bg-[#FAFBFC] p-3.5">
          <p className="mb-2.5 text-[12px] leading-[1.4] text-[#8A93A5]">{currentCategory.description}</p>
          <div className="flex flex-wrap gap-2">
            {currentCategory.options.map((role) => (
              <Chip key={role} label={role} selected={form.roles.includes(role)} onClick={() => toggleRole(role)} />
            ))}
          </div>
        </div>
      </Field>

      <Field label="근무 기간">
        <ChipGroup>
          {DURATION_OPTIONS.map((v) => (
            <Chip key={v} label={v} selected={form.duration === v} onClick={() => pickSingle("duration", v)} />
          ))}
        </ChipGroup>
      </Field>

      {/* Divider — 아래 필드는 전부 선택 사항임을 명시 (체감 부담 줄이기) */}
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-[#EEF1F5]" />
        <span className="text-[12px] text-[#AEB6C4]">아래는 선택 사항 — 남겨주시면 추천이 더 정확해져요</span>
        <div className="h-px flex-1 bg-[#EEF1F5]" />
      </div>

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
            <span className="text-[12px] text-[#AEB6C4]">{jdFile ? "다른 파일로 변경하려면 클릭" : "PDF · 최대 4MB"}</span>
            <input type="file" accept="application/pdf,.pdf" className="hidden" onChange={(e) => setJdFile(e.target.files?.[0] ?? null)} />
          </label>
        </div>
      </Field>

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
            {submitting ? "제출 중…" : hasInput ? "제출하기" : "건너뛰기"}
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
