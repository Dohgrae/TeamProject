import { PERSONALITY_QUESTIONS } from "./constants";
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

// 질문마다 고른 진술(1 또는 2)의 태그만 가중치 1.0으로 반영한다.
// "잘 모르겠다"를 고르거나 아직 답하지 않은 질문은 반영하지 않는다.
export function computeDerivedTagWeights(answers: PersonalityAnswer[]): Record<string, number> {
  const weights: Record<string, number> = {};
  for (const answer of answers) {
    if (answer.choice === null || answer.choice === "unknown") continue;
    const question = PERSONALITY_QUESTIONS.find((q) => q.question_id === answer.question_id);
    const option = question?.options.find((opt) => opt.option === answer.choice);
    if (!option) continue;
    for (const tag of option.tags) {
      weights[tag] = Math.max(weights[tag] ?? 0, 1.0);
    }
  }
  return weights;
}

export function createEmptyPersonalityAnswers(): PersonalityAnswer[] {
  return PERSONALITY_QUESTIONS.map((q) => ({ question_id: q.question_id, choice: null }));
}
