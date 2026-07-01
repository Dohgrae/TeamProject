import keywordDict from "@/keywords.json";
import { extractKeywordIdsFromTexts } from "@/lib/keywordMatch";
import type { UserProfileDraft } from "@/types/profile";

// 역량점수/우대요건점수 매칭에 공통으로 쓰는 사용자 하드스킬 키워드.
// tech_stack/certificates는 이미 표준 라벨(Java, React 등)이라 사전과 직접 대조되고,
// 자기소개성 자유 텍스트(경력 인터뷰 답변, 학내외활동·수상 설명)도 함께 사전 매칭한다.
export function extractUserSkillKeywords(profile: UserProfileDraft): Set<string> {
  const structured = [
    ...Object.values(profile.qualifications.tech_stack).flat(),
    ...profile.qualifications.certificates,
  ];
  const freeText = [
    ...profile.career.work_experiences.flatMap((exp) => exp.answers),
    ...profile.activities.academic_extracurricular.map((item) => item.description),
    ...profile.activities.awards.map((item) => item.description),
  ];
  return extractKeywordIdsFromTexts([structured.join("\n"), freeText.join("\n")], keywordDict.keywords);
}

// 업무성향점수: 성향 설문에서 이미 태그 ID로 도출되어 있으므로 텍스트 매칭 없이 그대로 사용.
export function extractUserPersonalityKeywords(profile: UserProfileDraft): Set<string> {
  return new Set(Object.keys(profile.personality_survey.derived_tag_weights));
}
