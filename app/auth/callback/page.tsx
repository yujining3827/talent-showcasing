"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function AuthCallbackPage() {
  useEffect(() => {
    async function handleCallback() {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");

      if (code) {
        const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code);

        if (session) {
          // 프로필 확인: 승인된 유저 + admin/super_admin은 각각 다른 곳으로
          const { data: profile } = await supabase
            .from("user_profiles")
            .select("status, role")
            .eq("id", session.user.id)
            .single();

          if (profile?.role === "super_admin" || profile?.role === "admin") {
            window.location.href = "/admin";
          } else if (profile?.status === "approved") {
            window.location.href = "/talents";
          } else {
            window.location.href = "/login";
          }
          return;
        }

        if (error) {
          console.error("Auth callback error:", error.message);
        }
      }

      // fallback
      window.location.href = "/login";
    }

    handleCallback();
  }, []);

  return (
    <main className="min-h-screen bg-[#F7F8FA] flex items-center justify-center">
      <p className="text-[14px] text-gray-500">로그인 처리 중...</p>
    </main>
  );
}
