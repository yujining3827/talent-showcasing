"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { signOut } from "@/lib/supabase-auth";

export function Header() {
  const [user, setUser] = useState<{ email?: string; avatar?: string } | null>(null);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          email: session.user.email,
          avatar: session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture,
        });
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          email: session.user.email,
          avatar: session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture,
        });
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleSignOut() {
    await signOut();
    setUser(null);
    setShowMenu(false);
  }

  return (
    <header className="bg-white sticky top-0 z-50">
      <div className="mx-auto max-w-[1080px] px-5 h-[56px] flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="VTM" width={24} height={24} className="rounded-[4px]" />
          <span className="text-[18px] text-gray-900 tracking-tight" style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 700 }}>
            Vtm
          </span>
        </Link>

        {user ? (
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="flex items-center gap-2"
            >
              {user.avatar ? (
                <img src={user.avatar} alt="" className="w-8 h-8 rounded-full" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                  <span className="text-[13px] font-medium text-blue-500">
                    {user.email?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
              )}
            </button>

            {showMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 top-10 z-50 bg-white border-[0.5px] border-gray-200 rounded-xl py-2 min-w-[180px]">
                  <p className="px-4 py-2 text-[12px] text-gray-500 truncate">{user.email}</p>
                  <div className="h-[0.5px] bg-gray-200/60 my-1" />
                  <Link
                    href="/login"
                    onClick={() => setShowMenu(false)}
                    className="block px-4 py-2 text-[14px] text-gray-700 hover:bg-gray-50"
                  >
                    내 계정
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-2 text-[14px] text-gray-700 hover:bg-gray-50"
                  >
                    로그아웃
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <Link
            href="/login"
            className="text-[14px] text-blue-500 font-medium hover:text-blue-600 transition-colors"
          >
            로그인
          </Link>
        )}
      </div>
      <div className="h-[0.5px] bg-gray-200/80" />
    </header>
  );
}
