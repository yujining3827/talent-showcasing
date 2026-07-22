"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/gm-admin/clarity", label: "Clarity 요약" },
  { href: "/gm-admin/chats", label: "1:1 채팅" },
  { href: "/gm-admin/leads", label: "상담 리드" },
  { href: "/gm-admin/cases", label: "고객사례 관리" },
  { href: "/gm-admin/brochure", label: "소개서 관리" },
];

export default function GmAdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // 로그인 페이지는 셸(헤더/네비) 없이 그대로
  if (pathname === "/gm-admin/login") return <>{children}</>;

  async function logout() {
    await fetch("/api/gm-admin/login", { method: "DELETE" });
    window.location.href = "/gm-admin/login";
  }

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <div className="min-h-screen bg-[#F7F8FA]">
      {/* 전체 폭 상단 헤더 */}
      <header className="sticky top-0 z-40 flex h-[60px] items-center border-b border-[#EAEDF2] bg-white px-6">
        <Link href="/" className="flex items-center">
          <img src="/logo-wordmark.png" alt="공고마감" className="h-7 w-auto" />
        </Link>
      </header>

      <div className="flex">
        {/* 좌측 사이드바 (데스크톱) */}
        <aside className="sticky top-[60px] hidden h-[calc(100vh-60px)] w-[224px] shrink-0 flex-col border-r border-[#EAEDF2] bg-white md:flex">
          <nav className="flex flex-1 flex-col gap-1 p-3">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className={`rounded-lg px-3.5 py-2.5 text-[14px] font-medium transition ${
                  isActive(n.href) ? "bg-[#FFF1E8] text-[#E8590C]" : "text-[#59657A] hover:bg-[#F5F6F8] hover:text-[#171E2D]"
                }`}
              >
                {n.label}
              </Link>
            ))}
            <a
              href="https://b2bvntr.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 rounded-lg px-3.5 py-2.5 text-[13px] font-medium text-[#8A95A1] transition hover:bg-[#F5F6F8] hover:text-[#E8590C]"
            >
              베타 광고 대시보드 ↗
            </a>
          </nav>
          <div className="border-t border-[#F1F3F7] p-3">
            <button
              onClick={logout}
              className="w-full rounded-lg px-3.5 py-2.5 text-left text-[13px] font-medium text-[#8A95A1] transition hover:bg-[#F5F6F8] hover:text-[#E8590C]"
            >
              로그아웃
            </button>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          {/* 모바일 가로 네비 */}
          <nav className="flex items-center gap-1 overflow-x-auto border-b border-[#EAEDF2] bg-white px-4 py-2 scrollbar-hide md:hidden">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className={`shrink-0 whitespace-nowrap rounded-md px-2.5 py-1.5 text-[13px] font-medium transition ${
                  isActive(n.href) ? "bg-[#FFF1E8] text-[#E8590C]" : "text-[#59657A]"
                }`}
              >
                {n.label}
              </Link>
            ))}
            <a
              href="https://b2bvntr.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 whitespace-nowrap rounded-md px-2.5 py-1.5 text-[13px] font-medium text-[#8A95A1]"
            >
              베타 광고 ↗
            </a>
            <button onClick={logout} className="shrink-0 whitespace-nowrap rounded-md px-2.5 py-1.5 text-[13px] font-medium text-[#8A95A1]">
              로그아웃
            </button>
          </nav>
          <main className="min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
