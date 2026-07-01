// src/data/jobs.json 의 개별 공고 레코드와 1:1 대응하는 타입.

export interface JobRecord {
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
  qualifications: string | null;
  career_type: string;
  career_type_code: string;
  career_years: string;
  career_years_min: number;
  job_title: string;
  filter_job_major: string;
  main_tasks: string | null;
  ideal_person: string | null;
  preferred_cert: string | null;
  preferred_language: string | null;
  preferred_etc: string | null;
  deadline: string;
  match_rate: number | null;
  match_reason: string | null;
  keywords: string[];
}

export interface JobsData {
  meta: { total: number; version: string; description: string };
  jobs: JobRecord[];
}
