export interface PortfolioResult {
  role: string;
  years_exp: number;
  location: string;
  top_skills: string[];
  career_history: { company: string; position: string; period: string }[];
  abilities: { technical: number; english: number; collaboration: number; stability: number; growth: number };
  summary_en: string;
  summary_ko: string;
  strengths_en: string[];
  strengths_ko: string[];
  score: number;
  raw_response: string;
  pdfBuffer?: Buffer;
}

const PORTFOLIO_PROMPT = `You are a senior tech recruiter. Analyze this CV/portfolio and extract a structured professional profile.

There is NO specific job description — evaluate the candidate's overall capabilities as an IT professional.

## CV/Portfolio
(attached as PDF file)

— TASK: PROFILE EXTRACTION & SCORING —

1. Identify the candidate's primary role (e.g. Frontend Developer, Backend Developer, Full-stack Developer, Mobile Developer, UI/UX Designer, DevOps Engineer, Data Engineer, QA Engineer, Project Manager, etc.)
2. Count total years of professional experience from the CV.
3. Score the candidate on overall professional quality (0-100) using this breakdown:
   - Technical depth: 0-35pts (skill level, tech stack breadth, project complexity)
   - Experience quality: 0-30pts (company tier, project impact, role progression)
   - Skills relevance: 0-20pts (how marketable/in-demand are the skills)
   - Career trajectory: 0-15pts (growth pattern, promotions, consistency)
   Each sub-score MUST reflect the actual CV content — use precise numbers like 23, 67, 81.

Return ONLY valid JSON:
{
  "score_breakdown": {
    "technical_depth": 0-35,
    "experience_quality": 0-30,
    "skills_relevance": 0-20,
    "career_trajectory": 0-15
  },
  "score": "SUM of score_breakdown (0-100)",
  "role": "the candidate's primary role in English (e.g. Frontend Developer)",
  "years_exp": number of total years of professional experience,
  "location": "city from CV (e.g. Ho Chi Minh City, Hanoi)",
  "top_skills": ["skill1", "skill2", "skill3", "skill4", "skill5"],
  "career_history": [
    {"company": "Company Name", "position": "Job Title", "period": "Jun 2023 - Present"},
    {"company": "Company Name", "position": "Job Title", "period": "Jan 2021 - May 2023"}
  ],
  "abilities": {
    "technical": 0-100,
    "english": 0-100,
    "collaboration": 0-100,
    "stability": 0-100,
    "growth": 0-100
  },
  "strengths_en": ["strength 1 in English", "strength 2", "strength 3"],
  "strengths_ko": ["strong point 1 in Korean", "strong point 2", "strong point 3"],
  "summary_en": "1-2 sentence professional summary in English. NEVER include the candidate's name.",
  "summary_ko": "1-2 sentence professional summary in Korean. NEVER include the candidate's name."
}

IMPORTANT:
- "role" should be a specific English role title, not generic.
- "top_skills" must be specific technical skills or tools from the CV (e.g. "React", "Node.js", "Figma"), NOT generic descriptions.
- "career_history" must list ALL work experiences from the CV.
- "abilities" scores (use precise numbers like 63, 77, 84 — NOT round numbers): technical=skill level, english=English proficiency, collaboration=teamwork indicators, stability=job tenure consistency, growth=career progression.
- "strengths_ko" and "summary_ko" must be in natural Korean.
- Return ONLY the JSON object. No other text.`;

export async function screenPortfolio(
  pdfBuffer: Buffer
): Promise<PortfolioResult | { error: string }> {
  const base64Pdf = pdfBuffer.toString("base64");

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4.1-mini",
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: PORTFOLIO_PROMPT },
                {
                  type: "file",
                  file: {
                    filename: "cv.pdf",
                    file_data: `data:application/pdf;base64,${base64Pdf}`,
                  },
                },
              ],
            },
          ],
          temperature: 0.1,
          max_tokens: 4096,
          response_format: { type: "json_object" },
        }),
      });

      if (res.status === 429) {
        const wait = Math.pow(2, attempt + 1) * 1000;
        await new Promise((r) => setTimeout(r, wait));
        continue;
      }

      if (!res.ok) {
        const err = await res.text();
        console.error("OpenAI API error:", err);
        return { error: "OpenAI API 오류: " + res.status };
      }

      const data = await res.json();
      const text = data.choices?.[0]?.message?.content || "";

      const result = parseResult(text);
      result.pdfBuffer = pdfBuffer;
      return result;
    } catch (err) {
      console.error("OpenAI request failed:", err);
      if (attempt === 2) return { error: "OpenAI 요청 실패: " + (err instanceof Error ? err.message : "unknown") };
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
  return { error: "OpenAI 요청 3회 실패" };
}

function parseResult(text: string): PortfolioResult {
  try {
    const json = JSON.parse(text);
    const score = json.score_breakdown
      ? (json.score_breakdown.technical_depth || 0) + (json.score_breakdown.experience_quality || 0) + (json.score_breakdown.skills_relevance || 0) + (json.score_breakdown.career_trajectory || 0)
      : (json.score || 0);

    return {
      score,
      role: json.role || "Unknown",
      years_exp: json.years_exp || 0,
      location: json.location || "",
      top_skills: (json.top_skills || []).slice(0, 5),
      career_history: (json.career_history || []).slice(0, 5),
      abilities: {
        technical: json.abilities?.technical || 0,
        english: json.abilities?.english || 0,
        collaboration: json.abilities?.collaboration || 0,
        stability: json.abilities?.stability || 0,
        growth: json.abilities?.growth || 0,
      },
      summary_en: json.summary_en || "",
      summary_ko: json.summary_ko || "",
      strengths_en: (json.strengths_en || []).slice(0, 3),
      strengths_ko: (json.strengths_ko || []).slice(0, 3),
      raw_response: text,
    };
  } catch {
    return {
      score: 0,
      role: "Unknown",
      years_exp: 0,
      location: "",
      top_skills: [],
      career_history: [],
      abilities: { technical: 0, english: 0, collaboration: 0, stability: 0, growth: 0 },
      summary_en: "",
      summary_ko: "",
      strengths_en: [],
      strengths_ko: [],
      raw_response: text,
    };
  }
}
