"use client";

import { useEffect, useRef, useState } from "react";

/* 브로셔(서비스 소개서) PDF 관리 — 업로드 / 활성본 선택 / 삭제
 *  활성본 = 브로셔 폼 제출 시 이메일에 첨부되는 PDF */

type BrochureFile = {
  path: string;
  name: string;
  size: number | null;
  updatedAt: string | null;
  url: string;
  active: boolean;
};

function fmtSize(n: number | null) {
  if (!n) return "";
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}
function fmtDate(s: string | null) {
  if (!s) return "";
  return s.slice(0, 10);
}

export default function BrochureAdminPage() {
  const [files, setFiles] = useState<BrochureFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null); // 진행 중인 작업 표시
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = () =>
    fetch("/api/gm-admin/brochure")
      .then((r) => r.json())
      .then((d) => setFiles(d.files || []))
      .catch(() => setMsg({ type: "err", text: "목록을 불러오지 못했어요." }))
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  async function onUpload(file: File | null) {
    if (!file) return;
    setBusy("upload");
    setMsg(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/gm-admin/brochure", { method: "POST", body: fd });
      const d = await res.json().catch(() => ({}));
      if (!res.ok || !d.ok) throw new Error(d.error || "업로드 실패");
      setMsg({ type: "ok", text: "업로드 완료. '이걸로 발송'을 눌러 활성본으로 지정하세요." });
      await load();
    } catch (e) {
      setMsg({ type: "err", text: e instanceof Error ? e.message : "업로드 중 문제가 발생했어요." });
    } finally {
      setBusy(null);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function setActive(path: string) {
    setBusy(path);
    setMsg(null);
    try {
      const res = await fetch("/api/gm-admin/brochure", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok || !d.ok) throw new Error(d.error || "지정 실패");
      setMsg({ type: "ok", text: "활성 소개서를 변경했어요. 이제 이 PDF가 메일로 발송됩니다." });
      await load();
    } catch (e) {
      setMsg({ type: "err", text: e instanceof Error ? e.message : "변경 중 문제가 발생했어요." });
    } finally {
      setBusy(null);
    }
  }

  async function remove(path: string, name: string) {
    if (!confirm(`'${name}' 파일을 삭제할까요?`)) return;
    setBusy(path);
    setMsg(null);
    try {
      const res = await fetch(`/api/gm-admin/brochure?path=${encodeURIComponent(path)}`, { method: "DELETE" });
      const d = await res.json().catch(() => ({}));
      if (!res.ok || !d.ok) throw new Error(d.error || "삭제 실패");
      setMsg({ type: "ok", text: "삭제했어요." });
      await load();
    } catch (e) {
      setMsg({ type: "err", text: e instanceof Error ? e.message : "삭제 중 문제가 발생했어요." });
    } finally {
      setBusy(null);
    }
  }

  const activeName = files.find((f) => f.active)?.name;

  return (
    <div className="mx-auto max-w-[880px] px-6 py-10">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-bold text-[#171E2D]">서비스 소개서 관리</h1>
          <p className="mt-1 text-[13.5px] text-[#8B95A1]">
            브로셔 폼 제출 시 방문자 이메일로 첨부·발송되는 PDF를 관리합니다.
          </p>
        </div>
        <label className="shrink-0 cursor-pointer rounded-md bg-[#E8590C] px-4 py-2.5 text-[14px] font-semibold text-white transition hover:bg-[#C74E0A]">
          {busy === "upload" ? "업로드 중…" : "+ PDF 업로드"}
          <input
            ref={fileRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            disabled={busy === "upload"}
            onChange={(e) => onUpload(e.target.files?.[0] ?? null)}
          />
        </label>
      </div>

      {/* 현재 활성본 배너 */}
      <div className="mt-6 rounded-xl border border-[#E4E8EF] bg-[#F9FAFB] px-5 py-4">
        <p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-[#E8590C]">현재 발송 소개서</p>
        <p className="mt-1 text-[15px] font-semibold text-[#171E2D]">{activeName || "선택된 PDF 없음 (기본 소개서 발송)"}</p>
      </div>

      {msg && (
        <p className={`mt-4 text-[13.5px] font-medium ${msg.type === "ok" ? "text-[#0F9D58]" : "text-[#D92D20]"}`}>{msg.text}</p>
      )}

      {/* 파일 목록 */}
      <div className="mt-6 flex flex-col gap-3">
        {loading ? (
          <p className="py-10 text-center text-[14px] text-[#8B95A1]">불러오는 중…</p>
        ) : files.length === 0 ? (
          <p className="py-10 text-center text-[14px] text-[#8B95A1]">업로드된 PDF가 없어요. 우측 상단에서 업로드하세요.</p>
        ) : (
          files.map((f) => (
            <div
              key={f.path}
              className={`flex items-center gap-4 rounded-xl border bg-white px-5 py-4 transition ${
                f.active ? "border-[#E8590C] shadow-[0_10px_30px_-20px_rgba(232,89,12,0.8)]" : "border-[#E4E8EF]"
              }`}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#FFF1E8] text-[18px]">📄</div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <a href={f.url} target="_blank" rel="noopener noreferrer" className="truncate text-[15px] font-semibold text-[#171E2D] hover:text-[#E8590C]">
                    {f.name}
                  </a>
                  {f.active && (
                    <span className="shrink-0 rounded-full bg-[#E8590C] px-2 py-0.5 text-[11px] font-semibold text-white">발송 중</span>
                  )}
                </div>
                <p className="mt-0.5 text-[12.5px] text-[#8B95A1]">
                  {fmtDate(f.updatedAt)} {f.size ? `· ${fmtSize(f.size)}` : ""}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {!f.active && (
                  <button
                    onClick={() => setActive(f.path)}
                    disabled={!!busy}
                    className="rounded-md border border-[#E8590C] px-3.5 py-2 text-[13px] font-semibold text-[#E8590C] transition hover:bg-[#FFF6EF] disabled:opacity-40"
                  >
                    {busy === f.path ? "…" : "이걸로 발송"}
                  </button>
                )}
                <button
                  onClick={() => remove(f.path, f.name)}
                  disabled={!!busy}
                  className="rounded-md border border-[#E4E8EF] px-3 py-2 text-[13px] text-[#6B7684] transition hover:border-[#D92D20] hover:text-[#D92D20] disabled:opacity-40"
                >
                  삭제
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
