import { PERSONALITY_QUESTIONS, TAG_WEIGHT_BY_RESPONSE } from "./constants";
import type { CareerStatus, PersonalityAnswer, WorkExperience } from "@/types/profile";

function monthsBetween(start: string, end: string): number {
  const [sy, sm] = start.split("-").map(Number);
  const [ey, em] = end.split("-").map(Number);
  if (!sy || !sm || !ey || !em) return 0;
  return Math.max(0, (ey - sy) * 12 + (em - sm));
}

// 재직 기간을 단순 합산해 총 경력연차를 계산한다.
// 기간이 겹치는 다중 재직은 단순 합산되므로 실제보다 클 수 있음 (v2 문서에 명시된 알려진 단순화).
export function computeCareer(workExperiences: WorkExperience[]): {
  career_status: CareerStatus;
  total_career_years: number;
} {
  if (workExperiences.length === 0) {
    return { career_status: "신입", total_career_years: 0 };
  }
  const now = new Date();
  const nowStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const totalMonths = workExperiences.reduce((sum, exp) => {
    if (!exp.start_date) return sum;
    return sum + monthsBetween(exp.start_date, exp.end_date || nowStr);
  }, 0);
  return {
    career_status: "경력",
    total_career_years: Math.round((totalMonths / 12) * 10) / 10,
  };
}

// 그렇다=1.0 / 모르겠다=0.3 / 아니다=0 규칙으로 진술 태그를 가중치로 환산.
// 같은 태그가 여러 진술에 걸쳐 나오면 가장 강한 신호(최댓값)를 채택한다.
export function computeDerivedTagWeights(answers: PersonalityAnswer[]): Record<string, number> {
  const weights: Record<string, number> = {};
  for (const answer of answers) {
    if (!answer.response) continue;
    const weight = TAG_WEIGHT_BY_RESPONSE[answer.response] ?? 0;
    for (const tag of answer.tags) {
      weights[tag] = Math.max(weights[tag] ?? 0, weight);
    }
  }
  return weights;
}

export function createEmptyPersonalityAnswers(): PersonalityAnswer[] {
  return PERSONALITY_QUESTIONS.flatMap((q) =>
    q.options.map((opt) => ({
      question_id: q.question_id,
      option: opt.option,
      tags: opt.tags,
      response: null,
    }))
  );
}
