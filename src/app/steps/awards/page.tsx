"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useProfile } from "@/context/ProfileContext";
import { AddExperienceGuideModal } from "@/components/AddExperienceGuideModal";

export default function AwardsPage() {
  const router = useRouter();
  const { profile, dispatch } = useProfile();
  const { awards } = profile.activities;
  const [showGuide, setShowGuide] = useState(false);

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">수상/공모전 경험</h1>
        <p className="mt-1 text-sm text-gray-500">항목을 추가하고 자유롭게 설명해주세요. 없다면 그냥 다음 단계로 넘어가도 돼요.</p>
      </div>

      <section>
        <div className="flex flex-col gap-4">
          {awards.map((item, i) => (
            <div key={item.id} className="rounded-xl border border-gray-200 p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-700">수상/공모전 {i + 1}</span>
                <button
                  type="button"
                  onClick={() => dispatch({ type: "REMOVE_AWARD", id: item.id })}
                  className="text-sm text-gray-400 hover:text-red-500"
                >
                  삭제
                </button>
              </div>
              <textarea
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-pink-500 focus:outline-none"
                rows={3}
                placeholder="수상/공모전 내용을 자유롭게 설명해주세요"
                value={item.description}
                onChange={(e) => dispatch({ type: "UPDATE_AWARD", id: item.id, value: { description: e.target.value } })}
              />
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setShowGuide(true)}
          className="mt-3 w-full rounded-xl border border-dashed border-gray-300 py-2 text-sm text-gray-500 hover:border-pink-400 hover:text-pink-500"
        >
          + 수상/공모전 항목 추가
        </button>
      </section>

      <div className="flex justify-between pt-4">
        <button type="button" onClick={() => router.push("/steps/extracurricular")} className="rounded-full border border-gray-300 px-8 py-3 font-semibold text-gray-600 hover:bg-gray-50">
          이전
        </button>
        <button
          type="button"
          onClick={() => router.push("/steps/personality")}
          className="rounded-full bg-pink-500 px-8 py-3 font-semibold text-white transition hover:bg-pink-600"
        >
          다음 단계
        </button>
      </div>

      {showGuide && (
        <AddExperienceGuideModal
          onConfirm={() => {
            dispatch({ type: "ADD_AWARD" });
            setShowGuide(false);
          }}
          onCancel={() => setShowGuide(false)}
        />
      )}
    </div>
  );
}
