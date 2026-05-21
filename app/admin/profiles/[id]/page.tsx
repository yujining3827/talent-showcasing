"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminI18n } from "@/lib/admin-i18n";

interface ProfileData {
  candidate: {
    id: string;
    full_name: string;
    email: string | null;
    phone: string | null;
    city: string | null;
    position: string | null;
    yoe: string | null;
    cv_url: string | null;
    portfolio_url: string | null;
    skills: string | null;
    source: string;
    applied_job: string | null;
    applied_company: string | null;
    llm_score: number | null;
    llm_summary: string | null;
    pipeline_status: string;
    talent_id: string | null;
  };
  talent: {
    id: string;
    name: string;
    role: string;
    years_exp: number;
    location: string;
    ovr_score: number;
    ovr_grade: string;
    top_skills: string[];
    abilities: { technical: number; english: number; collaboration: number; stability: number; growth: number };
    detailed_skills: { name: string; score: number; type: string }[];
    career_history: { tier: string; position: string; startDate: string; endDate: string; current: boolean }[];
    tags: string[];
    ktc_comment: string;
    resume_url: string | null;
    photo_url: string | null;
    verification: string[];
  } | null;
  session: {
    id: string;
    access_code: string;
    status: string;
    total_score: number | null;
    ai_summary: string | null;
    candidate_name: string;
    candidate_email: string;
    candidate_phone: string;
    applied_company: string;
    applied_position: string;
    created_at: string;
    started_at: string | null;
    completed_at: string | null;
    human_decision: string | null;
    human_review_note: string | null;
  } | null;
  responses: {
    id: string;
    question_order: number;
    score: number;
    score_reasoning: string;
    transcript: string;
    transcript_language: string;
    duration_seconds: number;
    interview_questions: {
      category: string;
      question_text_en: string;
      question_text_vi: string;
    };
  }[] | null;
}

const ABILITY_LABELS: Record<string, string> = {
  technical: "실무력",
  english: "영어",
  collaboration: "협업·소통",
  stability: "안정성",
  growth: "성장성",
};

const ABILITY_KEYS = ["technical", "english", "collaboration", "stability", "growth"] as const;

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

function getInterviewScoreColor(score: number) {
  if (score >= 7) return "text-[#1D9E75]";
  if (score >= 4) return "text-[#3182F6]";
  return "text-red-500";
}

export default function ProfileDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { t } = useAdminI18n();
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<"screening" | "interview" | "resume">("screening");

  useEffect(() => {
    fetch(`/api/admin/profiles?candidateId=${params.id}`)
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return <div className="py-8 text-[14px] text-gray-500">{t("common.loading")}</div>;
  }

  if (!data?.candidate) {
    return (
      <div className="py-8 text-center">
        <p className="text-[14px] text-gray-500">후보자를 찾을 수 없습니다</p>
        <button onClick={() => router.back()} className="mt-3 text-[13px] text-[#3182F6]">돌아가기</button>
      </div>
    );
  }

  const { candidate: c, talent, session, responses } = data;
  const summary = c.llm_summary ? JSON.parse(c.llm_summary) : null;
  const resumeUrl = c.cv_url || talent?.resume_url || null;
  const photoUrl = talent?.photo_url || null;
  const initial = c.full_name.charAt(0).toUpperCase();
  const ovrScore = talent?.ovr_score || c.llm_score || 0;

  const sections = [
    { key: "screening" as const, label: "서류 스크리닝", available: !!summary },
    { key: "interview" as const, label: "AI 인터뷰", available: !!session },
    { key: "resume" as const, label: "이력서", available: !!resumeUrl },
  ];

  return (
    <div className="max-w-[800px]">
      {/* 뒤로가기 */}
      <button onClick={() => router.back()} className="text-[13px] text-gray-500 mb-4 hover:text-gray-700 transition-colors">
        &larr; 프로필 카드 목록
      </button>

      {/* 프로필 헤더 */}
      <div className="bg-white rounded-2xl border-[0.5px] border-gray-200/60 p-6 mb-4">
        <div className="flex items-start gap-5">
          {/* 사진 */}
          {photoUrl ? (
            <img src={photoUrl} alt="" className="w-[80px] h-[80px] rounded-full object-cover flex-shrink-0" />
          ) : (
            <div className="w-[80px] h-[80px] rounded-full bg-[#E8F3FF] flex items-center justify-center flex-shrink-0">
              <span className="text-[26px] font-medium text-[#3182F6]">{initial}</span>
            </div>
          )}

          {/* 기본 정보 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-[20px] font-medium text-gray-900">{c.full_name}</h1>
              {ovrScore > 0 && (
                <span className={`text-[13px] font-medium px-2.5 py-1 rounded-full ${getScoreBg(ovrScore)} ${getScoreColor(ovrScore)}`}>
                  {talent?.ovr_grade || ""} {ovrScore}
                </span>
              )}
            </div>
            <p className="text-[14px] text-gray-500 mb-2">
              {talent?.role || c.position || "—"} · {c.city || talent?.location || "—"}
              {(talent?.years_exp || c.yoe) && ` · ${talent?.years_exp || c.yoe}년차`}
            </p>

            {/* 연락처 */}
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-gray-500">
              {c.email && (
                <span className="flex items-center gap-1">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                  {c.email}
                </span>
              )}
              {c.phone && (
                <span className="flex items-center gap-1">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
                  </svg>
                  {c.phone}
                </span>
              )}
            </div>

            {/* 검증 칩 */}
            {talent?.verification && talent.verification.length > 0 && (
              <div className="flex gap-1.5 mt-3">
                {talent.verification.map((v) => (
                  <span key={v} className="text-[11px] text-[#1D9E75] bg-[#1D9E75]/8 px-2 py-0.5 rounded-full">
                    {v}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* 점수 카드 */}
          <div className="flex gap-3 flex-shrink-0">
            {c.llm_score !== null && (
              <div className={`text-center px-4 py-3 rounded-xl ${getScoreBg(c.llm_score)}`}>
                <p className={`text-[24px] font-medium leading-none ${getScoreColor(c.llm_score)}`}>{c.llm_score}</p>
                <p className="text-[11px] text-gray-500 mt-1">스크리닝</p>
              </div>
            )}
            {session?.total_score !== null && session?.total_score !== undefined && (
              <div className="text-center px-4 py-3 rounded-xl bg-[#E8F3FF]">
                <p className="text-[24px] font-medium leading-none text-[#3182F6]">
                  {session.total_score}<span className="text-[14px] text-[#3182F6]/60">/70</span>
                </p>
                <p className="text-[11px] text-gray-500 mt-1">인터뷰</p>
              </div>
            )}
          </div>
        </div>

        {/* KTC 한줄 요약 */}
        {talent?.ktc_comment && (
          <div className="mt-4 bg-[#F7F8FA] rounded-xl px-4 py-3">
            <p className="text-[13px] text-gray-800 leading-relaxed">{talent.ktc_comment}</p>
          </div>
        )}

        {/* 핵심 스킬 태그 */}
        {talent?.top_skills && talent.top_skills.filter(Boolean).length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {talent.top_skills.filter(Boolean).map((s) => (
              <span key={s} className="text-[11px] text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full">{s}</span>
            ))}
          </div>
        )}

        {/* 링크 */}
        <div className="flex gap-2 mt-4">
          {resumeUrl && (
            <a href={resumeUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3.5 py-2 bg-gray-100 rounded-xl text-[13px] text-gray-700 hover:bg-gray-200 transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              이력서 보기
            </a>
          )}
          {c.portfolio_url && (
            <a href={c.portfolio_url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3.5 py-2 bg-gray-100 rounded-xl text-[13px] text-gray-700 hover:bg-gray-200 transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
              포트폴리오
            </a>
          )}
        </div>
      </div>

      {/* 섹션 탭 */}
      <div className="flex gap-1.5 mb-4">
        {sections.filter((s) => s.available).map((s) => (
          <button
            key={s.key}
            onClick={() => setActiveSection(s.key)}
            className={`px-4 py-2 rounded-full text-[13px] transition-colors ${
              activeSection === s.key
                ? "bg-gray-900 text-white"
                : "bg-white border border-gray-200 text-gray-700 hover:border-gray-300"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* 서류 스크리닝 결과 */}
      {activeSection === "screening" && summary && (
        <div className="space-y-4">
          {/* 점수 + 판정 */}
          <div className="bg-white rounded-2xl border-[0.5px] border-gray-200/60 p-5">
            <h3 className="text-[12px] text-gray-400 mb-3">LLM 스크리닝 결과</h3>
            <div className="flex items-center gap-3 mb-4">
              <span className={`text-[32px] font-medium ${getScoreColor(c.llm_score || 0)}`}>{c.llm_score}</span>
              <span className={`px-2.5 py-1 rounded-full text-[12px] font-medium ${
                summary.verdict === "PASS" ? "bg-[#1D9E75]/10 text-[#1D9E75]" : "bg-[#E8590C]/10 text-[#E8590C]"
              }`}>
                {summary.verdict}
              </span>
              {summary.company && <span className="text-[12px] text-gray-500">{summary.company}</span>}
            </div>

            {/* 경력 검증 */}
            {summary.yoe_check && (
              <div className="mb-3">
                <p className="text-[11px] text-gray-400 mb-1">경력 검증</p>
                <p className="text-[13px] text-gray-700">{summary.yoe_check}</p>
              </div>
            )}

            {/* 요약 */}
            {(summary.summary_ko || summary.summary_en || summary.summary) && (
              <div className="mb-3">
                <p className="text-[11px] text-gray-400 mb-1">요약</p>
                <p className="text-[13px] text-gray-700 leading-relaxed">
                  {summary.summary_ko || summary.summary_en || summary.summary}
                </p>
              </div>
            )}

            {/* 스킬 */}
            {summary.top_skills?.length > 0 && (
              <div className="mb-3">
                <p className="text-[11px] text-gray-400 mb-1.5">스킬</p>
                <div className="flex flex-wrap gap-1.5">
                  {summary.top_skills.map((s: string) => (
                    <span key={s} className="text-[11px] bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full">{s}</span>
                  ))}
                </div>
              </div>
            )}

            {/* 강점 */}
            {(summary.strengths_ko || summary.strengths_en || summary.strengths)?.length > 0 && (
              <div className="mb-3">
                <p className="text-[11px] text-gray-400 mb-1">강점</p>
                {(summary.strengths_ko || summary.strengths_en || summary.strengths).map((s: string, i: number) => (
                  <p key={i} className="text-[12px] text-[#1D9E75] mb-0.5">• {s}</p>
                ))}
              </div>
            )}

            {/* 약점 */}
            {(summary.gaps_ko || summary.gaps_en || summary.gaps)?.length > 0 && (
              <div className="mb-3">
                <p className="text-[11px] text-gray-400 mb-1">약점</p>
                {(summary.gaps_ko || summary.gaps_en || summary.gaps).map((g: string, i: number) => (
                  <p key={i} className="text-[12px] text-[#E8590C] mb-0.5">• {g}</p>
                ))}
              </div>
            )}

            {/* 경력 */}
            {summary.career_history?.length > 0 && (
              <div>
                <p className="text-[11px] text-gray-400 mb-1">경력</p>
                {summary.career_history.map((ch: { company: string; position: string; period: string }, i: number) => (
                  <p key={i} className="text-[12px] text-gray-700 mb-0.5">
                    • {ch.company} — {ch.position} ({ch.period})
                  </p>
                ))}
              </div>
            )}
          </div>

          {/* 능력치 */}
          {talent?.abilities && !ABILITY_KEYS.every((k) => talent.abilities[k] === 0) && (
            <div className="bg-white rounded-2xl border-[0.5px] border-gray-200/60 p-5">
              <h3 className="text-[12px] text-gray-400 mb-3">능력치 분석</h3>
              <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                {ABILITY_KEYS.map((key) => {
                  const value = talent.abilities[key] || 0;
                  return (
                    <div key={key}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[12px] text-gray-500">{ABILITY_LABELS[key]}</span>
                        <span className={`text-[13px] font-medium ${getScoreColor(value)}`}>{value}</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${value >= 85 ? "bg-[#E8590C]" : value >= 70 ? "bg-[#3182F6]" : "bg-gray-400"}`}
                          style={{ width: `${value}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 세부 스킬 */}
          {talent?.detailed_skills && talent.detailed_skills.length > 0 && (
            <div className="bg-white rounded-2xl border-[0.5px] border-gray-200/60 p-5">
              <h3 className="text-[12px] text-gray-400 mb-3">세부 스킬</h3>
              <div className="grid grid-cols-2 gap-x-5 gap-y-2">
                {talent.detailed_skills.map((skill) => (
                  <div key={skill.name} className="flex items-center gap-2">
                    <span className="text-[12px] text-gray-900 w-[80px] flex-shrink-0">{skill.name}</span>
                    <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${skill.type === "core" ? "bg-[#3182F6]" : "bg-gray-400"}`}
                        style={{ width: `${skill.score}%` }}
                      />
                    </div>
                    <span className="text-[11px] text-gray-500 w-5 text-right">{skill.score}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* AI 인터뷰 결과 */}
      {activeSection === "interview" && session && (
        <div className="space-y-4">
          {/* 인터뷰 기본 정보 + 점수 */}
          <div className="bg-white rounded-2xl border-[0.5px] border-gray-200/60 p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-[12px] text-gray-400 mb-1">AI 인터뷰 결과</h3>
                <span className="text-[12px] font-mono text-gray-400">{session.access_code}</span>
              </div>
              <span className={`text-[12px] px-2 py-0.5 rounded-full ${
                session.status === "scored" ? "bg-[#1D9E75]/10 text-[#1D9E75]" :
                session.status === "completed" ? "bg-[#E8F3FF] text-[#3182F6]" :
                "bg-gray-100 text-gray-600"
              }`}>{session.status}</span>
            </div>

            {session.total_score !== null && (
              <div className="bg-[#E8F3FF] rounded-xl p-4 mb-4">
                <div className="flex items-end gap-2">
                  <span className="text-[32px] font-medium text-[#3182F6]">{session.total_score}</span>
                  <span className="text-[16px] text-[#3182F6]/60 mb-1">/70</span>
                </div>
                <p className="text-[13px] text-gray-600 mt-1">
                  {Math.round((session.total_score / 70) * 100)}% — 판정:{" "}
                  <span className={`font-medium ${session.total_score >= 36 ? "text-[#1D9E75]" : "text-red-500"}`}>
                    {session.total_score >= 36 ? "PASS" : "FAIL"}
                  </span>
                  {" "}(커트라인 36)
                </p>
              </div>
            )}

            {/* AI 서머리 */}
            {session.ai_summary && (
              <div>
                <p className="text-[11px] text-gray-400 mb-1">AI Summary</p>
                <p className="text-[13px] text-gray-700 leading-relaxed bg-[#F7F8FA] rounded-xl p-3.5 whitespace-pre-wrap">
                  {session.ai_summary}
                </p>
              </div>
            )}

            {/* 타임스탬프 */}
            <div className="mt-3 text-[11px] text-gray-400 space-y-0.5">
              {session.created_at && <p>생성: {new Date(session.created_at).toLocaleString()}</p>}
              {session.started_at && <p>시작: {new Date(session.started_at).toLocaleString()}</p>}
              {session.completed_at && <p>완료: {new Date(session.completed_at).toLocaleString()}</p>}
            </div>
          </div>

          {/* 개별 응답 */}
          {responses && responses.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-[12px] text-gray-400">질문별 응답</h3>
              {responses.map((r) => (
                <div key={r.id} className="bg-white rounded-2xl border-[0.5px] border-gray-200/60 p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="text-[11px] text-gray-400">Q{r.question_order}</span>
                      <h4 className="text-[14px] font-medium text-gray-900">{r.interview_questions?.category}</h4>
                    </div>
                    <span className={`text-[20px] font-medium ${getInterviewScoreColor(r.score)}`}>{r.score}/10</span>
                  </div>
                  <p className="text-[12px] text-gray-500 mb-2">
                    <span className="font-medium">Q:</span> {r.interview_questions?.question_text_en}
                  </p>
                  <div className="space-y-2">
                    <div>
                      <p className="text-[11px] text-gray-400 mb-0.5">답변 ({r.transcript_language})</p>
                      <p className="text-[12px] text-gray-700 italic bg-[#F7F8FA] p-2.5 rounded-lg">&ldquo;{r.transcript}&rdquo;</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-gray-400 mb-0.5">AI 평가</p>
                      <p className="text-[12px] text-gray-600">{r.score_reasoning}</p>
                    </div>
                    <p className="text-[11px] text-gray-400">소요시간: {r.duration_seconds}초</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Human Review 결과 */}
          {session.human_decision && (
            <div className="bg-white rounded-2xl border-[0.5px] border-gray-200/60 p-5">
              <h3 className="text-[12px] text-gray-400 mb-2">담당자 판정</h3>
              <span className={`text-[14px] font-medium ${
                session.human_decision === "pass" ? "text-[#1D9E75]" :
                session.human_decision === "fail" ? "text-red-500" : "text-[#E8590C]"
              }`}>
                {session.human_decision.toUpperCase()}
              </span>
              {session.human_review_note && (
                <p className="text-[13px] text-gray-600 mt-2 bg-[#F7F8FA] rounded-xl p-3">{session.human_review_note}</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* 이력서 */}
      {activeSection === "resume" && resumeUrl && (
        <div className="bg-white rounded-2xl border-[0.5px] border-gray-200/60 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-[12px] text-gray-400">이력서</h3>
            <a href={resumeUrl} target="_blank" rel="noopener noreferrer"
              className="text-[12px] text-[#3182F6] hover:text-[#2272EB] flex items-center gap-1">
              새 탭에서 열기
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </a>
          </div>
          {resumeUrl.toLowerCase().endsWith(".pdf") || resumeUrl.includes("drive.google.com") ? (
            <div className="w-full" style={{ height: "80vh" }}>
              <iframe
                src={resumeUrl.includes("drive.google.com")
                  ? resumeUrl.replace(/\/view.*$/, "/preview")
                  : resumeUrl
                }
                className="w-full h-full border-0"
                title="이력서"
              />
            </div>
          ) : (
            <div className="p-8 text-center">
              <p className="text-[14px] text-gray-500 mb-3">이력서 미리보기를 지원하지 않는 형식입니다</p>
              <a href={resumeUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#3182F6] text-white text-[13px] rounded-xl hover:bg-[#2272EB] transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                이력서 다운로드
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
