// GTM dataLayer 헬퍼 + UTM 파라미터 캡처 유틸
// 이벤트: cta_click / lead_form_open / lead_form_step2 / lead_submit

export type GtmEvent = "cta_click" | "lead_form_open" | "lead_form_step2" | "lead_submit";

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

export function gtmPush(event: GtmEvent, data: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...data });
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
