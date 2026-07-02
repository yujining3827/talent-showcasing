// 공개 인재 사진을 gpt-4o-mini 비전으로 판정 → data/photo-verdicts.json 캐싱
// 산/단체/빈/저화질 걸러내고 프로 헤드샷만 통과
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";

const env = {};
for (const l of readFileSync(".env.local","utf8").split("\n")) { if(!l||l.trim().startsWith("#")||!l.includes("="))continue; const i=l.indexOf("="); let v=l.slice(i+1).trim(); if(v[0]==='"'&&v.at(-1)==='"')v=v.slice(1,-1); env[l.slice(0,i).trim()]=v; }
const OPENAI = env.OPENAI_API_KEY;
const M = env.MVP_SUPABASE_URL, MK = env.MVP_SUPABASE_ANON_KEY;

// 전체 풀: 사진 있는 user_profiles 전부 (헤드헌팅 동의 인재 전원)
const rows = await (await fetch(`${M}/rest/v1/user_profiles?select=id,full_name,photo_url&photo_url=not.is.null&limit=2000`,{headers:{apikey:MK,Authorization:`Bearer ${MK}`}})).json();
console.log("판정 대상:", rows.length, "명");

const PROMPT = `You are the photo editor for a PREMIUM talent marketplace like Toptal. A company executive will decide whether to contact this person based on the photo, so it must look polished and trustworthy. Judge this image and respond ONLY with compact JSON: {"headshot":boolean,"professional":boolean,"quality":1-5,"reason":"few words"}.
- headshot=true ONLY if exactly ONE real person, face clearly visible, head-and-shoulders framing. false for landscapes, group photos, logos, blank/white images, cartoons, full-body/far shots.
- professional=true ONLY if it looks like a polished professional headshot: well-lit, clean/uncluttered background, approachable or confident expression, face centered and facing the camera. professional=FALSE for casual selfies, shot-from-below/awkward angles, harsh unsmiling ID/mugshot look, messy room/outdoor backgrounds, low resolution.
- quality 1-5 = how premium/attractive it looks for a hiring showcase (5=studio-quality, 4=clean & professional, 3=acceptable, 1-2=poor/casual).`;

const verdicts = {};
let pass = 0;
for (let i = 0; i < rows.length; i++) {
  const p = rows[i];
  try {
    const imgRes = await fetch(p.photo_url);
    const buf = Buffer.from(await imgRes.arrayBuffer());
    const ct = imgRes.headers.get("content-type") || "image/jpeg";
    const dataUri = `data:${ct};base64,${buf.toString("base64")}`;
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${OPENAI}` },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        max_tokens: 60,
        messages: [{ role: "user", content: [
          { type: "text", text: PROMPT },
          { type: "image_url", image_url: { url: dataUri, detail: "low" } },
        ]}],
      }),
    });
    const j = await r.json();
    if (j.error) { console.log(`[${p.full_name}] API오류: ${j.error.message.slice(0,60)}`); continue; }
    const txt = j.choices[0].message.content.replace(/```json|```/g,"").trim();
    const v = JSON.parse(txt);
    const good = v.headshot === true && v.professional === true && Number(v.quality) >= 4;
    verdicts[p.id] = { good, headshot: v.headshot, professional: v.professional, quality: v.quality, reason: v.reason };
    if (good) pass++;
    console.log(`${good?"✅":"❌"} ${(p.full_name||"").slice(0,20).padEnd(20)} h:${v.headshot} q:${v.quality} (${v.reason})`);
  } catch (e) {
    console.log(`[${p.full_name}] 실패: ${String(e.message).slice(0,50)}`);
  }
}

if (!existsSync("data")) mkdirSync("data");
writeFileSync("data/photo-verdicts.json", JSON.stringify(verdicts, null, 0));
console.log(`\n=== 통과 ${pass}/${rows.length} → data/photo-verdicts.json 저장 ===`);
