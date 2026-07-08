"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { HERO_TALENTS } from "@/lib/heroTalents";

/* ============================================================================
 *  인재 상세 페이지 (구조 스켈레톤)
 *  - /api/showcase 에서 id로 인재를 찾아 표시
 *  - 좌: 프로필 이미지 / 우: 메인 카드에서 보이던 데이터(이름·직무·경력·어학·기술·학력)
 *  - TODO(추후): 포트폴리오/경력 타임라인/프로젝트 등 하단 상세 콘텐츠 추가
 * ========================================================================== */
type ShowcaseTalent = {
  id: string;
  name: string;
  role: string;
  headline: string | null;
  photo_url: string | null;
  school: string | null;
  schoolElite: boolean;
  company: string | null;
  companyElite: boolean;
  yoeYears: number | null;
  location: string | null;
  skills: string[];
  language?: string | null;
};

function InfoRow({ label, accent, children }: { label: string; accent?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 px-4">
      <span className="shrink-0 pt-0.5 text-[13px] font-semibold text-[#9AA3B2]">{label}</span>
      <span className={`text-right text-[15px] font-bold leading-[1.5] ${accent ? "text-[#E8590C]" : "text-[#1B2233]"}`}>{children}</span>
    </div>
  );
}

export default function TalentDetailPage() {
  const params = useParams();
  const id = String(params?.id ?? "");
  const [talent, setTalent] = useState<ShowcaseTalent | null>(null);
  const [loading, setLoading] = useState(true);
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    if (!id) return;
    // 1) 히어로 하드코딩 인재 먼저 조회
    const hero = HERO_TALENTS.find((t) => t.id === id);
    if (hero) {
      setTalent(hero);
      setLoading(false);
      return;
    }
    // 2) 없으면 /api/showcase 에서 조회
    fetch("/api/showcase")
      .then((r) => r.json())
      .then((d) => {
        const list: ShowcaseTalent[] = Array.isArray(d.talents) ? d.talents : [];
        setTalent(list.find((t) => t.id === id) ?? null);
      })
      .catch(() => setTalent(null))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <main className="min-h-screen bg-white text-[#171E2D]">
      {/* 헤더 */}
      <header className="sticky top-0 z-50 border-b border-[#EEF1F5] bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-[72px] max-w-[1360px] items-center justify-between px-5">
          <Link href="/" className="flex items-center" aria-label="공고마감 by LIKELION">
            <img src="/logo-wordmark.png" alt="공고마감 by LIKELION" className="h-9 w-auto" />
          </Link>
          <Link href="/pricing" className="rounded-sm bg-[#E8590C] px-6 py-3 text-[15px] font-semibold text-white transition hover:bg-[#C74E0A]">
            바로 고용하기
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-[1360px] px-5 py-12">
        <Link href="/" className="mb-6 inline-flex items-center text-[14px] font-medium text-[#59657A] transition hover:text-[#E8590C]">
          ← 인재 목록으로
        </Link>

        {loading ? (
          <p className="py-24 text-center text-[15px] text-[#697386]">불러오는 중…</p>
        ) : !talent ? (
          <p className="py-24 text-center text-[15px] text-[#697386]">인재를 찾을 수 없습니다.</p>
        ) : (
          <div className="grid grid-cols-1 gap-10 md:grid-cols-[320px_1fr]">
            {/* 좌: 프로필 이미지 */}
            <div>
              <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-[#EEF1F6]">
                {talent.photo_url && !imgFailed ? (
                  <img
                    src={talent.photo_url}
                    alt={talent.name}
                    onError={() => setImgFailed(true)}
                    className="h-full w-full object-cover"
                    style={{ objectPosition: "center 20%" }}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-[#D8DEE8]">
                    <img src="/default-profile.png" alt="" className="h-[70%] w-[70%] object-contain" />
                  </div>
                )}
                <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-[#E8590C]">
                  검증됨
                </div>
              </div>
              {talent.location && <p className="mt-3 text-center text-[13px] text-[#697386]">{talent.location}</p>}
            </div>

            {/* 우: 데이터 */}
            <div className="max-w-[600px]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#E8590C]">
                {talent.role || "테크 전문가"}
              </p>
              <h1 className="mt-2 text-[32px] font-bold leading-[1.2] text-[#171E2D]">{talent.name}</h1>
              <p className="mt-2 text-[16px] leading-[1.6] text-[#5B667A]">
                {talent.headline || `검증된 ${talent.role || "테크"} 전문가`}
              </p>

              <div className="mt-8 flex flex-col gap-6">
                <InfoRow label="경력" accent>
                  {talent.yoeYears ? `${talent.yoeYears}년차` : "신입"}
                  {talent.company ? ` · ${talent.company}` : ""}
                </InfoRow>
                <InfoRow label="어학 · 소통" accent>
                  {talent.language ? talent.language : <span className="font-medium italic text-[#9AA3B2]">조사 중</span>}
                </InfoRow>
                {talent.skills?.length > 0 && (
                  <div className="flex items-start justify-between gap-4 px-4">
                    <span className="shrink-0 pt-0.5 text-[13px] font-semibold text-[#9AA3B2]">기술</span>
                    <div className="flex flex-wrap justify-end gap-1.5">
                      {talent.skills.map((skill) => (
                        <span key={skill} className="rounded-full bg-[#F1F3F7] px-2.5 py-1 text-[12px] font-medium text-[#5B667A]">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <InfoRow label="학력">{talent.school || "확인 중"}</InfoRow>
              </div>

              <Link
                href="/pricing"
                className="mt-10 inline-flex h-14 items-center justify-center rounded-sm bg-[#E8590C] px-10 text-[16px] font-semibold text-white transition hover:bg-[#C74E0A]"
              >
                이 인재 고용 문의하기
              </Link>
            </div>
          </div>
        )}

        {/* TODO(추후): 하단 상세 콘텐츠 (포트폴리오 / 경력 타임라인 / 프로젝트 등) */}
      </div>
    </main>
  );
}
