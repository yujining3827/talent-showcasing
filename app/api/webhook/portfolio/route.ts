import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { processPortfolioPdf } from "@/lib/portfolio-talent";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const WEBHOOK_SECRET = process.env.WEBHOOK_PORTFOLIO_SECRET;

function authenticate(req: Request): boolean {
  const authHeader = req.headers.get("x-api-key") || req.headers.get("authorization")?.replace("Bearer ", "");
  return !!WEBHOOK_SECRET && authHeader === WEBHOOK_SECRET;
}

// POST: 인재 등록 (신규 또는 업데이트)
export async function POST(req: Request) {
  if (!authenticate(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const contentType = req.headers.get("content-type") || "";

    let pdfBuffer: Buffer;
    let name = "";
    let source = "외부 연동";
    let externalId = "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      name = (formData.get("name") as string) || "";
      source = (formData.get("source") as string) || "외부 연동";
      externalId = (formData.get("external_id") as string) || "";

      if (!file) {
        return NextResponse.json({ error: "file field is required" }, { status: 400 });
      }
      pdfBuffer = Buffer.from(await file.arrayBuffer());
    } else if (contentType.includes("application/json")) {
      const body = await req.json();

      if (!body.pdf_base64) {
        return NextResponse.json({ error: "pdf_base64 field is required" }, { status: 400 });
      }
      pdfBuffer = Buffer.from(body.pdf_base64, "base64");
      name = body.name || "";
      source = body.source || "외부 연동";
      externalId = body.external_id || "";
    } else {
      return NextResponse.json(
        { error: "Content-Type must be multipart/form-data or application/json" },
        { status: 400 }
      );
    }

    if (pdfBuffer.length < 100 || !pdfBuffer.subarray(0, 5).toString().includes("PDF")) {
      return NextResponse.json({ error: "Invalid PDF file" }, { status: 400 });
    }

    // 중복 체크: 같은 source + external_id가 있으면 기존 카드 삭제 후 재생성
    if (externalId && source) {
      const { data: existing } = await supabaseAdmin
        .from("talents")
        .select("id, resume_url")
        .eq("external_source", source)
        .eq("external_id", externalId)
        .maybeSingle();

      if (existing) {
        // 기존 Storage 파일 삭제
        if (existing.resume_url) {
          const path = existing.resume_url.split("/resumes/")[1];
          if (path) await supabaseAdmin.storage.from("resumes").remove([path]);
        }
        // 기존 인재 카드 삭제
        await supabaseAdmin.from("talents").delete().eq("id", existing.id);
      }
    }

    const result = await processPortfolioPdf(supabaseAdmin, pdfBuffer, {
      name,
      source,
      externalId: externalId || undefined,
    });

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error("webhook/portfolio POST error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE: 인재 삭제 (공개 해제 시)
export async function DELETE(req: Request) {
  if (!authenticate(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    let source = searchParams.get("source");
    let externalId = searchParams.get("external_id");

    // query param 없으면 body에서 읽기
    if (!source || !externalId) {
      try {
        const body = await req.json();
        source = source || body.source;
        externalId = externalId || body.external_id;
      } catch {
        // body 파싱 실패 무시
      }
    }

    if (!source || !externalId) {
      return NextResponse.json(
        { error: "source and external_id are required" },
        { status: 400 }
      );
    }

    const { data: existing } = await supabaseAdmin
      .from("talents")
      .select("id, resume_url, photo_url")
      .eq("external_source", source)
      .eq("external_id", externalId)
      .maybeSingle();

    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Storage 파일 정리
    const pathsToRemove: string[] = [];
    if (existing.resume_url) {
      const p = existing.resume_url.split("/resumes/")[1];
      if (p) pathsToRemove.push(p);
    }
    if (existing.photo_url) {
      const p = existing.photo_url.split("/resumes/")[1];
      if (p) pathsToRemove.push(p);
    }
    if (pathsToRemove.length > 0) {
      await supabaseAdmin.storage.from("resumes").remove(pathsToRemove);
    }

    await supabaseAdmin.from("talents").delete().eq("id", existing.id);

    return NextResponse.json({ success: true, deleted_id: existing.id });
  } catch (err) {
    console.error("webhook/portfolio DELETE error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
