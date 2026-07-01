import fs from "fs";
import path from "path";

// johyejune이 만든 공유 데이터 파일. src/data/jobs.json으로 rename되어 확장자가 생겼으니
// 정적 import도 가능하지만, 서버 전용 코드라는 걸 명확히 하기 위해 fs 텍스트 읽기를 유지한다.
const JOBS_PATH = path.join(process.cwd(), "src/data/jobs.json");
const KEYWORDS_PATH = path.join(process.cwd(), "src/keywords.json");

export interface JobPosting {
  id: number;
  company_name: string;
  posting_title: string;
  url: string;
  company_size: string;
  filter_company_size: string;
  region: string;
  filter_region: string;
  employment_type: string;
  education: string;
  education_level: string;
  major: string | null;
  qualifications: string;
  career_type: string;
  career_type_code: string;
  career_years: string;
  career_years_min: number;
  job_title: string;
  filter_job_major: string;
  main_tasks: string;
  ideal_person: string | null;
  preferred_cert: string | null;
  preferred_language: string | null;
  preferred_etc: string | null;
  deadline: string;
}

export interface KeywordEntry {
  category: string;
  id: string;
  aliases: string[];
}

// filterlogic(ekgus020330-lgtm)의 EDU_LEVEL과 동일한 학력 서열. 값이 클수록 상위 학력.
export const EDU_LEVEL_RANK: Record<string, number> = { H1: 1, H2: 2, H3: 3, H4: 4, H5: 5 };

let jobsCache: JobPosting[] | null = null;
let keywordsCache: KeywordEntry[] | null = null;

export function loadJobs(): JobPosting[] {
  if (!jobsCache) {
    const raw = fs.readFileSync(JOBS_PATH, "utf-8");
    jobsCache = JSON.parse(raw).jobs as JobPosting[];
  }
  return jobsCache;
}

export function loadKeywords(): KeywordEntry[] {
  if (!keywordsCache) {
    const raw = fs.readFileSync(KEYWORDS_PATH, "utf-8");
    keywordsCache = JSON.parse(raw).keywords as KeywordEntry[];
  }
  return keywordsCache;
}
