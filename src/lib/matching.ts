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

// 매칭에 쓰이는 사용자 신호 하나. keywords.json 사전 기반(기술스택/자격증)과
// 이미 확정된 한글 역량 문구 기반(직장경험 인터뷰 키워드, 성향 태그) 두 갈래를 하나로 합쳐서 다룬다.
interface UserSignal {
  label: string;
  weight: number;
  matchesJobText: (jobText: string) => boolean;
}

// 사용자 입력에서 채용공고와 비교할 신호를 뽑는다.
// - 기술스택/자격증: keywords.json alias 사전으로 매칭 (Python 태그 → 공고의 "파이썬"도 잡아냄)
// - 직장경험 인터뷰에서 AI(WorkExperienceInterviewModal)가 이미 추출해 둔 역량 키워드,
//   성향질문에서 파생된 태그: 이미 확정된 한글 문구이므로 공고 원문에 직접 등장하는지만 본다.
export function buildUserSignals(profile: UserProfileDraft, keywords: KeywordEntry[]): UserSignal[] {
  const signals: UserSignal[] = [];

  const taggedSources = [
    ...Object.values(profile.qualifications.tech_stack).flat(),
    ...profile.qualifications.certificates,
  ];
  for (const keyword of keywords) {
    if (taggedSources.some((tag) => textIncludesAnyAlias(tag, keyword))) {
      signals.push({ label: keyword.id, weight: 1.0, matchesJobText: (t) => textIncludesAnyAlias(t, keyword) });
    }
  }

  const workKeywords = new Set(profile.career.work_experiences.flatMap((e) => e.keywords));
  for (const phrase of workKeywords) {
    signals.push({ label: phrase, weight: 1.0, matchesJobText: (t) => t.includes(phrase) });
  }

  for (const [tag, weight] of Object.entries(profile.personality_survey.derived_tag_weights)) {
    signals.push({ label: tag, weight, matchesJobText: (t) => t.includes(tag) });
  }

  return signals;
}

export interface JobMatch {
  job: JobPosting;
  matchRate: number;
  matchedKeywords: string[];
  majorWarning: boolean;
}

function buildJobText(job: JobPosting): string {
  return [
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
}

// 사용자가 가진 신호 중 이 공고 원문에서 실제로 발견되는 비율로 매칭률을 계산한다.
// 0~100 사이 정수, 초안 버전 — 가중치/공식은 결과 파트와 조율해 조정 가능.
export function scoreJob(job: JobPosting, signals: UserSignal[]): { matchRate: number; matchedKeywords: string[] } {
  if (signals.length === 0) return { matchRate: 0, matchedKeywords: [] };

  const jobText = buildJobText(job);
  const matched = signals.filter((s) => s.matchesJobText(jobText));
  const weightSum = matched.reduce((sum, s) => sum + s.weight, 0);
  const matchRate = Math.min(100, Math.round((weightSum / signals.length) * 100));

  return { matchRate, matchedKeywords: matched.map((s) => s.label) };
}

// 결과 카드(feature3 UI)에 보여줄 "왜 추천하는지" 문구를 매칭된 신호를 바탕으로 만든다.
export function buildMatchReasons(job: JobPosting, matchedKeywords: string[], majorWarning: boolean): string[] {
  const reasons: string[] = [];

  if (matchedKeywords.length > 0) {
    reasons.push(`${matchedKeywords.slice(0, 3).map((k) => `#${k}`).join(", ")} 관련 역량이 이 공고와 겹쳐요.`);
  } else {
    reasons.push("직무·지역·경력 조건은 맞지만, 겹치는 역량 키워드는 아직 못 찾았어요.");
  }

  reasons.push(`${job.career_type}(${job.career_years}) · ${job.employment_type} 조건이 회원님과 맞아요.`);

  if (majorWarning) {
    reasons.push("전공 요건이 있는 공고예요 — 실무 경험으로 어필할 수 있는지 확인해보세요.");
  } else {
    reasons.push(`지원 마감일(${job.deadline})을 기준으로 실제 지원 가능성을 확인해보세요.`);
  }

  return reasons;
}

export function matchJobs(profile: UserProfileDraft, jobs: JobPosting[], keywords: KeywordEntry[]): JobMatch[] {
  const { passed, majorWarnings } = filterJobs(profile, jobs);
  const majorWarningIds = new Set(majorWarnings.map((j) => j.id));
  const signals = buildUserSignals(profile, keywords);

  return passed
    .map((job) => {
      const { matchRate, matchedKeywords } = scoreJob(job, signals);
      return { job, matchRate, matchedKeywords, majorWarning: majorWarningIds.has(job.id) };
    })
    .sort((a, b) => b.matchRate - a.matchRate);
}
