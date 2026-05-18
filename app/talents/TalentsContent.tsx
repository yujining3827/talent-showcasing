"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Talent } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import { getUserProfile } from "@/lib/supabase-auth";
import Link from "next/link";
import { TalentCard } from "@/app/components/talent/TalentCard";
import { FilterChips } from "@/app/components/talent/FilterChips";
import { TalentDetailModal } from "@/app/components/talent/TalentDetailModal";
import { Header } from "@/app/components/Header";
import { getScrapCount } from "@/lib/scraps";

export default function TalentsContent({ talents }: { talents: Talent[] }) {
  const availableCount = talents.filter(
    (t) => t.availability === "immediate"
  ).length;

  const router = useRouter();
  const [selected, setSelected] = useState<Talent | null>(null);
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [scrapCount, setScrapCount] = useState(0);

  // 스크랩 수 동기화
  useEffect(() => {
    setScrapCount(getScrapCount());
    const handler = () => setScrapCount(getScrapCount());
    window.addEventListener("scrap-change", handler);
    return () => window.removeEventListener("scrap-change", handler);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        setAuthed(false);
        return;
      }
      const profile = await getUserProfile(session.user.id);
      if (!profile || profile.status !== "approved") {
        setAuthed(false);
        return;
      }
      setAuthed(true);
    });
  }, [router]);

  if (authed === null) {
    return (
      <main className="min-h-screen bg-[#F7F8FA] flex items-center justify-center">
        <p className="text-[14px] text-gray-500">로딩 중...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F7F8FA]">
      <Header />

      <div className="mx-auto max-w-[1080px] px-5 pt-8 pb-16">
        {/* 타이틀 */}
        <div className="mb-5">
          <h1 className="text-[22px] font-medium text-gray-900 tracking-tight">
            베트남 IT 인재
          </h1>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-[14px] text-gray-500">
              지금 합류 가능한 인재{" "}
              <span className="text-blue-500 font-medium">{availableCount}명</span>
            </p>
            <Link
              href="/talents/criteria"
              className="inline-flex items-center gap-1.5 text-[12px] text-[#3182F6] font-medium hover:bg-[#E8F3FF] bg-[#E8F3FF]/60 transition-colors rounded-full px-3 py-1.5"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.2"/>
                <path d="M8 7V11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                <circle cx="8" cy="5.5" r="0.75" fill="currentColor"/>
              </svg>
              평가기준 보기
            </Link>
          </div>
        </div>

        {/* 필터 칩 */}
        <div className="mb-5">
          <FilterChips />
        </div>

        {/* 정렬 헤더 */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-[12px] text-gray-500">{talents.length}명 표시</span>
          <div className="flex items-center gap-3">
            <Link
              href="/talents/scraps"
              className="flex items-center gap-1.5 text-[12px] text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 3h10a1 1 0 011 1v13.5l-6-3.5-6 3.5V4a1 1 0 011-1z"/>
              </svg>
              스크랩{scrapCount > 0 && ` ${scrapCount}`}
            </Link>
            <button className="text-[12px] text-gray-600 hover:text-gray-900 transition-colors">
              추천순 ▼
            </button>
          </div>
        </div>

        {/* 카드 그리드 */}
        <div className="relative">
          <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-[10px] ${!authed ? "blur-[6px] select-none" : ""}`}>
            {talents.map((talent) => (
              <div
                key={talent.id}
                onClick={() => {
                  if (authed) setSelected(talent);
                }}
                className="cursor-pointer"
              >
                <TalentCard talent={talent} />
              </div>
            ))}
          </div>
          {!authed && (
            <div
              className="absolute inset-0 z-10 flex items-center justify-center cursor-pointer"
              onClick={() => router.push("/login")}
            >
              <div className="bg-white border border-[#E5E8EB] rounded-2xl px-8 py-6 text-center">
                <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-[#E8F3FF] flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M10 4a3 3 0 100 6 3 3 0 000-6zM5 16a5 5 0 0110 0" stroke="#3182F6" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </div>
                <p className="text-[16px] font-medium text-[#191F28]">로그인이 필요합니다</p>
                <p className="text-[13px] text-[#8B95A1] mt-1">인재 정보를 확인하려면 로그인하세요</p>
                <div className="mt-4 bg-[#3182F6] text-white text-[14px] font-medium rounded-full px-5 py-2.5">
                  로그인하기
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {selected && (
        <TalentDetailModal talent={selected} onClose={() => {
          setSelected(null);
          setScrapCount(getScrapCount());
        }} />
      )}
    </main>
  );
}
