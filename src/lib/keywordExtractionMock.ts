// ANTHROPIC_API_KEY가 없을 때만 쓰이는 임시 목업.
// 실제 AI 판단 없이 단순 키워드 매칭으로, 인터뷰 답변에서 후보 키워드를 흉내낸다.

const KEYWORD_TRIGGERS: [RegExp, string[]][] = [
  [/회장|리드|이끌|팀장|주도/, ["리더십", "자기주도적"]],
  [/활발|적극/, ["적극적"]],
  [/꼼꼼|세심|디테일/, ["꼼꼼함"]],
  [/책임/, ["책임감"]],
  [/도전|새로운\s?시도|새\s?기술/, ["도전정신"]],
  [/협업|팀워크|함께|소통/, ["협업"]],
  [/분석|데이터/, ["분석력"]],
  [/기획|계획/, ["기획력"]],
  [/끈기|포기하지/, ["끈기"]],
  [/문제.?해결/, ["문제해결력"]],
  [/성장|배우/, ["성장지향"]],
];

export function mockExtractKeywords(answers: string[]): string[] {
  const text = answers.join(" ");
  const found = new Set<string>();
  for (const [pattern, keywords] of KEYWORD_TRIGGERS) {
    if (pattern.test(text)) keywords.forEach((k) => found.add(k));
  }
  return Array.from(found);
}
