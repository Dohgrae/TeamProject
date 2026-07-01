"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useProfile } from "@/context/ProfileContext";

interface MatchResult {
  id: number;
  company_name: string;
  job_title: string;
  url: string;
  match_rate: number;
  matched_keywords: string[];
  major_warning: boolean;
}

interface MatchResponse {
  total_jobs: number;
  passed_count: number;
  results: MatchResult[];
}

export default function ReviewPage() {
  const router = useRouter();
  const { profile } = useProfile();
  const [copied, setCopied] = useState(false);
  const [matchResult, setMatchResult] = useState<MatchResponse | null>(null);
  const [loadingMatch, setLoadingMatch] = useState(false);
  const [matchError, setMatchError] = useState<string | null>(null);

  const json = JSON.stringify(profile, null, 2);

  async function copyJson() {
    await navigator.clipboard.writeText(json);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  async function runMatchPreview() {
    setLoadingMatch(true);
    setMatchError(null);
    try {
      const res = await fetch("/api/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: json,
      });
      if (!res.ok) throw new Error(`API 오류 (${res.status})`);
      setMatchResult(await res.json());
    } catch (err) {
      setMatchError(err instanceof Error ? err.message : "매칭 미리보기 실패");
    } finally {
      setLoadingMatch(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">입력 완료</h1>
        <p className="mt-1 text-sm text-gray-500">
          아래 JSON이 결과 도출 파트(AI 경험분석)로 넘어가는 최종 프로필입니다. 결과 화면 UI는 아직 없어서, 1차
          필터링 + 키워드 매칭 결과를 여기서 미리 확인할 수 있어요.
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

      <pre className="max-h-[400px] overflow-auto rounded-xl bg-gray-900 p-4 text-xs text-green-300">{json}</pre>

      <div className="rounded-xl border border-pink-100 bg-pink-50 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-bold text-gray-900">매칭 미리보기 (1차 필터링 + 키워드 매칭)</h2>
          <button
            type="button"
            onClick={runMatchPreview}
            disabled={loadingMatch}
            className="rounded-full bg-pink-500 px-4 py-1.5 text-sm font-semibold text-white hover:bg-pink-600 disabled:bg-gray-300"
          >
            {loadingMatch ? "계산 중..." : "매칭 실행"}
          </button>
        </div>

        {matchError && <p className="text-sm text-red-500">{matchError}</p>}

        {matchResult && (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-gray-600">
              전체 {matchResult.total_jobs}건 중 필터 통과 {matchResult.passed_count}건 (상위 {matchResult.results.length}건 표시)
            </p>
            {matchResult.results.map((r) => (
              <a
                key={r.id}
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-lg border border-gray-200 bg-white p-3 hover:border-pink-300"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-800">{r.company_name}</span>
                  <span className="rounded-full bg-pink-100 px-2 py-0.5 text-xs font-bold text-pink-600">
                    매칭 {r.match_rate}%
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-600">{r.job_title}</p>
                {r.matched_keywords.length > 0 && (
                  <p className="mt-1 text-xs text-gray-400">{r.matched_keywords.map((k) => `#${k}`).join(" ")}</p>
                )}
              </a>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-center">
        <button
          type="button"
          onClick={() => router.push("/result")}
          className="rounded-full bg-purple-500 px-8 py-3 font-semibold text-white transition hover:bg-purple-600"
        >
          카드로 결과 보기 →
        </button>
      </div>

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
