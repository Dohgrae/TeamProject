// 뽑아듀오 — 옵션/질문 상수
// 값(코드)은 johyejune의 jobs.json(filter_region/filter_job_major/filter_company_size)과
// ekgus020330-lgtm의 필터 화면 코드에 맞춘 실제 코드다. 임의로 바꾸지 말 것.

const REGION_OPTIONS = [
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

const JOB_CATEGORY_OPTIONS = [
  { value: "M1", label: "기획·PM" },
  { value: "M2", label: "영업·BD" },
  { value: "M3", label: "마케팅" },
  { value: "M4", label: "개발·AI" },
  { value: "M5", label: "디자인" },
  { value: "M6", label: "재무·회계" },
  { value: "M7", label: "연구·생산" },
];

// 직무(M1~M7) 선택 시 나타나는 세부직무. jobs.json에는 세부직무 코드가 따로 없어서,
// "전체"가 아닌 값을 고르면 job_title에 keywords 중 하나가 포함되는 공고만 남기는
// 소프트 필터로 동작한다 (1차 필터링을 보완하는 추가 조건).
const JOB_SUBCATEGORY_OPTIONS = {
  M1: [
    { value: "전체", keywords: [] },
    { value: "서비스기획", keywords: ["서비스기획", "기획자"] },
    { value: "PM/PO", keywords: ["PM", "PO", "프로덕트 매니저", "프로덕트매니저"] },
    { value: "사업기획", keywords: ["사업기획", "경영기획"] },
  ],
  M2: [
    { value: "전체", keywords: [] },
    { value: "국내영업", keywords: ["국내영업", "영업"] },
    { value: "해외영업", keywords: ["해외영업", "글로벌영업"] },
    { value: "BD/파트너십", keywords: ["BD", "파트너십", "사업개발"] },
  ],
  M3: [
    { value: "전체", keywords: [] },
    { value: "콘텐츠마케팅", keywords: ["콘텐츠", "콘텐츠마케팅"] },
    { value: "퍼포먼스마케팅", keywords: ["퍼포먼스", "그로스"] },
    { value: "브랜드마케팅", keywords: ["브랜드"] },
  ],
  M4: [
    { value: "전체", keywords: [] },
    { value: "백엔드", keywords: ["백엔드", "서버 개발", "Backend"] },
    { value: "프론트엔드", keywords: ["프론트엔드", "웹퍼블리셔", "Frontend"] },
    { value: "풀스택", keywords: ["풀스택", "Full-Stack", "Full Stack"] },
    { value: "AI/ML", keywords: ["AI", "머신러닝", "딥러닝", "인공지능"] },
    { value: "데이터", keywords: ["데이터 엔지니어", "데이터분석", "빅데이터"] },
    { value: "모바일", keywords: ["모바일", "안드로이드", "iOS", "앱 개발"] },
    { value: "DevOps/인프라", keywords: ["DevOps", "인프라", "클라우드", "SRE"] },
    { value: "QA", keywords: ["QA", "품질", "테스트"] },
  ],
  M5: [
    { value: "전체", keywords: [] },
    { value: "UX/UI디자인", keywords: ["UX", "UI"] },
    { value: "그래픽디자인", keywords: ["그래픽디자인", "그래픽"] },
    { value: "프로덕트디자인", keywords: ["프로덕트디자인", "제품디자인"] },
  ],
  M6: [
    { value: "전체", keywords: [] },
    { value: "회계", keywords: ["회계"] },
    { value: "재무", keywords: ["재무"] },
    { value: "세무", keywords: ["세무"] },
  ],
  M7: [
    { value: "전체", keywords: [] },
    { value: "R&D", keywords: ["R&D", "연구개발", "연구원"] },
    { value: "생산관리", keywords: ["생산관리", "생산"] },
    { value: "품질관리", keywords: ["품질관리", "품질"] },
  ],
};

const COMPANY_SIZE_OPTIONS = [
  { value: "A", label: "대기업" },
  { value: "B", label: "중견기업" },
  { value: "C", label: "중소기업" },
  { value: "D", label: "스타트업" },
  { value: "E", label: "공공/교육" },
];

const WORK_EMPLOYMENT_TYPE_OPTIONS = ["정규직", "계약직", "인턴", "프리랜서"];
const EMPLOYMENT_TYPE_OPTIONS = WORK_EMPLOYMENT_TYPE_OPTIONS.map((v) => ({ value: v, label: v }));

// filterlogic/jobs.json의 학력 서열과 동일한 코드 (H1=가장 낮음 ~ H5=가장 높음)
const EDUCATION_LEVEL_OPTIONS = [
  { value: "H1", label: "고졸" },
  { value: "H2", label: "전문학사" },
  { value: "H3", label: "학사" },
  { value: "H4", label: "석사" },
  { value: "H5", label: "박사" },
];
const EDU_LEVEL_RANK = { H1: 1, H2: 2, H3: 3, H4: 4, H5: 5 };

const MAJOR_CATEGORY_OPTIONS = [
  { value: "CS_ENGINEERING", label: "컴퓨터·공학" },
  { value: "NATURAL_SCIENCE", label: "자연과학" },
  { value: "BUSINESS", label: "경영·경제" },
  { value: "HUMANITIES", label: "인문·사회·어학" },
  { value: "ARTS", label: "예체능" },
  { value: "ETC", label: "기타" },
];

const LANGUAGE_TEST_OPTIONS = ["TOEIC", "TOEFL", "OPIc", "TEPS", "JLPT", "HSK", "해외 대학/대학원 졸업", "기타"];

const TECH_STACK_CATEGORIES = [
  { key: "언어", label: "언어", options: ["Java", "Python", "JavaScript", "TypeScript", "C++", "C#", "Go", "Kotlin"] },
  { key: "프레임워크_라이브러리", label: "프레임워크·라이브러리", options: ["Spring", "React", "Next.js", "Django", "Flask", "Node.js", "Vue"] },
  { key: "데이터베이스", label: "데이터베이스", options: ["MySQL", "PostgreSQL", "MongoDB", "Redis", "Oracle"] },
  { key: "클라우드_인프라", label: "클라우드·인프라", options: ["AWS", "GCP", "Azure", "Docker", "Kubernetes", "Terraform"] },
  { key: "AI_데이터", label: "AI·데이터", options: ["PyTorch", "TensorFlow", "Pandas", "scikit-learn"] },
  { key: "협업툴_형상관리", label: "협업툴·형상관리", options: ["Git", "GitHub", "Jira", "Notion", "Figma"] },
];
const TECH_STACK_CATEGORY_KEYS = TECH_STACK_CATEGORIES.map((c) => c.key);

const EXTRACURRICULAR_TYPE_OPTIONS = ["프로젝트", "동아리_학생회", "대외활동", "해외경험", "교육수강경험"];
const EXTRACURRICULAR_TYPE_LABELS = {
  프로젝트: "프로젝트",
  동아리_학생회: "동아리·학생회",
  대외활동: "대외활동",
  해외경험: "해외경험",
  교육수강경험: "교육 수강경험",
};

// 직장 경험을 추가할 때 순서대로 묻는 4가지 질문
// text: 챗봇이 묻는 질문, hint: 있으면 질문 아래에 작게 덧붙는 보충 설명
const WORK_INTERVIEW_QUESTIONS = [
  { text: "어떤 문제상황에 직면했었나요?" },
  { text: "그 상황을 어떻게 해결했나요?", hint: "문제를 해결하기 위해 본인이 기여한 바를 구체적으로 써주세요." },
  { text: "이를 통해 어떤 성과를 이루었나요?" },
  { text: "이 문제를 해결하는데 어떤 역량을 발휘했나요?" },
];

// 학내외경험/수상공모전을 추가할 때 순서대로 묻는 4가지 질문 (작성 가이드 박스 내용을 그대로 질문화)
const ACTIVITY_INTERVIEW_QUESTIONS = [
  { text: "어떤 분야/주제의 경험이었나요?", hint: "예: AI, 마케팅, 데이터분석, ESG 등" },
  { text: "어떤 기술/툴/방법론을 사용했나요?", hint: "예: Python, Figma, SQL 등" },
  { text: "본인의 역할과 담당 업무는 무엇이었나요?", hint: "예: 팀장, 데이터 분석 담당" },
  { text: "이 경험을 통해 어떤 성과를 이루었나요?" },
];

// 인터뷰 답변 내용에 맞춰 조금 더 자연스럽고 공감가는 반응을 고르기 위한 규칙 (서버 호출 없음).
// 답변에 특정 단어가 있으면 그에 맞는 반응 후보 중 하나를(내용 기반으로 안정적으로) 고르고,
// 아무 것도 안 걸리면 REACTION_FALLBACKS에서 고른다. KEYWORD_TRIGGERS와 같은 방식.
const REACTION_TRIGGERS = [
  [/힘들|어려웠|어려웠던|고생|부담|압박|스트레스|막막/, [
    "정말 쉽지 않으셨겠어요.",
    "그런 상황이면 부담이 크셨을 것 같아요.",
    "듣기만 해도 고생이 느껴지네요.",
  ]],
  [/성공|해결했|달성|늘었|증가|개선|향상|줄였|단축|성과/, [
    "오, 성과가 확실히 보이네요!",
    "결과로 이어졌다니 뿌듯하셨겠어요.",
    "그 정도면 정말 인상적인 결과네요.",
  ]],
  [/협업|팀원|함께|동료|소통|공유/, [
    "함께 만들어낸 결과라 더 의미 있었겠어요.",
    "팀워크가 느껴지는 이야기네요.",
    "동료분들과 잘 맞춰가셨나 봐요.",
  ]],
  [/처음|새로운|도전|배우|익숙하지/, [
    "새로운 걸 시도해보신 거네요, 멋져요.",
    "낯선 상황에서도 잘 부딪혀보셨네요.",
  ]],
  [/책임|맡았|담당|주도|리드/, [
    "책임감 있게 이끌어가셨네요.",
    "그 역할을 맡으신 게 인상 깊어요.",
  ]],
];

const REACTION_FALLBACKS = [
  "아, 그런 경험이 있으셨군요.",
  "말씀 잘 들었어요.",
  "구체적으로 알려주셔서 감사해요.",
  "흥미로운 이야기네요.",
  "그 얘기 자세히 들려주셔서 좋았어요.",
  "덕분에 잘 이해했어요.",
];

// 채용공고 키워드와 매칭되는 고정 역량 키워드 사전 (서버/AI 없이 규칙 기반으로 이 목록 안에서만 추출)
const KEYWORD_TRIGGERS = [
  [/회장|리드|이끌|팀장|주도/, ["리더십", "자기주도적"]],
  [/활발|적극/, ["적극적"]],
  [/꼼꼼|세심|디테일/, ["꼼꼼함"]],
  [/책임/, ["책임감"]],
  [/도전|새로운\s?시도|새\s?기술/, ["도전정신"]],
  [/협업|팀워크|함께|소통/, ["협업"]],
  [/분석|데이터/, ["분석력"]],
  [/기획|계획/, ["기획력"]],
  [/끈기|포기하지/, ["끈기"]],
  [/문제.?해결/, ["문제해결력"]],
  [/성장|배우/, ["성장지향"]],
];

// 8문항, 문항당 진술 하나를 골라 태그를 얻는 단일선택 구조 (Dohgrae 버전으로 통일)
const PERSONALITY_QUESTIONS = [
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

const WIZARD_SCREENS = [
  { id: "basic-info", label: "기본 인적사항" },
  { id: "work", label: "직장 경험" },
  { id: "extracurricular", label: "학내외경험" },
  { id: "awards", label: "수상·공모전" },
  { id: "personality", label: "업무 성향 테스트" },
  { id: "review", label: "완료" },
  { id: "result", label: "결과" },
];
