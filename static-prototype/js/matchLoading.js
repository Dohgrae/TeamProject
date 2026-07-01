// 뽑아듀오 — 매칭 결과를 기다리는 동안 보여줄 대기 화면 (큐피 마스코트 + 하트 박동 + 효과음).
// src/app/result의 React 버전(MatchLoadingScreen.tsx)과 동일한 마크업/타이밍을 순수 JS로 이식.

function buildMatchLoadingMessages(name) {
  return [
    `${name}님과 찰떡궁합인 공고를 찾고 있어요`,
    `${name}님의 이상형 채용공고, 거의 다 왔어요!`,
    `두근두근... ${name}님과 케미가 좋은 곳들을 스캔하는 중이에요`,
    `잠깐만요, ${name}님께 꼭 맞는 인연을 고르고 있어요`,
    `큐피가 ${name}님을 위한 매칭 화살을 쏘고 있어요 💘`,
  ];
}

let matchLoadingTimer = null;

// 대기 화면을 벗어날 때(에러/빈 결과/카드 표시로 전환) 반드시 호출해서 인터벌·오디오를 정리한다.
function stopMatchLoadingAnimation() {
  if (matchLoadingTimer) {
    clearInterval(matchLoadingTimer);
    matchLoadingTimer = null;
  }
}

function startMatchLoadingAnimation(container, name) {
  const displayName = (name || "").trim() || "회원";
  const messages = buildMatchLoadingMessages(displayName);
  let messageIndex = 0;
  let soundOn = true;

  container.innerHTML = `
    <div class="match-loading">
      <button type="button" class="match-loading-sound-toggle" id="match-loading-sound-toggle" aria-label="두근두근 효과음 끄기">🔊</button>
      <div class="match-loading-particles" aria-hidden="true">
        <span class="match-loading-particle p0">💗</span>
        <span class="match-loading-particle p1">💗</span>
        <span class="match-loading-particle p2">💗</span>
        <span class="match-loading-particle p3">💗</span>
        <span class="match-loading-particle p4">💗</span>
        <span class="match-loading-particle p5">💗</span>
      </div>
      <img src="img/qpi-mascot.png" alt="큐피" class="match-loading-mascot" />
      <span class="match-loading-heart" aria-hidden="true">❤️</span>
      <h2 class="match-loading-title">두근두근, 매칭 중이에요</h2>
      <p class="match-loading-message" id="match-loading-message">${messages[0]}</p>
      <div class="match-loading-dots" aria-hidden="true"><span></span><span></span><span></span></div>
      <audio id="match-loading-audio" src="sounds/heartbeat.mp3" loop preload="auto"></audio>
    </div>`;

  const audio = document.getElementById("match-loading-audio");
  const toggleBtn = document.getElementById("match-loading-sound-toggle");
  const messageEl = document.getElementById("match-loading-message");

  function applySoundState() {
    toggleBtn.textContent = soundOn ? "🔊" : "🔇";
    toggleBtn.setAttribute("aria-label", soundOn ? "두근두근 효과음 끄기" : "두근두근 효과음 켜기");
    if (soundOn) {
      audio.volume = 0.5;
      // 브라우저 자동재생 정책으로 막힐 수 있어 실패하면 조용히 음소거 상태로 전환.
      audio.play().catch(() => {
        soundOn = false;
        applySoundState();
      });
    } else {
      audio.pause();
    }
  }
  applySoundState();

  toggleBtn.addEventListener("click", (e) => {
    // 카드 전체에 탭-뒤집기 핸들러가 걸려 있어 stopPropagation 없으면 카드가 같이 뒤집힌다.
    e.stopPropagation();
    soundOn = !soundOn;
    applySoundState();
  });

  matchLoadingTimer = setInterval(() => {
    messageIndex = (messageIndex + 1) % messages.length;
    messageEl.textContent = messages[messageIndex];
  }, 2600);
}
