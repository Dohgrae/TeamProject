module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/src/lib/anthropicClient.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getAnthropicClient",
    ()=>getAnthropicClient
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@anthropic-ai/sdk/index.mjs [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$client$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__Anthropic__as__default$3e$__ = __turbopack_context__.i("[project]/node_modules/@anthropic-ai/sdk/client.mjs [app-route] (ecmascript) <export Anthropic as default>");
;
let client = null;
function getAnthropicClient() {
    if (!client) {
        client = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$client$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__Anthropic__as__default$3e$__["default"]();
    }
    return client;
}
}),
"[project]/src/lib/constants.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// 프로토타입 단계 하드코딩 옵션 상수.
// filters 코드값(REGION/INDUSTRY/JOB_CATEGORY)과 tech_stack 옵션 목록은
// 결과 도출 파트와 공유 코드 테이블로 확정되면 이 파일만 교체하면 된다.
__turbopack_context__.s([
    "COMPANY_SIZE_OPTIONS",
    ()=>COMPANY_SIZE_OPTIONS,
    "COMPANY_TYPE_OPTIONS",
    ()=>COMPANY_TYPE_OPTIONS,
    "COMPETENCY_KEYWORDS",
    ()=>COMPETENCY_KEYWORDS,
    "EDUCATION_LEVEL_OPTIONS",
    ()=>EDUCATION_LEVEL_OPTIONS,
    "EMPLOYMENT_TYPE_OPTIONS",
    ()=>EMPLOYMENT_TYPE_OPTIONS,
    "EXTRACURRICULAR_TYPE_LABELS",
    ()=>EXTRACURRICULAR_TYPE_LABELS,
    "EXTRACURRICULAR_TYPE_OPTIONS",
    ()=>EXTRACURRICULAR_TYPE_OPTIONS,
    "INDUSTRY_OPTIONS",
    ()=>INDUSTRY_OPTIONS,
    "JOB_CATEGORY_OPTIONS",
    ()=>JOB_CATEGORY_OPTIONS,
    "LANGUAGE_TEST_OPTIONS",
    ()=>LANGUAGE_TEST_OPTIONS,
    "MAJOR_CATEGORY_OPTIONS",
    ()=>MAJOR_CATEGORY_OPTIONS,
    "PERSONALITY_QUESTIONS",
    ()=>PERSONALITY_QUESTIONS,
    "REGION_OPTIONS",
    ()=>REGION_OPTIONS,
    "TECH_STACK_CATEGORIES",
    ()=>TECH_STACK_CATEGORIES,
    "WIZARD_STEPS",
    ()=>WIZARD_STEPS,
    "WORK_EMPLOYMENT_TYPE_OPTIONS",
    ()=>WORK_EMPLOYMENT_TYPE_OPTIONS,
    "WORK_INTERVIEW_ACKS",
    ()=>WORK_INTERVIEW_ACKS,
    "WORK_INTERVIEW_QUESTIONS",
    ()=>WORK_INTERVIEW_QUESTIONS
]);
const REGION_OPTIONS = [
    {
        value: "SEOUL",
        label: "서울"
    },
    {
        value: "GYEONGGI",
        label: "경기"
    },
    {
        value: "INCHEON",
        label: "인천"
    },
    {
        value: "BUSAN",
        label: "부산"
    },
    {
        value: "DAEGU",
        label: "대구"
    },
    {
        value: "DAEJEON",
        label: "대전"
    },
    {
        value: "GWANGJU",
        label: "광주"
    },
    {
        value: "ETC",
        label: "기타"
    }
];
const INDUSTRY_OPTIONS = [
    {
        value: "IT_TELECOM",
        label: "IT·정보통신"
    },
    {
        value: "MANUFACTURING",
        label: "제조"
    },
    {
        value: "FINANCE",
        label: "금융"
    },
    {
        value: "TRADE_DISTRIBUTION",
        label: "무역·유통"
    },
    {
        value: "FOOD_FMCG",
        label: "식품·FMCG"
    },
    {
        value: "PUBLIC",
        label: "공공·기관"
    },
    {
        value: "ETC",
        label: "기타"
    }
];
const JOB_CATEGORY_OPTIONS = [
    {
        value: "BACKEND_DEV",
        label: "백엔드 개발"
    },
    {
        value: "FRONTEND_DEV",
        label: "프론트엔드 개발"
    },
    {
        value: "FULLSTACK_DEV",
        label: "풀스택 개발"
    },
    {
        value: "AI_ENGINEER",
        label: "AI 엔지니어"
    },
    {
        value: "DATA_ENGINEER",
        label: "데이터 엔지니어"
    },
    {
        value: "MOBILE_DEV",
        label: "모바일 개발"
    },
    {
        value: "DEVOPS",
        label: "DevOps"
    },
    {
        value: "QA",
        label: "QA"
    },
    {
        value: "EMBEDDED_DEV",
        label: "임베디드 개발"
    },
    {
        value: "ETC",
        label: "기타"
    }
];
const COMPANY_SIZE_OPTIONS = [
    {
        value: "LARGE",
        label: "대기업"
    },
    {
        value: "MID",
        label: "중견기업"
    },
    {
        value: "SMALL",
        label: "중소기업"
    },
    {
        value: "STARTUP",
        label: "스타트업"
    }
];
const COMPANY_TYPE_OPTIONS = [
    {
        value: "GENERAL",
        label: "일반기업"
    },
    {
        value: "FOREIGN",
        label: "외국계"
    },
    {
        value: "PUBLIC",
        label: "공공기관"
    }
];
const EMPLOYMENT_TYPE_OPTIONS = [
    {
        value: "FULL_TIME",
        label: "정규직"
    },
    {
        value: "INTERN",
        label: "인턴"
    },
    {
        value: "CONTRACT",
        label: "계약직"
    }
];
const EDUCATION_LEVEL_OPTIONS = [
    {
        value: "HIGH_SCHOOL",
        label: "고졸"
    },
    {
        value: "ASSOCIATE",
        label: "전문학사"
    },
    {
        value: "BACHELOR",
        label: "학사"
    },
    {
        value: "MASTER",
        label: "석사"
    },
    {
        value: "DOCTOR",
        label: "박사"
    }
];
const MAJOR_CATEGORY_OPTIONS = [
    {
        value: "CS_ENGINEERING",
        label: "컴퓨터·공학"
    },
    {
        value: "NATURAL_SCIENCE",
        label: "자연과학"
    },
    {
        value: "BUSINESS",
        label: "경영·경제"
    },
    {
        value: "HUMANITIES",
        label: "인문·어학"
    },
    {
        value: "ARTS",
        label: "예체능"
    },
    {
        value: "ETC",
        label: "기타"
    }
];
const LANGUAGE_TEST_OPTIONS = [
    "TOEIC",
    "TOEFL",
    "OPIc",
    "TEPS",
    "JLPT",
    "HSK",
    "기타"
];
const TECH_STACK_CATEGORIES = [
    {
        key: "언어",
        label: "언어",
        options: [
            "Java",
            "Python",
            "JavaScript",
            "TypeScript",
            "C++",
            "C#",
            "Go",
            "Kotlin"
        ]
    },
    {
        key: "프레임워크_라이브러리",
        label: "프레임워크·라이브러리",
        options: [
            "Spring",
            "React",
            "Next.js",
            "Django",
            "Flask",
            "Node.js",
            "Vue"
        ]
    },
    {
        key: "데이터베이스",
        label: "데이터베이스",
        options: [
            "MySQL",
            "PostgreSQL",
            "MongoDB",
            "Redis",
            "Oracle"
        ]
    },
    {
        key: "클라우드_인프라",
        label: "클라우드·인프라",
        options: [
            "AWS",
            "GCP",
            "Azure",
            "Docker",
            "Kubernetes",
            "Terraform"
        ]
    },
    {
        key: "AI_데이터",
        label: "AI·데이터",
        options: [
            "PyTorch",
            "TensorFlow",
            "Pandas",
            "scikit-learn"
        ]
    },
    {
        key: "협업툴_형상관리",
        label: "협업툴·형상관리",
        options: [
            "Git",
            "GitHub",
            "Jira",
            "Notion",
            "Figma"
        ]
    }
];
const WORK_EMPLOYMENT_TYPE_OPTIONS = [
    "정규직",
    "계약직",
    "인턴",
    "프리랜서"
];
const EXTRACURRICULAR_TYPE_OPTIONS = [
    "프로젝트",
    "동아리_학생회",
    "대외활동",
    "해외경험",
    "교육수강경험"
];
const EXTRACURRICULAR_TYPE_LABELS = {
    프로젝트: "프로젝트",
    동아리_학생회: "동아리·학생회",
    대외활동: "대외활동",
    해외경험: "해외경험",
    교육수강경험: "교육 수강경험"
};
const PERSONALITY_QUESTIONS = [
    {
        question_id: 1,
        question: "나는 어떤 업무 환경에서 더 힘이 나는가?",
        options: [
            {
                option: 1,
                statement: "내 페이스대로 혼자 몰입",
                tags: [
                    "독립",
                    "몰입",
                    "자기주도"
                ]
            },
            {
                option: 2,
                statement: "사람들과 자주 논의하며 맞춰감",
                tags: [
                    "소통",
                    "협업",
                    "존중",
                    "함께성장"
                ]
            }
        ]
    },
    {
        question_id: 2,
        question: "일을 진행하는 나의 방식은?",
        options: [
            {
                option: 1,
                statement: "빠르게 실행하고 고쳐나감",
                tags: [
                    "속도",
                    "실행력",
                    "Runner",
                    "실험"
                ]
            },
            {
                option: 2,
                statement: "다듬어 완성도를 높인 뒤 내놓음",
                tags: [
                    "완성도",
                    "코드품질",
                    "구조",
                    "유지보수",
                    "확장성"
                ]
            }
        ]
    },
    {
        question_id: 3,
        question: "나는 어느 쪽에서 더 보람을 느끼는가?",
        options: [
            {
                option: 1,
                statement: "풀 문제가 뭔지 정의하는 것",
                tags: [
                    "문제정의",
                    "문제발굴",
                    "본질탐구",
                    "전략적사고"
                ]
            },
            {
                option: 2,
                statement: "정해진 목표를 끝까지 완수",
                tags: [
                    "완수",
                    "책임감",
                    "끝까지",
                    "오너십"
                ]
            }
        ]
    },
    {
        question_id: 4,
        question: "새로운 방식·도구를 마주하면 나는?",
        options: [
            {
                option: 1,
                statement: "겁 없이 먼저 시도",
                tags: [
                    "탐험",
                    "새기술",
                    "학습력",
                    "두려움없음",
                    "실험"
                ]
            },
            {
                option: 2,
                statement: "검증된 방식을 선호",
                tags: [
                    "검증",
                    "실용주의",
                    "안정",
                    "신중"
                ]
            }
        ]
    },
    {
        question_id: 5,
        question: "나는 어떻게 일할 때 편한가?",
        options: [
            {
                option: 1,
                statement: "시키기 전에 스스로 벌임",
                tags: [
                    "주도적",
                    "오너십",
                    "먼저움직임",
                    "GameChanger",
                    "변화주도"
                ]
            },
            {
                option: 2,
                statement: "명확한 방향이 주어졌을 때 잘함",
                tags: [
                    "방향지향",
                    "실행",
                    "안정"
                ]
            }
        ]
    },
    {
        question_id: 6,
        question: "나는 어디에 더 강한가?",
        options: [
            {
                option: 1,
                statement: "전체 구조·큰 그림",
                tags: [
                    "전략적사고",
                    "시스템사고",
                    "구조설계",
                    "확장성"
                ]
            },
            {
                option: 2,
                statement: "디테일을 챙겨 굴러가게 함",
                tags: [
                    "실무",
                    "실용주의",
                    "실제구현",
                    "완성도"
                ]
            }
        ]
    },
    {
        question_id: 7,
        question: "일에서 나를 움직이는 건?",
        options: [
            {
                option: 1,
                statement: "변화를 만들고 큰 영향을 줌",
                tags: [
                    "임팩트",
                    "변화주도",
                    "GameChanger"
                ]
            },
            {
                option: 2,
                statement: "맡은 걸 안정적으로 지켜냄",
                tags: [
                    "책임감",
                    "신뢰",
                    "오너십",
                    "끝까지"
                ]
            }
        ]
    },
    {
        question_id: 8,
        question: "AI 같은 새 도구를 대하는 태도는?",
        options: [
            {
                option: 1,
                statement: "동료처럼 적극 활용",
                tags: [
                    "AI활용",
                    "자동화",
                    "도구활용",
                    "파트너십"
                ]
            },
            {
                option: 2,
                statement: "결과를 검증하며 신중히 씀",
                tags: [
                    "검증",
                    "신중",
                    "책임감",
                    "품질"
                ]
            }
        ]
    }
];
const WORK_INTERVIEW_QUESTIONS = [
    "언제, 어디서, 어떤 활동을 했나요?",
    "해결해야 했던 문제나 목표가 무엇이었나요?",
    "그중에서 내가 직접 한 일은 무엇인가요?",
    "어떤 방식으로 행동하거나 판단했나요?",
    "어떤 툴/스킬을 사용해서 문제를 해결했나요?",
    "고객, 팀원, 외부기관, 상사 등 누구와 협업했나요?",
    "어떤 수치, 성과, 개선 결과가 있었나요?",
    "이 경험을 통해 어떤 역량을 보여줄 수 있나요?"
];
const WORK_INTERVIEW_ACKS = [
    "그렇군요!",
    "네, 잘 알겠습니다.",
    "좋은 경험이네요.",
    "아, 그러셨군요.",
    "말씀 감사해요.",
    "흥미로운 이야기네요."
];
const COMPETENCY_KEYWORDS = [
    "자기주도적",
    "주도적",
    "리더십",
    "책임감",
    "오너십",
    "협업",
    "커뮤니케이션",
    "적극적",
    "실행력",
    "문제해결력",
    "분석력",
    "논리적사고",
    "전략적사고",
    "창의성",
    "꼼꼼함",
    "디테일지향",
    "완성도",
    "끈기",
    "적응력",
    "학습력",
    "성장지향",
    "도전정신",
    "신속성",
    "멀티태스킹",
    "고객지향",
    "데이터기반의사결정",
    "기획력",
    "실행경험",
    "갈등조정",
    "신뢰성"
];
const WIZARD_STEPS = [
    {
        path: "/steps/basic-info",
        label: "기본 인적사항"
    },
    {
        path: "/steps/work",
        label: "직장 경험"
    },
    {
        path: "/steps/extracurricular",
        label: "학내외경험"
    },
    {
        path: "/steps/awards",
        label: "수상·공모전"
    },
    {
        path: "/steps/personality",
        label: "성향 질문"
    },
    {
        path: "/steps/review",
        label: "완료"
    }
];
}),
"[project]/src/lib/keywordExtractionMock.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "mockExtractKeywords",
    ()=>mockExtractKeywords
]);
// ANTHROPIC_API_KEY가 없을 때만 쓰이는 임시 목업.
// 실제 AI 판단 없이 단순 키워드 매칭으로, 인터뷰 답변에서 후보 키워드를 흉내낸다.
const KEYWORD_TRIGGERS = [
    [
        /회장|리드|이끌|팀장|주도/,
        [
            "리더십",
            "자기주도적"
        ]
    ],
    [
        /활발|적극/,
        [
            "적극적"
        ]
    ],
    [
        /꼼꼼|세심|디테일/,
        [
            "꼼꼼함"
        ]
    ],
    [
        /책임/,
        [
            "책임감"
        ]
    ],
    [
        /도전|새로운\s?시도|새\s?기술/,
        [
            "도전정신"
        ]
    ],
    [
        /협업|팀워크|함께|소통/,
        [
            "협업"
        ]
    ],
    [
        /분석|데이터/,
        [
            "분석력"
        ]
    ],
    [
        /기획|계획/,
        [
            "기획력"
        ]
    ],
    [
        /끈기|포기하지/,
        [
            "끈기"
        ]
    ],
    [
        /문제.?해결/,
        [
            "문제해결력"
        ]
    ],
    [
        /성장|배우/,
        [
            "성장지향"
        ]
    ]
];
function mockExtractKeywords(answers) {
    const text = answers.join(" ");
    const found = new Set();
    for (const [pattern, keywords] of KEYWORD_TRIGGERS){
        if (pattern.test(text)) keywords.forEach((k)=>found.add(k));
    }
    return Array.from(found);
}
}),
"[project]/src/app/api/work-interview-keywords/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@anthropic-ai/sdk/index.mjs [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$client$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__Anthropic__as__default$3e$__ = __turbopack_context__.i("[project]/node_modules/@anthropic-ai/sdk/client.mjs [app-route] (ecmascript) <export Anthropic as default>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$anthropicClient$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/anthropicClient.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/constants.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$keywordExtractionMock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/keywordExtractionMock.ts [app-route] (ecmascript)");
;
;
;
;
;
function buildSystemPrompt() {
    return `당신은 구직자-채용공고 매칭 서비스의 백엔드 시스템입니다.
사용자가 직장 경험에 대해 8가지 질문에 답한 내용이 주어집니다. 이 내용을 분석해서, 이 경험이 보여주는 역량과 의미상 가장 가까운 표현을 아래 [키워드 사전]에서만 골라주세요. 사전에 없는 표현은 절대로 새로 만들지 마세요.

이 결과는 사용자에게 보여지지 않고, 채용공고와의 매칭을 위해 회사 내부 시스템에서만 사용됩니다.

[키워드 사전]
${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["COMPETENCY_KEYWORDS"].join(", ")}

JSON으로만 응답하세요: {"keywords": ["...", "..."]}`;
}
function buildUserMessage(answers) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["WORK_INTERVIEW_QUESTIONS"].map((q, i)=>`Q${i + 1}. ${q}\nA${i + 1}. ${answers[i] ?? ""}`).join("\n\n");
}
async function POST(request) {
    const body = await request.json();
    const { answers } = body;
    if (!Array.isArray(answers) || answers.length !== __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["WORK_INTERVIEW_QUESTIONS"].length) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "invalid request"
        }, {
            status: 400
        });
    }
    if (!process.env.ANTHROPIC_API_KEY) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            keywords: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$keywordExtractionMock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["mockExtractKeywords"])(answers)
        });
    }
    try {
        const client = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$anthropicClient$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAnthropicClient"])();
        const response = await client.messages.create({
            model: "claude-haiku-4-5",
            max_tokens: 512,
            system: buildSystemPrompt(),
            output_config: {
                format: {
                    type: "json_schema",
                    schema: {
                        type: "object",
                        properties: {
                            keywords: {
                                type: "array",
                                items: {
                                    type: "string"
                                }
                            }
                        },
                        required: [
                            "keywords"
                        ],
                        additionalProperties: false
                    }
                }
            },
            messages: [
                {
                    role: "user",
                    content: buildUserMessage(answers)
                }
            ]
        });
        const textBlock = response.content.find((block)=>block.type === "text");
        const parsed = textBlock ? JSON.parse(textBlock.text) : {
            keywords: []
        };
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            keywords: parsed.keywords ?? []
        });
    } catch (error) {
        if (error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$client$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__Anthropic__as__default$3e$__["default"].APIError) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: error.message
            }, {
                status: error.status ?? 500
            });
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "unexpected error"
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__1qi4sma._.js.map