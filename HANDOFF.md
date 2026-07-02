# 핸드오프 — 인재 쇼케이스 (디자인 작업용)

KTC Support에서 갈라져 나온 **동의 기반 인재 쇼케이스** 스핀오프. 원본 DB는 **읽기 전용**(쓰기 금지). 지금 로직/데이터는 다 붙어 있고, **남은 건 디자인 감도**를 Toptal 수준으로 끌어올리는 것.

## 실행
```
npm install
npm run dev        # http://localhost:3000
```
`.env.local` 에 이미 키 다 있음(Supabase 2곳·OpenAI·logo.dev). **커밋 금지**(gitignore됨).

## 디자인이 만질 핵심 파일 (여기만 보면 됨)
| 파일 | 역할 |
|---|---|
| `app/page.tsx` → `PreviewSection` | 쇼케이스 섹션(그리드/타이틀/CTA). 페이지 최상단 |
| `app/components/showcase/ProfileCard.tsx` | **인재 카드** (가장 중요 — 여기가 감도) |
| `app/page.tsx` 히어로 섹션 | toptal식 정적 히어로 |
| `app/globals.css`, `tailwind.config.ts` | 토큰/스타일 |

## 데이터는 건드릴 필요 없음 (이미 작동)
- `GET /api/showcase` → `{ total, talents: ShowcaseTalent[] }` 반환
- `ShowcaseTalent`: `{ name, role, headline, photo_url, school, schoolElite, company, companyElite, companyDomain, yoeYears, location, skills }`
- 사진은 `/api/img?u=...` 프록시 경유. 회사 로고는 `img.logo.dev/{companyDomain}?token=...`
- 사진 큐레이션(산/단체/빈사진 제거)은 `data/photo-verdicts.json` + `scripts/curate-photos.mjs` (gpt-4o-mini 비전). 재실행: `node scripts/curate-photos.mjs`

## 현재 상태
- 공개 인재 36명 노출. 카드 = 가로형(왼쪽 큰 사진 + 오른쪽 이름/직무/이전소속(로고)/학력/공개동의)
- 회사 있으면 로고+이름, 없으면 "신입". 글로벌 기업 상단 정렬.

## 벤치마크 = toptal.com
- 사진이 주인공(크고 일관된 톤), 회사는 로고, 카드 극미니멀, 여백 넉넉, 라이트 그레이 캔버스.
- **개선 여지**: 사진 톤 일관화(약한 desaturation?), 타이포/여백 정교화, 히어로-쇼케이스 흐름, 전반 프리미엄 감도.

## 지켜야 할 것
- 원본 Supabase는 **읽기만**. `is_resume_public` 무관하게 전체 활용(다 헤드헌팅 동의).
- UI 한국어. 카피에 "합의용/공유용" 같은 메타표현 금지.
