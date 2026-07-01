"use client";

import { useRouter } from "next/navigation";
import { useProfile } from "@/context/ProfileContext";
import { ButtonGroup } from "@/components/ButtonGroup";
import { EXTRACURRICULAR_TYPE_LABELS, EXTRACURRICULAR_TYPE_OPTIONS, WORK_EMPLOYMENT_TYPE_OPTIONS } from "@/lib/constants";
import type { EmploymentTypeKR, ExtracurricularType } from "@/types/profile";

export default function CareerPage() {
  const router = useRouter();
  const { profile, dispatch } = useProfile();
  const { career, activities } = profile;

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">경력 및 경험</h1>
        <p className="mt-1 text-sm text-gray-500">
          직장 경험이 있으면 자동으로 &quot;경력&quot;으로 분류되고, 근무기간을 합산해 총 경력연차를 계산해요.
        </p>
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">직장 경험</h2>
          <span className="rounded-full bg-pink-50 px-3 py-1 text-sm font-medium text-pink-600">
            {career.career_status} · 총 {career.total_career_years}년
          </span>
        </div>

        <div className="flex flex-col gap-4">
          {career.work_experiences.map((exp) => (
            <div key={exp.id} className="rounded-xl border border-gray-200 p-4">
              <div className="mb-3 flex items-center justify-between">
                <ButtonGroup
                  options={WORK_EMPLOYMENT_TYPE_OPTIONS.map((v) => ({ value: v, label: v }))}
                  selected={[exp.employment_type]}
                  onToggle={(v) =>
                    dispatch({ type: "UPDATE_WORK_EXPERIENCE", id: exp.id, value: { employment_type: v as EmploymentTypeKR } })
                  }
                />
                <button
                  type="button"
                  onClick={() => dispatch({ type: "REMOVE_WORK_EXPERIENCE", id: exp.id })}
                  className="text-sm text-gray-400 hover:text-red-500"
                >
                  삭제
                </button>
              </div>
              <div className="mb-3 flex flex-wrap items-center gap-3">
                <label className="flex items-center gap-2 text-sm text-gray-600">
                  입사
                  <input
                    type="month"
                    className="rounded-lg border border-gray-300 px-2 py-1 text-sm"
                    value={exp.start_date}
                    onChange={(e) => dispatch({ type: "UPDATE_WORK_EXPERIENCE", id: exp.id, value: { start_date: e.target.value } })}
                  />
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-600">
                  퇴사
                  <input
                    type="month"
                    disabled={exp.end_date === null}
                    className="rounded-lg border border-gray-300 px-2 py-1 text-sm disabled:bg-gray-100"
                    value={exp.end_date ?? ""}
                    onChange={(e) => dispatch({ type: "UPDATE_WORK_EXPERIENCE", id: exp.id, value: { end_date: e.target.value } })}
                  />
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={exp.end_date === null}
                    onChange={(e) =>
                      dispatch({ type: "UPDATE_WORK_EXPERIENCE", id: exp.id, value: { end_date: e.target.checked ? null : "" } })
                    }
                  />
                  재직중
                </label>
              </div>
              <textarea
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-pink-500 focus:outline-none"
                rows={3}
                placeholder="담당 업무/역할을 자유롭게 설명해주세요"
                value={exp.description}
                onChange={(e) => dispatch({ type: "UPDATE_WORK_EXPERIENCE", id: exp.id, value: { description: e.target.value } })}
              />
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => dispatch({ type: "ADD_WORK_EXPERIENCE" })}
          className="mt-3 w-full rounded-xl border border-dashed border-gray-300 py-2 text-sm text-gray-500 hover:border-pink-400 hover:text-pink-500"
        >
          + 직장 경험 추가
        </button>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-bold text-gray-900">학내외경험</h2>
        <div className="flex flex-col gap-4">
          {activities.academic_extracurricular.map((item) => (
            <div key={item.id} className="rounded-xl border border-gray-200 p-4">
              <div className="mb-3 flex items-center justify-between">
                <ButtonGroup
                  options={EXTRACURRICULAR_TYPE_OPTIONS.map((v) => ({ value: v, label: EXTRACURRICULAR_TYPE_LABELS[v] }))}
                  selected={[item.type]}
                  onToggle={(v) => dispatch({ type: "UPDATE_EXTRACURRICULAR", id: item.id, value: { type: v as ExtracurricularType } })}
                />
                <button
                  type="button"
                  onClick={() => dispatch({ type: "REMOVE_EXTRACURRICULAR", id: item.id })}
                  className="text-sm text-gray-400 hover:text-red-500"
                >
                  삭제
                </button>
              </div>
              <textarea
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-pink-500 focus:outline-none"
                rows={3}
                placeholder="경험을 자유롭게 설명해주세요"
                value={item.description}
                onChange={(e) => dispatch({ type: "UPDATE_EXTRACURRICULAR", id: item.id, value: { description: e.target.value } })}
              />
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => dispatch({ type: "ADD_EXTRACURRICULAR" })}
          className="mt-3 w-full rounded-xl border border-dashed border-gray-300 py-2 text-sm text-gray-500 hover:border-pink-400 hover:text-pink-500"
        >
          + 학내외경험 추가
        </button>
      </section>

      <div className="flex justify-between pt-4">
        <button type="button" onClick={() => router.push("/steps/basic-info")} className="rounded-full border border-gray-300 px-8 py-3 font-semibold text-gray-600 hover:bg-gray-50">
          이전
        </button>
        <button
          type="button"
          onClick={() => router.push("/steps/awards")}
          className="rounded-full bg-pink-500 px-8 py-3 font-semibold text-white transition hover:bg-pink-600"
        >
          다음 단계
        </button>
      </div>
    </div>
  );
}
