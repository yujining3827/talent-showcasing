import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/* 공고마감 admin(/gm-admin) 비밀번호 게이트
 *  - 쿠키 gm_admin 값이 GM_ADMIN_PASSWORD 와 일치해야 통과
 *  - 로그인 페이지(/gm-admin/login)만 예외 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  // 로그인 페이지·로그인 API 는 게이트 예외
  if (pathname === "/gm-admin/login" || pathname === "/api/gm-admin/login") return NextResponse.next();

  const pw = process.env.GM_ADMIN_PASSWORD;
  const cookie = req.cookies.get("gm_admin")?.value;
  const ok = !!pw && cookie === pw;
  if (ok) return NextResponse.next();

  // API 요청은 401 JSON, 페이지는 로그인으로 리다이렉트
  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const url = req.nextUrl.clone();
  url.pathname = "/gm-admin/login";
  url.searchParams.set("next", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/gm-admin/:path*", "/api/gm-admin/:path*"],
};
