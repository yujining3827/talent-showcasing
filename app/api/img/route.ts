import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// 이미지가 브라우저에서 안 뜨는 문제(핫링크/CORS/레퍼러) 방지 — 서버가 대신 받아서 스트리밍
const ALLOWED = ["twpxsbnkypocjfnerfmd.supabase.co", "isukoqgnlaywgqujuugt.supabase.co"];

export async function GET(req: NextRequest) {
  const u = req.nextUrl.searchParams.get("u");
  if (!u) return new NextResponse("missing u", { status: 400 });
  let host = "";
  try { host = new URL(u).hostname; } catch { return new NextResponse("bad url", { status: 400 }); }
  if (!ALLOWED.includes(host)) return new NextResponse("host not allowed", { status: 403 });

  try {
    const r = await fetch(u, { cache: "no-store" });
    const ct = r.headers.get("content-type") || "";
    if (!r.ok || !/image/i.test(ct)) return new NextResponse("not an image", { status: 415 });
    const buf = await r.arrayBuffer();
    // 빈/깨진 썸네일(수백 바이트)은 거부 → 클라이언트에서 이니셜로 폴백
    if (buf.byteLength < 2500) return new NextResponse("image too small", { status: 415 });
    return new NextResponse(buf, {
      headers: { "content-type": ct, "cache-control": "public, max-age=86400" },
    });
  } catch {
    return new NextResponse("fetch failed", { status: 502 });
  }
}
