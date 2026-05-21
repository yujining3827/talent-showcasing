"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminI18n } from "@/lib/admin-i18n";

export default function InterviewDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { t } = useAdminI18n();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<Record<string, any> | null>(null);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { fetchDetail(); }, []);

  const fetchDetail = async () => {
    const res = await fetch(`/api/admin/interviews/${params.id}`);
    const json = await res.json();
    setData(json);
    setNote(json.session?.human_review_note || "");
  };

  const updateDecision = async (decision: "pass" | "hold" | "fail") => {
    setSaving(true);
    await fetch(`/api/admin/interviews/${params.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ decision, note }),
    });
    setSaving(false);
    fetchDetail();
  };

  const deleteSession = async () => {
    setDeleting(true);
    await fetch(`/api/admin/interviews/${params.id}`, { method: "DELETE" });
    setDeleting(false);
    router.push("/admin/interviews");
  };

  if (!data) return <div className="py-8 text-[14px] text-gray-500">{t("common.loading")}</div>;
  const { session, responses } = data;

  const scoreColor = (score: number) => {
    if (score >= 7) return "text-status-available";
    if (score >= 4) return "text-blue-500";
    return "text-red-500";
  };

  const hasResponses = responses && responses.length > 0;
  const deadlineOverdue = session.deadline && !["scored", "completed"].includes(session.status) && new Date() > new Date(session.deadline);

  const infoItems = [
    { label: t("interviews.label.name"), value: session.candidate_name },
    { label: t("interviews.label.email"), value: session.candidate_email },
    { label: t("interviews.label.phone"), value: session.candidate_phone },
    { label: t("interviews.label.company"), value: session.applied_company },
    { label: t("interviews.label.position"), value: session.applied_position },
    { label: t("interviews.label.deadline"), value: session.deadline ? new Date(session.deadline).toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh", year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: false }) + " (GMT+7)" : null, overdue: deadlineOverdue },
  ];

  return (
    <div className="max-w-[800px]">
      <button onClick={() => router.back()} className="text-[13px] text-gray-500 mb-4 hover:text-gray-700 transition-colors duration-100">
        &larr; {t("interviews.back")}
      </button>

      {/* 기본 정보 */}
      <div className="bg-white rounded-2xl border-[0.5px] border-gray-200/60 p-6 mb-6">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-[12px] font-mono text-gray-400">{session.access_code}</span>
              <span className={`text-[12px] px-2 py-0.5 rounded-full ${
                session.status === "scored" ? "bg-status-available/10 text-status-available" :
                session.status === "in_progress" ? "bg-grade-s-bg text-grade-s-text" :
                session.status === "completed" ? "bg-blue-50 text-blue-500" :
                session.status === "abandoned" ? "bg-red-400/10 text-red-500" :
                "bg-gray-100 text-gray-600"
              }`}>{session.status}</span>
            </div>

            <div className="grid grid-cols-2 gap-x-8 gap-y-2">
              {infoItems.map(item => (
                <div key={item.label}>
                  <span className="text-[12px] text-gray-400">{item.label}</span>
                  <p className={`text-[14px] ${(item as { overdue?: boolean }).overdue ? "text-red-500 font-medium" : "text-gray-900"}`}>
                    {item.value || <span className="text-gray-400">—</span>}
                    {(item as { overdue?: boolean }).overdue && <span className="ml-2 text-[11px] px-1.5 py-0.5 rounded-full bg-red-500/10 text-red-500">{t("interviews.overdue")}</span>}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-3 text-[12px] text-gray-400 space-y-0.5">
              {session.created_at && <p>{t("interviews.label.created")}: {new Date(session.created_at).toLocaleString()}</p>}
              {session.started_at && <p>{t("interviews.label.started")}: {new Date(session.started_at).toLocaleString()}</p>}
              {session.completed_at && <p>{t("interviews.label.completed")}: {new Date(session.completed_at).toLocaleString()}</p>}
            </div>
          </div>

          <button onClick={() => setShowDeleteConfirm(true)}
            className="px-3 py-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl text-[13px] transition-colors duration-100 flex items-center gap-1 ml-4">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
            </svg>
            {t("common.delete")}
          </button>
        </div>

        {session.total_score !== null && (
          <div className="mt-4 p-4 bg-blue-50 rounded-xl">
            <div className="text-[28px] font-medium text-blue-500">{session.total_score}/70</div>
            <div className="text-[13px] text-gray-600 mt-1">
              {Math.round((session.total_score / 70) * 100)}% — Suggested: <span className="font-medium">{session.total_score >= 36 ? "PASS" : "FAIL"}</span> (cutoff 36)
            </div>
          </div>
        )}

        {session.ai_summary && (
          <div className="mt-4">
            <h3 className="font-medium text-[12px] text-gray-500 uppercase mb-2">AI Summary</h3>
            <p className="text-gray-800 bg-gray-50 p-4 rounded-xl whitespace-pre-wrap text-[14px]">{session.ai_summary}</p>
          </div>
        )}
      </div>

      {/* 응답 */}
      {hasResponses && (
        <div className="space-y-4 mb-6">
          <h3 className="font-medium text-[12px] text-gray-500 uppercase">Responses</h3>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {(responses || []).map((r: Record<string, any>) => (
            <div key={r.id} className="bg-white border-[0.5px] border-gray-200/60 rounded-xl p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <span className="text-[12px] text-gray-500">Q{r.question_order}</span>
                  <h4 className="font-medium text-[15px] text-gray-900">{r.interview_questions?.category}</h4>
                </div>
                <div className={`text-[24px] font-medium ${scoreColor(r.score)}`}>{r.score}/10</div>
              </div>
              <div className="text-[12px] text-gray-500 mb-2">
                <span className="font-medium">Q:</span> {r.interview_questions?.question_text_en}
              </div>
              {r.audioUrl && <audio controls src={r.audioUrl} className="w-full my-2 h-8" />}
              <div className="text-[13px] space-y-2 mt-2">
                <div>
                  <p className="text-gray-500 mb-1 text-[12px]">Transcript ({r.transcript_language}):</p>
                  <p className="text-gray-800 italic bg-gray-50 p-2 rounded-lg text-[13px]">&ldquo;{r.transcript}&rdquo;</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1 text-[12px]">AI Reasoning:</p>
                  <p className="text-gray-700 text-[13px]">{r.score_reasoning}</p>
                </div>
                <div className="text-[12px] text-gray-400">Duration: {r.duration_seconds}s</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 미진행 */}
      {!hasResponses && session.status === "pending" && (
        <div className="bg-white rounded-2xl border-[0.5px] border-gray-200/60 p-8 mb-6 text-center">
          <p className="text-gray-400 text-[14px]">{t("interviews.notStarted")}</p>
          <p className="text-gray-400 text-[12px] mt-1">{t("interviews.notStartedHint")}</p>
        </div>
      )}

      {/* Human Review */}
      {hasResponses && (
        <div className="bg-white rounded-2xl border-[0.5px] border-gray-200/60 p-6">
          <h3 className="font-medium text-[12px] text-gray-500 uppercase mb-3">{t("interviews.humanReview")}</h3>
          <textarea value={note} onChange={(e) => setNote(e.target.value)}
            placeholder={t("interviews.notePlaceholder")} rows={4}
            className="w-full px-3 py-2 border-[0.5px] border-gray-200 rounded-xl mb-4 text-[14px] outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          <div className="flex gap-2">
            <button onClick={() => updateDecision("pass")} disabled={saving}
              className="flex-1 bg-status-available hover:opacity-90 text-white py-3 rounded-xl font-medium disabled:opacity-50 transition-colors duration-100">PASS</button>
            <button onClick={() => updateDecision("hold")} disabled={saving}
              className="flex-1 bg-grade-s-text hover:opacity-90 text-white py-3 rounded-xl font-medium disabled:opacity-50 transition-colors duration-100">HOLD</button>
            <button onClick={() => updateDecision("fail")} disabled={saving}
              className="flex-1 bg-red-500 hover:opacity-90 text-white py-3 rounded-xl font-medium disabled:opacity-50 transition-colors duration-100">FAIL</button>
          </div>
          {session.human_decision && (
            <p className="mt-3 text-[13px] text-gray-500">
              {t("interviews.currentDecision")}: <span className={`font-medium ${
                session.human_decision === "pass" ? "text-status-available" :
                session.human_decision === "fail" ? "text-red-500" : "text-grade-s-text"
              }`}>{session.human_decision.toUpperCase()}</span>
              {session.human_reviewed_at && ` (${t("interviews.reviewed")} ${new Date(session.human_reviewed_at).toLocaleString()})`}
            </p>
          )}
        </div>
      )}

      {/* 삭제 확인 */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowDeleteConfirm(false)}>
          <div className="bg-white rounded-2xl max-w-sm w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-[18px] font-medium text-gray-900 mb-2">{t("interviews.deleteSession")}</h2>
            <p className="text-[13px] text-gray-600 mb-1">{t("interviews.col.code")}: <span className="font-mono">{session.access_code}</span></p>
            {session.candidate_name && <p className="text-[13px] text-gray-600 mb-1">{t("interviews.col.name")}: {session.candidate_name}</p>}
            <p className="text-[13px] text-red-500 mt-3 mb-4">{t("interviews.deleteConfirm")}</p>
            <div className="flex gap-2">
              <button onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 bg-gray-100 rounded-xl text-[14px] text-gray-700 hover:bg-gray-200 transition-colors duration-100">{t("common.cancel")}</button>
              <button onClick={deleteSession} disabled={deleting}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-xl text-[14px] hover:bg-red-600 disabled:opacity-50 transition-colors duration-100">
                {deleting ? t("interviews.deleting") : t("common.delete")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
