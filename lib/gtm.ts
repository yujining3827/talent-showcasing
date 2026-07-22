// GTM dataLayer 헬퍼 + UTM 파라미터 캡처 유틸
// 이벤트: cta_click / lead_form_open / lead_form_step2 / lead_submit

export type GtmEvent = "cta_click" | "lead_form_open" | "lead_form_step2" | "lead_submit";

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
    clarity?: (...args: unknown[]) => void;
    gtag?: (...args: unknown[]) => void;
  }
}

// GTM 이벤트를 Clarity/GA4 커스텀 이벤트 이름으로 매핑 (전환을 구분)
function mappedEventName(event: GtmEvent, data: Record<string, unknown>): string {
  if (event === "lead_submit") {
    if (data.form === "brochure") return "brochure_download";   // 브로셔 다운로드
    if (data.is_talent_inquiry) return "talent_inquiry_submit"; // 인재 문의 완료
    return "lead_submit";
  }
  return event;
}

export function gtmPush(event: GtmEvent, data: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  const name = mappedEventName(event, data);
  // 1) GTM dataLayer
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...data });
  // 2) Microsoft Clarity 커스텀 이벤트 (전환 세션 필터/퍼널용) — 미로드 시 무시
  try {
    window.clarity?.("event", name);
  } catch {
    /* clarity 미로드 시 무시 */
  }
  // 3) GA4 이벤트 (gtag.js 직접 로드 시) — 미로드 시 무시
  try {
    window.gtag?.("event", name, data);
  } catch {
    /* gtag 미로드 시 무시 */
  }
}

// UTM / 광고 클릭 파라미터
export const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "fbclid"] as const;
export type UtmParams = Partial<Record<(typeof UTM_KEYS)[number], string>>;
const UTM_STORE_KEY = "gm_utm";

// 랜딩 시 URL의 UTM을 로컬스토리지에 저장 (페이지 이동해도 제출 때까지 유지)
export function captureUtmFromUrl() {
  if (typeof window === "undefined") return;
  const sp = new URLSearchParams(window.location.search);
  const found: UtmParams = {};
  let has = false;
  for (const k of UTM_KEYS) {
    const v = sp.get(k);
    if (v) {
      found[k] = v;
      has = true;
    }
  }
  if (has) {
    try {
      localStorage.setItem(UTM_STORE_KEY, JSON.stringify(found));
    } catch {
      /* 스토리지 불가 시 무시 */
    }
  }
}

// 제출 시점의 UTM — 현재 URL 우선, 없으면 저장된 값
export function getStoredUtm(): UtmParams {
  if (typeof window === "undefined") return {};
  const sp = new URLSearchParams(window.location.search);
  const cur: UtmParams = {};
  let has = false;
  for (const k of UTM_KEYS) {
    const v = sp.get(k);
    if (v) {
      cur[k] = v;
      has = true;
    }
  }
  if (has) return cur;
  try {
    return JSON.parse(localStorage.getItem(UTM_STORE_KEY) || "{}") as UtmParams;
  } catch {
    return {};
  }
}
