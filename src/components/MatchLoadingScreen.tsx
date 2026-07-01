"use client";

import { useEffect, useRef, useState } from "react";

function buildMessages(name: string): string[] {
  return [
    `${name}님과 찰떡궁합인 공고를 찾고 있어요`,
    `${name}님의 이상형 채용공고, 거의 다 왔어요!`,
    `두근두근... ${name}님과 케미가 좋은 곳들을 스캔하는 중이에요`,
    `잠깐만요, ${name}님께 꼭 맞는 인연을 고르고 있어요`,
    `큐피가 ${name}님을 위한 매칭 화살을 쏘고 있어요 💘`,
  ];
}

// 결과 카드가 도착하기 전, 매칭이 진행 중임을 지루하지 않게 보여주는 대기 화면.
export function MatchLoadingScreen({ name }: { name: string }) {
  const displayName = name.trim() || "회원";
  const messages = buildMessages(displayName);

  const [messageIndex, setMessageIndex] = useState(0);
  const [soundOn, setSoundOn] = useState(true);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setMessageIndex((i) => (i + 1) % messages.length);
    }, 2600);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = 0.5;
    if (soundOn) {
      // 브라우저 자동재생 정책으로 막힐 수 있어 실패하면 조용히 음소거 상태로 전환.
      audio.play().catch(() => setSoundOn(false));
    } else {
      audio.pause();
    }
  }, [soundOn]);

  return (
    <div className="match-loading">
      <button
        type="button"
        className="match-loading-sound-toggle"
        onClick={(e) => {
          e.stopPropagation();
          setSoundOn((v) => !v);
        }}
        aria-label={soundOn ? "두근두근 효과음 끄기" : "두근두근 효과음 켜기"}
      >
        {soundOn ? "🔊" : "🔇"}
      </button>

      <div className="match-loading-particles" aria-hidden="true">
        {["p0", "p1", "p2", "p3", "p4", "p5"].map((cls) => (
          <span key={cls} className={`match-loading-particle ${cls}`}>
            💗
          </span>
        ))}
      </div>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/qpi-mascot.png" alt="큐피" className="match-loading-mascot" />

      <span className="match-loading-heart" aria-hidden="true">
        ❤️
      </span>

      <h2 className="match-loading-title">두근두근, 매칭 중이에요</h2>
      <p className="match-loading-message" key={messageIndex}>
        {messages[messageIndex]}
      </p>

      <div className="match-loading-dots" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>

      <audio ref={audioRef} src="/sounds/heartbeat.wav" loop preload="auto" />
    </div>
  );
}
