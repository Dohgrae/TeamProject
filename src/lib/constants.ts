// 프로토타입 단계 하드코딩 옵션 상수.
// region/company_size/job_category/employment_type 코드값은 johyejune이 만든
// src/data(jobs.json)의 filter_region/filter_company_size/filter_job_major와
// ekgus020330-lgtm의 src/filterlogic 칩 코드에 맞춘 실제 코드다. 절대 임의로 바꾸지 말 것.

export const REGION_OPTIONS = [
  { value: "1", label: "서울" },
  { value: "2", label: "경기·인천" },
  { value: "3", label: "부산·경남" },
  { value: "4", label: "대구·경북" },
  { value: "5", label: "대전·충청" },
  { value: "6", label: "광주·전라" },
  { value: "7", label: "강원" },
  { value: "8", label: "제주" },
  { value: "9", label: "재택·전국" },
];

export const JOB_CATEGORY_OPTIONS = [
  { value: "M1", label: "기획·PM" },
  { value: "M2", label: "영업·BD" },
  { value: "M3", label: "마케팅" },
  { value: "M4", label: "개발·AI" },
  { value: "M5", label: "디자인" },
  { value: "M6", label: "재무·회계" },
  { value: "M7", label: "연구·생산" },
];

export const COMPANY_SIZE_OPTIONS = [
  { value: "A", label: "대기업" },
  { value: "B", label: "중견기업" },
  { value: "C", label: "중소기업" },
  { value: "D", label: "스타트업" },
  { value: "E", label: "공공/교육" },
];

export const WORK_EMPLOYMENT_TYPE_OPTIONS = ["정규직", "계약직", "인턴", "프리랜서"] as const;

// 채용공고의 employment_type 필드는 코드 없이 이 문자열 그대로 저장돼 있어 값=라벨로 둔다.
export const EMPLOYMENT_TYPE_OPTIONS = WORK_EMPLOYMENT_TYPE_OPTIONS.map((v) => ({ value: v, label: v }));

// H1~H5는 filterlogic/jobs.json의 학력 서열(EDU_LEVEL_RANK)과 동일한 코드.
export const EDUCATION_LEVEL_OPTIONS = [
  { value: "H1", label: "고졸" },
  { value: "H2", label: "전문학사" },
  { value: "H3", label: "학사" },
  { value: "H4", label: "석사" },
  { value: "H5", label: "박사" },
];

export const MAJOR_CATEGORY_OPTIONS = [
  { value: "CS_ENGINEERING", label: "컴퓨터·공학" },
  { value: "NATURAL_SCIENCE", label: "자연과학" },
  { value: "BUSINESS", label: "경영·경제" },
  { value: "HUMANITIES", label: "인문·어학" },
  { value: "ARTS", label: "예체능" },
  { value: "ETC", label: "기타" },
];

export const LANGUAGE_TEST_OPTIONS = [
  "TOEIC",
  "TOEFL",
  "OPIc",
  "TEPS",
  "JLPT",
  "HSK",
  "기타",
];

export const TECH_STACK_CATEGORIES: { key: string; label: string; options: string[] }[] = [
  {
    key: "언어",
    label: "언어",
    options: ["Java", "Python", "JavaScript", "TypeScript", "C++", "C#", "Go", "Kotlin"],
  },
  {
    key: "프레임워크_라이브러리",
    label: "프레임워크·라이브러리",
    options: ["Spring", "React", "Next.js", "Django", "Flask", "Node.js", "Vue"],
  },
  {
    key: "데이터베이스",
    label: "데이터베이스",
    options: ["MySQL", "PostgreSQL", "MongoDB", "Redis", "Oracle"],
  },
  {
    key: "클라우드_인프라",
    label: "클라우드·인프라",
    options: ["AWS", "GCP", "Azure", "Docker", "Kubernetes", "Terraform"],
  },
  {
    key: "AI_데이터",
    label: "AI·데이터",
    options: ["PyTorch", "TensorFlow", "Pandas", "scikit-learn"],
  },
  {
    key: "협업툴_형상관리",
    label: "협업툴·형상관리",
    options: ["Git", "GitHub", "Jira", "Notion", "Figma"],
  },
];

export const EXTRACURRICULAR_TYPE_OPTIONS = [
  "프로젝트",
  "동아리_학생회",
  "대외활동",
  "해외경험",
  "교육수강경험",
] as const;

export const EXTRACURRICULAR_TYPE_LABELS: Record<string, string> = {
  프로젝트: "프로젝트",
  동아리_학생회: "동아리·학생회",
  대외활동: "대외활동",
  해외경험: "해외경험",
  교육수강경험: "교육 수강경험",
};

export interface PersonalityOption {
  option: 1 | 2;
  statement: string;
  tags: string[];
}

export interface PersonalityQuestion {
  question_id: number;
  question: string;
  options: PersonalityOption[];
}

export const PERSONALITY_QUESTIONS: PersonalityQuestion[] = [
  {
    question_id: 1,
    question: "나는 어떤 업무 환경에서 더 힘이 나는가?",
    options: [
      { option: 1, statement: "내 페이스대로 혼자 몰입", tags: ["독립", "몰입", "자기주도"] },
      { option: 2, statement: "사람들과 자주 논의하며 맞춰감", tags: ["소통", "협업", "존중", "함께성장"] },
    ],
  },
  {
    question_id: 2,
    question: "일을 진행하는 나의 방식은?",
    options: [
      { option: 1, statement: "빠르게 실행하고 고쳐나감", tags: ["속도", "실행력", "Runner", "실험"] },
      { option: 2, statement: "다듬어 완성도를 높인 뒤 내놓음", tags: ["완성도", "코드품질", "구조", "유지보수", "확장성"] },
    ],
  },
  {
    question_id: 3,
    question: "나는 어느 쪽에서 더 보람을 느끼는가?",
    options: [
      { option: 1, statement: "풀 문제가 뭔지 정의하는 것", tags: ["문제정의", "문제발굴", "본질탐구", "전략적사고"] },
      { option: 2, statement: "정해진 목표를 끝까지 완수", tags: ["완수", "책임감", "끝까지", "오너십"] },
    ],
  },
  {
    question_id: 4,
    question: "새로운 방식·도구를 마주하면 나는?",
    options: [
      { option: 1, statement: "겁 없이 먼저 시도", tags: ["탐험", "새기술", "학습력", "두려움없음", "실험"] },
      { option: 2, statement: "검증된 방식을 선호", tags: ["검증", "실용주의", "안정", "신중"] },
    ],
  },
  {
    question_id: 5,
    question: "나는 어떻게 일할 때 편한가?",
    options: [
      { option: 1, statement: "시키기 전에 스스로 벌임", tags: ["주도적", "오너십", "먼저움직임", "GameChanger", "변화주도"] },
      { option: 2, statement: "명확한 방향이 주어졌을 때 잘함", tags: ["방향지향", "실행", "안정"] },
    ],
  },
  {
    question_id: 6,
    question: "나는 어디에 더 강한가?",
    options: [
      { option: 1, statement: "전체 구조·큰 그림", tags: ["전략적사고", "시스템사고", "구조설계", "확장성"] },
      { option: 2, statement: "디테일을 챙겨 굴러가게 함", tags: ["실무", "실용주의", "실제구현", "완성도"] },
    ],
  },
  {
    question_id: 7,
    question: "일에서 나를 움직이는 건?",
    options: [
      { option: 1, statement: "변화를 만들고 큰 영향을 줌", tags: ["임팩트", "변화주도", "GameChanger"] },
      { option: 2, statement: "맡은 걸 안정적으로 지켜냄", tags: ["책임감", "신뢰", "오너십", "끝까지"] },
    ],
  },
  {
    question_id: 8,
    question: "AI 같은 새 도구를 대하는 태도는?",
    options: [
      { option: 1, statement: "동료처럼 적극 활용", tags: ["AI활용", "자동화", "도구활용", "파트너십"] },
      { option: 2, statement: "결과를 검증하며 신중히 씀", tags: ["검증", "신중", "책임감", "품질"] },
    ],
  },
];

export const TAG_WEIGHT_BY_RESPONSE: Record<string, number> = {
  그렇다: 1.0,
  모르겠다: 0.3,
  아니다: 0,
};

export const WIZARD_STEPS = [
  { path: "/steps/basic-info", label: "기본 인적사항" },
  { path: "/steps/career", label: "경력 및 경험" },
  { path: "/steps/awards", label: "수상·공모전" },
  { path: "/steps/personality", label: "성향 질문" },
  { path: "/steps/review", label: "완료" },
] as const;
