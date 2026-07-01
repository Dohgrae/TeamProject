// UserProfileDraft(filters/basic_info/career)의 코드체계(constants.ts 옵션값)와
// src/data/jobs.json의 코드체계(filter_company_size A~E, filter_region 1~9, filter_job_major M1~M7,
// education_level H1~H5, 필터 프로토타입 src/filterlogic 참고)가 서로 다르므로 여기서 매핑한다.

export const COMPANY_SIZE_TO_JOB_CODE: Record<string, string> = {
  LARGE: "A",
  MID: "B",
  SMALL: "C",
  STARTUP: "D",
};

// 공공기관은 jobs.json에서 별도 company_type이 아니라 기업규모 코드 "E"(공공/교육)로 들어있다.
export const COMPANY_TYPE_TO_JOB_SIZE_CODE: Record<string, string> = {
  PUBLIC: "E",
};

export const REGION_TO_JOB_CODES: Record<string, string[]> = {
  SEOUL: ["1"],
  GYEONGGI: ["2"],
  INCHEON: ["2"],
  BUSAN: ["3"],
  DAEGU: ["4"],
  DAEJEON: ["5"],
  GWANGJU: ["6"],
  // 강원/제주/재택·전국처럼 위 옵션에 없는 지역
  ETC: ["7", "8", "9"],
};

// jobs.json의 직무 대분류(M1~M7)는 마법사의 세분화된 개발 직무 옵션보다 훨씬 거칠다.
// 개발 계열 직무는 전부 M4(개발·AI)로, 임베디드는 M7(연구·생산)로 모은다.
export const JOB_CATEGORY_TO_JOB_CODE: Record<string, string> = {
  BACKEND_DEV: "M4",
  FRONTEND_DEV: "M4",
  FULLSTACK_DEV: "M4",
  AI_ENGINEER: "M4",
  DATA_ENGINEER: "M4",
  MOBILE_DEV: "M4",
  DEVOPS: "M4",
  QA: "M4",
  EMBEDDED_DEV: "M7",
  // ETC는 특정 코드로 좁힐 수 없어 매핑하지 않음(필터 미적용)
};

export const EMPLOYMENT_TYPE_TO_JOB_LABEL: Record<string, string> = {
  FULL_TIME: "정규직",
  CONTRACT: "계약직",
  INTERN: "인턴",
};

export const EDUCATION_LEVEL_TO_JOB_CODE: Record<string, string> = {
  HIGH_SCHOOL: "H1",
  ASSOCIATE: "H2",
  BACHELOR: "H3",
  MASTER: "H4",
  DOCTOR: "H5",
};

export function mapValues(values: string[], table: Record<string, string>): string[] {
  return Array.from(new Set(values.flatMap((v) => (table[v] ? [table[v]] : []))));
}

export function mapValuesToMany(values: string[], table: Record<string, string[]>): string[] {
  return Array.from(new Set(values.flatMap((v) => table[v] ?? [])));
}
