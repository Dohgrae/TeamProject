import type { UserProfileDraft } from "@/types/profile";
import { EDU_LEVEL_RANK, type JobPosting, type KeywordEntry } from "./jobsData";

export interface FilterResult {
  passed: JobPosting[];
  majorWarnings: JobPosting[];
}

// ekgus020330-lgtm의 src/filterlogic runFilter()를 그대로 이식한 1차 필터링.
// 유일한 차이는 공유 데이터(src/data)의 실제 영문 키(filter_company_size 등)를 직접 읽는다는 것.
export function filterJobs(profile: UserProfileDraft, jobs: JobPosting[]): FilterResult {
  const { filters, basic_info, career } = profile;
  const passed: JobPosting[] = [];
  const majorWarnings: JobPosting[] = [];

  for (const job of jobs) {
    const fail: string[] = [];

    if (filters.company_size.length > 0 && !filters.company_size.includes(job.filter_company_size)) {
      fail.push("규모");
    }

    if (filters.region.length > 0) {
      const isRemote = job.region.includes("재택") || job.region.includes("전국");
      if (!isRemote && !filters.region.includes(String(job.filter_region))) fail.push("지역");
    }

    if (filters.job_category.length > 0 && !filters.job_category.includes(job.filter_job_major)) {
      fail.push("직무");
    }

    if (filters.employment_type.length > 0) {
      if (!filters.employment_type.some((t) => job.employment_type.includes(t))) fail.push("근무형태");
    }

    const userEduLevel = basic_info.education.level;
    if (userEduLevel) {
      const userLv = EDU_LEVEL_RANK[userEduLevel] ?? 1;
      const jdLv = EDU_LEVEL_RANK[job.education_level] ?? 1;
      if (userLv < jdLv) fail.push("학력");
    }

    const jdType = job.career_type_code || "";
    if (career.career_status === "신입") {
      if (!jdType.includes("신입") && !jdType.includes("무관")) fail.push("경력");
    } else {
      if (!jdType.includes("경력") && !jdType.includes("무관") && !jdType.includes("신입+경력")) {
        fail.push("경력");
      } else if (career.total_career_years < job.career_years_min) {
        fail.push("연차");
      }
    }

    if (fail.length === 0) passed.push(job);

    const jdMajor = job.major || "";
    if (jdMajor.trim() !== "" && !jdMajor.includes("무관")) majorWarnings.push(job);
  }

  return { passed, majorWarnings };
}

// "R", "Go", "JS", "VR"처럼 짧은 순수 영문 alias는 단순 substring 매칭 시
// "developer", "career" 같은 단어 속에서 오탐이 나기 쉬워 단어 경계(\b)로 매칭한다.
// 한글 alias나 특수문자가 섞인 alias("C++", "C#")는 그대로 substring 매칭한다.
function aliasMatches(text: string, alias: string): boolean {
  const isShortAsciiWord = /^[A-Za-z0-9]+$/.test(alias) && alias.length <= 3;
  if (isShortAsciiWord) {
    return new RegExp(`\\b${alias}\\b`, "i").test(text);
  }
  return text.toLowerCase().includes(alias.toLowerCase());
}

function textIncludesAnyAlias(text: string, keyword: KeywordEntry): boolean {
  return keyword.aliases.some((alias) => aliasMatches(text, alias));
}

// 사용자 입력(기술스택/자격증/성향태그/자유서술)에서 keywords.json 사전에 매칭되는
// 키워드 id별 최대 가중치를 뽑는다. 그렇다=1.0/모르겠다=0.3 가중치는 성향질문에서 그대로 가져온다.
export function buildUserKeywordWeights(
  profile: UserProfileDraft,
  keywords: KeywordEntry[]
): Map<string, number> {
  const weights = new Map<string, number>();
  const setMax = (id: string, w: number) => weights.set(id, Math.max(weights.get(id) ?? 0, w));

  const taggedSources = [
    ...Object.values(profile.qualifications.tech_stack).flat(),
    ...profile.qualifications.certificates,
  ];

  const freeTextSources = [
    ...profile.career.work_experiences.map((e) => e.description),
    ...profile.activities.academic_extracurricular.map((e) => e.description),
    ...profile.activities.awards.map((e) => e.description),
  ].join("\n");

  for (const keyword of keywords) {
    if (taggedSources.some((tag) => textIncludesAnyAlias(tag, keyword))) {
      setMax(keyword.id, 1.0);
    }
    if (textIncludesAnyAlias(freeTextSources, keyword)) {
      setMax(keyword.id, 1.0);
    }
  }

  for (const [tag, weight] of Object.entries(profile.personality_survey.derived_tag_weights)) {
    for (const keyword of keywords) {
      if (textIncludesAnyAlias(tag, keyword)) setMax(keyword.id, weight);
    }
  }

  return weights;
}

export interface JobMatch {
  job: JobPosting;
  matchRate: number;
  matchedKeywords: string[];
  majorWarning: boolean;
}

// 공고 원문(주요업무/자격요건/인재상/우대사항 등)에서 키워드 사전에 매칭되는 항목을 찾고,
// 사용자 키워드 가중치와 겹치는 비율로 매칭률을 계산한다. 0~100 사이 정수, 초안 버전.
export function scoreJob(
  job: JobPosting,
  userKeywordWeights: Map<string, number>,
  keywords: KeywordEntry[]
): { matchRate: number; matchedKeywords: string[] } {
  const jobText = [
    job.job_title,
    job.main_tasks,
    job.qualifications,
    job.ideal_person,
    job.preferred_cert,
    job.preferred_language,
    job.preferred_etc,
  ]
    .filter(Boolean)
    .join("\n");

  const jobKeywordIds = keywords.filter((k) => textIncludesAnyAlias(jobText, k)).map((k) => k.id);
  if (jobKeywordIds.length === 0) return { matchRate: 0, matchedKeywords: [] };

  const matched = jobKeywordIds.filter((id) => userKeywordWeights.has(id));
  const weightSum = matched.reduce((sum, id) => sum + (userKeywordWeights.get(id) ?? 0), 0);
  const matchRate = Math.min(100, Math.round((weightSum / jobKeywordIds.length) * 100));

  return { matchRate, matchedKeywords: matched };
}

export function matchJobs(profile: UserProfileDraft, jobs: JobPosting[], keywords: KeywordEntry[]): JobMatch[] {
  const { passed, majorWarnings } = filterJobs(profile, jobs);
  const majorWarningIds = new Set(majorWarnings.map((j) => j.id));
  const userKeywordWeights = buildUserKeywordWeights(profile, keywords);

  return passed
    .map((job) => {
      const { matchRate, matchedKeywords } = scoreJob(job, userKeywordWeights, keywords);
      return { job, matchRate, matchedKeywords, majorWarning: majorWarningIds.has(job.id) };
    })
    .sort((a, b) => b.matchRate - a.matchRate);
}
