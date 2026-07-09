// 실제 쇼케이스 인재를 오프라인 뷰티파이닝 → data/talent-details.generated.json + public/talent-photos/*.png
//  1) 이력서(resume_url PDF) 파싱 → GPT(gpt-4o-mini)로 한글 이력 JSON 생성
//  2) 프로필 사진 → GPT 이미지 편집(gpt-image-1)으로 얼굴 유지 + 배경 단정하게
//  3) resumeUrl(원본 링크) 보존 → 상세 페이지 "실제 이력서 보기" 버튼
//
// 사용:
//   node scripts/beautify-talents.mjs --limit 1 --skip-images   # 텍스트만 1명 (파일럿)
//   node scripts/beautify-talents.mjs --only <id>               # 특정 인재
//   node scripts/beautify-talents.mjs                            # 전체(캐시된 건 건너뜀)
//   node scripts/beautify-talents.mjs --force                   # 이미 생성된 것도 재생성
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { createClient } from "@supabase/supabase-js";
import ws from "ws";

/* ---------- env ---------- */
const env = {};
for (const l of readFileSync(".env.local", "utf8").split("\n")) {
  if (!l || l.trim().startsWith("#") || !l.includes("=")) continue;
  const i = l.indexOf("="); let v = l.slice(i + 1).trim();
  if (v[0] === '"' && v.at(-1) === '"') v = v.slice(1, -1);
  env[l.slice(0, i).trim()] = v;
}
const OPENAI = env.OPENAI_API_KEY;
const M = env.MVP_SUPABASE_URL, MK = env.MVP_SUPABASE_ANON_KEY;

/* ---------- args ---------- */
const args = process.argv.slice(2);
const getArg = (n) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : null; };
const LIMIT = getArg("--limit") ? Number(getArg("--limit")) : Infinity;
const ONLY = getArg("--only");
const SKIP_IMAGES = args.includes("--skip-images");
const FORCE = args.includes("--force");

const OUT = "data/talent-details.generated.json";
const IMG_DIR = "public/talent-photos";

/* ---------- helpers ---------- */
async function withRetry(fn, tries = 4) {
  let last;
  for (let i = 0; i < tries; i++) {
    try { const r = await fn(); if (r) return r; } catch (e) { last = e; }
    await new Promise((r) => setTimeout(r, 800 * (i + 1)));
  }
  if (last) throw last;
  return null;
}

// 로컬 dev 서버가 큐레이션한 36명 id 획득
async function getShowcaseIds() {
  const r = await fetch("http://localhost:3000/api/showcase").then((x) => x.json());
  return (r.talents || []).map((t) => t.id);
}

// DB 조회 — 앱 서버 컨텍스트에서만 정상이므로 임시 라우트(/api/_talent-source) 경유
async function fetchRows(ids) {
  const idset = new Set(ids);
  return withRetry(async () => {
    const j = await fetch("http://localhost:3000/api/beautify-source").then((x) => x.json());
    const rows = (j.rows || []).filter((r) => idset.has(r.id));
    return rows.length ? rows : null;
  });
}

// 구글드라이브 등 뷰 링크 → 직접 다운로드 URL
function toDownloadUrl(url) {
  if (!url) return null;
  const m = url.match(/drive\.google\.com\/file\/d\/([^/]+)/) || url.match(/[?&]id=([^&]+)/);
  if (m) return `https://drive.google.com/uc?export=download&id=${m[1]}`;
  return url;
}

async function extractPdfText(url) {
  try {
    const dl = toDownloadUrl(url);
    const res = await fetch(dl, { redirect: "follow" });
    const ct = res.headers.get("content-type") || "";
    const buf = Buffer.from(await res.arrayBuffer());
    if (!/pdf/i.test(ct) && buf.slice(0, 4).toString() !== "%PDF") return null; // PDF 아님(로그인 페이지 등)
    const mod = await import("pdf-parse");
    const pdf = mod.default ?? mod.pdf ?? mod;
    const data = await pdf(buf);
    return (data.text || "").replace(/\n{3,}/g, "\n\n").trim().slice(0, 12000);
  } catch (e) {
    console.log("   PDF 파싱 실패:", String(e.message).slice(0, 60));
    return null;
  }
}

const TEXT_PROMPT = `You are a resume editor for a PREMIUM talent marketplace serving KOREAN companies. Given a Vietnamese IT candidate's resume/profile (mostly English), produce a polished, natural KOREAN summary in the KOREAN RESUME convention: 학력·자격증·수상내역을 상단에서 강조하고, 그 다음 경력을 상세히 작성.
Respond ONLY with a JSON object with these keys:
- titleLine: string (직무 한 줄 요약, 한국어)
- objective: string (3~4문장 한국어 소개)
- education: array of {period, school, major}  // 학력. 원문에 있으면 반드시 채울 것
- certifications: array of string (한국어)  // 자격증. 원문(자격증·어학 점수 등)에서 최대한 추출
- achievements: array of string (한국어)  // 수상내역/성과. 원문(수상·표창·우수사원 등)에서 최대한 추출
- experience: array of {period, company, project, customer, role, summary, tasks[]}  // 경력. 한국어로 상세히(회사·기간·역할·요약·주요 업무 tasks 최대 5개). 원문 경력을 빠짐없이 정리
- skillGroups: array of {title, items[]}  // title 한국어, items는 짧은 한국어/영문 토큰. 그룹 3~4개, 그룹당 items 최대 4개
Rules: 원문에 충실하게(없는 내용은 지어내지 말고 빈 배열로). 회사명·기술명·자격증명은 원문 유지 가능. 학력/자격증/수상은 있으면 꼭 채우고, 경력은 구체적으로. 간결하고 읽기 쉽게.`;

async function beautifyText(row) {
  const pdfText = row.resume_url ? await extractPdfText(row.resume_url) : null;
  const source = pdfText
    ? `RESUME (from PDF):\n${pdfText}`
    : `PROFILE FIELDS:\n${JSON.stringify({
        name: row.full_name, position: row.position, headline: row.headline,
        university: row.university, experiences: row.experiences, projects: row.projects,
        skills: row.skills, intro: row.intro, languages: row.languages, english_cert: row.english_cert,
      }).slice(0, 12000)}`;
  const r = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${OPENAI}` },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.3,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: TEXT_PROMPT },
        { role: "user", content: source },
      ],
    }),
  });
  const j = await r.json();
  if (j.error) throw new Error("GPT: " + j.error.message);
  return { detail: JSON.parse(j.choices[0].message.content), usedPdf: !!pdfText };
}

const IMG_PROMPT =
  "Keep this exact same person, same face, same identity, same hairstyle and clothing, unchanged. Replace only the background with a clean, softly-lit neutral light-gray professional studio backdrop. Realistic professional corporate headshot, natural lighting, no distortion of the face. Portrait orientation with a 3:4 vertical aspect ratio (taller than wide), head-and-shoulders composition, subject centered.";

async function beautifyImage(row) {
  const src = row.photo_url;
  if (!src) return null;
  const imgRes = await fetch(src);
  const buf = Buffer.from(await imgRes.arrayBuffer());
  const ct = imgRes.headers.get("content-type") || "image/jpeg";
  const form = new FormData();
  form.append("model", "gpt-image-1");
  form.append("image", new Blob([buf], { type: ct }), "photo.png");
  form.append("prompt", IMG_PROMPT);
  form.append("size", "1024x1536"); // gpt-image-1 세로형(3:4에 가장 가까운 지원 사이즈)
  const r = await fetch("https://api.openai.com/v1/images/edits", {
    method: "POST",
    headers: { Authorization: `Bearer ${OPENAI}` },
    body: form,
  });
  const j = await r.json();
  if (j.error) throw new Error("IMG: " + j.error.message);
  const b64 = j.data[0].b64_json;
  if (!existsSync(IMG_DIR)) mkdirSync(IMG_DIR, { recursive: true });
  const path = `${IMG_DIR}/${row.id}.png`;
  writeFileSync(path, Buffer.from(b64, "base64"));
  return `/talent-photos/${row.id}.png`;
}

/* ---------- run ---------- */
const store = existsSync(OUT) ? JSON.parse(readFileSync(OUT, "utf8")) : {};

let ids = ONLY ? ONLY.split(",").map((s) => s.trim()) : await getShowcaseIds();
console.log("쇼케이스 대상:", ids.length, "명");
const rows = await fetchRows(ids);
if (!rows) { console.log("DB 조회 실패(스로틀). 잠시 후 재시도하세요."); process.exit(1); }

let done = 0;
for (const row of rows) {
  if (done >= LIMIT) break;
  if (!FORCE && store[row.id]?.detail) { console.log(`⏭  ${row.full_name} (캐시됨)`); continue; }
  done++;
  console.log(`\n▶ ${row.full_name} (${row.id})`);
  const entry = store[row.id] || { id: row.id };
  try {
    const { detail, usedPdf } = await beautifyText(row);
    entry.detail = detail;
    entry.resumeUrl = row.resume_url || null;
    console.log(`   ✅ 텍스트 (${usedPdf ? "PDF" : "필드"} 기반) — 경력 ${detail.experience?.length || 0}건`);
  } catch (e) {
    console.log("   ❌ 텍스트 실패:", String(e.message).slice(0, 80));
  }
  if (!SKIP_IMAGES) {
    try {
      const p = await beautifyImage(row);
      if (p) { entry.photo = p; console.log("   ✅ 이미지:", p); }
    } catch (e) {
      console.log("   ❌ 이미지 실패:", String(e.message).slice(0, 80));
    }
  }
  store[row.id] = entry;
  if (!existsSync("data")) mkdirSync("data");
  writeFileSync(OUT, JSON.stringify(store, null, 2)); // 매 건 저장(중단 대비)
}
console.log(`\n=== 처리 ${done}명 → ${OUT} 저장 ===`);
