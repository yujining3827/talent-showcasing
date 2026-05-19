import type { SupabaseClient } from "@supabase/supabase-js";
import { screenPortfolio } from "@/lib/portfolio-screening";
import type { PortfolioResult } from "@/lib/portfolio-screening";
import { extractAndUploadPhoto } from "@/lib/extract-photo";

function scoreToGrade(score: number): string {
  if (score >= 85) return "S";
  if (score >= 70) return "A";
  if (score >= 55) return "B";
  return "C";
}

function mapLocation(loc: string): string {
  if (!loc) return "기타";
  if (/ho chi minh|hcm|호치민|hồ chí minh/i.test(loc)) return "호치민";
  if (/ha noi|hanoi|하노이|hà nội/i.test(loc)) return "하노이";
  if (/da nang|danang|다낭|đà nẵng/i.test(loc)) return "다낭";
  return "기타";
}

interface ProcessResult {
  success: true;
  talent_id: string;
  score: number;
  grade: string;
  role: string;
  years_exp: number;
  top_skills: string[];
  summary_ko: string;
  strengths_ko: string[];
}

export async function processPortfolioPdf(
  supabase: SupabaseClient,
  pdfBuffer: Buffer,
  opts: { name?: string; source?: string; externalId?: string } = {}
): Promise<ProcessResult | { error: string }> {
  const result = await screenPortfolio(pdfBuffer);

  if ("error" in result) {
    return { error: result.error };
  }

  const r = result as PortfolioResult;
  const score = r.score || 0;
  const topSkills = r.top_skills.slice(0, 5);
  const strengthsKo = r.strengths_ko || r.strengths_en || [];
  const careerHistory = (r.career_history || []).map((ch) => ({
    tier: ch.company,
    position: ch.position,
    startDate: ch.period?.split("-")[0]?.trim() || "",
    endDate: ch.period?.split("-")[1]?.trim() || "현재",
    current: (ch.period || "").toLowerCase().includes("present"),
  }));

  const displayName = opts.name || r.role || "Unknown";
  const source = opts.source || "포트폴리오 등록";

  // PDF를 Supabase Storage에 업로드
  const pdfPath = `portfolios/${crypto.randomUUID()}.pdf`;
  const { data: uploadData } = await supabase.storage
    .from("resumes")
    .upload(pdfPath, pdfBuffer, { contentType: "application/pdf" });

  const resumeUrl = uploadData?.path
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/resumes/${uploadData.path}`
    : null;

  const { data: talent, error: insertError } = await supabase
    .from("talents")
    .insert({
      name: displayName,
      role: r.role || "Unknown",
      years_exp: Math.round(r.years_exp || 0),
      location: mapLocation(r.location || ""),
      ovr_score: score,
      ovr_grade: scoreToGrade(score),
      top_skills: topSkills.length >= 2 ? [topSkills[0], topSkills[1]] : [topSkills[0] || "", topSkills[1] || ""],
      korean_level: 1,
      desired_salary_krw: 0,
      availability: "negotiable",
      ktc_comment: r.summary_ko || r.summary_en || "",
      abilities: r.abilities || { technical: 0, english: 0, collaboration: 0, stability: 0, growth: 0 },
      detailed_skills: topSkills.map((s, idx) => ({
        name: s,
        score: Math.max(50, 95 - idx * 8),
        type: idx < 3 ? "core" : "sub",
      })),
      career_history: careerHistory,
      tags: [...strengthsKo.slice(0, 3)],
      verification: [source],
      resume_url: resumeUrl,
      published: false,
      external_id: opts.externalId || null,
      external_source: opts.externalId ? source : null,
    })
    .select("id")
    .single();

  if (insertError) {
    return { error: "인재 카드 생성 실패: " + insertError.message };
  }

  // PDF에서 프로필 사진 추출
  if (talent) {
    const photoUrl = await extractAndUploadPhoto(supabase, pdfBuffer, talent.id);
    if (photoUrl) {
      await supabase
        .from("talents")
        .update({ photo_url: photoUrl })
        .eq("id", talent.id);
    }
  }

  return {
    success: true,
    talent_id: talent!.id,
    score,
    grade: scoreToGrade(score),
    role: r.role,
    years_exp: r.years_exp,
    top_skills: topSkills,
    summary_ko: r.summary_ko,
    strengths_ko: strengthsKo,
  };
}
