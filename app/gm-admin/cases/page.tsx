"use client";

import { useEffect, useState } from "react";

type Metric = { value: string; label: string };
type Section = { title: string; body: string };
type QA = { q: string; a: string };

type CaseRow = {
  slug: string;
  company: string;
  title: string;
  industry: string | null;
  thumbnail: string | null;
  site_url: string | null;
  created_at?: string;
};

const inputCls =
  "w-full rounded-md border border-[#E1E5EC] bg-white px-3 py-2 text-[14px] text-[#1B2233] placeholder:text-[#B4BBC7] transition focus:border-[#E8590C] focus:outline-none focus:ring-2 focus:ring-[#E8590C]/15";

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[13px] font-semibold text-[#3A4356]">
        {label}
        {hint && <span className="ml-1.5 font-normal text-[#9AA3B2]">{hint}</span>}
      </span>
      {children}
    </label>
  );
}

const EMPTY = {
  slug: "",
  company: "",
  industry: "",
  scope: "",
  talentRole: "",
  title: "",
  summary: "",
  thumbnail: "",
  siteUrl: "",
  quote: "",
  quoteBy: "",
  images: [] as string[],
  metrics: [] as Metric[],
  story: [{ title: "", body: "" }] as Section[],
  interview: [] as QA[],
};

export default function GmAdminCases() {
  const [cases, setCases] = useState<CaseRow[]>([]);
  const [form, setForm] = useState({ ...EMPTY });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const load = () =>
    fetch("/api/gm-admin/cases")
      .then((r) => r.json())
      .then((d) => setCases(d.cases || []))
      .catch(() => {});
  useEffect(() => {
    load();
  }, []);

  const set = (p: Partial<typeof form>) => setForm((f) => ({ ...f, ...p }));

  async function uploadImage(file: File): Promise<string | null> {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/gm-admin/cases/upload", { method: "POST", body: fd });
    const d = await res.json().catch(() => ({}));
    return res.ok ? d.url : null;
  }

  async function onThumb(file: File | null) {
    if (!file) return;
    setUploading(true);
    const url = await uploadImage(file);
    setUploading(false);
    if (url) set({ thumbnail: url });
    else setMsg("썸네일 업로드 실패");
  }
  async function onGallery(file: File | null) {
    if (!file) return;
    setUploading(true);
    const url = await uploadImage(file);
    setUploading(false);
    if (url) set({ images: [...form.images, url] });
    else setMsg("이미지 업로드 실패");
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (saving) return;
    if (!form.company.trim() || !form.title.trim()) {
      setMsg("고객사명과 제목은 필수입니다.");
      return;
    }
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch("/api/gm-admin/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          story: form.story.filter((s) => s.title.trim() || s.body.trim()),
          metrics: form.metrics.filter((m) => m.value.trim() || m.label.trim()),
          interview: form.interview.filter((q) => q.q.trim() || q.a.trim()),
        }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(d.error || "저장 실패");
      setMsg("저장되었습니다 ✓");
      setForm({ ...EMPTY });
      load();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "저장 실패");
    } finally {
      setSaving(false);
    }
  }

  async function remove(slug: string) {
    if (!confirm(`'${slug}' 사례를 삭제할까요?`)) return;
    await fetch(`/api/gm-admin/cases?slug=${encodeURIComponent(slug)}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="mx-auto max-w-[900px] px-6 py-8">
      <h1 className="text-[24px] font-bold text-[#171E2D]">고객 사례</h1>
      <p className="mt-1 text-[13px] text-[#8A93A5]">랜딩·고객사례 페이지에 노출됩니다. (DB 저장 사례가 정적 사례와 함께 표시)</p>

      {/* 기존 사례 목록 */}
      <div className="mt-6 rounded-xl border border-[#E9ECF2] bg-white">
        <p className="border-b border-[#F1F3F7] px-5 py-3 text-[13px] font-bold text-[#171E2D]">등록된 사례 (DB)</p>
        {cases.length === 0 ? (
          <p className="px-5 py-6 text-[13px] text-[#9AA3B2]">아직 DB에 등록된 사례가 없어요. 아래에서 추가하세요.</p>
        ) : (
          <ul className="divide-y divide-[#F5F6F9]">
            {cases.map((c) => (
              <li key={c.slug} className="flex items-center gap-3 px-5 py-3">
                {c.thumbnail && <img src={c.thumbnail} alt="" className="h-9 w-12 shrink-0 rounded object-cover" />}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-semibold text-[#171E2D]">{c.company} · {c.title}</p>
                  <p className="truncate text-[12px] text-[#9AA3B2]">/{c.slug} {c.industry ? `· ${c.industry}` : ""}</p>
                </div>
                <a href={`/cases/${c.slug}`} target="_blank" rel="noopener noreferrer" className="text-[12px] font-medium text-[#8A93A5] hover:text-[#E8590C]">보기</a>
                <button onClick={() => remove(c.slug)} className="text-[12px] font-medium text-[#C4576B] hover:text-[#D92D20]">삭제</button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 추가 폼 */}
      <form onSubmit={submit} className="mt-6 rounded-xl border border-[#E9ECF2] bg-white p-6">
        <p className="text-[15px] font-bold text-[#171E2D]">새 사례 추가</p>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="고객사명" hint="필수"><input className={inputCls} value={form.company} onChange={(e) => set({ company: e.target.value })} placeholder="도루리" /></Field>
          <Field label="slug" hint="URL, 비우면 자동"><input className={inputCls} value={form.slug} onChange={(e) => set({ slug: e.target.value })} placeholder="doruri" /></Field>
          <Field label="업종"><input className={inputCls} value={form.industry} onChange={(e) => set({ industry: e.target.value })} placeholder="F&B · D2C 커머스" /></Field>
          <Field label="작업 범위"><input className={inputCls} value={form.scope} onChange={(e) => set({ scope: e.target.value })} placeholder="브랜드 쇼핑몰 구축 · 운영" /></Field>
          <Field label="투입 인재 직무"><input className={inputCls} value={form.talentRole} onChange={(e) => set({ talentRole: e.target.value })} placeholder="웹 개발 · 디자인" /></Field>
          <Field label="사이트 URL"><input className={inputCls} value={form.siteUrl} onChange={(e) => set({ siteUrl: e.target.value })} placeholder="https://doruri.com/" /></Field>
        </div>

        <div className="mt-4">
          <Field label="제목" hint="필수 · 성과 중심 한 줄"><input className={inputCls} value={form.title} onChange={(e) => set({ title: e.target.value })} placeholder="프리미엄 육포 브랜드 '도루리', 베트남 인재와 자사몰을 완성하다" /></Field>
        </div>
        <div className="mt-4">
          <Field label="요약" hint="카드/상단 한 줄"><textarea className={`${inputCls} min-h-[60px] resize-none`} value={form.summary} onChange={(e) => set({ summary: e.target.value })} /></Field>
        </div>

        {/* 이미지 */}
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="대표 이미지(썸네일)">
            <div className="flex items-center gap-3">
              {form.thumbnail && <img src={form.thumbnail} alt="" className="h-14 w-20 rounded object-cover" />}
              <label className="cursor-pointer rounded-md border border-dashed border-[#D6DBE3] px-3 py-2 text-[13px] text-[#59657A] hover:border-[#E8590C]">
                {form.thumbnail ? "변경" : "업로드"}
                <input type="file" accept="image/*" className="hidden" onChange={(e) => onThumb(e.target.files?.[0] ?? null)} />
              </label>
            </div>
          </Field>
          <Field label="갤러리 이미지" hint="여러 장">
            <div className="flex flex-wrap items-center gap-2">
              {form.images.map((img, i) => (
                <div key={i} className="relative">
                  <img src={img} alt="" className="h-14 w-20 rounded object-cover" />
                  <button type="button" onClick={() => set({ images: form.images.filter((_, j) => j !== i) })} className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#171E2D] text-[11px] text-white">×</button>
                </div>
              ))}
              <label className="cursor-pointer rounded-md border border-dashed border-[#D6DBE3] px-3 py-2 text-[13px] text-[#59657A] hover:border-[#E8590C]">
                + 추가
                <input type="file" accept="image/*" className="hidden" onChange={(e) => onGallery(e.target.files?.[0] ?? null)} />
              </label>
            </div>
          </Field>
        </div>
        {uploading && <p className="mt-2 text-[12px] text-[#E8590C]">이미지 업로드 중…</p>}

        {/* 지표 */}
        <div className="mt-6">
          <div className="flex items-center justify-between">
            <p className="text-[13px] font-semibold text-[#3A4356]">핵심 지표 <span className="font-normal text-[#9AA3B2]">(실측만, 0~3개)</span></p>
            <button type="button" onClick={() => set({ metrics: [...form.metrics, { value: "", label: "" }] })} className="text-[12px] font-medium text-[#E8590C]">+ 추가</button>
          </div>
          <div className="mt-2 flex flex-col gap-2">
            {form.metrics.map((m, i) => (
              <div key={i} className="flex gap-2">
                <input className={`${inputCls} w-32`} value={m.value} onChange={(e) => set({ metrics: form.metrics.map((x, j) => (j === i ? { ...x, value: e.target.value } : x)) })} placeholder="50%" />
                <input className={inputCls} value={m.label} onChange={(e) => set({ metrics: form.metrics.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)) })} placeholder="국내 대비 인건비 수준" />
                <button type="button" onClick={() => set({ metrics: form.metrics.filter((_, j) => j !== i) })} className="shrink-0 px-2 text-[#B4BBC7] hover:text-[#D92D20]">×</button>
              </div>
            ))}
          </div>
        </div>

        {/* 본문(스토리) */}
        <div className="mt-6">
          <div className="flex items-center justify-between">
            <p className="text-[13px] font-semibold text-[#3A4356]">본문 <span className="font-normal text-[#9AA3B2]">(제목 + 내용 섹션)</span></p>
            <button type="button" onClick={() => set({ story: [...form.story, { title: "", body: "" }] })} className="text-[12px] font-medium text-[#E8590C]">+ 섹션</button>
          </div>
          <div className="mt-2 flex flex-col gap-3">
            {form.story.map((s, i) => (
              <div key={i} className="rounded-md border border-[#EEF1F5] p-3">
                <div className="flex gap-2">
                  <input className={inputCls} value={s.title} onChange={(e) => set({ story: form.story.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)) })} placeholder="프로젝트 배경" />
                  <button type="button" onClick={() => set({ story: form.story.filter((_, j) => j !== i) })} className="shrink-0 px-2 text-[#B4BBC7] hover:text-[#D92D20]">×</button>
                </div>
                <textarea className={`${inputCls} mt-2 min-h-[70px] resize-none`} value={s.body} onChange={(e) => set({ story: form.story.map((x, j) => (j === i ? { ...x, body: e.target.value } : x)) })} placeholder="내용…" />
              </div>
            ))}
          </div>
        </div>

        {/* 인용구 (선택) */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-[1fr_180px]">
          <Field label="인용구" hint="실제 고객 코멘트 있을 때만"><input className={inputCls} value={form.quote} onChange={(e) => set({ quote: e.target.value })} /></Field>
          <Field label="인용 출처"><input className={inputCls} value={form.quoteBy} onChange={(e) => set({ quoteBy: e.target.value })} placeholder="도루리 대표" /></Field>
        </div>

        {msg && <p className={`mt-4 text-[13px] font-medium ${msg.includes("✓") ? "text-[#12B76A]" : "text-[#D92D20]"}`}>{msg}</p>}

        <button type="submit" disabled={saving} className="mt-5 rounded-md bg-[#E8590C] px-6 py-3 text-[15px] font-semibold text-white transition hover:bg-[#C74E0A] disabled:opacity-40">
          {saving ? "저장 중…" : "사례 저장"}
        </button>
      </form>
    </div>
  );
}
