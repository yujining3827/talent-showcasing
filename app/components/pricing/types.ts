// Pricing 2-step 위저드 폼 — 공용 타입/옵션/스타일

export type JdType = "text" | "url" | "file";

// 특정 인재 문의 시 — 면접 희망 일정 (날짜별 시간대 복수 선택)
export type InterviewSlot = { date: string; times: string[] };

export type PricingForm = {
  // Step 1 — 기본 정보
  name: string;
  company: string;
  contact: string;
  roles: string[]; // 관심 직무 (복수 선택)
  // Step 2 — 채용 정보
  workType: string; // 근무 형태 (단일)
  duration: string; // 근무 기간 (단일)
  startTime: string; // 채용 시점 (단일)
  industry: string; // 기업 업종 (드롭다운 단일)
  jd: string; // 텍스트 JD
  jdUrl: string; // URL JD
  consent: boolean; // 개인정보 수집·이용 동의 (필수)
  // 인재 특정 문의 시 — 면접 일정 (Hero/nav 진입 시엔 비어 있음)
  interviewSlots: InterviewSlot[]; // 가능한 면접 날짜·시간대
  interviewNote: string; // 요청사항
};

export const EMPTY_FORM: PricingForm = {
  name: "",
  company: "",
  contact: "",
  roles: [],
  workType: "",
  duration: "",
  startTime: "",
  industry: "",
  jd: "",
  jdUrl: "",
  consent: false,
  interviewSlots: [{ date: "", times: [] }],
  interviewNote: "",
};

// 면접 가능 시간대 (오전 10:00 ~ 오후 5:30, 30분 단위)
export const INTERVIEW_TIMES = [
  "오전 10:00", "오전 10:30", "오전 11:00", "오전 11:30", "오후 12:00", "오후 12:30",
  "오후 1:00", "오후 1:30", "오후 2:00", "오후 2:30", "오후 3:00", "오후 3:30",
  "오후 4:00", "오후 4:30", "오후 5:00", "오후 5:30",
];

export const ROLE_OPTIONS = ["백엔드", "프론트엔드", "풀스택", "모바일", "QA", "UI/UX", "PM", "DevOps", "AI", "기타"];
export const WORKTYPE_OPTIONS = ["풀타임", "파트타임", "계약직", "인턴"];
export const DURATION_OPTIONS = ["1~3개월", "3~6개월", "6개월 이상", "협의"];
export const STARTTIME_OPTIONS = ["ASAP", "1개월 내", "2개월 내", "협의"];
export const INDUSTRY_OPTIONS = ["IT", "금융", "커머스", "게임", "제조", "교육", "헬스케어", "스타트업", "기타"];

export const JD_TABS: { key: JdType; label: string }[] = [
  { key: "text", label: "텍스트" },
  { key: "url", label: "URL" },
  { key: "file", label: "PDF" },
];

export const inputClass =
  "w-full rounded-md border border-[#E1E5EC] bg-white px-3.5 py-3 text-[15px] text-[#1B2233] placeholder:text-[#AEB6C4] transition focus:border-[#E8590C] focus:outline-none focus:ring-2 focus:ring-[#E8590C]/15";
