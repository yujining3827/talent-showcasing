import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

/* 고객 사례 이미지 업로드 → case-images 버킷 (service_role). /gm-admin 미들웨어로 보호됨 */
export async function POST(req: Request) {
  let file: File | null = null;
  try {
    const fd = await req.formData();
    const f = fd.get("file");
    if (f && typeof f !== "string") file = f;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid form" }, { status: 400 });
  }
  if (!file) return NextResponse.json({ ok: false, error: "파일 없음" }, { status: 400 });

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const safe = (file.name || "image").replace(/[^\w.\-]+/g, "_");
  const path = `${Date.now()}-${safe}`;
  const buf = new Uint8Array(await file.arrayBuffer());
  const { error } = await supabase.storage.from("case-images").upload(path, buf, {
    contentType: file.type || "image/png",
    upsert: false,
  });
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  const url = supabase.storage.from("case-images").getPublicUrl(path).data.publicUrl;
  return NextResponse.json({ ok: true, url });
}
