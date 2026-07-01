"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useProfile } from "@/context/ProfileContext";
import { ButtonGroup } from "@/components/ButtonGroup";
import { AddExperienceGuideModal } from "@/components/AddExperienceGuideModal";
import { EXTRACURRICULAR_TYPE_LABELS, EXTRACURRICULAR_TYPE_OPTIONS } from "@/lib/constants";
import type { ExtracurricularType } from "@/types/profile";

export default function ExtracurricularPage() {
  const router = useRouter();
  const { profile, dispatch } = useProfile();
  const { academic_extracurricular } = profile.activities;
  const [showGuide, setShowGuide] = useState(false);

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">학내외경험</h1>
        <p className="mt-1 text-sm text-gray-500">대회활동, 학생회, 동아리, 아르바이트 등 경험을 자유롭게 적어주세요.</p>
      </div>

      <section>
        <div className="flex flex-col gap-4">
          {academic_extracurricular.map((item) => (
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
          onClick={() => setShowGuide(true)}
          className="mt-3 w-full rounded-xl border border-dashed border-gray-300 py-2 text-sm text-gray-500 hover:border-pink-400 hover:text-pink-500"
        >
          + 학내외경험 추가
        </button>
      </section>

      <div className="flex justify-between pt-4">
        <button type="button" onClick={() => router.push("/steps/work")} className="rounded-full border border-gray-300 px-8 py-3 font-semibold text-gray-600 hover:bg-gray-50">
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

      {showGuide && (
        <AddExperienceGuideModal
          onConfirm={() => {
            dispatch({ type: "ADD_EXTRACURRICULAR" });
            setShowGuide(false);
          }}
          onCancel={() => setShowGuide(false)}
        />
      )}
    </div>
  );
}
