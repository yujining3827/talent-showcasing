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

export type TalentDetail = {
  id: string;
  titleLine?: string; // 직무 요약 라인
  basic?: { label: string; value: string; href?: string }[];
  objective?: string;
  education?: { period: string; school: string; major: string }[];
  skillGroups?: { title: string; items: string[] }[];
  experience?: ExperienceItem[];
  certifications?: string[];
  achievements?: string[];
  resumeUrl?: string; // 실제 이력서 원본(구글 드라이브 등) 링크
};

export const TALENT_DETAILS: Record<string, TalentDetail> = {
  "hero-1": {
    id: "hero-1",
    titleLine: "시니어 QA 엔지니어 · 품질 관리 스페셜리스트",
    // 개인정보(생년월일·성별·연락처·이메일)는 노출하지 않음 — 거주지는 별도 표시, 여기선 GitHub만
    basic: [
      { label: "GitHub", value: "github.com/trnmhung", href: "https://github.com/trnmhung" },
    ],
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
};
