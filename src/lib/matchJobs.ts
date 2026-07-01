import jobsData from "@/data/jobs.json";
import type { UserProfileDraft } from "@/types/profile";
import type { JobRecord, JobsData } from "@/types/job";
import { computeMatchScore } from "@/lib/matchScore";
import { filterJobs } from "@/lib/filterJobs";

export interface ScoredJob extends JobRecord {
  match_rate: number;
  match_reason: string;
}

export function loadJobs(): JobRecord[] {
  return (jobsData as JobsData).jobs;
}

// 2차 스코어링: 1차 필터링을 통과한 공고 목록에 매칭률을 매겨 내림차순 정렬한다.
export function scoreJobs(profile: UserProfileDraft, jobs: JobRecord[]): ScoredJob[] {
  return jobs
    .map((job) => {
      const { match_rate, match_reason } = computeMatchScore(profile, job);
      return { ...job, match_rate, match_reason };
    })
    .sort((a, b) => b.match_rate - a.match_rate);
}

export interface MatchPipelineResult {
  results: ScoredJob[];
  majorWarnings: JobRecord[];
}

// 전체 파이프라인: 1차 필터링(filterJobs) → 2차 스코어링(scoreJobs).
export function matchJobsForProfile(profile: UserProfileDraft, jobs: JobRecord[] = loadJobs()): MatchPipelineResult {
  const { passed, majorWarnings } = filterJobs(profile, jobs);
  return { results: scoreJobs(profile, passed), majorWarnings };
}
