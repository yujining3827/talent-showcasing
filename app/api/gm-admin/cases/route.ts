import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

/* 고객 사례 CRUD — /gm-admin/cases 용 (미들웨어 비밀번호로 보호됨)
 *  - 메인 DB(case_studies) service_role */
function admin() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

const slugify = (s: string) =>
  s.trim().toLowerCase().replace(/[^\w가-힣]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || `case-${Date.now()}`;

export async function GET() {
  const { data, error } = await admin().from("case_studies").select("*").order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message, cases: [] }, { status: 500 });
  return NextResponse.json({ cases: data || [] });
}

export async function POST(req: Request) {
  let b: Record<string, unknown>;
  try {
    b = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid json" }, { status: 400 });
  }

  const company = String(b.company || "").trim();
  const title = String(b.title || "").trim();
  if (!company || !title) return NextResponse.json({ ok: false, error: "고객사명과 제목은 필수입니다." }, { status: 400 });

  const slug = String(b.slug || "").trim() || slugify(company);

  const row = {
    slug,
    company,
    industry: String(b.industry || "").trim() || null,
    scope: String(b.scope || "").trim() || null,
    talent_role: String(b.talentRole || "").trim() || null,
    title,
    summary: String(b.summary || "").trim() || null,
    thumbnail: String(b.thumbnail || "").trim() || null,
    images: Array.isArray(b.images) ? b.images : [],
    metrics: Array.isArray(b.metrics) ? b.metrics : [],
    story: Array.isArray(b.story) ? b.story : [],
    blocks: Array.isArray(b.blocks) ? b.blocks : [],
    quote: String(b.quote || "").trim() || null,
    quote_by: String(b.quoteBy || "").trim() || null,
    interview: Array.isArray(b.interview) && b.interview.length ? b.interview : null,
    site_url: String(b.siteUrl || "").trim() || null,
    published: b.published === false ? false : true,
  };

  const { data, error } = await admin().from("case_studies").upsert(row, { onConflict: "slug" }).select().single();
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, case: data });
}

export async function DELETE(req: Request) {
  const url = new URL(req.url);
  const slug = url.searchParams.get("slug");
  if (!slug) return NextResponse.json({ ok: false, error: "slug 필요" }, { status: 400 });
  const { error } = await admin().from("case_studies").delete().eq("slug", slug);
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
