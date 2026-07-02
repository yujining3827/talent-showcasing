"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { TalentForm, type TalentFormData } from "../_components/TalentForm";

export default function NewTalentPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  async function handleSave(data: TalentFormData) {
    setSaving(true);
    const { error } = await supabase.from("talents").insert({
      name: data.name,
      photo_url: data.photo_url || null,
      resume_url: data.resume_url || null,
      university: data.university || null,
      graduation_year: data.graduation_year || null,
      role: data.role,
      years_exp: data.years_exp,
      location: data.location,
      ovr_score: data.ovr_score,
      ovr_grade: data.ovr_grade,
      top_skills: data.top_skills,
      korean_level: data.korean_level,
      salary_min_vnd: data.salary_min_vnd,
      salary_max_vnd: data.salary_max_vnd,
      availability: data.availability,
      ktc_comment: data.ktc_comment,
      abilities: data.abilities,
      detailed_skills: data.detailed_skills,
      career_history: data.career_history,
      tags: data.tags,
      published: data.published,
    });
    setSaving(false);

    if (error) {
      alert("저장 실패: " + error.message);
      return;
    }
    router.push("/admin/talents");
  }

  return (
    <div>
      <h1 className="text-[22px] font-medium text-gray-900 tracking-tight mb-1">
        인재 등록
      </h1>
      <p className="text-[14px] text-gray-500 mb-6">
        새로운 인재 카드를 등록합니다
      </p>
      <TalentForm onSave={handleSave} saving={saving} />
    </div>
  );
}
