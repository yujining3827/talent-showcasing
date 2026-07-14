import { NextResponse } from "next/server";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

/* 어드민 채팅 API 공용 인증
 * 클라이언트가 보낸 Authorization: Bearer <supabase access token>을 검증하고
 * user_profiles에서 admin/super_admin 권한을 확인한다.
 * 통과하면 adminId(토큰 유저 id)를 돌려주므로 클라이언트가 보낸 id를 신뢰할 필요가 없다. */

export function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { persistSession: false, autoRefreshToken: false },
      // Next가 라우트 핸들러의 fetch를 캐싱해 이전 권한 조회 결과를 재사용하는 것 방지
      global: {
        fetch: (url, options = {}) => fetch(url, { ...options, cache: "no-store" }),
      },
    }
  );
}

type AdminAuth =
  | { supabase: SupabaseClient; adminId: string; fail: null }
  | { supabase: SupabaseClient; adminId: null; fail: NextResponse };

export async function requireAdmin(req: Request): Promise<AdminAuth> {
  const supabase = getSupabaseAdmin();
  const unauthorized = () =>
    ({ supabase, adminId: null, fail: NextResponse.json({ error: "unauthorized" }, { status: 401 }) }) as AdminAuth;

  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") || "";
  if (!token) return unauthorized();

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return unauthorized();

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (!profile || (profile.role !== "admin" && profile.role !== "super_admin")) {
    return { supabase, adminId: null, fail: NextResponse.json({ error: "forbidden" }, { status: 403 }) };
  }

  return { supabase, adminId: user.id, fail: null };
}
