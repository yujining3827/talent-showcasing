"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/gm-admin/chats", label: "1:1 채팅" },
  { href: "/gm-admin/cases", label: "고객 사례" },
  { href: "/gm-admin/leads", label: "상담 리드" },
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

  return (
    <div className="min-h-screen bg-[#F7F8FA]">
      <header className="sticky top-0 z-40 border-b border-[#EAEDF2] bg-white">
        <div className="mx-auto flex h-[60px] max-w-[1100px] items-center justify-between px-6">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center">
              <img src="/logo-wordmark.png" alt="공고마감" className="h-7 w-auto" />
            </Link>
            <nav className="flex items-center gap-1">
              {NAV.map((n) => {
                const active = n.href === "/gm-admin" ? pathname === n.href : pathname.startsWith(n.href);
                return (
                  <Link
                    key={n.href}
                    href={n.href}
                    className={`rounded-md px-3 py-1.5 text-[14px] font-medium transition ${
                      active ? "bg-[#FFF1E8] text-[#E8590C]" : "text-[#59657A] hover:text-[#171E2D]"
                    }`}
                  >
                    {n.label}
                  </Link>
                );
              })}
            </nav>
          </div>
          <button onClick={logout} className="text-[13px] font-medium text-[#8A93A5] transition hover:text-[#E8590C]">
            로그아웃
          </button>
        </div>
      </header>
      {children}
    </div>
  );
}
