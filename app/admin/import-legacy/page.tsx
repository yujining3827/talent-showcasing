"use client";

import React, { useState } from "react";

export default function ImportLegacyPage() {
  const [tsvData, setTsvData] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const preview = () => {
    if (!tsvData.trim()) return null;
    const lines = tsvData.split("\n").filter((l) => l.trim());
    let dataStart = 0;
    for (let i = 0; i < Math.min(10, lines.length); i++) {
      if (lines[i].split("\t")[0].trim() === "ID") { dataStart = i + 1; break; }
    }
    const dataLines = lines.slice(dataStart).filter((l) => {
      const f = l.split("\t")[0].trim();
      return f !== "ID" && f !== "";
    });
    return dataLines.length;
  };

  const handleImport = async () => {
    if (!tsvData.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/admin/import-legacy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tsvData }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Import failed");
      } else {
        setResult(data);
      }
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  };

  const rowCount = preview();

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-6">
      <div className="max-w-[800px] mx-auto">
        <h1 className="text-[22px] font-medium text-[#191F28] mb-2">
          Legacy 시트 데이터 임포트
        </h1>
        <p className="text-[13px] text-[#8B95A1] mb-6">
          스프레드시트에서 데이터를 복사(Ctrl+C)한 뒤 아래 텍스트 영역에 붙여넣기(Ctrl+V) 하세요.
          헤더 행(ID, Full Name, Email, ...)이 포함되어야 합니다.
        </p>

        <textarea
          value={tsvData}
          onChange={(e) => setTsvData(e.target.value)}
          placeholder={"스프레드시트에서 복사한 데이터를 여기에 붙여넣기...\n\nID\tFull Name\tEmail\tPhone\t..."}
          className="w-full h-[300px] p-4 border border-[#E5E8EB] rounded-2xl text-[13px] text-[#333D4B] font-mono bg-white resize-y focus:outline-none focus:border-[#3182F6] transition-colors"
        />

        {rowCount !== null && (
          <p className="mt-2 text-[13px] text-[#6B7684]">
            {rowCount}건의 데이터 행 감지됨
          </p>
        )}

        <div className="mt-4 flex gap-3">
          <button
            onClick={handleImport}
            disabled={loading || !tsvData.trim()}
            className="px-5 py-2.5 rounded-full text-[13px] font-medium text-white bg-[#3182F6] hover:bg-[#2272EB] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "임포트 중..." : "임포트 실행"}
          </button>
          <button
            onClick={() => { setTsvData(""); setResult(null); setError(null); }}
            className="px-5 py-2.5 rounded-full text-[13px] font-medium text-[#4E5968] bg-white border border-[#E5E8EB] hover:border-[#D1D6DB] transition-colors"
          >
            초기화
          </button>
        </div>

        {error && (
          <div className="mt-4 p-4 rounded-2xl bg-red-50 border border-red-200">
            <p className="text-[13px] text-red-600">{error}</p>
          </div>
        )}

        {result && (
          <div className="mt-4 p-5 rounded-2xl bg-white border border-[#E5E8EB]">
            <h2 className="text-[15px] font-medium text-[#191F28] mb-3">임포트 결과</h2>
            <div className="grid grid-cols-2 gap-2 text-[13px]">
              <div className="text-[#8B95A1]">파싱된 후보자</div>
              <div className="text-[#333D4B] font-medium">{result.parsed as number}명</div>

              <div className="text-[#8B95A1]">DB 중복 스킵</div>
              <div className="text-[#333D4B] font-medium">{result.dbDuplicate as number}명</div>

              <div className="text-[#8B95A1]">삽입 성공</div>
              <div className="text-[#1D9E75] font-medium">{result.inserted as number}명</div>

              <div className="text-[#8B95A1]">삽입 실패</div>
              <div className={`font-medium ${(result.errors as number) > 0 ? "text-red-500" : "text-[#333D4B]"}`}>
                {result.errors as number}명
              </div>

              <div className="text-[#8B95A1]">파싱 에러</div>
              <div className="text-[#333D4B] font-medium">{result.parseErrors as number}건</div>
            </div>

            {result.stats && (
              <div className="mt-4 pt-4 border-t border-[#F2F4F6]">
                <h3 className="text-[13px] font-medium text-[#191F28] mb-2">Pipeline 분류 (삽입된 건만)</h3>
                <div className="grid grid-cols-2 gap-1.5 text-[12px]">
                  <div className="text-[#8B95A1]">스크리닝 전 (new)</div>
                  <div className="text-[#333D4B]">{(result.stats as Record<string, number>).new}</div>
                  <div className="text-[#8B95A1]">CV 합격 (passed)</div>
                  <div className="text-[#3182F6]">{(result.stats as Record<string, number>).passed}</div>
                  <div className="text-[#8B95A1]">인터뷰 합격 (ai_interview_passed)</div>
                  <div className="text-[#1D9E75]">{(result.stats as Record<string, number>).ai_interview_passed}</div>
                  <div className="text-[#8B95A1]">CV 불합격 (screening_failed)</div>
                  <div className="text-[#B0B8C1]">{(result.stats as Record<string, number>).screening_failed}</div>
                  <div className="text-[#8B95A1]">불합격/withdraw (rejected)</div>
                  <div className="text-[#B0B8C1]">{(result.stats as Record<string, number>).rejected}</div>
                </div>
              </div>
            )}

            {(result.errorMessages as string[])?.length > 0 && (
              <div className="mt-4 pt-4 border-t border-[#F2F4F6]">
                <h3 className="text-[13px] font-medium text-red-500 mb-2">에러 메시지</h3>
                {(result.errorMessages as string[]).map((msg, i) => (
                  <p key={i} className="text-[12px] text-red-400">{msg}</p>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
