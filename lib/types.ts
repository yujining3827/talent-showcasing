export type OvrGrade = "S" | "A" | "B" | "C";
export type Availability = "immediate" | "negotiable" | "employed";

export interface DetailedSkill {
  name: string;
  score: number;
  type: "core" | "sub";
}

export interface CareerEntry {
  tier: string;
  position: string;
  startDate: string;
  endDate: string | "current";
  current: boolean;
}

export interface Abilities {
  technical: number;
  english: number;
  collaboration: number;
  stability: number;
  growth: number;
}

export interface Talent {
  id: string;
  name: string;
  role: string;
  years_exp: number;
  location: string;
  ovr_score: number;
  ovr_grade: OvrGrade;
  top_skills: [string, string];
  korean_level: 1 | 2 | 3 | 4 | 5;
  salary_min_vnd: number; // 월급 Gross VND
  salary_max_vnd: number; // 월급 Gross VND
  availability: Availability;
  ktc_comment: string;
  abilities: Abilities;
  detailed_skills: DetailedSkill[];
  career_history: CareerEntry[];
  tags: string[];
  photo_url?: string;
  resume_url?: string;
  university?: string;      // 출신 대학 (동의 기반 노출, 카드 강조)
  graduation_year?: string; // 졸업 연도
}

/** career_history 에서 가장 내세울 만한 '전 직장'을 고른다 (현직 제외, 없으면 현직). */
export function pickExCompany(careers: CareerEntry[]): string | null {
  if (!careers || careers.length === 0) return null;
  const past = careers.find((c) => !c.current);
  const pick = past || careers[0];
  return pick?.tier?.trim() || null;
}

/** 실명 → 이니셜 변환 (예: "Tran Nguyen" → "T.N", "홍길동" → "홍") */
export function toInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return parts.map((p) => p.charAt(0).toUpperCase()).join(".");
  }
  return name.charAt(0).toUpperCase();
}
