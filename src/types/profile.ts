// schema/user-profile.schema.json 과 1:1 대응하는 타입 정의.
// 결과 도출 파트로 넘기는 최종 계약(JSON)의 TS 버전이므로, 스키마를 바꾸면 이 파일도 함께 바꿔야 한다.

export type Gender = "male" | "female" | "other" | "prefer_not_to_say";

export interface BasicInfo {
  name: string;
  gender: Gender | "";
  birth_date: string; // YYYY-MM-DD
  education: {
    level: string; // 학력 단계 코드
    major_category: string; // 전공 대분류 코드
    major_detail: string; // 학과(자유 입력, 프로토타입 단계)
  };
  contact: {
    phone: string;
    email: string;
  };
}

// region/job_category/company_size/employment_type 값은 채용공고 DB(src/data)의
// filter_region/filter_job_major/filter_company_size/employment_type 코드와 1:1로 맞춘다.
// 실제 데이터에 industry(산업군)/company_type(기업형태) 필드가 없어 이 스킴에는 포함하지 않는다.
export interface Filters {
  region: string[];
  job_category: string[];
  company_size: string[];
  employment_type: string[];
}

export interface LanguageScore {
  test: string;
  score: string;
}

export type TechStackCategory =
  | "언어"
  | "프레임워크_라이브러리"
  | "데이터베이스"
  | "클라우드_인프라"
  | "AI_데이터"
  | "협업툴_형상관리";

export type TechStack = Record<TechStackCategory, string[]>;

export interface Qualifications {
  languages: LanguageScore[];
  certificates: string[];
  tech_stack: TechStack;
}

export type EmploymentTypeKR = "정규직" | "계약직" | "인턴" | "프리랜서";

export interface WorkExperience {
  id: string;
  employment_type: EmploymentTypeKR;
  start_date: string; // YYYY-MM
  end_date: string | null; // YYYY-MM, 재직중이면 null
  // WORK_INTERVIEW_QUESTIONS(constants.ts) 8개 질문에 순서대로 대응하는 답변.
  answers: string[];
  // 답변을 바탕으로 채용공고 매칭용으로 추출한 역량 키워드. 회사 내부 매칭에만 쓰이며 사용자 화면에는 절대 노출하지 않는다.
  keywords: string[];
}

export type CareerStatus = "신입" | "경력";

export interface Career {
  career_status: CareerStatus;
  total_career_years: number;
  work_experiences: WorkExperience[];
}

export type ExtracurricularType =
  | "프로젝트"
  | "동아리_학생회"
  | "대외활동"
  | "해외경험"
  | "교육수강경험";

export interface ExtracurricularItem {
  id: string;
  type: ExtracurricularType;
  description: string;
}

export interface AwardItem {
  id: string;
  description: string;
}

export interface Activities {
  academic_extracurricular: ExtracurricularItem[];
  awards: AwardItem[];
}

// 질문마다 두 진술 중 하나를 고르거나 "잘 모르겠다"를 고르는 3지선다 구조.
export type PersonalityChoice = 1 | 2 | "unknown";

export interface PersonalityAnswer {
  question_id: number;
  choice: PersonalityChoice | null;
}

export interface PersonalitySurvey {
  answers: PersonalityAnswer[];
  derived_tag_weights: Record<string, number>;
}

export interface UserProfileDraft {
  basic_info: BasicInfo;
  filters: Filters;
  qualifications: Qualifications;
  career: Career;
  activities: Activities;
  personality_survey: PersonalitySurvey;
  meta: {
    draft_id: string;
    updated_at: string;
  };
}
