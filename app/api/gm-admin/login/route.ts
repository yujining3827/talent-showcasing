import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/* 공고마감 admin 로그인 — 비밀번호 확인 후 httpOnly 쿠키 발급 */
export async function POST(req: Request) {
  let password = "";
  try {
    const body = await req.json();
    password = String(body?.password || "");
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const pw = process.env.GM_ADMIN_PASSWORD;
  if (!pw) return NextResponse.json({ ok: false, error: "서버에 비밀번호가 설정되지 않았습니다." }, { status: 500 });
  if (password !== pw) return NextResponse.json({ ok: false, error: "비밀번호가 올바르지 않습니다." }, { status: 401 });

  const res = NextResponse.json({ ok: true });
  res.cookies.set("gm_admin", pw, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30일
  });
  return res;
}

/* 로그아웃 — 쿠키 제거 */
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set("gm_admin", "", { httpOnly: true, path: "/", maxAge: 0 });
  return res;
}
