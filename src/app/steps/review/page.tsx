"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useProfile } from "@/context/ProfileContext";

export default function ReviewPage() {
  const router = useRouter();
  const { profile } = useProfile();
  const [copied, setCopied] = useState(false);

  const json = JSON.stringify(profile, null, 2);

  async function copyJson() {
    await navigator.clipboard.writeText(json);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">입력 완료</h1>
        <p className="mt-1 text-sm text-gray-500">
          아래 JSON이 결과 도출 파트(AI 경험분석)로 넘어가는 최종 프로필입니다. 지금은 결과 파트가 아직 없어서 화면에
          출력만 해요.
        </p>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">draft_id: {profile.meta.draft_id}</span>
        <button
          type="button"
          onClick={copyJson}
          className="rounded-full bg-gray-900 px-4 py-1.5 text-sm text-white hover:bg-gray-700"
        >
          {copied ? "복사됨!" : "JSON 복사"}
        </button>
      </div>

      <pre className="max-h-[500px] overflow-auto rounded-xl bg-gray-900 p-4 text-xs text-green-300">{json}</pre>

      <div className="flex justify-between pt-4">
        <button
          type="button"
          onClick={() => router.push("/steps/personality")}
          className="rounded-full border border-gray-300 px-8 py-3 font-semibold text-gray-600 hover:bg-gray-50"
        >
          이전
        </button>
        <button
          type="button"
          onClick={() => router.push("/")}
          className="rounded-full bg-pink-500 px-8 py-3 font-semibold text-white transition hover:bg-pink-600"
        >
          처음으로
        </button>
      </div>
    </div>
  );
}
