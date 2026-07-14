"use client";

import { useEffect } from "react";
import { captureUtmFromUrl } from "@/lib/gtm";

/* 랜딩 시 UTM 파라미터를 캡처해 로컬스토리지에 보관 (제출 때까지 유지) */
export default function Analytics() {
  useEffect(() => {
    captureUtmFromUrl();
  }, []);
  return null;
}
