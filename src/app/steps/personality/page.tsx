"use client";

import { useRouter } from "next/navigation";
import { useProfile } from "@/context/ProfileContext";
import { PERSONALITY_QUESTIONS } from "@/lib/constants";
import type { PersonalityChoice } from "@/types/profile";

export default function PersonalityPage() {
  const router = useRouter();
  const { profile, dispatch } = useProfile();
  const { answers } = profile.personality_survey;

  const answeredCount = answers.filter((a) => a.choice !== null).length;

  function findChoice(questionId: number) {
    return answers.find((a) => a.question_id === questionId)?.choice ?? null;
  }

  function selectChoice(questionId: number, choice: PersonalityChoice) {
    dispatch({ type: "SET_PERSONALITY_CHOICE", question_id: questionId, choice });
  }

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">성향 질문</h1>
        <p className="mt-1 text-sm text-gray-500">
          나와 더 가까운 쪽을 골라주세요. ({answeredCount} / {answers.length})
        </p>
        <div className="mt-2 h-1.5 w-full rounded-full bg-gray-100">
          <div
            className="h-1.5 rounded-full bg-pink-500 transition-all"
            style={{ width: `${(answeredCount / answers.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="flex flex-col gap-8">
        {PERSONALITY_QUESTIONS.map((q) => {
          const choice = findChoice(q.question_id);
          return (
            <div key={q.question_id} className="rounded-xl border border-gray-200 p-4">
              <p className="mb-3 font-semibold text-gray-900">
                Q{q.question_id}. {q.question}
              </p>
              <div className="flex flex-col gap-2">
                {q.options.map((opt) => (
                  <button
                    key={opt.option}
                    type="button"
                    onClick={() => selectChoice(q.question_id, opt.option)}
                    className={`rounded-lg border p-3 text-left text-sm transition ${
                      choice === opt.option
                        ? "border-pink-500 bg-pink-50 text-pink-700"
                        : "border-gray-200 bg-gray-50 text-gray-700 hover:border-pink-300"
                    }`}
                  >
                    {opt.statement}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => selectChoice(q.question_id, "unknown")}
                  className={`rounded-lg border p-3 text-left text-sm transition ${
                    choice === "unknown"
                      ? "border-gray-400 bg-gray-100 text-gray-700"
                      : "border-gray-200 bg-white text-gray-400 hover:border-gray-300"
                  }`}
                >
                  잘 모르겠어요
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-between pt-4">
        <button type="button" onClick={() => router.push("/steps/awards")} className="rounded-full border border-gray-300 px-8 py-3 font-semibold text-gray-600 hover:bg-gray-50">
          이전
        </button>
        <button
          type="button"
          onClick={() => router.push("/steps/review")}
          className="rounded-full bg-pink-500 px-8 py-3 font-semibold text-white transition hover:bg-pink-600"
        >
          완료
        </button>
      </div>
    </div>
  );
}
