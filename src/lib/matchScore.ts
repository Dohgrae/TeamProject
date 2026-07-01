import type { UserProfileDraft } from "@/types/profile";
import type { JobRecord } from "@/types/job";
import {
  extractJobCompetencyKeywords,
  extractJobPersonalityKeywords,
  extractJobPreferredKeywords,
} from "@/lib/jobKeywords";
import { extractUserPersonalityKeywords, extractUserSkillKeywords } from "@/lib/userKeywords";

const WEIGHTS = { competency: 0.5, personality: 0.2, preferred: 0.3 };

export interface CategoryScore {
  score: number; // 0~100
  matched: string[];
}

export interface MatchResult {
  match_rate: number; // 0~100
  match_reason: string;
  competency: CategoryScore;
  personality: CategoryScore;
  preferred: CategoryScore;
}

// 공고 기준 재현율: 공고가 요구하는 키워드 중 사용자가 가진 비율.
// 공고 쪽에 해당 카테고리 텍스트/키워드가 아예 없으면 감점 요인이 아니므로 만점 처리한다.
function recallScore(jobKeywords: Set<string>, userKeywords: Set<string>): CategoryScore {
  if (jobKeywords.size === 0) return { score: 100, matched: [] };
  const matched = [...jobKeywords].filter((id) => userKeywords.has(id));
  return { score: Math.round((matched.length / jobKeywords.size) * 100), matched };
}

function buildMatchReason(competency: CategoryScore, personality: CategoryScore, preferred: CategoryScore): string {
  const parts: string[] = [];
  if (competency.matched.length > 0) parts.push(`역량: ${competency.matched.join(", ")}`);
  if (personality.matched.length > 0) parts.push(`업무성향: ${personality.matched.join(", ")}`);
  if (preferred.matched.length > 0) parts.push(`우대요건: ${preferred.matched.join(", ")}`);
  return parts.length > 0 ? `일치 키워드 - ${parts.join(" / ")}` : "일치하는 키워드가 없어요.";
}

export function computeMatchScore(profile: UserProfileDraft, job: JobRecord): MatchResult {
  const userSkills = extractUserSkillKeywords(profile);
  const userPersonality = extractUserPersonalityKeywords(profile);

  const competency = recallScore(extractJobCompetencyKeywords(job), userSkills);
  const personality = recallScore(extractJobPersonalityKeywords(job), userPersonality);
  const preferred = recallScore(extractJobPreferredKeywords(job), userSkills);

  const match_rate = Math.round(
    competency.score * WEIGHTS.competency +
      personality.score * WEIGHTS.personality +
      preferred.score * WEIGHTS.preferred
  );

  return {
    match_rate,
    match_reason: buildMatchReason(competency, personality, preferred),
    competency,
    personality,
    preferred,
  };
}
