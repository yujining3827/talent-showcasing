import { Talent, pickExCompany } from "@/lib/types";
import { translateRole } from "@/lib/i18n";

// 스핀오프 프리미엄 톤 (toptal 지향)
const NAVY = "#16213E"; // 강조 텍스트(이름/대학)
const ACCENT = "#2751E0"; // Ex-회사 pill, 강조 포인트

function getScoreStyle(score: number) {
  if (score >= 85) return "bg-grade-s-bg text-grade-s-text";
  if (score >= 70) return "bg-grade-a-bg text-grade-a-text";
  return "bg-grade-b-bg text-grade-b-text";
}

const VERIFY_COLORS: Record<string, string> = {
  "서류 합격": "#2751E0",
  "인터뷰 합격": "#1D9E75",
};

function CapIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
      <path d="M22 10L12 5 2 10l10 5 10-5z" />
      <path d="M6 12v5c0 1 2.5 2.5 6 2.5s6-1.5 6-2.5v-5" />
    </svg>
  );
}

function BriefcaseIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" />
    </svg>
  );
}

export function TalentCard({ talent, blurPhoto }: { talent: Talent; blurPhoto?: boolean }) {
  const verification = (talent as unknown as { verification?: string[] }).verification || [];
  const skills = (talent.top_skills?.[0] && talent.top_skills[0] !== "")
    ? talent.top_skills.filter(Boolean)
    : (talent.tags || []).slice(0, 3);
  const exCompany = pickExCompany(talent.career_history);
  const hasHighlight = Boolean(talent.university || exCompany);

  return (
    <div className="group bg-white rounded-2xl border border-gray-200 p-5 cursor-pointer transition-all duration-150 hover:border-gray-300 hover:shadow-[0_8px_24px_-12px_rgba(22,33,62,0.25)] active:scale-[0.99]">
      {/* 상단: 사진 + 이름/직무 + OVR */}
      <div className="flex items-start gap-3">
        <img
          src={talent.photo_url || "/default-profile.png"}
          alt=""
          className={`w-[52px] h-[52px] rounded-full object-cover flex-shrink-0 ring-1 ring-gray-100 ${blurPhoto ? "blur-[2px]" : ""}`}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="text-[16px] font-semibold leading-tight truncate" style={{ color: NAVY }}>
              {talent.name}
            </p>
            <span className={`text-[13px] font-medium px-2.5 py-[3px] rounded-full flex-shrink-0 ${getScoreStyle(talent.ovr_score)}`}>
              {talent.ovr_score}
            </span>
          </div>
          <p className="text-[12.5px] text-gray-500 mt-[3px] truncate">
            {translateRole(talent.role)} · {talent.years_exp > 0 ? `${talent.years_exp}년차` : "신입"} · {talent.location}
          </p>
        </div>
      </div>

      {/* 강조: 출신 대학 + 전 직장 (이 프로덕트의 핵심) */}
      {hasHighlight && (
        <div className="mt-3.5 flex flex-col gap-2">
          {talent.university && (
            <div className="flex items-center gap-2">
              <CapIcon />
              <span className="text-[13.5px] font-medium leading-tight truncate" style={{ color: NAVY }}>
                {talent.university}
              </span>
              {talent.graduation_year && (
                <span className="text-[11px] text-gray-400 flex-shrink-0">{talent.graduation_year}</span>
              )}
            </div>
          )}
          {exCompany && (
            <div className="flex items-center gap-1.5">
              <span
                className="inline-flex items-center gap-1 text-[12px] font-medium px-2 py-[3px] rounded-md"
                style={{ backgroundColor: ACCENT + "12", color: ACCENT }}
              >
                <BriefcaseIcon />
                Ex-{exCompany}
              </span>
            </div>
          )}
        </div>
      )}

      {/* 스킬 태그 */}
      {skills.length > 0 && (
        <div className="flex gap-1 mt-3.5 flex-wrap">
          {skills.slice(0, 3).map((skill) => (
            <span key={skill} className="text-[11px] text-gray-600 bg-gray-100 px-[7px] py-[3px] rounded-full leading-[18px] inline-flex items-center">
              {skill}
            </span>
          ))}
        </div>
      )}

      {/* 하단: 검증 칩 + 연봉 */}
      <div className="flex items-center justify-between mt-4 pt-3.5 border-t border-gray-100">
        <div className="flex gap-1.5">
          {verification.map((chip) => (
            <span key={chip} className="text-[10px] px-[7px] py-[2px] rounded-full leading-[16px] inline-flex items-center"
              style={{ backgroundColor: (VERIFY_COLORS[chip] || "#8B95A1") + "15", color: VERIFY_COLORS[chip] || "#8B95A1" }}>
              {chip}
            </span>
          ))}
        </div>
        {talent.salary_min_vnd > 0 && (
          <span className="text-[13px] font-semibold" style={{ color: "#FF5500" }}>
            {(talent.salary_min_vnd / 1000000).toFixed(0)}~{(talent.salary_max_vnd / 1000000).toFixed(0)}M
          </span>
        )}
      </div>
    </div>
  );
}
