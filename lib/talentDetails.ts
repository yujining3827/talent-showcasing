// 인재 상세(이력서) 하드코딩 데이터 — 상세 페이지에서 id로 조회
// ⚠️ 여기 항목을 추가하면 해당 인재 상세 페이지에 풍부한 이력 뷰가 표시됩니다.

export type ExperienceItem = {
  period: string;
  company: string;
  project?: string;
  customer?: string;
  summary?: string;
  role?: string;
  tasks?: string[];
};

// 주요 프로젝트(포트폴리오) — 경력과 별개로 대표 작업물을 카드로 노출
export type ProjectItem = {
  name: string;         // 프로젝트명
  domain?: string;      // 도메인/분야 (예: 핀테크, 헬스케어, 이커머스)
  period?: string;
  role?: string;        // 담당 역할
  description?: string; // 한 줄 설명
  tech?: string[];      // 사용 기술
  liveUrl?: string;     // 배포된 라이브 데모/서비스/디자인(Figma) 바로가기
  liveLabel?: string;   // liveUrl 버튼 라벨 (기본 "Live Demo", 예: "Figma")
  sourceUrl?: string;   // GitHub 등 소스 코드
  highlights?: string[]; // 핵심 성과 (선택)
};

// 상단 요약에 노출할 대표 링크 (있는 것만 버튼으로 표시)
export type TalentLinks = {
  github?: string;
  portfolio?: string; // 포트폴리오 사이트/파일 (미지정 시 resumeUrl로 대체)
  website?: string;   // 개인 웹사이트/블로그
};

export type TalentDetail = {
  id: string;
  titleLine?: string; // 직무 요약 라인
  basic?: { label: string; value: string; href?: string }[];
  links?: TalentLinks; // 상단 요약 링크 버튼 (GitHub·포트폴리오·웹사이트)
  objective?: string;
  education?: { period: string; school: string; major: string }[];
  skillGroups?: { title: string; items: string[] }[];
  projects?: ProjectItem[]; // 주요 프로젝트 (라이브 데모/소스 링크 포함)
  experience?: ExperienceItem[];
  certifications?: string[];
  achievements?: string[];
  resumeUrl?: string; // 실제 이력서/포트폴리오 원본(구글 드라이브 등) 링크
};

export const TALENT_DETAILS: Record<string, TalentDetail> = {
  "hero-1": {
    id: "hero-1",
    titleLine: "시니어 QA 엔지니어 · 품질 관리 스페셜리스트",
    links: { github: "https://github.com/trnmhung" },
    objective:
      "5년 이상의 B2B 소프트웨어 테스트 경력을 보유한 품질 관리 스페셜리스트이자 시니어 QA 엔지니어입니다. 삼성의 대규모 디지털 사이니지 플랫폼을 포함해, 종합적인 테스트 전략과 부서 간 협업을 통해 제품의 안정성·성능·사용자 경험을 보장해왔습니다. 데이터 기반 및 AI 활용 접근으로 테스트 효율과 제품 품질을 높이고, 엔터프라이즈 고객을 위한 확장 가능한 SaaS 솔루션을 제공하는 데 강점이 있습니다.",
    education: [
      { period: "2016 – 2020", school: "호치민 공과대학 (Ho Chi Minh University of Technology)", major: "컴퓨터공학 (Computer Science)" },
    ],
    skillGroups: [
      {
        title: "소프트웨어 테스팅",
        items: [
          "기능 · 비기능(보안·성능·호환성·사용성) 테스트",
          "수동 · 회귀 · 스모크 · 통합 · 시스템 · API · DB · UI/UX",
          "모바일 · 웹 · 애자일/스크럼/칸반",
        ],
      },
      {
        title: "소프트 스킬",
        items: ["팀 커뮤니케이션 · 협업 · 발표/데모", "신규 멤버 온보딩 · 지속 학습"],
      },
      {
        title: "테스팅 툴",
        items: [
          "Jira · TestRail · Zephyr · Confluence",
          "Postman · JMeter · BrowserStack · Selenium/Appium · Miro",
        ],
      },
      { title: "언어", items: ["영어 (업무 가능)", "프랑스어 (기초)"] },
    ],
    projects: [
      {
        name: "HOCS — 병원 운영 관제 시스템",
        domain: "헬스케어 · B2B SaaS",
        period: "2024 – 2026",
        role: "시니어 QA 엔지니어",
        description: "환자·의약품·의료기기의 실시간 데이터를 모니터링/업데이트하는 병원 운영 플랫폼. 싱가포르 Tan Tock Seng Hospital 납품.",
        tech: ["Manual/Regression", "API Testing", "DB Testing", "Jira", "TestRail"],
        highlights: ["웹·모바일 회귀·스모크·UI/UX·DB 테스트 전 영역 담당", "명세 기반 테스트 케이스 설계 및 리포트 작성"],
      },
      {
        name: "삼성 B2B Signage — 디지털 사이니지 플랫폼",
        domain: "디스플레이 · 글로벌",
        period: "2020 – 2024",
        role: "서브리더 · 시니어 QA (5인 팀)",
        description: "삼성 대표 디스플레이 제품인 기업용 사이니지 광고 솔루션. 전 세계 대상 안정성·신뢰성 검증.",
        tech: ["Selenium/Appium", "Postman", "JMeter", "BrowserStack", "Confluence"],
        highlights: ["인도팀 지식 이전 및 베트남팀 온보딩 주도", "SQA 최우수 퍼포먼스 Top 10 (2022·2023)"],
      },
      {
        name: "Neuralyzer — 산업 인프라 보안 SW",
        domain: "사이버 보안 · US",
        period: "2020",
        role: "QA 엔지니어",
        description: "대형 산업·공장 IT 인프라를 온라인 공격으로부터 보호하는 보안 소프트웨어. 통합·시스템 테스트 담당.",
        tech: ["Integration Testing", "System Testing", "API", "Smoke/Regression"],
      },
    ],
    experience: [
      {
        period: "2024.04 – 2026.04",
        company: "ST Engineering Vietnam",
        project: "HOCS",
        customer: "Tan Tock Seng Hospital",
        role: "시니어 소프트웨어 테스트 엔지니어",
        summary: "운영자·부서장이 환자, 의약품, 의료기기의 실시간 데이터를 모니터링하고 업데이트할 수 있도록 지원하는 제품.",
        tasks: [
          "싱가포르 관리팀과 긴밀히 소통하며 신규 기능 요구사항 파악 및 피드백 제공",
          "웹·모바일 앱 수동 테스트 수행 (회귀 · 스모크 · UI/UX · DB · 기능)",
          "명세 문서 기반 신규 기능 테스트 케이스 설계 및 테스트 리포트 작성",
          "증거 수집 및 개발자 버그 재현 지원, 태스크·버그 티켓 기한 내 완료",
          "스프린트 종료 시 신규 기능 데모 참여",
        ],
      },
      {
        period: "2020.12 – 2024.04",
        company: "삼성 호치민 연구소 (SHRC)",
        project: "B2B Signage",
        customer: "전 세계 (Worldwide)",
        role: "서브리더 · 시니어 QA (5인 팀 관리)",
        summary: "삼성의 대표 디스플레이 제품인 사이니지 — 기업용의 안정적이고 신뢰성 높은 광고 솔루션.",
        tasks: [
          "인도 팀으로부터 프로젝트 지식을 습득해 베트남 팀원에게 전수",
          "제품팀 테스트 요청 시 테스트 계획 수립",
          "웹·모바일 수동 테스트 및 명세 기반 테스트 케이스 설계, 리포트 작성",
          "개발자·PO와 결함 확인 및 제품 명세 협의",
          "주니어 팀원 감독, 테스트 프로세스·일정 준수 관리",
          "신규 멤버·타 팀 교육 지원, Confluence에 테스트 문서 작성",
        ],
      },
      {
        period: "2020.06 – 2020.12",
        company: "Opswat Software Vietnam",
        project: "Neuralyzer",
        customer: "미국 (US)",
        role: "QA 엔지니어",
        summary: "대형 산업·기업·공장의 IT 인프라를 온라인 공격으로부터 보호하는 보안 소프트웨어.",
        tasks: [
          "시니어 QA와 협업해 프로젝트 초기부터 제품 테스트 담당",
          "여러 모듈에 대한 통합·시스템 테스트 (UX/UI · 기능 · API · DB)",
          "신규 빌드 스모크 테스트, 요구·환경 변경 및 성능 수정 회귀 테스트",
          "스프린트 데모 기록·수행, 사용자 매뉴얼 작성",
          "테스트 머신 배포, 제품 성능 평가 지원, 랩 장비 셋업",
        ],
      },
    ],
    certifications: ["IELTS 7.0 (2017)", "TOEIC 825 (2016)", "ISTQB Foundation Level (2024)"],
    achievements: [
      "2021년 3분기 우수사원 — Opswat",
      "SQA 최우수 퍼포먼스 Top 10 (2022 · 2023) — 삼성 호치민 연구소(SHRC)",
    ],
    resumeUrl: "https://drive.google.com/file/d/1k17dithvtgosK2JfyLoLxD0gcWXmctzl/view",
  },

  "hero-2": {
    id: "hero-2",
    titleLine: "시니어 UX/UI 디자이너 · 모바일·웹 프로덕트 디자인",
    links: { website : "https://caothanhhung.framer.website/" },
    projects: [
      {
        name: "Catgirl.io — Web3 게임 플랫폼",
        domain: "Web3 · 게이밍",
        period: "2024 – 2026",
        role: "시니어 UX/UI 디자이너 (BLOCKPIXELS)",
        description: "스테이크홀더 요구사항을 웹·모바일 고전환 비주얼로 구현. 엔드투엔드 디자인 리드.",
        tech: ["Figma", "Design System", "Web/Mobile"],
        liveUrl: "https://www.catgirl.io/",
      },
      {
        name: "Unipaws — 반려동물 Web3 서비스",
        domain: "Web3 · 이커머스",
        period: "2024 – 2026",
        role: "시니어 UX/UI 디자이너 (BLOCKPIXELS)",
        description: "반려동물 커머스/커뮤니티 제품의 웹·모바일 UX/UI 엔드투엔드 설계.",
        tech: ["Figma", "Prototyping", "UX Research"],
        liveUrl: "https://www.unipaws.world/",
      },
      {
        name: "Narwhal Finance — DeFi 파생상품",
        domain: "DeFi · 핀테크",
        role: "UX/UI 디자이너",
        description: "온체인 파생상품 거래 앱의 인터페이스 디자인.",
        tech: ["Figma", "Design System"],
        liveUrl: "https://app.narwhal.finance/",
      },
      {
        name: "Zalo Cloud · Developers (VNG)",
        domain: "클라우드 · 개발자 플랫폼",
        period: "2021 – 2024",
        role: "시니어 UI/UX 디자이너 (VNG)",
        description: "베트남 대표 테크 VNG의 Zalo 개발자·클라우드 제품 UX/UI 및 디자인 시스템 구축.",
        tech: ["Figma", "Design System", "Usability Testing"],
        liveUrl: "https://developers.zalo.me/",
      },
    ],
    objective:
      "8년 이상의 경력을 가진 시니어 UX/UI 디자이너로, 모바일 및 웹 제품 디자인, 사용자 연구, 디자인 시스템 개발에 전문성을 보유하고 있습니다. VNG(Zalo Cloud) 등에서 디자인 팀을 이끌고 다양한 부서와 협업하여 직관적이고 효과적인 디지털 경험을 제공한 검증된 능력을 갖추고 있습니다.",
    skillGroups: [
      { title: "디자인 툴", items: ["Figma (전문)", "Adobe Illustrator · Photoshop", "Framer · 프로토타이핑"] },
      { title: "전문 분야", items: ["모바일·웹 프로덕트 디자인", "사용자 연구 · 사용성 테스트", "디자인 시스템 구축", "와이어프레이밍"] },
      { title: "협업", items: ["디자인 팀 리딩", "크로스펑셔널 협업 · 개발 핸드오프"] },
    ],
    experience: [
      {
        period: "2024.02 – 2026.02",
        company: "BLOCKPIXELS",
        role: "시니어 UX/UI 디자이너 (리모트)",
        summary: "모바일·웹 제품의 UX/UI 디자인 및 디자인 시스템 전반을 담당.",
      },
      {
        period: "2021.07 – 2024.02",
        company: "VNG | Zalo Cloud",
        role: "시니어 UI/UX 디자이너",
        summary: "베트남 대표 테크 기업 VNG의 Zalo Cloud 제품 UX/UI 설계와 디자인 시스템 개발을 주도.",
      },
      {
        period: "2021.03 – 2021.07",
        company: "Hailstone Labs",
        role: "시니어 UI/UX 디자이너 (프리랜스)",
        summary: "제품 UI/UX 디자인 및 프로토타이핑.",
      },
      {
        period: "2020.01 – 2021.03",
        company: "Base Business Solutions Corp.",
        role: "UI/UX 디자이너",
        summary: "B2B SaaS 제품 인터페이스 디자인.",
      },
      {
        period: "2018.05 – 2020.01",
        company: "Dien Quan Media & Entertainment",
        role: "그래픽 디자이너",
        summary: "브랜드·미디어 그래픽 디자인.",
      },
    ],
    resumeUrl: "https://drive.google.com/file/d/1DakTBaEIhZS6oyVEGB6XWuX2mcqD6yV4/view",
  },

  "hero-3": {
    id: "hero-3",
    titleLine: "AI/ML 엔지니어 · RAG·AI Agent 전문",
    links: { github: "https://github.com/pgtkhai" },
    projects: [
      {
        name: "CV·JD 파싱 툴킷",
        domain: "AI · 문서 파싱",
        period: "2025",
        role: "AI 엔지니어 (Aniday)",
        description: "CV·JD에서 구조화 스키마로 정보를 추출하는 자동 파이프라인. 민감정보 탐지·자동 마스킹 모듈과 OCR(Google Cloud Vision) 통합.",
        tech: ["Gemini API", "Google Cloud Vision", "FastAPI", "Docker"],
      },
      {
        name: "Job-Candidate 매칭 엔진",
        domain: "AI · 시맨틱 검색",
        period: "2025",
        role: "AI 엔지니어 (Aniday)",
        description: "임베딩 기반 시맨틱 매칭으로 후보-공고 적합도를 산출. Elasticsearch 벡터 검색으로 저지연 인덱싱.",
        tech: ["Gemini API", "MongoDB", "Elasticsearch", "Google Embedding"],
      },
      {
        name: "CD-HMA — Blind 이미지 초해상도 (연구)",
        domain: "컴퓨터 비전 · 논문",
        period: "2025",
        role: "제1저자 (ICMV 2025)",
        description: "열화 인지 하이브리드 멀티축 어텐션 네트워크. 5개 벤치마크에서 SOTA급 성능 달성, 국제학회 ICMV 게재.",
        tech: ["PyTorch", "Diffusion", "Super-resolution"],
        sourceUrl: "https://github.com/pgtkhai/CD-HMA",
      },
      {
        name: "자동 콜드 이메일 아웃리치",
        domain: "AI · 자동화",
        role: "AI 엔지니어 (Aniday)",
        description: "n8n 워크플로우로 리드 스크래핑·연락처 보강(Hunter.io) 후 Gemini로 맞춤 이메일을 생성·자동 발송.",
        tech: ["n8n", "Gemini API", "Hunter.io", "Google Workspace API"],
      },
    ],
    objective:
      "RAG(검색 증강 생성)와 AI Agent, 컴퓨터 비전·NLP를 아우르는 AI/ML 엔지니어입니다. Gemini 등 최신 LLM API를 활용해 실용적인 AI 애플리케이션을 구축하며, 관련 연구 논문 경력도 보유하고 있습니다. IELTS 8.0의 영어 역량으로 글로벌 환경에서의 협업에 강점이 있습니다.",
    skillGroups: [
      { title: "AI / ML", items: ["AI Agent · RAG (검색 증강 생성)", "Gemini API · LLM 애플리케이션", "NLP · 컴퓨터 비전", "Elasticsearch"] },
      { title: "언어", items: ["영어 (IELTS 8.0)"] },
    ],
    experience: [
      {
        period: "재직",
        company: "Aniday",
        role: "AI/ML 엔지니어",
        summary: "RAG·AI Agent 기반 기능 개발 및 Gemini 등 LLM을 활용한 AI 애플리케이션 구현.",
      },
    ],
    achievements: ["AI/ML 분야 연구 논문 경력 보유"],
    resumeUrl: "https://drive.google.com/file/d/1G3UVFJgQhCTyyB9VLARCEyoFjQvHhDOW/view",
  },

  "hero-4": {
    id: "hero-4",
    titleLine: "풀스택 개발자 · 백엔드·프론트엔드",
    objective:
      "TypeScript, NestJS, React 생태계에 능숙한 풀스택 개발자입니다. 백엔드와 프론트엔드 모두에 강점을 가지고 있으며, 프로덕션 환경에서 복잡한 기능을 주도적으로 구현하고 애자일 환경에서 효과적으로 협업합니다. 핀테크·SaaS 도메인 경험과 마이크로서비스 아키텍처 역량을 보유하고 있습니다.",
    skillGroups: [
      { title: "백엔드", items: ["NestJS · Node.js", "PostgreSQL · Kafka", "마이크로서비스 아키텍처 · API 설계"] },
      { title: "프론트엔드", items: ["TypeScript · React", "Next.js 14", "React Native"] },
      { title: "언어", items: ["영어 (업무 가능)", "한국어 (초급)"] },
    ],
    experience: [
      {
        period: "2025.09 – 현재",
        company: "724 Software",
        role: "풀스택 / 프론트엔드 개발자",
        summary: "프로덕션 웹·모바일 서비스의 풀스택 기능 개발. TypeScript·NestJS·Next.js 기반 엔드투엔드 구현 및 React Native 앱 개발.",
      },
      {
        period: "2024.12 – 2025.07",
        company: "FPT Software",
        role: "백엔드 개발자 (.NET)",
        summary: "베트남 대표 IT 기업 FPT Software에서 백엔드 개발 담당, 실무 프로젝트 경험 축적.",
      },
    ],
    resumeUrl: "https://drive.google.com/file/d/1FASclI9U8_vwKEwR5BQEy3Q4r19do8lF/view",
  },

  "hero-5": {
    id: "hero-5",
    titleLine: "프론트엔드 엔지니어 · React · Vue",
    links: { website: "https://toan-vo.lovable.app" },
    projects: [
      {
        name: "Promer AI — Shopify 광고 크리에이티브 앱",
        domain: "AI · 이커머스 (Shopify)",
        period: "2024 – 2025",
        role: "프론트엔드 엔지니어 (FireGroup)",
        description: "Remix·Tailwind로 Shopify Admin 네이티브 UI 구현. SSE로 AI 에이전트 응답을 실시간 스트리밍.",
        tech: ["Remix", "Tailwind CSS", "Jotai", "SSE", "Shopify Polaris"],
        highlights: ["Shopify 앱스토어 4.6★ · 2,000+ 가맹점 사용"],
        liveUrl: "https://apps.shopify.com/promer-creative-studio",
      },
      {
        name: "Pettiny — 반려동물 이커머스",
        domain: "이커머스 · 플랫폼",
        period: "2023",
        role: "풀스택 개발자",
        description: "반려동물 용품 커머스와 펫샵·동물병원·수의사를 연결하는 서비스. 지도·실시간 기능 포함.",
        tech: ["Next.js", "TypeScript", "Firebase", "AWS", "Google Maps API"],
        liveUrl: "https://pettiny.netlify.app/",
      },
      {
        name: "Lofty — 부동산 SaaS 플랫폼",
        domain: "부동산 · B2B SaaS",
        period: "2025 – 현재",
        role: "프론트엔드 엔지니어 (Moatable)",
        description: "CRM·빌링·CMS를 아우르는 부동산 플랫폼. SSR 적용으로 Lighthouse SEO +25%, FCP 15% 개선.",
        tech: ["Vue 3", "Pinia", "SSR"],
        highlights: ["SEO 점수 +25% · 페이지 로드 15% 단축"],
      },
    ],
    objective:
      "React와 Vue 생태계에 능숙한 프론트엔드 엔지니어입니다. 다양한 웹 애플리케이션을 개발하며 컴포넌트 설계, 상태 관리, 사용자 경험 최적화에 강점을 쌓아왔습니다. 최신 프레임워크와 AI 연동 기능 개발 경험도 보유하고 있습니다.",
    skillGroups: [
      { title: "프론트엔드", items: ["React · Vue", "Remix", "Pinia · Jotai (상태 관리)"] },
      { title: "언어", items: ["영어 (TOEIC 775)"] },
    ],
    experience: [
      {
        period: "재직",
        company: "Moatable Inc.",
        role: "프론트엔드 개발자",
        summary: "React·Vue 기반 웹 프로덕트의 프론트엔드 개발 및 UI 구현, 사용자 경험 최적화.",
      },
    ],
    resumeUrl: "https://drive.google.com/file/d/1gV-G-pF1srpe5pkdxMYbDS3Aq5CERLnB/view",
  },

  "hero-6": {
    id: "hero-6",
    titleLine: "시니어 백엔드 개발자 · 핀테크·결제 시스템",
    links: { github: "https://github.com/nguy3n47", website: "https://2land.dev" },
    projects: [
      {
        name: "Walaa Claims2 — 보험 청구 심사 플랫폼",
        domain: "인슈어테크 · 중동",
        period: "2025 – 현재",
        role: "시니어 풀스택 엔지니어 (CoverGo)",
        description: "중동 대형 보험사향 TPA 청구 플랫폼. 청구당 100+ 항목을 처리하는 심사 엔진과 Temporal 기반 사전승인 워크플로우 구축.",
        tech: ["NestJS", "Vue 3", "PostgreSQL", "Temporal", "GraphQL", "AWS"],
        highlights: ["수작업 대사(reconciliation)를 자동 심사 엔진으로 대체", "데이터 웨어하우스 동기화 파이프라인 신규 설계"],
      },
      {
        name: "멀티클라우드 관리 플랫폼",
        domain: "클라우드 · SaaS",
        period: "2024 – 2025",
        role: "풀스택 엔지니어 (CloudVerse.AI)",
        description: "AWS/Azure/GCP 비용·컴플라이언스를 통합 가시화. OAuth2 SSO, CUR 자동 수집, 크로스클라우드 SKU 비교 기능 구현.",
        tech: ["NestJS", "Next.js", "GraphQL", "PostgreSQL", "RabbitMQ"],
      },
      {
        name: "NAB Builders — 인터넷뱅킹 미니앱 프레임워크",
        domain: "핀테크 · 뱅킹 (호주)",
        period: "2023",
        role: "풀스택 엔지니어 (NAB)",
        description: "호주 대형은행 NAB의 인터넷뱅킹 미니앱 프레임워크. BFF 패턴 구현 및 기술 명세 작성.",
        tech: ["Node.js", "Express", "React", "GraphQL", "AWS"],
      },
    ],
    objective:
      "Node.js·NestJS 백엔드 프레임워크와 PostgreSQL 데이터 모델링, AWS 인프라를 전문으로 하는 5년 이상 경력의 시니어 백엔드 개발자입니다. 핀테크·결제 시스템 개발에 능숙하며, 문제 해결 능력이 뛰어나고 주니어에서 시니어까지 꾸준한 경력 성장을 보여줍니다.",
    skillGroups: [
      { title: "백엔드", items: ["Node.js · NestJS", "PostgreSQL 데이터 모델링", "마이크로서비스"] },
      { title: "인프라 · 결제", items: ["AWS", "Stripe 결제 연동", "핀테크 시스템"] },
      { title: "언어", items: ["영어 (업무 가능)"] },
    ],
    experience: [
      {
        period: "2025.05 – 현재",
        company: "CoverGo",
        role: "시니어 풀스택 엔지니어",
        summary: "인슈어테크 플랫폼의 백엔드·풀스택 기능 개발.",
      },
      {
        period: "2024.01 – 2025.05",
        company: "CloudVerse.AI",
        role: "풀스택 엔지니어",
        summary: "클라우드 비용 관리 SaaS 제품의 풀스택 개발.",
      },
      {
        period: "2023.06 – 2023.12",
        company: "NAB Innovation Centre Vietnam",
        role: "풀스택 엔지니어",
        summary: "호주 대형 은행 NAB의 이노베이션 센터에서 금융 서비스 개발.",
      },
      {
        period: "2022.10 – 2023.05",
        company: "LASTMILE WORKS Co., Ltd",
        role: "주니어 백엔드 엔지니어",
        summary: "백엔드 API 및 서비스 개발.",
      },
      {
        period: "2021.01 – 2022.09",
        company: "Vinova Pte. Ltd",
        role: "백엔드 엔지니어",
        summary: "웹·모바일 백엔드 개발로 커리어 시작.",
      },
    ],
    resumeUrl: "https://drive.google.com/file/d/1TVmqqdBUba1lIQ4CiiyxSDAVwTNApPDS/view",
  },

  "hero-7": {
    id: "hero-7",
    titleLine: "그로스 마케터 · 퍼포먼스·프로덕트 마케팅",
    links: { website: "https://www.thaibaotran-growth.com/" },
    objective:
      "핀테크·AI 제품을 베트남과 글로벌 시장에서 스케일업한 2년+ 경력의 그로스 마케터입니다. MoMo, Mondelez 등 국내외 대표 기업에서 사용자 획득·전환·리텐션을 데이터 기반으로 개선해왔으며, 엔지니어와 직접 협업할 수 있는 기술 이해도와 강한 오너십이 강점입니다.",
    education: [
      { period: "2021 – 2024", school: "Western Sydney University", major: "경영학 (마케팅) · Top Student Award 장학생" },
    ],
    skillGroups: [
      { title: "그로스 · 마케팅", items: ["사용자 획득(UA) · 퍼포먼스 마케팅", "ROAS · SEO 최적화", "정성·정량 리서치 · A/B 테스트"] },
      { title: "데이터 · 툴", items: ["GA4 · Ad Networks (Google·Meta·Unity·AppLovin·Mintegral)", "MMP (Appsflyer·Adjust)", "Power BI · Looker · MSSQL · R"] },
      { title: "언어", items: ["영어 (IELTS Academic 7.5)"] },
    ],
    projects: [
      {
        name: "AI Intern · Thinking Desk 런칭",
        domain: "AI 하드웨어 · 이커머스 (US/EU)",
        period: "2025 – 현재",
        role: "Growth · Product Executive",
        description: "AI 제품 2종의 마켓 진입·런칭을 총괄. 7인 크로스펑셔널 팀 + 3개 AI 에이전트 운영.",
        tech: ["Google Ads", "Meta Ads", "GA4", "Growth Strategy"],
        highlights: ["2개월 만에 $300K 매출 · 15K DAU 달성", "월 $20K 예산으로 240만 트래픽 · ROAS 6.5X"],
      },
      {
        name: "MoMo 'Donate by Purchase' 플로우",
        domain: "핀테크 · QR 결제 (베트남)",
        period: "2024 – 2025",
        role: "Associate Growth Executive",
        description: "베트남 대표 핀테크 MoMo 앱의 기부-결제 연계 플로우를 설계·운영.",
        tech: ["A/B Testing", "Gamification", "Market Research"],
        highlights: ["170만 거래 상승 · 리텐션 +13% MoM", "가맹점 프로모션으로 MAU +12% · DAU +9%"],
      },
      {
        name: "Uplive 하이퍼캐주얼 게임 UA",
        domain: "모바일 게임 (US)",
        period: "2025",
        role: "User Acquisition Executive",
        description: "Amanotes 자회사 Uplive의 게임 3종 런칭 사용자 획득(UA) 전략 담당.",
        tech: ["TikTok Ads", "Google Ads", "MMP (Appsflyer)"],
        highlights: ["월 $50K 집행 · D14 ROAS 120% 유지"],
      },
    ],
    experience: [
      {
        period: "2025.11 – 현재",
        company: "Autonomous",
        role: "Growth · Product Executive",
        summary: "AI 하드웨어·이커머스(US/CA/EU/GB 시장). AI Intern·Thinking Desk 제품 런칭 주도.",
        tasks: [
          "7인 크로스펑셔널 팀 + 3개 AI 에이전트 총괄 — 2개월 만에 $300K 매출, 15K DAU 달성",
          "월 $20K 유료 채널 예산 운영 (Google·Meta) — 240만 트래픽, ROAS 6.5X",
          "Supermemory·Gbrain·Venice·Nous Research 등과 전략적 파트너십 구축",
        ],
      },
      {
        period: "2025.07 – 2025.10",
        company: "Uplive (Amanotes 자회사)",
        role: "User Acquisition Executive",
        summary: "하이퍼캐주얼 모바일 게임 (US 시장).",
        tasks: [
          "3개 게임 런칭 UA 전략 담당, 월 $50K 집행 — D14 ROAS 120% 유지",
          "Google·TikTok 담당자와 협업해 US 시장 현지화·마케팅 최적화",
        ],
      },
      {
        period: "2024.07 – 2025.07",
        company: "MoMo",
        role: "Associate Growth Executive",
        summary: "핀테크 · 오프라인(QR) 결제 (베트남 시장).",
        tasks: [
          "MoMo 앱 'Donate by Purchase' 플로우 설계 — 170만 거래 상승, 리텐션 +13% MoM",
          "가맹점·오프라인 유저 게이미피케이션/프로모션 (월 $20K) — MAU +12%, DAU +9%",
          "인앱·광고 채널 마켓 리서치 및 A/B 테스트 운영",
        ],
      },
      {
        period: "2023.05 – 2023.11",
        company: "Mondelez Kinh Do",
        role: "Business Intelligence Intern",
        summary: "FMCG · 세일즈 인텔리전스 (베트남 시장). 판매 대시보드·애드혹 분석 구축.",
      },
    ],
    certifications: [
      "Professional Scrum Product Owner (Scrum.org)",
      "Generative AI for Data Analysts Specialization (IBM)",
      "IBM Data Analytics with Excel and R Professional Certificate",
    ],
    achievements: [
      "MoMo Talent 2025 — Top 5/30 (Applied AI 워크스트림)",
      "Marketing on Air 2022 — Top 6/700+ 팀",
    ],
    resumeUrl: "https://mpzwzihqtbewqudpggam.supabase.co/storage/v1/object/public/ktc-cvs/1782462737036-ktb4ke4dll.pdf",
  },

  "hero-8": {
    id: "hero-8",
    titleLine: "프로덕트 디자이너 · UX/UI · 프론트엔드 이해도",
    links: { website: "https://tyler-builder.digital/" },
    projects: [
      {
        name: "2Nong — 농업 AI 에코시스템",
        domain: "애그테크 · AI",
        period: "2023 – 2026",
        role: "프로덕트 디자이너 (ADVN GLOBAL)",
        description: "웹·모바일 통합 리디자인. 작물 진단·전문가 지식·커머스를 하나의 AI 기반 여정으로 통합.",
        tech: ["Figma", "Product Design", "AI UX"],
        highlights: ["10만+ 활성 사용자 도달", "작물 진단 시간을 며칠→초 단위로 단축"],
      },
      {
        name: "Track-asia — 실시간 물류 관제",
        domain: "물류 · 지도 솔루션",
        role: "UX 전략 · 프로덕트 디자이너",
        description: "물류 운영자용 실시간 트래킹 시스템의 정보 구조·대시보드 설계, 복잡한 데이터 시각화 담당.",
        tech: ["Figma", "Information Architecture", "Data Viz"],
      },
      {
        name: "SIH Hospital — 헬스케어 예약 플랫폼",
        domain: "헬스케어",
        role: "프로덕트 디자이너",
        description: "예약 플로우 리디자인으로 다단계 마찰 감소. 프로덕션 레디 마크업 제공으로 개발 효율 개선.",
        tech: ["Figma", "UX Flow", "HTML/CSS"],
        highlights: ["시스템 성능 30% 개선"],
      },
      {
        name: "Crafto — HTML5 템플릿 (200+ 컴포넌트)",
        domain: "프론트엔드 · 디자인 시스템",
        role: "프로덕트 디자이너 · 마크업 엔지니어",
        description: "Atomic Design 기반 200+ 재사용 컴포넌트. SEO 최적화·크로스브라우저 대응 시맨틱 마크업.",
        tech: ["HTML", "CSS", "JavaScript", "Atomic Design"],
        liveUrl: "https://craftohtml.themezaa.com/",
      },
    ],
    objective:
      "5년 이상의 UX/UI 디자인 및 전환 최적화 경험을 보유한 프로덕트 디자이너입니다. 디자인과 프론트엔드 개발을 연결하는 역량이 뛰어나며, 전자상거래·헬스케어·물류 등 다양한 산업에서 엔드투엔드 디자인 전략을 주도해 왔습니다.",
    skillGroups: [
      { title: "디자인", items: ["Figma", "프로덕트 디자인 · UX/UI", "전환 최적화(CRO)"] },
      { title: "프론트엔드", items: ["HTML · CSS · JavaScript", "React · Next.js (디자인-개발 연결)"] },
    ],
    experience: [
      {
        period: "2023 – 2026",
        company: "ADVN GLOBAL",
        role: "프로덕트 디자이너",
        summary: "제품 UX/UI 디자인 및 전환 최적화, 크로스펑셔널 협업.",
      },
      {
        period: "2020 – 2023",
        company: "GIANTY",
        role: "UI/UX 디자이너",
        summary: "웹·모바일 서비스 UI/UX 디자인.",
      },
      {
        period: "2017 – 2020",
        company: "Envato Market",
        role: "프로덕트 디자이너 · 마크업 엔지니어",
        summary: "글로벌 디지털 마켓플레이스 제품 디자인 및 마크업 구현.",
      },
    ],
    resumeUrl: "https://drive.google.com/file/d/1ohkC8b29V5LpJA4yRxxmqO1A3o_E8Eno/view",
  },

  "hero-9": {
    id: "hero-9",
    titleLine: "시니어 백엔드 소프트웨어 엔지니어 · 백엔드 팀 리드",
    objective:
      "10년 이상의 경력을 가진 백엔드 소프트웨어 엔지니어입니다. 다양한 팀의 백엔드 개발 및 기술 검토 위원회를 이끌며, 모바일 및 백엔드 애플리케이션 개발에 주력하고 있습니다. 삼성 R&D를 비롯한 이력을 바탕으로, 최신 기술을 활용해 효율적이고 안정적인 시스템을 구축하는 데 강점이 있습니다.",
    education: [
      { period: "2008 – 2012", school: "Posts and Telecommunications Institute of Technology (PTIT)", major: "정보통신" },
    ],
    skillGroups: [
      { title: "백엔드 · 언어", items: ["Golang · Python · Java", "C/C++", "시스템 아키텍처 설계"] },
      { title: "AI", items: ["Machine Learning", "LLM"] },
      { title: "리더십", items: ["백엔드 팀 리드", "기술 검토 위원회 운영", "팀원 교육 · 멘토링"] },
    ],
    projects: [
      {
        name: "Samsung SPen SDK 라이브러리",
        domain: "모바일 SDK · 삼성",
        period: "2016 – 2018",
        role: "모바일 개발자",
        description: "삼성 R&D 센터에서 다양한 애플리케이션용 SPen SDK 라이브러리를 개발·유지보수. SDK 기능 설계 및 기술 문서 작성.",
        tech: ["Java", "Android", "SDK 설계"],
      },
      {
        name: "ViettelPost 물류 애플리케이션",
        domain: "물류 · 이커머스",
        period: "2018 – 2021",
        role: "모바일·백엔드 팀 리더",
        description: "ViettelPost 앱의 모바일·백엔드 개발을 이끌며 기능 설계·구현과 팀 멘토링, 일정 관리를 담당.",
        tech: ["Golang", "Java", "System Architecture"],
        highlights: ["모바일·백엔드 두 팀 리드로 엔드투엔드 개발 총괄"],
      },
    ],
    experience: [
      {
        period: "2021.05 – 현재",
        company: "Teko VietNam",
        project: "백엔드 개발 및 기술 검토",
        customer: "내부 팀",
        role: "백엔드 팀 리드",
        summary: "다양한 팀의 백엔드 개발 및 기술 검토 위원회를 이끌고 있습니다.",
        tasks: [
          "팀원들과의 협업 및 기술 검토 진행",
          "백엔드 시스템 아키텍처 설계",
          "코드 품질 관리 및 개선",
        ],
      },
      {
        period: "2018.04 – 2021",
        company: "ViettelPost – VtpTek",
        project: "ViettelPost 애플리케이션 개발",
        customer: "ViettelPost",
        role: "모바일 개발 팀 리더 / 백엔드 팀 리더",
        summary: "ViettelPost 애플리케이션의 모바일 및 백엔드 개발을 이끌었습니다.",
        tasks: [
          "애플리케이션 기능 설계 및 구현",
          "팀원 교육 및 멘토링",
          "프로젝트 일정 관리",
        ],
      },
      {
        period: "2016.01 – 2018.04",
        company: "Samsung VietNam R&D Mobile Center",
        project: "SPen SDK 라이브러리 개발",
        customer: "삼성 (Samsung)",
        role: "모바일 개발자",
        summary: "다양한 애플리케이션을 위한 SPen SDK 라이브러리를 개발하고 유지보수했습니다.",
        tasks: [
          "SDK 기능 설계 및 구현",
          "기술 문서 작성",
          "버그 수정 및 성능 개선",
        ],
      },
    ],
  },

  "hero-10": {
    id: "hero-10",
    titleLine: "시니어 프로덕트 디자이너 · 모바일 퍼스트 UX/UI",
    objective:
      "모바일 퍼스트 디지털 제품, 온보딩, 인게이지먼트 플로우, 복잡한 서비스의 명확한 인터페이스를 설계해 온 15년+ 경력의 프로덕트 UI/UX 디자이너입니다. Prudential·Sacombank 등 금융권과 Gameloft를 거치며, 감정적·행동적·데이터 기반 인사이트를 신뢰감 있고 단순하게 전달하는 데 강점을 쌓았습니다. AI 헬스케어 제품에 특히 적합합니다.",
    education: [
      { period: "2001 – 2005", school: "Hoa Sen University", major: "디자인·멀티미디어 (커뮤니케이션 디자인) 학사" },
    ],
    skillGroups: [
      { title: "디자인 툴", items: ["Figma · Adobe XD", "Photoshop · Illustrator · After Effects", "Sketch · 프레젠테이션 자산 제작"] },
      { title: "전문 분야", items: ["모바일 퍼스트 UX/UI", "디자인 시스템 · 프로토타이핑", "사용자 연구 · 사용성 테스트", "AI·헬스케어 제품 경험"] },
      { title: "기술 이해", items: ["CSS · HTML · JavaScript", "반응형 · 디자인-개발 핸드오프", "애자일 · Jira"] },
      { title: "언어", items: ["영어 (유창)", "베트남어 (원어민)"] },
    ],
    projects: [
      {
        name: "Sacombank — 웹·앱 프로덕트 디자인",
        domain: "핀테크 · 뱅킹",
        role: "시니어 프로덕트 디자이너",
        description: "모바일 퍼스트 제품 디자인, 디자인 시스템, 온보딩·서비스 플로우 설계.",
        tech: ["Figma", "Design System", "Mobile-first"],
        liveUrl: "https://www.figma.com/design/RbxOSHy84nMzCKU5o7CLTB/Sacombank-Design-Direction---private?node-id=1307-3370&t=2FCqcArhQglGicvf-4",
        liveLabel: "Figma",
      },
      {
        name: "HDBank — 모바일 앱",
        domain: "핀테크 · 뱅킹",
        role: "프로덕트 디자이너",
        description: "모바일 앱 UX, 금융 가이던스 플로우, 사용자 명확성과 태스크 완료율 개선.",
        tech: ["Figma", "Mobile UX", "Prototyping"],
        liveUrl: "https://www.figma.com/proto/6c79HQU7BMNJiDNB7KqVNA?node-id=0-1&t=ibNOW04ku8qBZo3N-6",
        liveLabel: "Figma",
      },
      {
        name: "Propzy Mortgage — 모기지 서비스",
        domain: "프롭테크 · 핀테크",
        role: "프로덕트 디자이너",
        description: "복잡한 서비스 UX, 폼, 추천형 플로우와 사용자 의사결정 지원 설계.",
        tech: ["Figma", "Service UX", "Form Design"],
        liveUrl: "https://www.figma.com/design/tFr8f3NxSw4UbuW4C7tPnd/Mortgage-Improvement--Y-?node-id=416-20016&t=THUh8yxVXjEWYXjB-4",
        liveLabel: "Figma",
      },
      {
        name: "EVN App — 공공 서비스 앱",
        domain: "공공 서비스 · 유틸리티",
        role: "프로덕트 디자이너",
        description: "사용자 중심 리디자인, 사용성 테스트, 더 명확한 서비스 여정 설계.",
        tech: ["Figma", "Usability Testing", "UX Research"],
        liveUrl: "https://www.figma.com/design/lWJflNkyUKWSvsEkEyH0Mg/PTI-2-VNPOST-(Copy)?node-id=0-1&t=6czU6mrEBZr9GktR-1",
        liveLabel: "Figma",
      },
      {
        name: "Third Place — 마켓플레이스",
        domain: "마켓플레이스 · 커머스",
        role: "프로덕트 디자이너",
        description: "마켓플레이스 UX, 인게이지먼트 플로우, 상품 탐색 경험 설계.",
        tech: ["Figma", "Marketplace UX", "Product Discovery"],
        liveUrl: "https://www.figma.com/design/DH3wYYvun3dm4fXI1Wh73Q/Third-Place---(Backup30nov)?node-id=37-8778&t=tsZj3I5P4vBfh7R6-4",
        liveLabel: "Figma",
      },
      {
        name: "Outdoors — 마켓플레이스",
        domain: "마켓플레이스 · 리테일",
        role: "프로덕트 디자이너",
        description: "사용자 리서치, 여정 매핑, 반응형 제품 경험 설계.",
        tech: ["Figma", "User Research", "Journey Mapping"],
        liveUrl: "https://www.figma.com/design/tgm79yu5Ei2MpYeGvsenpg/UOUTDOORS-private?node-id=1-2&t=hPALXmCWa6KDijrJ-4",
        liveLabel: "Figma",
      },
      {
        name: "WWE Champions — 모바일 게임",
        domain: "게임 · 엔터테인먼트",
        role: "UI · 인터랙션 디자이너",
        description: "모바일 게임 UI, 감성적 인게이지먼트, 비주얼 인터랙션 디자인.",
        tech: ["Figma", "Game UI", "Interaction Design"],
        liveUrl: "https://www.figma.com/design/bCfOpe9erYbwJHPFtZQ4zP/WWE-V2-(edit---y-console)-(rep)?node-id=25710-133&t=DpCqEQzj6OED19jK-4",
        liveLabel: "Figma",
      },
      {
        name: "기타 디자인 & 레이아웃",
        domain: "마케팅 · 비주얼",
        role: "디자이너",
        description: "마케팅 비주얼, 랜딩 페이지, 캠페인 자산, 제품 커뮤니케이션 자료.",
        tech: ["Graphic Design", "Landing Page", "Campaign"],
        liveUrl: "https://www.flickr.com/photos/56033193@N08/",
        liveLabel: "Flickr",
      },
    ],
    experience: [
      {
        period: "2022.09 – 현재",
        company: "GEAR INC",
        role: "프로덕트 디자이너 · AI 구현 스페셜리스트",
        summary: "AI 도구·분석·사용자 피드백을 활용해 모바일·웹 제품의 플로우를 개선하고 마찰을 줄이며, 재사용 가능한 디자인 시스템과 온보딩 경험을 구축.",
      },
      {
        period: "2020.11 – 2022.08",
        company: "Sacombank",
        role: "시니어 프로덕트 디자이너",
        summary: "신뢰·명확성·개인정보 보호가 핵심인 모바일·웹 뱅킹 경험 설계. 옴니채널 경험 디자인에서 IBM·에이전시·엔지니어와 협업.",
      },
      {
        period: "2016.09 – 2020.10",
        company: "Prudential Finance",
        role: "시니어 프로덕트 디자이너",
        summary: "보험·헬스 베네핏 인터페이스 설계 — 세심한 문구, 신뢰, 명확한 정보 위계, 민감 데이터 처리. UX/UI 로드맵 기획.",
      },
      {
        period: "2013.07 – 2016.08",
        company: "Ringer Vietnam",
        role: "UI · 그래픽 디자이너",
        summary: "디지털 제품의 UI 비주얼, 웹사이트, 랜딩페이지, 캠페인 자산 제작 및 멀티플랫폼 디자인.",
      },
      {
        period: "2009.06 – 2013.06",
        company: "Gameloft Vietnam",
        role: "사운드 · UI 디자이너",
        summary: "다양한 모바일 기기에 최적화된 감성적인 게임 인터페이스 디자인 및 크로스플랫폼 적응.",
      },
    ],
    certifications: [
      "Google UX Design Certificate (Coursera)",
      "AWS Certified Cloud Practitioner",
      "The Complete Web Development Bootcamp (Udemy)",
    ],
    resumeUrl: "https://twpxsbnkypocjfnerfmd.supabase.co/storage/v1/object/public/resumes/09273709-87da-49be-9404-2c61f50b4a36/1782550641938_CV_-_Dangvany_-_Product_UIUX_Designer_-_Shupia.pdf",
  },
};
