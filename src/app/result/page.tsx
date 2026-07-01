"use client";

import { useEffect, useMemo, useState } from "react";
import { useProfile } from "@/context/ProfileContext";
import "./result.css";

interface MatchResult {
  id: number;
  company_name: string;
  job_title: string;
  url: string;
  region: string;
  deadline: string;
  short_description: string;
  match_rate: number;
  matched_keywords: string[];
  match_reasons: string[];
  major_warning: boolean;
}

interface MatchResponse {
  total_jobs: number;
  passed_count: number;
  results: MatchResult[];
}

// 매칭률에 따른 소개팅 앱 스타일 리액션 (feature3/script.js getMatchComment 그대로 이식)
function getMatchComment(score: number): string {
  if (score >= 95) return "이건 운명입니다. 놓치지 마세요! 💘";
  if (score >= 90) return "이 정도면 바로 만나봐야 해!";
  if (score >= 85) return "어? 생각보다 진짜 잘 맞아요!";
  if (score >= 80) return "오, 첫 만남 잡아봐도 되겠어요!";
  if (score >= 70) return "나쁘지 않아요! 공고 한 번 보세요!";
  if (score >= 60) return "조금 애매한데, 조건은 더 봐야 할 거 같아요.";
  if (score >= 50) return "끌리는 포인트는 있는데 신중히 보셔야 해요.";
  return "음… 더 좋은 상대가 있을거에요 ^^;;";
}

export default function ResultPage() {
  const { profile } = useProfile();
  const [jobs, setJobs] = useState<MatchResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [entering, setEntering] = useState(true);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (!profile.meta.draft_id) return;
    fetch("/api/match", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`API 오류 (${res.status})`);
        return res.json();
      })
      .then((data: MatchResponse) => setJobs(data.results))
      .catch((err) => setError(err instanceof Error ? err.message : "매칭 결과를 불러오지 못했어요"));
  }, [profile]);

  const job = jobs?.[currentIndex] ?? null;
  const isEnd = jobs !== null && currentIndex >= jobs.length;

  const scoreClass = useMemo(() => {
    if (!job) return "score-pct";
    if (job.match_rate >= 90) return "score-pct score-green";
    if (job.match_rate < 75) return "score-pct score-orange";
    return "score-pct";
  }, [job]);

  function flipCard() {
    setIsFlipped((f) => !f);
  }

  function showNextCard() {
    if (!jobs) return;
    setLeaving(true);
    setEntering(false);
    setTimeout(() => {
      setCurrentIndex((i) => i + 1);
      setIsFlipped(false);
      setLeaving(false);
      setEntering(true);
    }, 280);
  }

  function openJobLink() {
    if (!job) return;
    if (/^https?:\/\//i.test(job.url)) window.open(job.url, "_blank", "noopener,noreferrer");
  }

  function resetCards() {
    setCurrentIndex(0);
    setIsFlipped(false);
  }

  useEffect(() => {
    function onKeydown(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const tag = (document.activeElement?.tagName || "").toLowerCase();
      if (["input", "textarea", "select"].includes(tag)) return;
      if (isEnd) return;

      if (e.key === "ArrowRight") {
        e.preventDefault();
        showNextCard();
      } else if (e.key === " " && tag !== "button" && tag !== "a") {
        e.preventDefault();
        flipCard();
      } else if (e.key === "Enter" && tag !== "button" && tag !== "a") {
        e.preventDefault();
        openJobLink();
      }
    }
    document.addEventListener("keydown", onKeydown);
    return () => document.removeEventListener("keydown", onKeydown);
  });

  return (
    <div className="result-page">
      <header className="header" role="banner">
        <div className="header-inner">
          <div className="logo">
            <span className="logo-icon" aria-hidden="true">💼</span>
            <span className="logo-text">뽑아듀오</span>
            <span className="logo-tagline">취업도 매칭처럼 💕</span>
          </div>
        </div>
      </header>

      <main className="main" role="main">
        <div className="hero">
          <h1 className="hero-title">오늘의 매칭 결과 💌</h1>
          <p className="hero-sub">경험과 선호 조건에 꼭 맞는 공고를 찾았어요!</p>
        </div>

        {jobs && jobs.length > 0 && !isEnd && (
          <div className="progress-area" aria-label="공고 탐색 진행률">
            <span className="card-counter" aria-live="polite">
              {currentIndex + 1} / {jobs.length}
            </span>
            <div className="progress-bar-wrap" role="progressbar" aria-valuemin={0} aria-valuemax={100}>
              <div className="progress-bar" style={{ width: `${((currentIndex + 1) / jobs.length) * 100}%` }} />
            </div>
          </div>
        )}

        {!isEnd && (
          <div className="card-area">
            <div className={`card-wrap ${entering ? "entering" : ""} ${leaving ? "leaving" : ""}`}>
              <div className="card" onClick={flipCard} role="button" tabIndex={0} aria-label="카드 뒤집기 (스페이스바로도 가능)">
                <div className={`card-inner ${isFlipped ? "flipped" : ""}`}>
                  <div className="card-front">
                    {error && (
                      <div className="error-state">
                        <span className="state-icon" aria-hidden="true">😥</span>
                        <p className="state-title">{error}</p>
                      </div>
                    )}
                    {!error && !jobs && (
                      <div className="loading-state">
                        <div className="loading-spinner" aria-hidden="true" />
                        <p className="loading-text">채용공고를 찾는 중이에요...</p>
                      </div>
                    )}
                    {!error && jobs && jobs.length === 0 && (
                      <div className="empty-state">
                        <span className="state-icon" aria-hidden="true">🔍</span>
                        <p className="state-title">현재 조건에 맞는 공고가 없습니다.</p>
                        <p className="state-desc">조건을 변경하거나 잠시 후 다시 시도해보세요.</p>
                      </div>
                    )}
                    {job && (
                      <>
                        <div className="card-top">
                          <p className="card-company-big">{job.company_name}</p>
                          <p className="card-position-sub">{job.job_title}</p>
                        </div>
                        <div className="card-score-center" aria-label={`매칭률 ${job.match_rate}%`}>
                          <span className="score-heart" aria-hidden="true">❤️</span>
                          <span className={scoreClass}>{job.match_rate}%</span>
                          <span className="score-label">{getMatchComment(job.match_rate)}</span>
                        </div>
                        <p className="flip-hint">탭해서 상세 보기 👆</p>
                      </>
                    )}
                  </div>
                  <div className="card-back">
                    {job && (
                      <>
                        <p className="back-section-title">🏷 매칭 키워드</p>
                        <div className="keyword-chips-back" aria-label="매칭 키워드">
                          {job.matched_keywords.map((k) => (
                            <span key={k} className="keyword-chip-back">
                              #{k}
                            </span>
                          ))}
                        </div>
                        <p className="back-section-title">✨ 이 공고가 잘 맞는 이유</p>
                        <ul className="match-reasons-back">
                          {job.match_reasons.map((r, i) => (
                            <li key={i} className="reason-item-back">
                              {r}
                            </li>
                          ))}
                        </ul>
                        <p className="back-deadline">📅 지원 마감 : {job.deadline}</p>
                        <a
                          href={/^https?:\/\//i.test(job.url) ? job.url : "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-original"
                          onClick={(e) => e.stopPropagation()}
                        >
                          원본 채용공고 보기 →
                        </a>
                        <p className="flip-hint-back">탭해서 앞면으로 👆</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {isEnd && (
          <div className="end-screen" aria-live="polite">
            <div className="end-emoji" aria-hidden="true">🎉</div>
            <h2 className="end-title">
              모든 추천 공고를
              <br />
              확인했어요!
            </h2>
            <p className="end-desc">
              마음에 드는 공고를 찾으셨나요?
              <br />
              저장한 결과에서 다시 확인할 수 있어요.
            </p>
            <button className="btn-reset" onClick={resetCards}>
              🔄 처음으로 돌아가기
            </button>
          </div>
        )}

        {job && !isEnd && (
          <div className="button-area" role="group" aria-label="카드 조작 버튼">
            <button className="btn btn-skip" onClick={showNextCard} aria-label="관심 없어요 — 다음 공고 (오른쪽 방향키)">
              <span className="btn-icon" aria-hidden="true">👎</span>
              <span className="btn-label">관심 없어요</span>
            </button>
            <button className="btn btn-flip" onClick={flipCard} aria-label="카드 뒤집기 — 상세 정보 보기 (스페이스바)">
              <span className="btn-icon" aria-hidden="true">🔄</span>
              <span className="btn-label">카드 뒤집기</span>
            </button>
            <button className="btn btn-view" onClick={openJobLink} aria-label="공고 보기 — 원본 채용공고 열기 (엔터키)">
              <span className="btn-icon" aria-hidden="true">✅</span>
              <span className="btn-label">공고 보기</span>
            </button>
          </div>
        )}

        <p className="sr-only">키보드 단축키: 오른쪽 방향키 — 다음 공고, 스페이스바 — 카드 뒤집기, 엔터키 — 공고 열기</p>
      </main>
    </div>
  );
}
