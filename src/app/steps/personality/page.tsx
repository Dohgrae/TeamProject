"use client";

import { useRouter } from "next/navigation";
import { useProfile } from "@/context/ProfileContext";
import { PERSONALITY_QUESTIONS } from "@/lib/constants";
import type { SurveyResponse } from "@/types/profile";

const RESPONSE_OPTIONS: SurveyResponse[] = ["그렇다", "아니다", "모르겠다"];

export default function PersonalityPage() {
  const router = useRouter();
  const { profile, dispatch } = useProfile();
  const { answers, derived_tag_weights } = profile.personality_survey;

  const answeredCount = answers.filter((a) => a.response !== null).length;
  const topTags = Object.entries(derived_tag_weights)
    .filter(([, w]) => w > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  function findResponse(questionId: number, option: 1 | 2) {
    return answers.find((a) => a.question_id === questionId && a.option === option)?.response ?? null;
  }

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">성향 질문</h1>
        <p className="mt-1 text-sm text-gray-500">
          각 진술이 나와 얼마나 맞는지 응답해주세요. ({answeredCount} / {answers.length})
        </p>
        <div className="mt-2 h-1.5 w-full rounded-full bg-gray-100">
          <div
            className="h-1.5 rounded-full bg-pink-500 transition-all"
            style={{ width: `${(answeredCount / answers.length) * 100}%` }}
          />
        </div>
      </div>

      {topTags.length > 0 && (
        <div className="rounded-xl bg-purple-50 p-4">
          <p className="mb-2 text-xs font-semibold text-purple-600">현재까지 파악된 성향 태그</p>
          <div className="flex flex-wrap gap-2">
            {topTags.map(([tag, weight]) => (
              <span key={tag} className="rounded-full bg-white px-3 py-1 text-xs font-medium text-purple-600">
                #{tag} {weight < 1 ? `(${weight.toFixed(1)})` : ""}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-8">
        {PERSONALITY_QUESTIONS.map((q) => (
          <div key={q.question_id} className="rounded-xl border border-gray-200 p-4">
            <p className="mb-3 font-semibold text-gray-900">
              Q{q.question_id}. {q.question}
            </p>
            <div className="flex flex-col gap-3">
              {q.options.map((opt) => {
                const response = findResponse(q.question_id, opt.option);
                return (
                  <div key={opt.option} className="rounded-lg bg-gray-50 p-3">
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-sm text-gray-800">
                          ({opt.option}) {opt.statement}
                        </p>
                        <p className="mt-1 text-xs text-gray-400">{opt.tags.map((t) => `#${t}`).join(" ")}</p>
                      </div>
                      <div className="flex gap-1">
                        {RESPONSE_OPTIONS.map((r) => (
                          <button
                            key={r}
                            type="button"
                            onClick={() =>
                              dispatch({
                                type: "SET_PERSONALITY_ANSWER",
                                question_id: q.question_id,
                                option: opt.option,
                                response: response === r ? null : r,
                              })
                            }
                            className={`rounded-full border px-3 py-1 text-xs transition ${
                              response === r
                                ? "border-pink-500 bg-pink-500 text-white"
                                : "border-gray-300 bg-white text-gray-600 hover:border-pink-300"
                            }`}
                          >
                            {r}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
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
