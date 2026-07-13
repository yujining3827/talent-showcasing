"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { HERO_TALENTS } from "@/lib/heroTalents";
import { TALENT_DETAILS, type TalentDetail } from "@/lib/talentDetails";
import ContactCTA from "@/app/components/ContactCTA";
// 오프라인 생성(뷰티파이닝) 결과 — 실제 인재의 한글 이력/사진
import GENERATED from "@/data/talent-details.generated.json";

/* ============================================================================
 *  인재 상세 페이지
 *  - 상단: 프로필 이미지 + 요약(직무·경력·어학·기술·학력·주소·GitHub) + CTA
 *  - CTA 아래: lib/talentDetails.ts 이력 뷰(소개·경력·기술·학력·자격증·성과), CTA와 좌측 정렬
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

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <span className="h-4 w-1 rounded-full bg-[#E8590C]" />
      <h2 className="text-[20px] font-bold text-[#171E2D]">{children}</h2>
    </div>
  );
}

export default function TalentDetailPage() {
  const params = useParams();
  const id = String(params?.id ?? "");
  const [talent, setTalent] = useState<ShowcaseTalent | null>(null);
  const [loading, setLoading] = useState(true);
  const [imgFailed, setImgFailed] = useState(false);

  const gen = (GENERATED as unknown as Record<string, { detail?: TalentDetail; resumeUrl?: string | null }>)[id];
  const detail: TalentDetail | undefined = TALENT_DETAILS[id] ?? gen?.detail;

  useEffect(() => {
    if (!id) return;
    const hero = HERO_TALENTS.find((t) => t.id === id);
    if (hero) {
      setTalent(hero);
      setLoading(false);
      return;
    }
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
            인재 추천받기
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-[1360px] px-5 pt-12 pb-24">
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
              </div>

              {/* 바로 채용 가능 + 채용 문의 */}
              <div className="mt-4 rounded-lg border border-[#EEF1F5] px-4 py-4 text-center">
                <p className="text-[15px] font-semibold text-[#171E2D]">
                  이 인재는 <span className="font-bold text-[#E8590C]">바로 채용 가능</span>합니다
                </p>
                <Link
                  href="/pricing"
                  className="mt-3 flex h-12 w-full items-center justify-center rounded-md bg-[#E8590C] text-[15px] font-semibold text-white transition hover:bg-[#C74E0A]"
                >
                  이 인재 채용 문의하기
                </Link>
              </div>
            </div>

            {/* 우: 요약 + CTA + 이력 */}
            <div>
              {/* 요약 */}
              <div className="max-w-[600px]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#E8590C]">{talent.role || "테크 전문가"}</p>
                <h1 className="mt-2 text-[32px] font-bold leading-[1.2] text-[#171E2D]">{talent.name}</h1>
                <p className="mt-2 text-[16px] leading-[1.6] text-[#5B667A]">
                  {detail?.titleLine || talent.headline || `검증된 ${talent.role || "테크"} 전문가`}
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
                  {talent.location && <InfoRow label="거주지">{talent.location}</InfoRow>}
                  {/* 주소 · GitHub (개인정보 최소 노출) */}
                  {detail?.basic?.map((b) => (
                    <InfoRow key={b.label} label={b.label}>
                      {b.href ? (
                        <a href={b.href} target="_blank" rel="noopener noreferrer" className="text-[#E8590C] hover:underline">
                          {b.value}
                        </a>
                      ) : (
                        b.value
                      )}
                    </InfoRow>
                  ))}
                </div>
              </div>

              {/* CTA 아래: 이력 상세 (CTA와 좌측 정렬) */}
              {detail && (
                <div className="mt-14 max-w-[820px] border-t border-[#EEF1F5] pt-12">
                  <div className="flex flex-col gap-14">
                    {/* 소개 */}
                    {detail.objective && (
                      <section>
                        <SectionTitle>소개</SectionTitle>
                        <p className="text-[15.5px] leading-[1.85] text-[#3A4356]">{detail.objective}</p>
                      </section>
                    )}

                    {/* 학력 */}
                    {detail.education && detail.education.length > 0 && (
                      <section>
                        <SectionTitle>학력</SectionTitle>
                        <div className="flex flex-col gap-3">
                          {detail.education.map((edu, i) => (
                            <div key={i} className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between">
                              <div>
                                <p className="text-[16px] font-semibold text-[#171E2D]">{edu.school}</p>
                                <p className="text-[13.5px] text-[#5B667A]">{edu.major}</p>
                              </div>
                              <span className="text-[13px] font-medium text-[#8A93A5]">{edu.period}</span>
                            </div>
                          ))}
                        </div>
                      </section>
                    )}

                    {/* 자격증 */}
                    {detail.certifications && detail.certifications.length > 0 && (
                      <section>
                        <SectionTitle>자격증</SectionTitle>
                        <ul className="flex flex-col gap-2">
                          {detail.certifications.map((c, i) => (
                            <li key={i} className="flex gap-2 text-[14.5px] text-[#3A4356]">
                              <span className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-[#E8590C]" />
                              {c}
                            </li>
                          ))}
                        </ul>
                      </section>
                    )}

                    {/* 수상내역 */}
                    {detail.achievements && detail.achievements.length > 0 && (
                      <section>
                        <SectionTitle>수상내역</SectionTitle>
                        <ul className="flex flex-col gap-2">
                          {detail.achievements.map((a, i) => (
                            <li key={i} className="flex gap-2 text-[14.5px] text-[#3A4356]">
                              <span className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-[#E8590C]" />
                              {a}
                            </li>
                          ))}
                        </ul>
                      </section>
                    )}

                    {/* 경력 */}
                    {detail.experience && detail.experience.length > 0 && (
                      <section>
                        <SectionTitle>경력</SectionTitle>
                        <div className="flex flex-col gap-5">
                          {detail.experience.map((exp, i) => (
                            <div key={i} className="rounded-xl border border-[#EEF1F5] p-6 shadow-[0_10px_30px_-26px_rgba(10,18,32,0.4)]">
                              <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                                <p className="text-[17px] font-bold text-[#171E2D]">{exp.company}</p>
                                <span className="text-[13px] font-medium text-[#8A93A5]">{exp.period}</span>
                              </div>
                              <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px]">
                                {exp.role && <span className="rounded-full bg-[#FFF1E8] px-2.5 py-0.5 font-semibold text-[#E8590C]">{exp.role}</span>}
                                {exp.project && <span className="text-[#5B667A]">프로젝트: {exp.project}</span>}
                                {exp.customer && <span className="text-[#9AA3B2]">· 고객: {exp.customer}</span>}
                              </div>
                              {exp.summary && <p className="mt-3 text-[14px] leading-[1.7] text-[#5B667A]">{exp.summary}</p>}
                              {exp.tasks && exp.tasks.length > 0 && (
                                <ul className="mt-3 flex flex-col gap-1.5">
                                  {exp.tasks.map((task, j) => (
                                    <li key={j} className="flex gap-2 text-[14px] leading-[1.65] text-[#3A4356]">
                                      <span className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-[#E8590C]" />
                                      {task}
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          ))}
                        </div>
                      </section>
                    )}

                    {/* 기술 */}
                    {detail.skillGroups && detail.skillGroups.length > 0 && (
                      <section>
                        <SectionTitle>기술</SectionTitle>
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                          {detail.skillGroups.map((g) => (
                            <div key={g.title} className="rounded-xl border border-[#EEF1F5] p-5">
                              <p className="text-[14px] font-bold text-[#171E2D]">{g.title}</p>
                              <ul className="mt-3 flex flex-col gap-2">
                                {g.items.map((item, k) => (
                                  <li key={k} className="flex gap-2 text-[13.5px] leading-[1.6] text-[#5B667A]">
                                    <span className="mt-[8px] h-1 w-1 shrink-0 rounded-full bg-[#E8590C]" />
                                    {item}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </section>
                    )}

                    {/* 실제 이력서 원본 보기 */}
                    {detail.resumeUrl && (
                      <a
                        href={detail.resumeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex w-fit items-center gap-2 rounded-sm border-2 border-[#E8590C] px-8 py-3.5 text-[15px] font-semibold text-[#E8590C] transition hover:bg-[#FFF6EF]"
                      >
                        이력서 · 포트폴리오 원본 보기
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                          <path d="M7 17 17 7M17 7H9M17 7v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <ContactCTA />
    </main>
  );
}
