// MVP user_profiles 접근 진단 — 카운트만 출력 (시크릿/개인정보 출력 없음)
import path from "node:path";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: path.join(process.cwd(), ".env.local") });

const url = process.env.MVP_SUPABASE_URL;
const anon = process.env.MVP_SUPABASE_ANON_KEY;
const service = process.env.MVP_SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
const mainUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

console.log("MVP url host:", (url || "").replace("https://", "").split(".")[0]);
console.log("main url host:", (mainUrl || "").replace("https://", "").split(".")[0]);
console.log("service key present:", !!service);

async function count(label, client, filter) {
  try {
    let q = client.from("user_profiles").select("id", { count: "exact", head: true });
    if (filter) q = filter(q);
    const { count: c, error } = await q;
    console.log(label, error ? `ERROR: ${error.message}` : c);
  } catch (e) {
    console.log(label, "THROW:", e.message);
  }
}

const anonClient = createClient(url, anon);
await count("[anon] user_profiles total:", anonClient);
await count("[anon] with photo:", anonClient, (q) => q.not("photo_url", "is", null));

// 서비스 키가 MVP 프로젝트 것인지 불명 — MVP URL에 대고 시도
if (service) {
  const svcClient = createClient(url, service);
  await count("[service@MVP] total:", svcClient);
  await count("[service@MVP] with photo:", svcClient, (q) => q.not("photo_url", "is", null));
  await count("[service@MVP] resume public:", svcClient, (q) => q.eq("is_resume_public", true));
}
