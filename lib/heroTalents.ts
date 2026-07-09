// 히어로 하드코딩 인재 (랜딩 히어로 + 상세 페이지 공유)
// ⚠️ 여기 수정하면 히어로 카드/상세 페이지에 함께 반영됩니다.

export type HeroTalent = {
  id: string;
  name: string;
  role: string;
  headline: string | null;
  photo_url: string | null;
  school: string | null;
  schoolElite: boolean;
  schoolTier: string | null;
  company: string | null;
  companyElite: boolean;
  companyDomain: string | null;
  yoeYears: number | null;
  location: string | null;
  skills: string[];
  // 어학/소통 능력 (예: "영어 업무 가능 · 한국어 초급", "TOEIC 850"). 데이터 없으면 "조사 중" 노출
  language?: string | null;
};

export const HERO_TALENTS: HeroTalent[] = [
  {
    id: "hero-1",
    name: "Trần Minh Hưng",
    role: "QA Engineer",
    headline: "삼성 출신 시니어 QA 엔지니어",
    photo_url: "/hero3.png",
    school: "Ho Chi Minh University of Technology",
    schoolElite: true,
    schoolTier: "top",
    company: "Samsung",
    companyElite: true,
    companyDomain: "samsung.com",
    yoeYears: 5,
    location: "베트남 호치민",
    skills: ["Manual Testing", "API Testing", "Test Case Design", "Agile/Scrum"],
    language: "IELTS 7.0 · TOEIC 825",
  },
  {
    id: "hero-2",
    name: "Vo Huynh Yen Nhi",
    role: "Embedded Software Developer",
    headline: "FPT Software 출신 임베디드 개발자",
    photo_url: "/hero2.png",
    school: "Ho Chi Minh City University of Technology and Education",
    schoolElite: false,
    schoolTier: null,
    company: "FPT Software",
    companyElite: true,
    companyDomain: "fpt-software.com",
    yoeYears: 5,
    location: "Nha Trang",
    skills: ["C++", "C#", "Swift", "Arduino"],
    language: "IELTS 7.0 · TOPIK Level 1",
  },
  {
    id: "hero-3",
    name: "Cao Thanh Hung",
    role: "UX/UI Designer",
    headline: "VNG 출신 시니어 UX/UI 디자이너",
    photo_url: "/hero4.png",
    school: "Can Tho University",
    schoolElite: false,
    schoolTier: null,
    company: "VNG",
    companyElite: true,
    companyDomain: "vng.com.vn",
    yoeYears: 8,
    location: "Ho Chi Minh City",
    skills: ["User Research", "Design Systems", "Team Leadership"],
  },
  {
    id: "hero-4",
    name: "Phạm Gia Tuấn Khải",
    role: "AI/ML Engineer",
    headline: "컴퓨터 비전·NLP 전문 AI 엔지니어",
    photo_url: "/HERO%20PROFILE.png",
    school: "University of Science, VNU-HCM",
    schoolElite: true,
    schoolTier: "top",
    company: "Aniday",
    companyElite: false,
    companyDomain: null,
    yoeYears: 1,
    location: "Ho Chi Minh City",
    skills: ["Computer Vision", "NLP", "RAG", "Gemini API", "Elasticsearch"],
    language: "IELTS 8.0",
  },
  {
    id: "hero-5",
    name: "Tong Tat Thanh",
    role: "Full-stack Developer",
    headline: "헬스케어·핀테크 백엔드 엔지니어",
    photo_url: "/HERO%20PROFILE.png",
    school: "University of Science, VNU-HCM",
    schoolElite: true,
    schoolTier: "top",
    company: "Fullerton Health Vietnam",
    companyElite: false,
    companyDomain: null,
    yoeYears: 4,
    location: "Ho Chi Minh City",
    skills: ["Node.js", "NestJS", "MySQL", "Redis", "Microservices"],
  },
  {
    id: "hero-6",
    name: "Võ Minh Toàn",
    role: "Front End Developer",
    headline: "React·Vue 프론트엔드 엔지니어",
    photo_url: "/hero3.png",
    school: "Ho Chi Minh University of Technology",
    schoolElite: true,
    schoolTier: "top",
    company: "Moatable Inc.",
    companyElite: false,
    companyDomain: null,
    yoeYears: 3,
    location: "Ho Chi Minh City",
    skills: ["React", "Vue", "Remix", "Pinia/Jotai"],
    language: "TOEIC 775",
  },
  {
    id: "hero-7",
    name: "Victor Hoang",
    role: "Full-Stack Engineer",
    headline: "한국 기업 프로젝트 경험 보유 풀스택 엔지니어",
    photo_url: "/HERO%20PROFILE.png",
    school: "University of Engineering and Technology (VNU), Hanoi",
    schoolElite: true,
    schoolTier: "top",
    company: "SotaTek",
    companyElite: true,
    companyDomain: null,
    yoeYears: 3,
    location: "Hanoi",
    skills: ["Next.js", "TypeScript", "PostgreSQL", "Prisma"],
  },
];
