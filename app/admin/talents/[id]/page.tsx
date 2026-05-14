"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { TalentForm, type TalentFormData } from "../_components/TalentForm";

export default function EditTalentPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [initialData, setInitialData] = useState<TalentFormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from("talents")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) {
        alert("인재 정보를 불러올 수 없습니다");
        router.push("/admin/talents");
        return;
      }

      setInitialData({
        name: data.name,
        photo_url: data.photo_url || undefined,
        resume_url: data.resume_url || undefined,
        role: data.role,
        years_exp: data.years_exp,
        location: data.location,
        ovr_score: data.ovr_score,
        ovr_grade: data.ovr_grade,
        top_skills: data.top_skills,
        korean_level: data.korean_level,
        desired_salary_krw: data.desired_salary_krw,
        availability: data.availability,
        ktc_comment: data.ktc_comment || "",
        abilities: data.abilities,
        detailed_skills: data.detailed_skills,
        career_history: data.career_history,
        tags: data.tags || [],
        published: data.published ?? true,
      });
      setLoading(false);
    }
    load();
  }, [id, router]);

  async function handleSave(formData: TalentFormData) {
    setSaving(true);
    const { error } = await supabase
      .from("talents")
      .update({
        ...formData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);
    setSaving(false);

    if (error) {
      alert("저장 실패: " + error.message);
      return;
    }
    router.push("/admin/talents");
  }

  if (loading) {
    return (
      <div className="text-center py-16">
        <p className="text-[14px] text-gray-500">로딩 중...</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-[22px] font-medium text-gray-900 tracking-tight mb-1">
        인재 수정
      </h1>
      <p className="text-[14px] text-gray-500 mb-6">
        인재 카드 정보를 수정합니다
      </p>
      {initialData && (
        <TalentForm initialData={initialData} onSave={handleSave} saving={saving} />
      )}
    </div>
  );
}
