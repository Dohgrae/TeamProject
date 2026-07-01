// 1차 필터링: src/filterlogic (프로토타입 HTML)의 runFilter() 로직을 그대로 이식하되,
// 마법사 UI(UserProfileDraft, constants.ts 코드체계)에서 jobs.json 코드체계로 변환하는 단계를 앞에 붙였다.

import type { UserProfileDraft } from "@/types/profile";
import type { JobRecord } from "@/types/job";
import {
  COMPANY_SIZE_TO_JOB_CODE,
  COMPANY_TYPE_TO_JOB_SIZE_CODE,
  EDUCATION_LEVEL_TO_JOB_CODE,
  EMPLOYMENT_TYPE_TO_JOB_LABEL,
  JOB_CATEGORY_TO_JOB_CODE,
  REGION_TO_JOB_CODES,
  mapValues,
  mapValuesToMany,
} from "@/lib/profileCodeMapping";

const EDU_LEVEL_RANK: Record<string, number> = { H1: 1, H2: 2, H3: 3, H4: 4, H5: 5 };

interface FilterProfile {
  company_size_codes: string[];
  job_major_codes: string[];
  region_codes: string[];
  work_type_labels: string[];
  education_level_code: string;
  career_type: "신입" | "경력" | "";
  career_years: number;
}

// jobs.json은 기업규모 코드 하나(A~E)에 "공공/교육"까지 욱여넣고 있어서, filters.company_size와
// filters.company_type(공공기관)을 엄격한 AND가 아니라 허용 코드 집합의 합집합으로 완화해서 매핑한다.
function buildFilterProfile(profile: UserProfileDraft): FilterProfile {
  const companySizeCodes = [
    ...mapValues(profile.filters.company_size, COMPANY_SIZE_TO_JOB_CODE),
    ...mapValues(profile.filters.company_type, COMPANY_TYPE_TO_JOB_SIZE_CODE),
  ];

  return {
    company_size_codes: Array.from(new Set(companySizeCodes)),
    job_major_codes: mapValues(profile.filters.job_category, JOB_CATEGORY_TO_JOB_CODE),
    region_codes: mapValuesToMany(profile.filters.region, REGION_TO_JOB_CODES),
    work_type_labels: mapValues(profile.filters.employment_type, EMPLOYMENT_TYPE_TO_JOB_LABEL),
    education_level_code: EDUCATION_LEVEL_TO_JOB_CODE[profile.basic_info.education.level] ?? "",
    career_type: profile.career.career_status,
    career_years: profile.career.total_career_years,
  };
}

export interface FilterResult {
  passed: JobRecord[];
  majorWarnings: JobRecord[];
}

export function filterJobs(profile: UserProfileDraft, jobs: JobRecord[]): FilterResult {
  const filterProfile = buildFilterProfile(profile);
  const passed: JobRecord[] = [];
  const majorWarnings: JobRecord[] = [];

  for (const job of jobs) {
    let fails = false;

    // 기업규모(+공공기관)
    if (filterProfile.company_size_codes.length > 0) {
      if (!filterProfile.company_size_codes.includes(job.filter_company_size)) fails = true;
    }

    // 지역 (재택·전국 공고는 지역 필터 대상에서 제외)
    if (!fails && filterProfile.region_codes.length > 0) {
      const isRemote = job.region.includes("재택") || job.region.includes("전국");
      if (!isRemote && !filterProfile.region_codes.includes(String(job.filter_region))) fails = true;
    }

    // 직무
    if (!fails && filterProfile.job_major_codes.length > 0) {
      if (!filterProfile.job_major_codes.includes(job.filter_job_major)) fails = true;
    }

    // 근무형태
    if (!fails && filterProfile.work_type_labels.length > 0) {
      if (!filterProfile.work_type_labels.some((t) => job.employment_type.includes(t))) fails = true;
    }

    // 학력
    if (!fails && filterProfile.education_level_code) {
      const userLv = EDU_LEVEL_RANK[filterProfile.education_level_code] ?? 1;
      const jdLv = EDU_LEVEL_RANK[job.education_level] ?? 1;
      if (userLv < jdLv) fails = true;
    }

    // 경력
    if (!fails && filterProfile.career_type) {
      const jdType = job.career_type_code || "";
      const jdYears = job.career_years_min || 0;
      if (filterProfile.career_type === "신입") {
        if (!jdType.includes("신입") && !jdType.includes("무관")) fails = true;
      } else {
        if (!jdType.includes("경력") && !jdType.includes("무관") && !jdType.includes("신입+경력")) {
          fails = true;
        } else if (filterProfile.career_years < jdYears) {
          fails = true;
        }
      }
    }

    // 전공 SOFT: 탈락시키지 않고 경고만 표시 (실무 경험으로 대체 가능한 경우가 많아서)
    if (job.major && !job.major.includes("무관") && job.major.trim() !== "") {
      majorWarnings.push(job);
    }

    if (!fails) passed.push(job);
  }

  return { passed, majorWarnings };
}
