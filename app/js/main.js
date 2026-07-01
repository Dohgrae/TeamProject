// 뽑아듀오 — 화면 전환/이벤트 연결/초기화 (프레임워크 없이 순수 JS)

const RENDERERS = {
  "basic-info": () => {
    renderBasicInfo();
    setupFocusCards();
    activateFirstCardIfEmpty();
  },
  work: renderWork,
  extracurricular: renderExtracurricular,
  awards: renderAwards,
  personality: renderPersonality,
  review: renderReview,
  result: () => startResultScreen(),
};

// ============================================================
// 기본 인적사항: 전체 항목을 한 화면에 보여주되, 클릭/포커스한 카드만
// 위로 살짝 떠오르며 강조되고 나머지는 은은하게 가라앉는 효과
// ============================================================
let focusCardsBound = false;

function setActiveFocusCard(card) {
  const list = document.getElementById("basic-info-focus-list");
  list.querySelectorAll(".focus-card").forEach((c) => c.classList.toggle("active", c === card));
  list.classList.toggle("has-active", !!card);
}

// 이름/생년월일/성별/전화/이메일 중 아무것도 입력 안 된 완전히 빈 상태로 이 화면에 들어오면,
// 어디부터 채워야 할지 알 수 있게 첫 번째 카드를 기본으로 띄워둔다. 이미 뭔가 활성화돼 있으면(=
// 사용자가 직접 클릭해뒀으면) 건드리지 않는다.
function activateFirstCardIfEmpty() {
  const list = document.getElementById("basic-info-focus-list");
  if (list.querySelector(".focus-card.active")) return;

  const b = AppState.profile.basic_info;
  const isEmpty = !b.name && !b.birth_date && !b.gender && !b.contact.phone && !b.contact.email;
  if (isEmpty) setActiveFocusCard(list.querySelector(".focus-card"));
}

// 이벤트 위임 방식이라 매번 다시 렌더링돼도 한 번만 바인딩하면 된다.
function setupFocusCards() {
  if (focusCardsBound) return;
  focusCardsBound = true;
  const list = document.querySelector(".focus-card-list");
  list.id = "basic-info-focus-list";

  list.addEventListener(
    "focusin",
    (e) => {
      const card = e.target.closest(".focus-card");
      if (card) setActiveFocusCard(card);
    },
    true
  );

  // 칩 버튼 클릭은 onToggle 안에서 바로 innerHTML을 다시 그려서 자기 자신을 DOM에서
  // 떼어내 버리므로, 버블링(click)까지 기다리면 e.target의 부모 체인이 이미 끊겨 있다.
  // 그래서 캡처링 단계(버튼 자체 클릭 핸들러보다 먼저)에서 잡아야 한다.
  list.addEventListener(
    "click",
    (e) => {
      const card = e.target.closest(".focus-card");
      if (card) setActiveFocusCard(card);
    },
    true
  );

  // 카드 바깥을 클릭하면 강조를 해제한다. 이것도 캡처링 단계에서 판단해야
  // 칩 재렌더링으로 e.target이 떨어져나가기 전에 원래 위치를 기준으로 판단할 수 있다.
  document.addEventListener(
    "click",
    (e) => {
      if (!e.target.closest(".focus-card") && !e.target.closest(".modal-overlay")) {
        setActiveFocusCard(null);
      }
    },
    true
  );
}

// 필수 항목(이름/출생년월일/학력단계)만 유효성 검사, 나머지는 비워도 다음 단계로 넘어갈 수 있다.
function isBasicInfoValid() {
  const p = AppState.profile;
  return p.basic_info.name.trim() !== "" && p.basic_info.birth_date !== "" && p.basic_info.education.level !== "";
}

function showScreen(id) {
  document.querySelectorAll(".screen").forEach((s) => s.classList.remove("active"));
  document.getElementById(`screen-${id}`).classList.add("active");
  document.querySelector(".app-header").style.display = id === "result" ? "none" : "flex";
  renderStepNav(id);
  RENDERERS[id]?.();
  window.scrollTo(0, 0);
}

// ============================================================
// 기본 인적사항: 직접 입력 필드 바인딩
// ============================================================
function bindBasicInfoInputs() {
  const p = () => AppState.profile;
  document.getElementById("input-name").addEventListener("input", (e) => {
    p().basic_info.name = e.target.value;
    AppState.save();
    document.getElementById("btn-basic-info-next").disabled = !isBasicInfoValid();
  });
  document.getElementById("input-birth").addEventListener("input", (e) => {
    p().basic_info.birth_date = e.target.value;
    AppState.save();
    document.getElementById("btn-basic-info-next").disabled = !isBasicInfoValid();
  });
  document.getElementById("input-major-detail").addEventListener("input", (e) => {
    p().basic_info.education.major_detail = e.target.value;
    AppState.save();
  });
  document.getElementById("input-phone").addEventListener("input", (e) => {
    p().basic_info.contact.phone = e.target.value;
    AppState.save();
  });
  document.getElementById("input-email").addEventListener("input", (e) => {
    p().basic_info.contact.email = e.target.value;
    AppState.save();
  });

  document.getElementById("btn-add-cert").addEventListener("click", () => {
    const input = document.getElementById("input-cert");
    const value = input.value.trim();
    if (!value) return;
    p().qualifications.certificates.push(value);
    AppState.save();
    input.value = "";
    renderBasicInfo();
  });
  document.getElementById("input-cert").addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      document.getElementById("btn-add-cert").click();
    }
  });

  document.getElementById("btn-add-lang").addEventListener("click", () => {
    const scoreInput = document.getElementById("input-lang-score");
    const score = scoreInput.value.trim();
    if (!score) return;
    const test = document.getElementById("select-lang-test").value;
    p().qualifications.languages.push({ test, score });
    AppState.save();
    scoreInput.value = "";
    renderBasicInfo();
  });
}

// ============================================================
// 직장경험 인터뷰 모달
// ============================================================
const interviewState = { messages: [], answers: [], finishing: false };

function openInterviewModal() {
  interviewState.messages = [{ role: "assistant", text: WORK_INTERVIEW_QUESTIONS[0] }];
  interviewState.answers = [];
  interviewState.finishing = false;
  renderInterviewMessages();
  document.getElementById("interview-modal").hidden = false;
  document.getElementById("interview-input").value = "";
  document.getElementById("interview-input").focus();
}

function closeInterviewModal() {
  document.getElementById("interview-modal").hidden = true;
}

function renderInterviewMessages() {
  const box = document.getElementById("interview-messages");
  box.innerHTML = interviewState.messages.map((m) => `<div class="msg ${m.role}">${m.text}</div>`).join("");
  document.getElementById("interview-progress").textContent = `${Math.min(interviewState.answers.length + 1, WORK_INTERVIEW_QUESTIONS.length)} / ${WORK_INTERVIEW_QUESTIONS.length}`;
  box.scrollTop = box.scrollHeight;
}

function submitInterviewAnswer() {
  const input = document.getElementById("interview-input");
  const answer = input.value.trim();
  if (!answer || interviewState.finishing) return;

  interviewState.answers.push(answer);
  input.value = "";
  interviewState.messages.push({ role: "user", text: answer });

  if (interviewState.answers.length < WORK_INTERVIEW_QUESTIONS.length) {
    const ack = WORK_INTERVIEW_ACKS[Math.floor(Math.random() * WORK_INTERVIEW_ACKS.length)];
    interviewState.messages.push({ role: "assistant", text: ack });
    interviewState.messages.push({ role: "assistant", text: WORK_INTERVIEW_QUESTIONS[interviewState.answers.length] });
    renderInterviewMessages();
  } else {
    interviewState.messages.push({ role: "assistant", text: "말씀해주셔서 감사해요! 잘 정리해서 저장할게요." });
    interviewState.finishing = true;
    renderInterviewMessages();
    // 서버가 없으므로 규칙 기반 mock 추출만 사용 (Dohgrae의 keywordExtractionMock과 동일한 방식)
    const keywords = mockExtractKeywords(interviewState.answers);
    AppState.addWorkExperience(interviewState.answers, keywords);
    setTimeout(() => {
      closeInterviewModal();
      renderWork();
    }, 400);
  }
}

// ============================================================
// 결과 카드 (feature3 이식)
// ============================================================
const resultState = { jobs: null, currentIndex: 0, isFlipped: false, error: null };

function getMatchComment(score) {
  if (score >= 95) return "이건 운명입니다. 놓치지 마세요! 💘";
  if (score >= 90) return "이 정도면 바로 만나봐야 해!";
  if (score >= 85) return "어? 생각보다 진짜 잘 맞아요!";
  if (score >= 80) return "오, 첫 만남 잡아봐도 되겠어요!";
  if (score >= 70) return "나쁘지 않아요! 공고 한 번 보세요!";
  if (score >= 60) return "조금 애매한데, 조건은 더 봐야 할 거 같아요.";
  if (score >= 50) return "끌리는 포인트는 있는데 신중히 보셔야 해요.";
  return "음… 더 좋은 상대가 있을거에요 ^^;;";
}

async function startResultScreen() {
  resultState.jobs = null;
  resultState.currentIndex = 0;
  resultState.isFlipped = false;
  resultState.error = null;
  document.getElementById("end-screen").style.display = "none";
  document.getElementById("card-area").style.display = "block";
  document.getElementById("button-area").style.display = "flex";
  renderResultCard();

  try {
    const data = await matchJobs(AppState.profile);
    resultState.jobs = data.results;
  } catch (err) {
    resultState.error = "매칭 결과를 불러오지 못했어요: " + err.message;
  }
  renderResultCard();
}

function renderResultCard() {
  const front = document.getElementById("card-front");
  const back = document.getElementById("card-back");
  const cardInner = document.getElementById("card-inner");
  const progressArea = document.getElementById("result-progress-area");

  cardInner.classList.remove("flipped");
  resultState.isFlipped = false;

  if (resultState.error) {
    front.innerHTML = `<div class="error-state"><span class="state-icon">😥</span><p class="state-title">${resultState.error}</p></div>`;
    progressArea.style.display = "none";
    document.getElementById("button-area").style.display = "none";
    return;
  }
  if (resultState.jobs === null) {
    front.innerHTML = `<div class="loading-state"><div class="loading-spinner"></div><p class="loading-text">채용공고를 찾는 중이에요...</p></div>`;
    progressArea.style.display = "none";
    return;
  }
  if (resultState.jobs.length === 0) {
    front.innerHTML = `<div class="empty-state"><span class="state-icon">🔍</span><p class="state-title">현재 조건에 맞는 공고가 없습니다.</p><p class="state-desc">조건을 변경하거나 잠시 후 다시 시도해보세요.</p></div>`;
    progressArea.style.display = "none";
    document.getElementById("button-area").style.display = "none";
    return;
  }
  if (resultState.currentIndex >= resultState.jobs.length) {
    showEndScreen();
    return;
  }

  progressArea.style.display = "flex";
  document.getElementById("button-area").style.display = "flex";
  const job = resultState.jobs[resultState.currentIndex];
  const scoreClass = job.match_rate >= 90 ? "score-pct score-green" : job.match_rate < 75 ? "score-pct score-orange" : "score-pct";

  front.innerHTML = `
    <div class="card-top">
      <p class="card-company-big">${job.company_name}</p>
      <p class="card-position-sub">${job.job_title}</p>
    </div>
    <div class="card-score-center">
      <span class="score-heart">❤️</span>
      <span class="${scoreClass}">${job.match_rate}%</span>
      <span class="score-label">${getMatchComment(job.match_rate)}</span>
    </div>
    <p class="flip-hint">탭해서 상세 보기 👆</p>`;

  const kw = job.matched_keywords.map((k) => `<span class="keyword-chip-back">#${k}</span>`).join("");
  const reasons = job.match_reasons.map((r) => `<li class="reason-item-back">${r}</li>`).join("");
  const safeUrl = /^https?:\/\//i.test(job.url) ? job.url : "#";

  back.innerHTML = `
    <p class="back-section-title">🏷 매칭 키워드</p>
    <div class="keyword-chips-back">${kw}</div>
    <p class="back-section-title">✨ 이 공고가 잘 맞는 이유</p>
    <ul class="match-reasons-back">${reasons}</ul>
    <p class="back-deadline">📅 지원 마감 : ${job.deadline}</p>
    <a href="${safeUrl}" target="_blank" rel="noopener noreferrer" class="btn-original" id="btn-original-link">원본 채용공고 보기 →</a>
    <p class="flip-hint-back">탭해서 앞면으로 👆</p>`;
  document.getElementById("btn-original-link")?.addEventListener("click", (e) => e.stopPropagation());

  document.getElementById("card-counter").textContent = `${resultState.currentIndex + 1} / ${resultState.jobs.length}`;
  document.getElementById("result-progress-bar").style.width = `${((resultState.currentIndex + 1) / resultState.jobs.length) * 100}%`;

  const wrap = document.getElementById("card-wrap");
  wrap.classList.remove("entering");
  void wrap.offsetWidth;
  wrap.classList.add("entering");
}

function flipResultCard() {
  const inner = document.getElementById("card-inner");
  resultState.isFlipped = !resultState.isFlipped;
  inner.classList.toggle("flipped", resultState.isFlipped);
}

function showNextResultCard() {
  if (!resultState.jobs) return;
  if (resultState.currentIndex >= resultState.jobs.length - 1) {
    resultState.currentIndex++;
    showEndScreen();
    return;
  }
  const wrap = document.getElementById("card-wrap");
  wrap.classList.add("leaving");
  wrap.classList.remove("entering");
  setTimeout(() => {
    resultState.currentIndex++;
    wrap.classList.remove("leaving");
    renderResultCard();
  }, 280);
}

function openCurrentJobLink() {
  const job = resultState.jobs?.[resultState.currentIndex];
  if (job && /^https?:\/\//i.test(job.url)) window.open(job.url, "_blank", "noopener,noreferrer");
}

function showEndScreen() {
  document.getElementById("card-area").style.display = "none";
  document.getElementById("result-progress-area").style.display = "none";
  document.getElementById("button-area").style.display = "none";
  const endScreen = document.getElementById("end-screen");
  endScreen.style.display = "flex";
  endScreen.setAttribute("aria-hidden", "false");
}

// ============================================================
// 초기화
// ============================================================
document.addEventListener("DOMContentLoaded", () => {
  AppState.load();
  bindBasicInfoInputs();

  document.getElementById("btn-reset-profile").addEventListener("click", () => {
    if (!window.confirm("입력한 내용을 전부 지우고 처음부터 다시 시작할까요?")) return;
    AppState.reset();
    resultState.jobs = null;
    resultState.currentIndex = 0;
    showScreen("basic-info");
  });

  document.getElementById("btn-basic-info-next").addEventListener("click", () => {
    if (isBasicInfoValid()) showScreen("work");
  });
  document.getElementById("btn-work-prev").addEventListener("click", () => showScreen("basic-info"));
  document.getElementById("btn-work-next").addEventListener("click", () => showScreen("extracurricular"));
  document.getElementById("btn-extracurricular-prev").addEventListener("click", () => showScreen("work"));
  document.getElementById("btn-extracurricular-next").addEventListener("click", () => showScreen("awards"));
  document.getElementById("btn-awards-prev").addEventListener("click", () => showScreen("extracurricular"));
  document.getElementById("btn-awards-next").addEventListener("click", () => showScreen("personality"));
  document.getElementById("btn-personality-prev").addEventListener("click", () => showScreen("awards"));
  document.getElementById("btn-personality-next").addEventListener("click", () => showScreen("review"));
  document.getElementById("btn-review-prev").addEventListener("click", () => showScreen("personality"));
  document.getElementById("btn-review-restart").addEventListener("click", () => showScreen("basic-info"));
  document.getElementById("btn-go-result").addEventListener("click", () => showScreen("result"));
  document.getElementById("btn-result-back-to-review").addEventListener("click", () => showScreen("review"));

  document.getElementById("btn-add-work").addEventListener("click", openInterviewModal);
  document.getElementById("btn-interview-cancel").addEventListener("click", closeInterviewModal);
  document.getElementById("interview-form").addEventListener("submit", (e) => {
    e.preventDefault();
    submitInterviewAnswer();
  });

  document.getElementById("btn-add-extracurricular").addEventListener("click", () => {
    AppState.addExtracurricular();
    renderExtracurricular();
  });
  document.getElementById("btn-add-award").addEventListener("click", () => {
    AppState.addAward();
    renderAwards();
  });

  document.getElementById("btn-copy-json").addEventListener("click", async () => {
    await navigator.clipboard.writeText(JSON.stringify(AppState.profile, null, 2));
    const btn = document.getElementById("btn-copy-json");
    const original = btn.textContent;
    btn.textContent = "복사됨!";
    setTimeout(() => (btn.textContent = original), 1500);
  });

  // 결과 카드 조작
  document.getElementById("job-card").addEventListener("click", flipResultCard);
  document.getElementById("btn-flip-card").addEventListener("click", flipResultCard);
  document.getElementById("btn-skip-card").addEventListener("click", showNextResultCard);
  document.getElementById("btn-view-card").addEventListener("click", openCurrentJobLink);
  document.getElementById("btn-reset-cards").addEventListener("click", () => {
    resultState.currentIndex = 0;
    resultState.isFlipped = false;
    document.getElementById("end-screen").style.display = "none";
    document.getElementById("card-area").style.display = "block";
    renderResultCard();
  });

  document.addEventListener("keydown", (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const tag = (document.activeElement?.tagName || "").toLowerCase();
    if (["input", "textarea", "select"].includes(tag)) return;
    if (!document.getElementById("screen-result").classList.contains("active")) return;
    if (document.getElementById("end-screen").style.display === "flex") return;

    if (e.key === "ArrowRight") {
      e.preventDefault();
      showNextResultCard();
    } else if (e.key === " " && tag !== "button" && tag !== "a") {
      e.preventDefault();
      flipResultCard();
    } else if (e.key === "Enter" && tag !== "button" && tag !== "a") {
      e.preventDefault();
      openCurrentJobLink();
    }
  });

  showScreen("basic-info");
});
