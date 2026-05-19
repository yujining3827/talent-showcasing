"use client";

import { useState, useRef } from "react";
import { useAdminI18n } from "@/lib/admin-i18n";

interface PoolEntry {
  id: string;
  name: string;
  file: File;
  status: "pending" | "screening" | "done" | "error";
  result?: {
    talent_id: string;
    score: number;
    grade: string;
    role: string;
    years_exp: number;
    top_skills: string[];
    summary_ko: string;
    strengths_ko: string[];
  };
  error?: string;
}

export default function PoolPage() {
  const { t } = useAdminI18n();
  const [entries, setEntries] = useState<PoolEntry[]>([]);
  const [busy, setBusy] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addFiles = (files: FileList | File[]) => {
    const newEntries: PoolEntry[] = Array.from(files)
      .filter((f) => f.type === "application/pdf")
      .map((file) => ({
        id: crypto.randomUUID(),
        name: file.name.replace(/\.pdf$/i, ""),
        file,
        status: "pending" as const,
      }));
    if (newEntries.length > 0) {
      setEntries((prev) => [...newEntries, ...prev]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files);
    }
  };

  const runAll = async () => {
    setBusy(true);
    const pending = entries.filter((e) => e.status === "pending");

    for (let i = 0; i < pending.length; i++) {
      const entry = pending[i];

      setEntries((prev) =>
        prev.map((e) => (e.id === entry.id ? { ...e, status: "screening" as const } : e))
      );

      try {
        const formData = new FormData();
        formData.append("file", entry.file);
        formData.append("name", entry.name);

        const res = await fetch("/api/screen-portfolio", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();

        if (data.error) {
          setEntries((prev) =>
            prev.map((e) => (e.id === entry.id ? { ...e, status: "error" as const, error: data.error } : e))
          );
        } else {
          setEntries((prev) =>
            prev.map((e) => (e.id === entry.id ? { ...e, status: "done" as const, result: data } : e))
          );
        }
      } catch {
        setEntries((prev) =>
          prev.map((e) => (e.id === entry.id ? { ...e, status: "error" as const, error: "요청 실패" } : e))
        );
      }

      if (i < pending.length - 1) {
        await new Promise((r) => setTimeout(r, 1500));
      }
    }

    setBusy(false);
  };

  const runSingle = async (entryId: string) => {
    const entry = entries.find((e) => e.id === entryId);
    if (!entry) return;

    setEntries((prev) =>
      prev.map((e) => (e.id === entryId ? { ...e, status: "screening" as const, error: undefined } : e))
    );

    try {
      const formData = new FormData();
      formData.append("file", entry.file);
      formData.append("name", entry.name);

      const res = await fetch("/api/screen-portfolio", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.error) {
        setEntries((prev) =>
          prev.map((e) => (e.id === entryId ? { ...e, status: "error" as const, error: data.error } : e))
        );
      } else {
        setEntries((prev) =>
          prev.map((e) => (e.id === entryId ? { ...e, status: "done" as const, result: data } : e))
        );
      }
    } catch {
      setEntries((prev) =>
        prev.map((e) => (e.id === entryId ? { ...e, status: "error" as const, error: "요청 실패" } : e))
      );
    }
  };

  const removeEntry = (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const updateName = (id: string, name: string) => {
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, name } : e)));
  };

  const pendingCount = entries.filter((e) => e.status === "pending").length;
  const doneCount = entries.filter((e) => e.status === "done").length;
  const errorCount = entries.filter((e) => e.status === "error").length;
  const screeningEntry = entries.find((e) => e.status === "screening");

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-[22px] font-medium text-gray-900">{t("pool.title")}</h1>
      </div>

      {/* 파일 업로드 영역 */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-8 mb-5 text-center hover:border-gray-300 transition-colors cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) addFiles(e.target.files);
            e.target.value = "";
          }}
        />
        <svg className="mx-auto mb-3" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#B0B8C1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        <p className="text-[14px] text-gray-700 mb-1">{t("pool.dropzone")}</p>
        <p className="text-[12px] text-gray-400">{t("pool.dropzoneHint")}</p>
      </div>

      {/* 상태 요약 + 실행 버튼 */}
      {entries.length > 0 && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-3 text-[13px]">
            <span className="text-gray-500">{t("pool.total")} <span className="text-gray-900 font-medium">{entries.length}</span></span>
            {pendingCount > 0 && <span className="text-gray-500">{t("pool.pending")} <span className="text-gray-900 font-medium">{pendingCount}</span></span>}
            {doneCount > 0 && <span className="text-[#1D9E75]">{t("pool.done")} <span className="font-medium">{doneCount}</span></span>}
            {errorCount > 0 && <span className="text-[#E8590C]">{t("pool.error")} <span className="font-medium">{errorCount}</span></span>}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setEntries([])}
              disabled={busy}
              className="px-3.5 py-2 text-[13px] text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-40"
            >
              {t("pool.clearAll")}
            </button>
            <button
              onClick={runAll}
              disabled={busy || pendingCount === 0}
              className="px-4 py-2 bg-[#3182F6] text-white text-[13px] rounded-xl hover:bg-[#2272EB] transition-colors disabled:opacity-50"
            >
              {busy
                ? `${t("pool.screening")}... (${doneCount + errorCount}/${entries.length})`
                : `${t("pool.runAll")} (${pendingCount})`}
            </button>
          </div>
        </div>
      )}

      {/* 진행 중 표시 */}
      {screeningEntry && (
        <div className="mb-4 px-4 py-3 bg-white border border-gray-200/60 rounded-xl">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-[#3182F6] border-t-transparent rounded-full animate-spin" />
            <span className="text-[13px] text-gray-700">
              {screeningEntry.name} {t("pool.screeningInProgress")}
            </span>
          </div>
        </div>
      )}

      {/* 리스트 */}
      {entries.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200/60 overflow-hidden">
          <div className="divide-y divide-gray-100">
            {entries.map((entry) => (
              <div key={entry.id} className="px-5 py-4">
                <div className="flex items-center gap-3">
                  {/* 상태 아이콘 */}
                  <div className="flex-shrink-0">
                    {entry.status === "pending" && (
                      <div className="w-[32px] h-[32px] rounded-full bg-gray-100 flex items-center justify-center">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8B95A1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                        </svg>
                      </div>
                    )}
                    {entry.status === "screening" && (
                      <div className="w-[32px] h-[32px] rounded-full bg-[#E8F3FF] flex items-center justify-center">
                        <div className="w-3.5 h-3.5 border-2 border-[#3182F6] border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                    {entry.status === "done" && (
                      <div className="w-[32px] h-[32px] rounded-full bg-[#1D9E75]/10 flex items-center justify-center">
                        <span className="text-[14px] font-medium text-[#1D9E75]">{entry.result?.score}</span>
                      </div>
                    )}
                    {entry.status === "error" && (
                      <div className="w-[32px] h-[32px] rounded-full bg-[#E8590C]/10 flex items-center justify-center">
                        <span className="text-[12px] text-[#E8590C]">!</span>
                      </div>
                    )}
                  </div>

                  {/* 정보 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      {entry.status === "pending" ? (
                        <input
                          type="text"
                          value={entry.name}
                          onChange={(e) => updateName(entry.id, e.target.value)}
                          className="text-[14px] font-medium text-gray-900 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-[#3182F6] focus:outline-none py-0 px-0 w-[200px]"
                        />
                      ) : (
                        <span className="text-[14px] font-medium text-gray-900">{entry.name}</span>
                      )}
                      {entry.result && (
                        <span className={`px-2 py-0.5 rounded-full text-[11px] ${
                          entry.result.score >= 85 ? "bg-[#FFF8F0] text-[#E8590C]"
                            : entry.result.score >= 70 ? "bg-[#E8F3FF] text-[#3182F6]"
                            : "bg-[#F2F4F6] text-[#6B7684]"
                        }`}>
                          {entry.result.grade} {entry.result.score}
                        </span>
                      )}
                      {entry.result && (
                        <span className="text-[12px] text-gray-500">
                          {entry.result.role} · {entry.result.years_exp}yr
                        </span>
                      )}
                    </div>
                    <p className="text-[12px] text-gray-400">
                      {(entry.file.size / 1024).toFixed(0)} KB
                    </p>
                    {entry.error && <p className="text-[12px] text-[#E8590C] mt-1">{entry.error}</p>}
                    {entry.result && (
                      <div className="mt-2">
                        <div className="flex flex-wrap gap-1 mb-1">
                          {entry.result.top_skills.map((s) => (
                            <span key={s} className="text-[11px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{s}</span>
                          ))}
                        </div>
                        {entry.result.summary_ko && (
                          <p className="text-[12px] text-gray-600 mt-1">{entry.result.summary_ko}</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* 액션 */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {entry.status === "error" && (
                      <button
                        onClick={() => runSingle(entry.id)}
                        disabled={busy}
                        className="px-2.5 py-1.5 text-[12px] text-[#3182F6] bg-[#E8F3FF] rounded-lg hover:bg-[#d0e7ff] transition-colors disabled:opacity-40"
                      >
                        {t("pool.retry")}
                      </button>
                    )}
                    {entry.result?.talent_id && (
                      <a
                        href={`/admin/talents/${entry.result.talent_id}`}
                        className="px-2.5 py-1.5 text-[12px] text-[#1D9E75] bg-[#1D9E75]/10 rounded-lg hover:bg-[#1D9E75]/20 transition-colors"
                      >
                        {t("pool.viewCard")}
                      </a>
                    )}
                    <button
                      onClick={() => removeEntry(entry.id)}
                      disabled={entry.status === "screening"}
                      className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors disabled:opacity-30"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {entries.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-200/60 py-16 text-center">
          <p className="text-[14px] text-gray-500">{t("pool.empty")}</p>
          <p className="text-[12px] text-gray-400 mt-1">{t("pool.emptyHint")}</p>
        </div>
      )}
    </div>
  );
}
