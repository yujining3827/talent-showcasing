import Link from "next/link";
import { dummyTalents } from "@/lib/dummy-talents";
import { TalentCard } from "@/app/components/talent/TalentCard";

export default function LandingPage() {
  const previewTalents = dummyTalents
    .filter((t) => t.availability !== "employed")
    .slice(0, 4);

  return (
    <main className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white sticky top-0 z-10">
        <div className="mx-auto max-w-[1080px] px-5 h-[56px] flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <rect width="20" height="20" rx="6" fill="#3182F6" />
              <path d="M6 10.5L9 13.5L14 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-[18px] font-medium text-gray-900 tracking-tight">
              TalentMarket
            </span>
          </Link>
          <Link
            href="/login"
            className="text-[14px] text-blue-500 font-medium hover:text-blue-600 transition-colors"
          >
            로그인
          </Link>
        </div>
        <div className="h-[0.5px] bg-gray-200/80" />
      </header>

      {/* 히어로 */}
      <section className="bg-white">
        <div className="mx-auto max-w-[1080px] px-5 py-16 md:py-24 text-center">
          <p className="text-[14px] text-blue-500 font-medium mb-4 animate-section">
            베트남 개발자 채용, 아직도 이력서만 보고 계신가요?
          </p>
          <h1 className="text-[28px] md:text-[40px] font-medium text-gray-900 leading-tight tracking-tight mb-5 animate-section animate-delay-1">
            검증된 IT 인재를<br />
            능력치 카드로 3초 만에 비교하세요
          </h1>
          <p className="text-[15px] md:text-[16px] text-gray-500 leading-relaxed mb-8 max-w-[480px] mx-auto animate-section animate-delay-2">
            기술력·한국어·협업 능력까지 6대 역량을 KTC가 직접 평가했습니다.
            마음에 드는 인재에게 바로 인터뷰를 요청하세요.
          </p>
          <div className="flex justify-center gap-3 animate-section animate-delay-3">
            <Link
              href="/login"
              className="bg-blue-500 text-white px-6 py-3.5 rounded-xl text-[15px] font-medium hover:bg-blue-600 active:scale-[0.98] transition"
            >
              무료로 시작하기
            </Link>
          </div>
        </div>
        <div className="h-[0.5px] bg-gray-200/80" />
      </section>

      {/* 이용 방법 3단계 */}
      <section className="mx-auto max-w-[1080px] px-5 py-16">
        <p className="text-[12px] text-blue-500 font-medium mb-2 text-center">
          이용 방법
        </p>
        <p className="text-[22px] font-medium text-gray-900 tracking-tight text-center mb-12">
          3단계로 끝나는 채용
        </p>

        <div className="flex flex-col md:flex-row items-stretch gap-0">
          {/* STEP 01 */}
          <div className="flex-1 animate-section step-card-1" style={{ animationDelay: "0.15s" }}>
            <div className="bg-white border-[0.5px] border-gray-200/60 rounded-[20px] p-6 h-full">
              <div className="mb-5">
                <svg width="100%" height="80" viewBox="0 0 200 80" fill="none">
                  <rect x="10" y="5" width="56" height="70" rx="8" fill="#F2F4F6" stroke="#E5E8EB" strokeWidth="0.5" />
                  <circle cx="30" cy="24" r="8" fill="#E8F3FF" />
                  <rect x="20" y="40" width="36" height="4" rx="2" fill="#D1D6DB" />
                  <rect x="20" y="50" width="24" height="3" rx="1.5" fill="#E5E8EB" />
                  <rect x="20" y="60" width="30" height="3" rx="1.5" fill="#E5E8EB" />
                  <rect x="72" y="5" width="56" height="70" rx="8" fill="#F2F4F6" stroke="#E5E8EB" strokeWidth="0.5" />
                  <circle cx="92" cy="24" r="8" fill="#E8F3FF" />
                  <rect x="82" y="40" width="36" height="4" rx="2" fill="#D1D6DB" />
                  <rect x="82" y="50" width="24" height="3" rx="1.5" fill="#E5E8EB" />
                  <rect x="82" y="60" width="30" height="3" rx="1.5" fill="#E5E8EB" />
                  <rect x="134" y="5" width="56" height="70" rx="8" fill="#F2F4F6" stroke="#E5E8EB" strokeWidth="0.5" />
                  <circle cx="154" cy="24" r="8" fill="#E8F3FF" />
                  <rect x="144" y="40" width="36" height="4" rx="2" fill="#D1D6DB" />
                  <rect x="144" y="50" width="24" height="3" rx="1.5" fill="#E5E8EB" />
                  <rect x="144" y="60" width="30" height="3" rx="1.5" fill="#E5E8EB" />
                  <circle cx="110" cy="35" r="4" fill="#3182F6" opacity="0.25" className="landing-dot-1" />
                </svg>
              </div>
              <span className="text-[11px] font-medium text-blue-500 mb-2 block">STEP 01</span>
              <p className="text-[15px] font-medium text-gray-900 mb-2">인재 카드 비교</p>
              <p className="text-[13px] text-gray-500 leading-relaxed">
                직무, 경력, 한국어 능력, OVR 점수를 한눈에 비교하세요. 이력서를 열어볼 필요가 없습니다.
              </p>
            </div>
          </div>

          {/* 화살표 1 */}
          <div className="flex items-center justify-center py-3 md:py-0 md:px-3 flex-shrink-0 animate-section" style={{ animationDelay: "0.45s" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-gray-300 rotate-90 md:rotate-0">
              <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          {/* STEP 02 */}
          <div className="flex-1 animate-section step-card-2" style={{ animationDelay: "0.6s" }}>
            <div className="bg-white border-[0.5px] border-gray-200/60 rounded-[20px] p-6 h-full">
              <div className="mb-5">
                <svg width="100%" height="80" viewBox="0 0 200 80" fill="none">
                  <rect x="30" y="2" width="140" height="76" rx="12" fill="#F9FAFB" stroke="#E5E8EB" strokeWidth="0.5" />
                  <circle cx="56" cy="22" r="8" fill="#E8F3FF" />
                  <rect x="70" y="18" width="50" height="4" rx="2" fill="#D1D6DB" />
                  <rect x="70" y="26" width="35" height="3" rx="1.5" fill="#E5E8EB" />
                  <rect x="44" y="40" width="112" height="12" rx="4" fill="white" stroke="#E5E8EB" strokeWidth="0.5" />
                  <rect x="50" y="44" width="40" height="4" rx="2" fill="#E5E8EB" />
                  <rect x="44" y="58" width="112" height="16" rx="8" fill="#3182F6" />
                  <rect x="72" y="64" width="56" height="4" rx="2" fill="white" opacity="0.8" />
                </svg>
              </div>
              <span className="text-[11px] font-medium text-blue-500 mb-2 block">STEP 02</span>
              <p className="text-[15px] font-medium text-gray-900 mb-2">인터뷰 요청</p>
              <p className="text-[13px] text-gray-500 leading-relaxed">
                마음에 드는 인재에게 버튼 한 번으로 인터뷰를 요청하세요. 회사 정보만 입력하면 됩니다.
              </p>
            </div>
          </div>

          {/* 화살표 2 */}
          <div className="flex items-center justify-center py-3 md:py-0 md:px-3 flex-shrink-0 animate-section" style={{ animationDelay: "0.9s" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-gray-300 rotate-90 md:rotate-0">
              <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          {/* STEP 03 */}
          <div className="flex-1 animate-section step-card-3" style={{ animationDelay: "1.05s" }}>
            <div className="bg-white border-[0.5px] border-gray-200/60 rounded-[20px] p-6 h-full">
              <div className="mb-5">
                <svg width="100%" height="80" viewBox="0 0 200 80" fill="none">
                  <rect x="16" y="16" width="48" height="48" rx="12" fill="#F2F4F6" stroke="#E5E8EB" strokeWidth="0.5" />
                  <rect x="28" y="30" width="24" height="4" rx="2" fill="#D1D6DB" />
                  <rect x="30" y="38" width="20" height="3" rx="1.5" fill="#E5E8EB" />
                  <rect x="32" y="46" width="16" height="3" rx="1.5" fill="#E5E8EB" />
                  <circle cx="100" cy="32" r="14" fill="#E8F3FF" />
                  <circle cx="100" cy="29" r="5" fill="#3182F6" opacity="0.3" />
                  <path d="M91 42c0-5 4-9 9-9s9 4 9 9" stroke="#3182F6" strokeWidth="1" strokeLinecap="round" opacity="0.3" />
                  <text x="100" y="60" textAnchor="middle" fill="#3182F6" fontSize="8" fontWeight="500" style={{ fontFamily: "inherit" }}>KTC 매니저</text>
                  <rect x="136" y="16" width="48" height="48" rx="12" fill="#F2F4F6" stroke="#E5E8EB" strokeWidth="0.5" />
                  <circle cx="160" cy="32" r="8" fill="#E8F3FF" />
                  <rect x="148" y="46" width="24" height="3" rx="1.5" fill="#E5E8EB" />
                  <path d="M64 40h22" stroke="#D1D6DB" strokeWidth="1" strokeDasharray="3 2" />
                  <path d="M114 40h22" stroke="#D1D6DB" strokeWidth="1" strokeDasharray="3 2" />
                  <circle cx="172" cy="22" r="6" fill="#1D9E75" opacity="0.15" />
                  <path d="M169 22l2 2 4-4" stroke="#1D9E75" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="text-[11px] font-medium text-blue-500 mb-2 block">STEP 03</span>
              <p className="text-[15px] font-medium text-gray-900 mb-2">KTC 매니저가 연결</p>
              <p className="text-[13px] text-gray-500 leading-relaxed">
                영업일 1일 내에 KTC 매니저가 후보자와 일정을 조율하고, 면접을 세팅해 드립니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 숫자로 보는 서비스 */}
      <section className="bg-white border-y-[0.5px] border-gray-200/60">
        <div className="mx-auto max-w-[1080px] px-5 py-14">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {([
              { num: "142명", label: "등록 인재" },
              { num: "6대 역량", label: "KTC 직접 평가" },
              { num: "1일 내", label: "인터뷰 회신" },
              { num: "135~470만", label: "월 희망 연봉대" },
            ] as const).map((item) => (
              <div key={item.label}>
                <p className="text-[24px] font-medium text-gray-900 mb-1">
                  {item.num}
                </p>
                <p className="text-[13px] text-gray-500">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 인재 미리보기 (블러) */}
      <section className="mx-auto max-w-[1080px] px-5 py-16">
        <p className="text-[12px] text-blue-500 font-medium mb-2 text-center">
          미리보기
        </p>
        <p className="text-[22px] font-medium text-gray-900 tracking-tight text-center mb-8">
          이런 인재들이 기다리고 있어요
        </p>
        <div className="relative">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-[10px] select-none pointer-events-none">
            {previewTalents.map((talent, i) => (
              <div key={talent.id} className="blur-[3px]">
                <TalentCard
                  talent={talent}
                  photoUrl={[
                    "https://randomuser.me/api/portraits/men/32.jpg",
                    "https://randomuser.me/api/portraits/women/44.jpg",
                    "https://randomuser.me/api/portraits/men/67.jpg",
                    "https://randomuser.me/api/portraits/women/17.jpg",
                  ][i]}
                />
              </div>
            ))}
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50/60 rounded-2xl">
            <p className="text-[15px] font-medium text-gray-900 mb-1">
              로그인하면 인재 프로필을 확인할 수 있어요
            </p>
            <p className="text-[13px] text-gray-500 mb-4">
              능력치, 경력, 한국어 수준까지 상세하게 비교해보세요
            </p>
            <Link
              href="/login"
              className="bg-blue-500 text-white px-5 py-3 rounded-xl text-[14px] font-medium hover:bg-blue-600 active:scale-[0.98] transition"
            >
              로그인하고 확인하기
            </Link>
          </div>
        </div>
      </section>

      {/* 최종 CTA */}
      <section className="bg-white border-t-[0.5px] border-gray-200/60">
        <div className="mx-auto max-w-[1080px] px-5 py-16 text-center">
          <p className="text-[22px] font-medium text-gray-900 tracking-tight mb-2">
            채용 고민, 여기서 끝내세요
          </p>
          <p className="text-[14px] text-gray-500 mb-6">
            가입은 무료입니다. 인터뷰 요청 시에만 비용이 발생합니다.
          </p>
          <Link
            href="/login"
            className="inline-block bg-blue-500 text-white px-8 py-3.5 rounded-xl text-[15px] font-medium hover:bg-blue-600 active:scale-[0.98] transition"
          >
            무료로 시작하기
          </Link>
        </div>
      </section>

      {/* 풋터 */}
      <footer className="border-t-[0.5px] border-gray-200/60 bg-gray-50">
        <div className="mx-auto max-w-[1080px] px-5 py-8">
          <div className="flex items-center gap-2 mb-3">
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
              <rect width="20" height="20" rx="6" fill="#3182F6" />
              <path d="M6 10.5L9 13.5L14 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-[14px] font-medium text-gray-700">
              TalentMarket
            </span>
          </div>
          <p className="text-[12px] text-gray-500">
            KTC 파트너사 · 베트남 IT 인재 마켓플레이스
          </p>
        </div>
      </footer>
    </main>
  );
}
