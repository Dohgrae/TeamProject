import keywordDict from "@/keywords.json";
import personalityDict from "@/lib/personalityKeywords.json";
import { extractKeywordIdsFromTexts } from "@/lib/keywordMatch";
import type { JobRecord } from "@/types/job";

// 역량점수: 자격요건 + 주요업무 텍스트에서 뽑은 하드스킬 키워드.
export function extractJobCompetencyKeywords(job: JobRecord): Set<string> {
  return extractKeywordIdsFromTexts([job.qualifications, job.main_tasks], keywordDict.keywords);
}

// 우대요건점수: 우대사항 + 우대 자격증/어학기준 텍스트에서 뽑은 하드스킬 키워드.
export function extractJobPreferredKeywords(job: JobRecord): Set<string> {
  return extractKeywordIdsFromTexts(
    [job.preferred_etc, job.preferred_cert, job.preferred_language],
    keywordDict.keywords
  );
}

// 업무성향점수: 인재상 텍스트에서 뽑은 성향 키워드.
export function extractJobPersonalityKeywords(job: JobRecord): Set<string> {
  return extractKeywordIdsFromTexts([job.ideal_person], personalityDict.keywords);
}

// 공고 카드 등에 노출할 수 있는, 사용자와 무관한 정적 키워드 목록(역량+우대 키워드 합집합).
export function extractJobAllKeywords(job: JobRecord): string[] {
  return Array.from(
    new Set([...extractJobCompetencyKeywords(job), ...extractJobPreferredKeywords(job)])
  );
}
