// Sora 2로 랜딩 히어로 배경 영상 생성 → public/hero.mp4 저장
// 사용법:
//   OPENAI_API_KEY=sk-... node scripts/generate-hero-video.mjs
// 옵션:
//   --prompt "..."   프롬프트 교체
//   --seconds 8      길이 (4|8|12)
//   --pro            sora-2-pro (1080p, 비쌈)

import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";

dotenv.config({ path: path.join(process.cwd(), ".env.local") });

const API = "https://api.openai.com/v1";
const KEY = process.env.OPENAI_API_KEY;
if (!KEY) {
  console.error("OPENAI_API_KEY 환경변수가 필요합니다.");
  process.exit(1);
}

const args = process.argv.slice(2);
const getArg = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};

const DEFAULT_PROMPT = [
  "Cinematic b-roll of a modern Vietnamese software development team working in a sleek office in Ho Chi Minh City.",
  "Young professional developers and designers at desks with monitors showing code and design tools,",
  "warm rim lighting, shallow depth of field, slow dolly camera movement, premium automotive-commercial mood,",
  "dark moody color grade with warm orange accents. No text, no logos, no captions.",
].join(" ");

const prompt = getArg("prompt", DEFAULT_PROMPT);
const seconds = getArg("seconds", "8");
const model = args.includes("--pro") ? "sora-2-pro" : "sora-2";
const size = args.includes("--pro") ? "1792x1024" : "1280x720";

const headers = { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" };

async function main() {
  console.log(`모델 ${model} · ${seconds}s · ${size}`);
  const create = await fetch(`${API}/videos`, {
    method: "POST",
    headers,
    body: JSON.stringify({ model, prompt, seconds, size }),
  });
  if (!create.ok) throw new Error(`생성 요청 실패 ${create.status}: ${await create.text()}`);
  let job = await create.json();
  console.log(`잡 생성됨: ${job.id}`);

  while (job.status === "queued" || job.status === "in_progress") {
    await new Promise((r) => setTimeout(r, 10_000));
    const res = await fetch(`${API}/videos/${job.id}`, { headers: { Authorization: `Bearer ${KEY}` } });
    job = await res.json();
    console.log(`  상태: ${job.status}${job.progress != null ? ` (${job.progress}%)` : ""}`);
  }
  if (job.status !== "completed") throw new Error(`실패: ${JSON.stringify(job, null, 2)}`);

  const content = await fetch(`${API}/videos/${job.id}/content`, { headers: { Authorization: `Bearer ${KEY}` } });
  if (!content.ok) throw new Error(`다운로드 실패 ${content.status}`);
  const out = path.join(process.cwd(), "public", "hero.mp4");
  fs.writeFileSync(out, Buffer.from(await content.arrayBuffer()));
  console.log(`저장 완료: ${out} (${(fs.statSync(out).size / 1024 / 1024).toFixed(1)}MB)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
