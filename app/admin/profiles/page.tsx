"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminI18n } from "@/lib/admin-i18n";

interface ProfileItem {
  candidate: {
    id: string;
    full_name: string;
    email: string | null;
    phone: string | null;
    position: string | null;
    city: string | null;
    cv_url: string | null;
    llm_score: number | null;
    llm_summary: string | null;
    applied_job: string | null;
    applied_company: string | null;
    pipeline_status: string;
    updated_at: string;
  };
  talent: {
    id: string;
    ovr_score: number;
    ovr_grade: string;
    role: string;
    top_skills: string[];
    photo_url: string | null;
  } | null;
  session: {
    id: string;
    status: string;
    total_score: number | null;
    ai_summary: string | null;
    access_code: string;
  } | null;
}

function getScoreColor(score: number) {
  if (score >= 85) return "text-[#E8590C]";
  if (score >= 70) return "text-[#3182F6]";
  return "text-[#6B7684]";
}

function getScoreBg(score: number) {
  if (score >= 85) return "bg-[#FFF8F0]";
  if (score >= 70) return "bg-[#E8F3FF]";
  return "bg-[#F2F4F6]";
}

export default function ProfilesPage() {
  const { t } = useAdminI18n();
  const router = useRouter();
  const [profiles, setProfiles] = useState<ProfileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/admin/profiles")
      .then((r) => r.json())
      .then((data) => {
        setProfiles(data.profiles || []);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = profiles.filter(
    (p) =>
      !search ||
      p.candidate.full_name.toLowerCase().includes(search.toLowerCase()) ||
      (p.candidate.position || "").toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-[14px] text-gray-500">{t("common.loading")}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-[22px] font-medium text-gray-900">프로필 카드</h1>
          <p className="text-[13px] text-gray-500 mt-1">
            최종합격 후보자의 종합 프로필을 확인하고 한국 기업에 전달할 수 있습니다
          </p>
        </div>
        <span className="text-[13px] text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full">
          {filtered.length}명
        </span>
      </div>

      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="이름 또는 포지션으로 검색..."
          className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-[13px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-gray-300"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200/60 py-16 text-center">
          <p className="text-[14px] text-gray-500">
            {profiles.length === 0 ? "최종합격 후보자가 없습니다" : "검색 결과가 없습니다"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((p) => {
            const { candidate: c, talent, session } = p;
            const score = talent?.ovr_score || c.llm_score || 0;
            const initial = c.full_name.charAt(0).toUpperCase();

            return (
              <div
                key={c.id}
                onClick={() => router.push(`/admin/profiles/${c.id}`)}
                className="bg-white rounded-2xl border-[0.5px] border-gray-200/60 p-5 hover:border-gray-300 cursor-pointer transition-colors active:scale-[0.99]"
              >
                <div className="flex items-center gap-4">
                  {/* 아바타 */}
                  {talent?.photo_url ? (
                    <img src={talent.photo_url} alt="" className="w-[48px] h-[48px] rounded-full object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-[48px] h-[48px] rounded-full bg-[#E8F3FF] flex items-center justify-center flex-shrink-0">
                      <span className="text-[16px] font-medium text-[#3182F6]">{initial}</span>
                    </div>
                  )}

                  {/* 기본 정보 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[15px] font-medium text-gray-900">{c.full_name}</span>
                      {score > 0 && (
                        <span className={`text-[12px] font-medium px-2 py-0.5 rounded-full ${getScoreBg(score)} ${getScoreColor(score)}`}>
                          {talent?.ovr_grade || ""} {score}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[12px] text-gray-500">
                      {(talent?.role || c.position) && <span>{talent?.role || c.position}</span>}
                      {c.city && <span>· {c.city}</span>}
                    </div>
                    {talent?.top_skills && talent.top_skills.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {talent.top_skills.filter(Boolean).slice(0, 4).map((s) => (
                          <span key={s} className="text-[11px] text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">{s}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 점수 요약 */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {/* 스크리닝 점수 */}
                    {c.llm_score !== null && (
                      <div className="text-center">
                        <p className="text-[11px] text-gray-400 mb-0.5">스크리닝</p>
                        <p className={`text-[16px] font-medium ${getScoreColor(c.llm_score)}`}>{c.llm_score}</p>
                      </div>
                    )}

                    {/* 인터뷰 점수 */}
                    {session?.total_score !== null && session?.total_score !== undefined && (
                      <div className="text-center">
                        <p className="text-[11px] text-gray-400 mb-0.5">인터뷰</p>
                        <p className="text-[16px] font-medium text-gray-900">{session.total_score}<span className="text-[12px] text-gray-400">/70</span></p>
                      </div>
                    )}

                    {/* 화살표 */}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#B0B8C1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
