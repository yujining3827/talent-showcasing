import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

/* 브로셔(서비스 소개서) PDF 관리 — /gm-admin 미들웨어로 보호됨
 *  - 'brochure' 버킷(public)에 PDF 업로드/목록/삭제
 *  - 활성본(메일 첨부 대상)은 버킷의 _active.json 마커에 저장 ({path, name})
 *  - 새 DB 테이블 불필요 */
const BUCKET = "brochure";
const ACTIVE_MARKER = "_active.json";
const LEGACY_DEFAULT = "gonggomagam-service-brochure.pdf"; // 마커 없을 때 폴백

function admin() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

// 파일명에서 앞의 타임스탬프 접두사 제거 → 보기 좋은 이름
function displayName(path: string) {
  return path.replace(/^\d+-/, "");
}

async function readActive(sb: ReturnType<typeof admin>): Promise<{ path: string; name: string }> {
  try {
    const { data } = await sb.storage.from(BUCKET).download(ACTIVE_MARKER);
    if (data) {
      const cfg = JSON.parse(await data.text());
      if (cfg?.path) return { path: String(cfg.path), name: String(cfg.name || displayName(cfg.path)) };
    }
  } catch {
    /* 마커 없음 → 폴백 */
  }
  return { path: LEGACY_DEFAULT, name: displayName(LEGACY_DEFAULT) };
}

// GET: PDF 목록 + 활성본
export async function GET() {
  const sb = admin();
  const { data: list, error } = await sb.storage.from(BUCKET).list("", {
    limit: 200,
    sortBy: { column: "created_at", order: "desc" },
  });
  if (error) return NextResponse.json({ error: error.message, files: [] }, { status: 500 });

  const active = await readActive(sb);
  const files = (list || [])
    .filter((f) => f.name !== ACTIVE_MARKER && /\.pdf$/i.test(f.name))
    .map((f) => ({
      path: f.name,
      name: displayName(f.name),
      size: f.metadata?.size ?? null,
      updatedAt: f.updated_at ?? f.created_at ?? null,
      url: sb.storage.from(BUCKET).getPublicUrl(f.name).data.publicUrl,
      active: f.name === active.path,
    }));

  return NextResponse.json({ files, activePath: active.path });
}

// POST: PDF 업로드 (multipart/form-data, field: file)
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
  if (!/\.pdf$/i.test(file.name || "") && file.type !== "application/pdf") {
    return NextResponse.json({ ok: false, error: "PDF 파일만 업로드할 수 있어요." }, { status: 400 });
  }

  const sb = admin();
  const safe = (file.name || "brochure.pdf").replace(/[^\w.\-가-힣]+/g, "_");
  const path = `${Date.now()}-${safe}`;
  const buf = new Uint8Array(await file.arrayBuffer());
  const { error } = await sb.storage.from(BUCKET).upload(path, buf, {
    contentType: "application/pdf",
    upsert: false,
  });
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, path });
}

// PATCH: 활성본 지정 ({ path })
export async function PATCH(req: Request) {
  const { path } = await req.json().catch(() => ({}));
  if (!path || typeof path !== "string") {
    return NextResponse.json({ ok: false, error: "path required" }, { status: 400 });
  }
  const sb = admin();
  const marker = JSON.stringify({ path, name: displayName(path) });
  // ⚠️ 'brochure' 버킷은 PDF MIME만 허용 → 마커 내용은 JSON이지만 content-type은 application/pdf로 업로드
  //    (읽을 때는 텍스트로 파싱하므로 저장 mime는 무관)
  const { error } = await sb.storage.from(BUCKET).upload(ACTIVE_MARKER, new TextEncoder().encode(marker), {
    contentType: "application/pdf",
    upsert: true,
  });
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, activePath: path });
}

// DELETE: 파일 삭제 (?path=)
export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const path = searchParams.get("path") || "";
  if (!path) return NextResponse.json({ ok: false, error: "path required" }, { status: 400 });

  const sb = admin();
  // 활성본을 지우면 마커도 정리 (다음 GET에서 폴백)
  const active = await readActive(sb);
  const { error } = await sb.storage.from(BUCKET).remove([path]);
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  if (active.path === path) {
    await sb.storage.from(BUCKET).remove([ACTIVE_MARKER]).catch(() => {});
  }
  return NextResponse.json({ ok: true });
}
