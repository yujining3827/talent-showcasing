"use client";

import Link from "next/link";
import { gtmPush } from "@/lib/gtm";

/* "인재 추천받기" 등 CTA 공통 래퍼 — 클릭 시 dataLayer cta_click 이벤트 push
 * 서버 컴포넌트(헤더/푸터/ContactCTA) 안에서도 클라이언트 아일랜드로 사용 가능 */
export default function CtaLink({
  href,
  location,
  className,
  children,
}: {
  href: string;
  location: string; // 클릭 위치 (header / hero / footer / contact-cta)
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={className}
      onClick={() => gtmPush("cta_click", { cta_location: location, cta_href: href })}
    >
      {children}
    </Link>
  );
}
