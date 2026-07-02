import type { Talent } from "@/lib/types";
import { pickExCompany } from "@/lib/types";

/**
 * 노출 규칙 (인지도 기반 큐레이션)
 * 1) 이력서 사진이 있는 인재만  (hasPhoto)
 * 2) 그 중 베트남 명문대 OR 대기업 출신만  (isPrestigious)
 * 3) 직무별 분류  (groupByRole)
 *
 * 아래 리스트는 "인지도" 기준 큐레이션 — 자유롭게 추가/삭제하면 됨.
 * 매칭은 대소문자·성조·괄호 무시하고 부분일치로 판단한다.
 */

// 베트남 명문대학교 (인지도 상위)
export const TOP_UNIVERSITIES: string[] = [
  // 하노이
  "VNU", "Vietnam National University", "하노이 국립대",
  "HUST", "Hanoi University of Science and Technology", "Bach Khoa Hanoi", "하노이 공과대",
  "NEU", "National Economics University", "국민경제대",
  "FTU", "Foreign Trade University", "무역대", "외국어대",
  "PTIT", "Posts and Telecommunications", "우정통신대",
  "Hanoi University of Science",
  // 호치민
  "VNU-HCM", "HCMUT", "Ho Chi Minh City University of Technology", "Bach Khoa", "호치민 공과대",
  "UIT", "University of Information Technology", "정보기술대",
  "University of Science", "Khoa Hoc Tu Nhien",
  "UEH", "University of Economics Ho Chi Minh", "경제대",
  "RMIT",
  // 다낭 외
  "DUT", "Danang University of Technology", "다낭 공과대",
  "Duy Tan",
  // 전국
  "FPT University", "FPT대",
];

// 베트남 IT 대기업·인지도 기업 (전 직장 강조용)
export const TOP_COMPANIES: string[] = [
  "VNG", "Zalo", "FPT", "FPT Software",
  "Viettel", "VNPT", "VNPAY",
  "Momo", "M_Service", "Tiki", "Shopee", "Lazada", "Sendo",
  "Grab", "Gojek", "Be",
  "Samsung", "SVMC", "LG", "Bosch", "Intel",
  "NAVER", "LINE", "Line",
  "Axon Active", "KMS", "KMS Technology", "TMA", "NashTech", "Katalon",
  "Sky Mavis", "VinAI", "VinGroup", "VNPAY", "Teko", "One Mount",
  "Techcombank", "MB Bank", "Got It", "Base.vn",
];

/** 성조·괄호·공백 제거 후 소문자 정규화 */
function norm(s: string): string {
  return (s || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // 베트남어 성조 제거
    .toLowerCase()
    .replace(/[()[\]]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** value 안에 리스트 항목 중 하나라도 부분일치하면 그 항목을 반환 */
function matchIn(value: string | null | undefined, list: string[]): string | null {
  if (!value) return null;
  const v = norm(value);
  if (!v) return null;
  for (const item of list) {
    const n = norm(item);
    if (n && (v.includes(n) || n.includes(v))) return item;
  }
  return null;
}

/** 규칙 1: 이력서 사진 보유 */
export function hasPhoto(t: Talent): boolean {
  return Boolean(t.photo_url && t.photo_url.trim() !== "");
}

/** 명문대 출신이면 매칭된 대학명 반환 */
export function matchedUniversity(t: Talent): string | null {
  return matchIn(t.university, TOP_UNIVERSITIES);
}

/** 대기업 출신이면 매칭된 회사명 반환 (career_history 전체 탐색) */
export function matchedCompany(t: Talent): string | null {
  const companies = (t.career_history || []).map((c) => c.tier);
  for (const c of companies) {
    const hit = matchIn(c, TOP_COMPANIES);
    if (hit) return hit;
  }
  return null;
}

/** 규칙 2: 명문대 OR 대기업 출신 */
export function isPrestigious(t: Talent): boolean {
  return Boolean(matchedUniversity(t) || matchedCompany(t));
}

/** 규칙 1+2: 노출 대상 자격 */
export function qualifiesForExposure(t: Talent): boolean {
  return hasPhoto(t) && isPrestigious(t);
}

/** 노출 대상만 필터 */
export function filterExposure(talents: Talent[]): Talent[] {
  return talents.filter(qualifiesForExposure);
}

export interface RoleGroup {
  role: string;
  talents: Talent[];
}

/** 규칙 3: 직무별 분류 (직무 내에서는 OVR 높은 순, 그룹은 인원수 많은 순) */
export function groupByRole(talents: Talent[]): RoleGroup[] {
  const map = new Map<string, Talent[]>();
  for (const t of talents) {
    const role = t.role || "기타";
    if (!map.has(role)) map.set(role, []);
    map.get(role)!.push(t);
  }
  const groups: RoleGroup[] = [];
  for (const [role, list] of map) {
    list.sort((a, b) => b.ovr_score - a.ovr_score);
    groups.push({ role, talents: list });
  }
  groups.sort((a, b) => b.talents.length - a.talents.length);
  return groups;
}

/** 규칙 1→2→3 한 번에: 사진有 + 명문대/대기업 → 직무별 그룹 */
export function buildExposureGroups(talents: Talent[]): RoleGroup[] {
  return groupByRole(filterExposure(talents));
}

/** 제각각인 직무명(Full-stack/Fullstack/Full Stack…)을 표준 직무로 정규화 */
export function normalizeRole(raw: string): string {
  const s = (raw || "").toLowerCase();
  if (/full[\s-]?stack/.test(s)) return "풀스택";
  if (/front/.test(s)) return "프론트엔드";
  if (/back/.test(s)) return "백엔드";
  if (/ios|android|mobile|flutter|react native/.test(s)) return "모바일";
  if (/design|ux|ui/.test(s)) return "디자이너";
  if (/\bqa\b|test/.test(s)) return "QA";
  if (/data|\bai\b|\bml\b|analyst|robot/.test(s)) return "데이터/AI";
  if (/devops|sre|infra|cloud/.test(s)) return "DevOps";
  if (/\bpm\b|product manager|project manager/.test(s)) return "PM";
  if (/market|growth|brand|content|seo|ecom|commerce/.test(s)) return "마케팅";
  if (/\bhr\b|recruit|people|admin/.test(s)) return "HR/총무";
  if (/account|finance|financial/.test(s)) return "재무/회계";
  return "기타";
}

// 글로벌 인지도 기업 (전 세계급 브랜드) — 명문대와 함께 "엘리트" 판정 기준
export const GLOBAL_COMPANIES: string[] = [
  "Google", "Alphabet", "Meta", "Facebook", "Amazon", "AWS", "Microsoft", "Apple",
  "Samsung", "LG", "Intel", "IBM", "Oracle", "SAP", "Nvidia", "Qualcomm", "Cisco",
  "Sony", "Panasonic", "Hitachi", "Fujitsu", "NTT", "Bosch", "Siemens", "Ericsson", "Nokia",
  "Accenture", "Deloitte", "PwC", "KPMG", "EY", "DXC",
  "Grab", "Gojek", "Shopee", "Sea", "Lazada", "TikTok", "ByteDance", "Agoda", "Traveloka",
  "Naver", "LINE", "Kakao", "Rakuten", "Nexon", "Garena",
  "Global Cybersoft", "Renesas", "Bosch Global", "NashTech", "KMS", "TMA", "Katalon",
  "FPT", "VNG", "Viettel", "VNPAY", "Momo", "Tiki", "Zalo", "VinAI", "VinGroup", "Sky Mavis",
];

/** 명문대 여부 (문자열) */
export function isEliteSchool(school: string | null | undefined): boolean {
  return Boolean(matchIn(school || "", TOP_UNIVERSITIES));
}
/** 글로벌/인지도 기업 출신 여부 (문자열) */
export function isEliteCompany(company: string | null | undefined): boolean {
  return Boolean(matchIn(company || "", [...TOP_COMPANIES, ...GLOBAL_COMPANIES]));
}
/** 쇼케이스 엘리트 기준: 명문대 OR 글로벌 인지도 기업 */
export function isElite(school: string | null | undefined, company: string | null | undefined): boolean {
  return isEliteSchool(school) || isEliteCompany(company);
}

/** 규칙 1+3 (프리스티지는 데이터 확보 후): 사진有 → 정규화 직무별 그룹 */
export function groupByNormalizedRole(talents: Talent[]): RoleGroup[] {
  const map = new Map<string, Talent[]>();
  for (const t of talents.filter(hasPhoto)) {
    const role = normalizeRole(t.role);
    if (!map.has(role)) map.set(role, []);
    map.get(role)!.push(t);
  }
  const groups: RoleGroup[] = [];
  for (const [role, list] of map) {
    list.sort((a, b) => b.ovr_score - a.ovr_score);
    groups.push({ role, talents: list });
  }
  groups.sort((a, b) => b.talents.length - a.talents.length);
  return groups;
}

/** 카드에 붙일 "출신 배지" 텍스트 (대학 우선, 없으면 Ex-대기업) */
export function prestigeBadge(t: Talent): string | null {
  const uni = matchedUniversity(t);
  if (uni) return t.university || uni;
  const co = matchedCompany(t) || pickExCompany(t.career_history);
  return co ? `Ex-${co}` : null;
}
