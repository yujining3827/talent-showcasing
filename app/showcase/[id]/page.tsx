"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { HERO_TALENTS } from "@/lib/heroTalents";
import { TALENT_DETAILS, type TalentDetail } from "@/lib/talentDetails";
import ContactCTA from "@/app/components/ContactCTA";
import SiteHeader from "@/app/components/SiteHeader";
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

// 대표 링크 버튼 (아이콘 + 라벨)
function ProfileLink({ href, kind, label }: { href: string; kind: "github" | "portfolio" | "website" | "live"; label: string }) {
  const icon = {
    github: <path d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.49v-1.7c-2.78.62-3.37-1.22-3.37-1.22-.46-1.18-1.11-1.5-1.11-1.5-.9-.63.07-.62.07-.62 1 .07 1.53 1.05 1.53 1.05.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.56-1.14-4.56-5.06 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.7 0 0 .84-.28 2.75 1.05a9.35 9.35 0 0 1 5 0c1.91-1.33 2.75-1.05 2.75-1.05.55 1.4.2 2.44.1 2.7.64.72 1.03 1.63 1.03 2.75 0 3.93-2.34 4.79-4.57 5.05.36.32.68.94.68 1.9v2.82c0 .27.18.6.69.49A10.26 10.26 0 0 0 22 12.25C22 6.58 17.52 2 12 2Z" fill="currentColor" />,
    portfolio: <path d="M14 3v4a1 1 0 0 0 1 1h4M5 3h9l6 6v11a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" fill="none" />,
    website: <><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" fill="none" /><path d="M3 12h18M12 3c2.5 2.5 3.5 6 3.5 9S14.5 18.5 12 21c-2.5-2.5-3.5-6-3.5-9S9.5 5.5 12 3Z" stroke="currentColor" strokeWidth="1.6" fill="none" /></>,
    live: <path d="M8 5v14l11-7L8 5Z" fill="currentColor" />,
  }[kind];
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 rounded-md border border-[#DDE2EA] bg-white px-3.5 py-2 text-[13px] font-semibold text-[#3A4356] transition hover:border-[#E8590C] hover:text-[#E8590C]"
    >
      <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true">{icon}</svg>
      {label}
    </a>
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

  // 메인 인재(hero-1) 외 hero 인재는 이력서 원본 대신 '준비중' 페이지로 유도
  const resumeBlocked = id !== "hero-1" && HERO_TALENTS.some((t) => t.id === id);

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
      <SiteHeader />

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
                  href={`/pricing?talentId=${encodeURIComponent(talent.id)}&talentName=${encodeURIComponent(talent.name)}&talentRole=${encodeURIComponent(talent.role || "")}`}
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
                  {(detail?.titleLine || talent.headline || `검증된 ${talent.role || "테크"} 전문가`).replace(/\s*\/n\s*/g, " ")}
                </p>

                {/* 대표 링크 (GitHub · 포트폴리오 사이트 · 웹사이트) — 있는 것만 노출
                    포트폴리오는 하단 '이력서·포트폴리오 원본 보기'(resumeUrl)와 겹치지 않도록,
                    별도 포트폴리오 사이트(links.portfolio)가 있을 때만 노출 (resumeUrl fallback 없음) */}
                {(() => {
                  const gh = detail?.links?.github;
                  const pf = detail?.links?.portfolio;
                  const web = detail?.links?.website;
                  if (!gh && !pf && !web) return null;
                  return (
                    <div className="mt-5 flex flex-wrap gap-2">
                      {gh && <ProfileLink href={gh} kind="github" label="GitHub" />}
                      {pf && <ProfileLink href={pf} kind="portfolio" label="포트폴리오" />}
                      {web && <ProfileLink href={web} kind="website" label="웹사이트" />}
                    </div>
                  );
                })()}

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

                    {/* 주요 프로젝트 */}
                    {detail.projects && detail.projects.length > 0 && (
                      <section>
                        <SectionTitle>주요 프로젝트</SectionTitle>
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                          {detail.projects.map((p, i) => (
                            <div key={i} className="flex flex-col rounded-xl border border-[#EEF1F5] p-6 shadow-[0_10px_30px_-26px_rgba(10,18,32,0.4)]">
                              <div className="flex items-start justify-between gap-3">
                                <p className="text-[16px] font-bold leading-[1.35] text-[#171E2D]">{p.name}</p>
                                {p.period && <span className="shrink-0 pt-0.5 text-[12px] font-medium text-[#9AA3B2]">{p.period}</span>}
                              </div>
                              <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12.5px]">
                                {p.domain && <span className="rounded-full bg-[#FFF1E8] px-2.5 py-0.5 font-semibold text-[#E8590C]">{p.domain}</span>}
                                {p.role && <span className="text-[#8A93A5]">{p.role}</span>}
                              </div>
                              {p.description && <p className="mt-3 text-[14px] leading-[1.7] text-[#5B667A]">{p.description}</p>}
                              {p.highlights && p.highlights.length > 0 && (
                                <ul className="mt-3 flex flex-col gap-1.5">
                                  {p.highlights.map((h, j) => (
                                    <li key={j} className="flex gap-2 text-[13.5px] leading-[1.6] text-[#3A4356]">
                                      <span className="mt-[8px] h-1 w-1 shrink-0 rounded-full bg-[#E8590C]" />
                                      {h}
                                    </li>
                                  ))}
                                </ul>
                              )}
                              {p.tech && p.tech.length > 0 && (
                                <div className="mt-3 flex flex-wrap gap-1.5">
                                  {p.tech.map((t) => (
                                    <span key={t} className="rounded-full bg-[#F1F3F7] px-2.5 py-1 text-[11.5px] font-medium text-[#5B667A]">{t}</span>
                                  ))}
                                </div>
                              )}
                              {(p.liveUrl || p.sourceUrl) && (
                                <div className="mt-4 flex flex-wrap gap-2 pt-1">
                                  {p.liveUrl && <ProfileLink href={p.liveUrl} kind="live" label={p.liveLabel || "Live Demo"} />}
                                  {p.sourceUrl && <ProfileLink href={p.sourceUrl} kind="github" label="소스 코드" />}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
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

                    {/* 실제 이력서 원본 보기 — 메인 인재 외에는 '준비중' 페이지로 유도 */}
                    {detail.resumeUrl && (
                      resumeBlocked ? (
                        <Link
                          href="/coming-soon"
                          className="inline-flex w-fit items-center gap-2 rounded-sm border-2 border-[#E8590C] px-8 py-3.5 text-[15px] font-semibold text-[#E8590C] transition hover:bg-[#FFF6EF]"
                        >
                          이력서 · 포트폴리오 원본 보기
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <path d="M7 17 17 7M17 7H9M17 7v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </Link>
                      ) : (
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
                      )
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
