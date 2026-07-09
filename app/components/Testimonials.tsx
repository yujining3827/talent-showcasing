"use client";

import { useEffect, useState } from "react";

/* ============================================================================
 *  고객사 후기 — 1 2 레이아웃 (대표 카드는 4개 자동 전환 / 작은 카드 2개 고정)
 *  ⚠️ 실제 후기 준비되면 FEATURED(4개, 자동 전환) / SMALL(2개, 고정)만 교체하세요.
 * ========================================================================== */
type Testimonial = {
  quote: string;
  name: string; // 담당자
  role: string; // 직책 · 회사
  metric?: string; // 강조 지표 (대표 카드용)
};

const FEATURED: Testimonial[] = [
  {
    quote: "이력서 스크리닝에만 몇 주씩 걸렸는데, 검증된 후보를 바로 받아 3주 만에 백엔드 2명을 채용했어요. 채용 비용도 국내 대비 절반 수준이라 대만족입니다.",
    name: "김O O",
    role: "OO테크 · 인사팀장",
    metric: "3주 만에 2명 채용",
  },
  {
    quote: "PM을 급하게 구했는데 2주 만에 실무 바로 투입 가능한 분을 만났어요. 커뮤니케이션도 매끄럽고 온보딩이 정말 빨랐습니다.",
    name: "최O O",
    role: "OO핀테크 · CEO",
    metric: "2주 만에 PM 채용",
  },
  {
    quote: "면접 본 후보 대부분이 합격권이었어요. 서류 필터링에 쓰던 시간이 사라졌고, 확실히 퀄리티가 다릅니다.",
    name: "이O O",
    role: "OO커머스 · CTO",
    metric: "면접 합격률 80%",
  },
  {
    quote: "구독형이라 예산 관리가 편하고, 필요할 때 바로 인원을 늘릴 수 있어요. 반값에 이 퀄리티는 처음입니다.",
    name: "한O O",
    role: "OO커머스 · COO",
    metric: "채용비 50% 절감",
  },
];

const SMALL: Testimonial[] = [
  { quote: "영어·한국어 소통이 되는 개발자를 이 가격에 만날 줄 몰랐어요.", name: "박O O", role: "OO스타트업 · 대표" },
  { quote: "포트폴리오가 실제 실력이랑 일치해서 온보딩이 빨랐어요.", name: "정O O", role: "OO게임 · 개발팀장" },
];

const ROTATE_MS = 3500;

function Stars() {
  return (
    <div className="flex gap-0.5" aria-label="별점 5점">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill="#E8590C" aria-hidden="true">
          <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 18.9 6.1 20.5l1.2-6.5L2.5 9.4l6.6-.9L12 2.5Z" />
        </svg>
      ))}
    </div>
  );
}

function Author({ name, role }: { name: string; role: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FFF1E8] text-[15px] font-bold text-[#E8590C]">
        {name.trim()[0] || "?"}
      </span>
      <div>
        <p className="text-[14px] font-semibold text-[#171E2D]">{name}</p>
        <p className="text-[12.5px] text-[#8A93A5]">{role}</p>
      </div>
    </div>
  );
}

function SmallCard({ t }: { t: Testimonial }) {
  return (
    <div className="flex flex-1 flex-col justify-between rounded-2xl border border-[#EAEDF2] bg-white p-6">
      <p className="text-[16px] leading-[1.65] text-[#3A4356]">“{t.quote}”</p>
      <div className="mt-5">
        <Author name={t.name} role={t.role} />
      </div>
    </div>
  );
}

export default function Testimonials() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setActive((i) => (i + 1) % FEATURED.length), ROTATE_MS);
    return () => clearInterval(id);
  }, []);

  const t = FEATURED[active];

  return (
    <section className="bg-white">
      <div className="mx-auto max-w-[1360px] px-5 py-24">
        <div className="max-w-[680px]">
          <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-[#E8590C]">고객사 후기</p>
          <h2 className="mt-3 text-[34px] font-semibold tracking-normal text-[#171E2D] md:text-[44px]">검증된 인재로, 채용을 끝낸 기업들</h2>
          <p className="mt-4 text-[17px] leading-[1.7] text-[#5B667A]">실제 고객사가 공고마감으로 어떻게 채용했는지 확인해보세요.</p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-[1.4fr_1fr]">
          {/* 대표 후기 (4개 자동 전환) */}
          <div className="flex min-h-[340px] flex-col justify-between rounded-2xl border border-[#EAEDF2] bg-white p-8 shadow-[0_20px_60px_-40px_rgba(10,18,32,0.5)] md:p-10">
            <div key={active} className="animate-testimonial">
              <Stars />
              {t.metric && (
                <span className="mt-5 inline-block rounded-full bg-[#FFF1E8] px-3 py-1 text-[13px] font-bold text-[#E8590C]">{t.metric}</span>
              )}
              <p className="mt-4 text-[22px] font-semibold leading-[1.5] text-[#171E2D] md:text-[26px]">“{t.quote}”</p>
            </div>
            <div className="mt-8 flex items-end justify-between gap-4">
              <div key={`a-${active}`} className="animate-testimonial">
                <Author name={t.name} role={t.role} />
              </div>
              {/* 인디케이터 */}
              <div className="flex gap-1.5">
                {FEATURED.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActive(i)}
                    aria-label={`${i + 1}번 후기`}
                    className={`h-1.5 rounded-full transition-all ${i === active ? "w-5 bg-[#E8590C]" : "w-1.5 bg-[#E1E5EC] hover:bg-[#C9CFDA]"}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* 작은 후기 2개 (고정) */}
          <div className="flex flex-col gap-6">
            {SMALL.map((s, i) => (
              <SmallCard key={i} t={s} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
