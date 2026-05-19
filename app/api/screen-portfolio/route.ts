import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { processPortfolioPdf } from "@/lib/portfolio-talent";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const name = (formData.get("name") as string) || "";

    if (!file) {
      return NextResponse.json({ error: "PDF 파일이 필요합니다." }, { status: 400 });
    }

    const pdfBuffer = Buffer.from(await file.arrayBuffer());

    if (pdfBuffer.length < 100 || !pdfBuffer.subarray(0, 5).toString().includes("PDF")) {
      return NextResponse.json({ error: "유효한 PDF 파일이 아닙니다." }, { status: 400 });
    }

    const result = await processPortfolioPdf(supabaseAdmin, pdfBuffer, { name });

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error("screen-portfolio error:", err);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
