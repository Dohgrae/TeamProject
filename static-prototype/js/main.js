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
  personality: () => {
    renderPersonality();
    setupPersonalityFocusCards();
    activateFirstPersonalityCardIfEmpty();
  },
  review: renderReview,
  result: () => startResultScreen(),
};

// ============================================================
// 항목이 여러 장 카드로 나열된 화면(기본 인적사항, 업무 성향 테스트) 공통:
// 클릭/포커스한 카드만 위로 떠오르며 강조되고 나머지는 은은하게 가라앉는 효과
// ============================================================
function setActiveFocusCard(list, card) {
  list
    .querySelectorAll(".focus-card")
    .forEach((c) => c.classList.toggle("active", c === card));
  list.classList.toggle("has-active", !!card);
}

// 카드 바깥(어느 화면의 focus-card-list든)을 클릭하면 강조를 해제한다. 한 번만 등록하면 된다.
let focusCardOutsideClickBound = false;
function bindFocusCardOutsideClick() {
  if (focusCardOutsideClickBound) return;
  focusCardOutsideClickBound = true;
  document.addEventListener(
    "click",
    (e) => {
      if (
        !e.target.closest(".focus-card") &&
        !e.target.closest(".modal-overlay")
      ) {
        document
          .querySelectorAll(".focus-card-list")
          .forEach((list) => setActiveFocusCard(list, null));
      }
    },
    true,
  );
}

// list 하나에 클릭/포커스로 카드를 강조하는 이벤트 위임을 붙인다. 매번 다시 렌더링돼도
// list 자체(컨테이너)는 안 바뀌니 한 번만 바인딩하면 된다.
function bindFocusCardList(list) {
  list.addEventListener(
    "focusin",
    (e) => {
      const card = e.target.closest(".focus-card");
      if (card) setActiveFocusCard(list, card);
    },
    true,
  );

  // 칩/옵션 버튼 클릭은 onToggle 안에서 바로 innerHTML을 다시 그려서 자기 자신을 DOM에서
  // 떼어내 버리므로, 버블링(click)까지 기다리면 e.target의 부모 체인이 이미 끊겨 있다.
  // 그래서 캡처링 단계(버튼 자체 클릭 핸들러보다 먼저)에서 잡아야 한다.
  list.addEventListener(
    "click",
    (e) => {
      const card = e.target.closest(".focus-card");
      if (card) setActiveFocusCard(list, card);
    },
    true,
  );

  bindFocusCardOutsideClick();
}

// ── 기본 인적사항 ──
let basicInfoFocusBound = false;

// 이름/생년월일/성별/전화/이메일 중 아무것도 입력 안 된 완전히 빈 상태로 이 화면에 들어오면,
// 어디부터 채워야 할지 알 수 있게 첫 번째 카드를 기본으로 띄워둔다. 이미 뭔가 활성화돼 있으면(=
// 사용자가 직접 클릭해뒀으면) 건드리지 않는다.
function activateFirstCardIfEmpty() {
  const list = document.getElementById("basic-info-focus-list");
  if (list.querySelector(".focus-card.active")) return;

  const b = AppState.profile.basic_info;
  const isEmpty =
    !b.name &&
    !b.birth_date &&
    !b.gender &&
    !b.contact.phone &&
    !b.contact.email;
  if (isEmpty) setActiveFocusCard(list, list.querySelector(".focus-card"));
}

function setupFocusCards() {
  if (basicInfoFocusBound) return;
  basicInfoFocusBound = true;
  const list = document.querySelector(".focus-card-list");
  list.id = "basic-info-focus-list";
  bindFocusCardList(list);
  setupAutoAdvance(list);
}

// 기본 인적사항 카드 목록에서 index번째 카드를 강조하고 그쪽으로 스크롤한다.
// setupAutoAdvance뿐 아니라, 학력 카드처럼 내용이 동적으로 바뀌는 카드에서도
// (render.js) 같은 방식으로 다음 카드로 넘어가야 해서 전역 함수로 뺐다.
function advanceBasicInfoCard(index) {
  const list = document.getElementById("basic-info-focus-list");
  const target = list?.querySelectorAll(".focus-card")[index];
  if (!target) return;
  setActiveFocusCard(list, target);
  target.scrollIntoView({ behavior: "smooth", block: "center" });
}

// 카드2(학력/전공)는 학력 단계에 따라 물어보는 전공 입력창 개수가 달라지므로,
// "마지막 전공 입력을 마쳤는지"를 매번 다시 판단해야 한다. 필수 전공 입력이
// 모두 채워졌을 때만(= isEducationMajorsComplete) 카드3으로 넘어간다.
function maybeAdvanceAfterEducationMajors() {
  if (isEducationMajorsComplete(AppState.profile)) advanceBasicInfoCard(2);
}

// 각 카드의 마지막 항목을 입력/선택하면, 사용자가 직접 클릭하지 않아도
// 자동으로 다음 카드가 위로 떠오르며 강조되고 화면도 그쪽으로 스크롤된다.
function setupAutoAdvance(list) {
  // 카드1(이름~이메일) 마지막 항목: 이메일
  document
    .getElementById("input-email")
    .addEventListener("blur", () => advanceBasicInfoCard(1));
  // 카드2(학력/전공)는 render.js의 bindEducationMajorSection에서
  // maybeAdvanceAfterEducationMajors()로 처리한다.
  // 카드3(자격증/어학) 마지막 항목: 어학 점수/등급
  // "추가" 버튼을 누르면 그 클릭 자체가 이 입력의 blur를 먼저 발생시키는데, 그 즉시 카드가
  // scrollIntoView로 이동해버리면 클릭 중간에 버튼이 밀려나 첫 클릭이 씹힌 것처럼 보인다.
  // 그래서 "추가" 클릭이 완전히 처리될 시간을 준 뒤에 넘어가도록 살짝 지연시킨다.
  document
    .getElementById("input-lang-score")
    .addEventListener("blur", () => setTimeout(() => advanceBasicInfoCard(3), 200));
  // 칩 클릭은 onToggle 안에서 바로 컨테이너를 다시 그려 자기 자신을 DOM에서 떼어내므로,
  // 여기서도 버블링을 기다리지 않고 캡처링 단계에서 먼저 판단해야 한다.
  // 카드4(기술스택) 마지막 항목: 협업툴·형상관리 칩 (컨테이너에 위임, 안에서 매번 다시 그려지므로)
  document.getElementById("tech-stack-container").addEventListener(
    "click",
    (e) => {
      if (e.target.closest('[id="tech-협업툴_형상관리"]')) advanceBasicInfoCard(4);
    },
    true,
  );
  // 카드5(직무+세부직무) 마지막 항목: 직무 칩 (세부직무는 부가 선택이라 트리거로 안 씀)
  document.getElementById("filter-job-category-chips").addEventListener(
    "click",
    (e) => {
      if (e.target.tagName === "BUTTON") advanceBasicInfoCard(5);
    },
    true,
  );
}

// ── 업무 성향 테스트 ──
let personalityFocusBound = false;

function activateFirstPersonalityCardIfEmpty() {
  const list = document.getElementById("personality-questions");
  if (list.querySelector(".focus-card.active")) return;
  const allUnanswered = AppState.profile.personality_survey.answers.every(
    (a) => a.choice === null,
  );
  if (allUnanswered)
    setActiveFocusCard(list, list.querySelector(".focus-card"));
}

function setupPersonalityFocusCards() {
  const list = document.getElementById("personality-questions");
  if (personalityFocusBound) return;
  personalityFocusBound = true;
  bindFocusCardList(list);
}

// 문항 하나는 버튼 하나 고르는 게 곧 "완료"이므로, 답을 고르면 바로 다음 문항이 떠오른다.
// render.js가 renderPersonality()로 카드를 통째로 다시 그린 "직후"에 호출되므로,
// (bindFocusCardList의 클릭 강조 로직보다 늦게 실행돼도) 새로 그려진 카드에 안전하게 강조를 입힐 수 있다.
function advanceToNextPersonalityCard(answeredQuestionId) {
  const list = document.getElementById("personality-questions");
  const cards = Array.from(list.querySelectorAll(".focus-card"));
  const idx = PERSONALITY_QUESTIONS.findIndex(
    (q) => q.question_id === answeredQuestionId,
  );
  const next = cards[idx + 1];
  if (next) {
    setActiveFocusCard(list, next);
    next.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

// 화면마다 있는 "중간 저장" 버튼. 이미 입력할 때마다 자동 저장되고 있지만,
// 지원자가 눈으로 "저장됐다"는 걸 확인하고 안심할 수 있도록 명시적으로 눌러서 확인시켜준다.
function wireInterimSaveButton(buttonId) {
  const btn = document.getElementById(buttonId);
  const original = btn.textContent;
  btn.addEventListener("click", () => {
    AppState.save();
    btn.textContent = "저장됨 ✓";
    btn.disabled = true;
    setTimeout(() => {
      btn.textContent = original;
      btn.disabled = false;
    }, 1200);
  });
}

// 학력 단계에서 필요로 하는 전공 입력이 전부 채워졌는지 검사한다.
// 고졸(H1)은 전공 입력이 아예 없어 통과, 그 외 단계는 학부 전공이 필수이고
// 석사·박사 전공은 "OO와 동일해요" 체크로 대체될 수 있다.
function isEducationMajorsComplete(profile) {
  const edu = profile.basic_info.education;
  const isFilled = (m) => m.major_category !== "" && m.major_detail.trim() !== "";
  const tiers = educationMajorTiersForLevel(edu.level);
  if (tiers.includes("undergraduate") && !isFilled(edu.undergraduate)) return false;
  if (tiers.includes("graduate") && !(edu.graduate.same_as_undergraduate || isFilled(edu.graduate))) return false;
  if (
    tiers.includes("doctorate") &&
    !(edu.doctorate.same_as_undergraduate || edu.doctorate.same_as_graduate || isFilled(edu.doctorate))
  )
    return false;
  return true;
}

// 필수 항목(이름/출생년월일/학력단계/학력별 전공)만 유효성 검사, 나머지는 비워도 다음 단계로 넘어갈 수 있다.
function isBasicInfoValid() {
  const p = AppState.profile;
  return (
    p.basic_info.name.trim() !== "" &&
    p.basic_info.birth_date !== "" &&
    p.basic_info.education.level !== "" &&
    isEducationMajorsComplete(p)
  );
}

function showScreen(id) {
  document
    .querySelectorAll(".screen")
    .forEach((s) => s.classList.remove("active"));
  document.getElementById(`screen-${id}`).classList.add("active");
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
    document.getElementById("btn-basic-info-next").disabled =
      !isBasicInfoValid();
  });
  document.getElementById("input-birth").addEventListener("input", (e) => {
    p().basic_info.birth_date = e.target.value;
    AppState.save();
    document.getElementById("btn-basic-info-next").disabled =
      !isBasicInfoValid();
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

  // "해외 대학/대학원 졸업"은 매길 점수/등급이 없으므로, 선택하면 점수 입력칸이 필요 없다는 걸
  // 바로 알 수 있도록 placeholder를 바꾸고 비활성화해준다.
  document.getElementById("select-lang-test").addEventListener("change", (e) => {
    const scoreInput = document.getElementById("input-lang-score");
    const isGraduation = e.target.value === "해외 대학/대학원 졸업";
    scoreInput.disabled = isGraduation;
    scoreInput.value = "";
    scoreInput.placeholder = isGraduation ? "점수/등급 필요 없음" : "점수/등급";
  });

  document.getElementById("btn-add-lang").addEventListener("click", () => {
    const scoreInput = document.getElementById("input-lang-score");
    const score = scoreInput.value.trim();
    const test = document.getElementById("select-lang-test").value;
    // "해외 대학/대학원 졸업"은 매길 점수/등급이 없으므로 점수 입력 없이도 추가할 수 있게 한다.
    if (!score && test !== "해외 대학/대학원 졸업") return;
    p().qualifications.languages.push({ test, score });
    AppState.save();
    scoreInput.value = "";
    renderBasicInfo();
  });
}

// ============================================================
// 직장경험 추가: 1) 기간/고용형태 미니 모달 -> 2) 인터뷰 챗봇 모달
// ============================================================
const periodState = {
  employment_type: "정규직",
  start_date: "",
  end_date: null,
};

function openPeriodModal() {
  periodState.employment_type = "정규직";
  periodState.start_date = "";
  periodState.end_date = null;

  const chips = document.getElementById("period-emptype-chips");
  chips.innerHTML = chipGroupHtml(
    WORK_EMPLOYMENT_TYPE_OPTIONS.map((v) => ({ value: v, label: v })),
    [periodState.employment_type],
  );
  chips.querySelectorAll("button").forEach((btn) =>
    btn.addEventListener("click", () => {
      periodState.employment_type = btn.dataset.value;
      chips
        .querySelectorAll("button")
        .forEach((b) => b.classList.toggle("selected", b === btn));
    }),
  );

  document.getElementById("period-start-year").innerHTML = yearOptionsHtml("");
  document.getElementById("period-start-month").innerHTML =
    monthOptionsHtml("");
  document.getElementById("period-end-year").innerHTML = yearOptionsHtml("");
  document.getElementById("period-end-month").innerHTML = monthOptionsHtml("");
  document.getElementById("period-end-year").disabled = false;
  document.getElementById("period-end-month").disabled = false;
  document.getElementById("period-ongoing").checked = false;
  document.getElementById("btn-period-next").disabled = true;

  document.getElementById("period-modal").hidden = false;
}

function closePeriodModal() {
  document.getElementById("period-modal").hidden = true;
}

// ============================================================
// 학내외경험 추가: 1) 유형 미니 모달 -> 2) 인터뷰 챗봇 모달
// ============================================================
const extracurricularTypeState = { type: "프로젝트" };

function openExtracurricularTypeModal() {
  extracurricularTypeState.type = "프로젝트";

  const chips = document.getElementById("extracurricular-type-chips");
  chips.innerHTML = chipGroupHtml(
    EXTRACURRICULAR_TYPE_OPTIONS.map((v) => ({
      value: v,
      label: EXTRACURRICULAR_TYPE_LABELS[v],
    })),
    [extracurricularTypeState.type],
  );
  chips.querySelectorAll("button").forEach((btn) =>
    btn.addEventListener("click", () => {
      extracurricularTypeState.type = btn.dataset.value;
      chips
        .querySelectorAll("button")
        .forEach((b) => b.classList.toggle("selected", b === btn));
    }),
  );

  document.getElementById("extracurricular-type-modal").hidden = false;
}

function closeExtracurricularTypeModal() {
  document.getElementById("extracurricular-type-modal").hidden = true;
}

// ── 인터뷰 챗봇 (직장경험/학내외경험/수상공모전이 공통으로 쓰는 범용 모달) ──
// questions: 이번에 물어볼 질문 세트, onComplete: 4개 다 답하면 호출되는 콜백(answers, keywords)
const interviewState = {
  questions: [],
  answers: [],
  finishing: false,
  onComplete: null,
  visibleCount: 0,
  revealTimer: null,
  animating: false,
};

// 문자열을 안정적인(같은 입력엔 항상 같은 결과) 숫자로 바꿔서 배열에서 하나를 고른다.
// Math.random()을 쓰면 "이전"으로 돌아갔다 다시 렌더링될 때마다 반응 문구가 바뀌어버려서
// 답변 내용 자체를 시드로 쓴다.
function pickStableReply(list, seed) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++)
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return list[hash % list.length];
}

// 답변 내용에 맞는 반응을 고른다 (규칙 기반, KEYWORD_TRIGGERS와 같은 방식).
function buildInterviewReaction(answer) {
  for (const [pattern, replies] of REACTION_TRIGGERS) {
    if (pattern.test(answer)) return pickStableReply(replies, answer);
  }
  return pickStableReply(REACTION_FALLBACKS, answer);
}

// answers 배열만으로 대화 로그를 매번 다시 만든다 — "이전"으로 되돌아가도 항상 일관된 상태가 되도록.
function buildInterviewMessages(questions, answers) {
  const messages = [];
  const total = questions.length;
  for (let i = 0; i < total; i++) {
    const q = questions[i];
    messages.push({ role: "assistant", text: q.text, hint: q.hint });
    if (i < answers.length) {
      messages.push({ role: "user", text: answers[i] });
      messages.push({
        role: "assistant",
        text:
          i < total - 1
            ? buildInterviewReaction(answers[i])
            : "말씀해주셔서 감사해요! 잘 정리해서 저장할게요.",
      });
    } else {
      break; // 아직 답변 안 한 질문에서 멈추고 여기서 입력 대기
    }
  }
  return messages;
}

// questions: WORK_INTERVIEW_QUESTIONS 또는 ACTIVITY_INTERVIEW_QUESTIONS
// onComplete(answers, keywords): 4개 질문에 다 답하고 나면 호출되어 실제 저장을 담당
function openInterviewModal(questions, onComplete) {
  interviewState.questions = questions;
  interviewState.answers = [];
  interviewState.finishing = false;
  interviewState.onComplete = onComplete;
  interviewState.visibleCount = 0;
  interviewState.animating = false;
  clearInterviewRevealTimer();
  renderInterviewMessages();
  document.getElementById("interview-modal").hidden = false;
  document.getElementById("interview-input").value = "";
  document.getElementById("interview-input").focus();
}

function closeInterviewModal() {
  clearInterviewRevealTimer();
  document.getElementById("interview-modal").hidden = true;
}

function clearInterviewRevealTimer() {
  if (interviewState.revealTimer) {
    clearTimeout(interviewState.revealTimer);
    interviewState.revealTimer = null;
  }
}

// 상담사 문장이 시간차를 두고 나오는 동안에는 입력을 막아서, 아직 안 보여준 대화 중간에
// 사용자가 답을 보내 대화 순서가 꼬이는 걸 막는다(전송 버튼을 눌러도 조용히 씹히는 대신
// 아예 비활성화해서 "지금은 기다려야 한다"는 게 눈에 보이게 한다).
function setInterviewInputEnabled(enabled) {
  document.getElementById("interview-input").disabled = !enabled;
  document.querySelector("#interview-form button[type=submit]").disabled = !enabled;
}

// count개의 메시지만 실제로 그린다. showTyping이면 맨 끝에 "입력 중" 점 3개 말풍선을 덧붙인다.
function paintInterviewMessages(messages, count, showTyping) {
  const box = document.getElementById("interview-messages");
  const bubbles = messages
    .slice(0, count)
    .map(
      (m) =>
        `<div class="msg ${m.role}">${m.text}${m.hint ? `<span class="msg-hint">${m.hint}</span>` : ""}</div>`,
    )
    .join("");
  box.innerHTML = showTyping ? bubbles + `<div class="msg-typing"><span></span><span></span><span></span></div>` : bubbles;
  box.scrollTop = box.scrollHeight;
}

// answers 배열이 바뀔 때마다 전체 대화 로그를 다시 계산한다. 상담사가 반응 문장과 다음 질문을
// 동시에 던지면 실제 채팅 같지 않으므로, animate:true면 아직 안 보여준 문장들을 한 번에 다
// 그리지 않고 "입력 중..." 표시 후 하나씩 시간차를 두고 등장시킨다.
// animate:false(모달 열 때/"이전"으로 되돌아갈 때)는 지금까지의 대화를 즉시 그대로 보여준다.
function renderInterviewMessages({ animate = false } = {}) {
  clearInterviewRevealTimer();
  const total = interviewState.questions.length;
  const messages = buildInterviewMessages(interviewState.questions, interviewState.answers);

  document.getElementById("interview-progress").textContent =
    `${Math.min(interviewState.answers.length + 1, total)} / ${total}`;
  document.getElementById("btn-interview-prev").disabled =
    interviewState.answers.length === 0 || interviewState.finishing;

  if (!animate) {
    interviewState.visibleCount = messages.length;
    interviewState.animating = false;
    setInterviewInputEnabled(!interviewState.finishing);
    paintInterviewMessages(messages, messages.length, false);
    return;
  }

  interviewState.animating = true;
  setInterviewInputEnabled(false);
  const revealNext = (i) => {
    if (i >= messages.length) {
      interviewState.visibleCount = messages.length;
      interviewState.animating = false;
      setInterviewInputEnabled(true);
      return;
    }
    const showThisOne = () => {
      paintInterviewMessages(messages, i + 1, false);
      interviewState.visibleCount = i + 1;
      interviewState.revealTimer = setTimeout(() => revealNext(i + 1), messages[i].role === "assistant" ? 450 : 200);
    };
    if (messages[i].role === "assistant") {
      paintInterviewMessages(messages, i, true);
      interviewState.revealTimer = setTimeout(showThisOne, 550);
    } else {
      showThisOne();
    }
  };
  revealNext(Math.min(interviewState.visibleCount, messages.length));
}

function submitInterviewAnswer() {
  const input = document.getElementById("interview-input");
  const answer = input.value.trim();
  if (!answer || interviewState.finishing || interviewState.animating) return;

  interviewState.answers.push(answer);
  input.value = "";

  if (interviewState.answers.length === interviewState.questions.length) {
    interviewState.finishing = true;
    // 모달이 곧 닫히므로 마지막 감사 인사는 채팅 애니메이션 없이 바로 보여준다.
    renderInterviewMessages();
    // 서버가 없으므로 규칙 기반 mock 추출만 사용 (Dohgrae의 keywordExtractionMock과 동일한 방식)
    const keywords = mockExtractKeywords(interviewState.answers);
    const onComplete = interviewState.onComplete;
    setTimeout(() => {
      closeInterviewModal();
      onComplete(interviewState.answers, keywords);
    }, 400);
  } else {
    renderInterviewMessages({ animate: true });
  }
}

// 직전 질문으로 돌아가서 방금 쓴 답변을 입력창에 다시 채워 수정할 수 있게 한다.
function goToPreviousInterviewAnswer() {
  if (interviewState.answers.length === 0 || interviewState.finishing || interviewState.animating) return;
  const lastAnswer = interviewState.answers.pop();
  renderInterviewMessages();
  const input = document.getElementById("interview-input");
  input.value = lastAnswer;
  input.focus();
}

// ============================================================
// 결과 카드 (feature3 이식)
// ============================================================
const resultState = {
  jobs: null,
  currentIndex: 0,
  isFlipped: false,
  error: null,
};

// 공고 원문 인용문을 innerHTML에 그대로 꽂기 전에 이스케이프한다.
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// 공고 원문 발췌용 한 줄이 너무 길면, 하이라이트 구간이 잘리지 않도록 그 주변을 중심으로 잘라낸다.
function truncateAroundHighlight(
  line,
  highlightStart,
  highlightEnd,
  maxLength,
) {
  if (line.length <= maxLength)
    return { text: line, start: highlightStart, end: highlightEnd };
  const highlightLen = highlightEnd - highlightStart;
  const context = Math.max(0, Math.floor((maxLength - highlightLen) / 2));
  let start = Math.max(0, highlightStart - context);
  let end = Math.min(line.length, start + maxLength);
  start = Math.max(0, end - maxLength);
  const prefix = start > 0 ? "…" : "";
  const suffix = end < line.length ? "…" : "";
  return {
    text: prefix + line.slice(start, end) + suffix,
    start: highlightStart - start + prefix.length,
    end: highlightEnd - start + prefix.length,
  };
}

function getMatchComment(score) {
  if (score >= 95) return "천생연분! 뽑아듀오가 응원하는 최고의 궁합이에요 💯💍";
  if (score >= 90) return "심장이 쿵! 이건 운명이에요 🔥";
  if (score >= 85) return "이 케미, 그냥 지나칠 수 없어요 💫";
  if (score >= 80) return "자꾸 생각나는 사이? 이미 시작된 것 같아요 😳";
  if (score >= 71) return "이 정도면 애프터 각! 서로에게 딱이에요 💕";
  if (score >= 61) return "대화가 술술 풀릴 궁합이에요. 적극 추천! 💬";
  if (score >= 51) return "어? 은근 잘 맞는데요? 소개팅 성공 예감 👀";
  if (score >= 41) return "나쁘지 않은 인연! 한 번쯤 만나볼 만해요 ☕";
  if (score >= 31) return "대화는 통할 것 같은데, 케미는 조금 더 지켜봐야겠어요";
  if (score >= 21) return "살짝 관심이 가긴 하는데, 확신은 아직이에요 🤔";
  if (score >= 11) return "아직은 서로 낯설어요. 다른 상대를 좀 더 살펴볼까요?";
  return "이 인연은... 스쳐 지나가는 사이인가 봐요 👋";
}

// 매칭률 구간별로 표정이 다른 큐피 이미지를 보여준다(5=제일 좋아함 ~ 1=제일 시무룩).
function getMascotImage(score) {
  if (score >= 85) return "img/qpi-mascot-tier-5.png";
  if (score >= 70) return "img/qpi-mascot-tier-4.png";
  if (score >= 50) return "img/qpi-mascot-tier-3.png";
  if (score >= 30) return "img/qpi-mascot-tier-2.png";
  return "img/qpi-mascot-tier-1.png";
}

function hashCode(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++)
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  return h;
}

// 카드 상단 배너 색 — job.id 기준으로 고정된 색을 골라 카드마다 자연스럽게 다양한 색이 나오게 한다.
const CARD_BANNER_COLORS = [
  "#16a085",
  "#4a5a6a",
  "#a97142",
  "#7d00b8",
  "#c2185b",
  "#2e7d6e",
];
function getBannerColor(jobId) {
  const idx = Math.abs(hashCode(String(jobId))) % CARD_BANNER_COLORS.length;
  return CARD_BANNER_COLORS[idx];
}

// jobs.json의 deadline은 "2026.07.18" 형식의 점 구분 문자열이다.
function computeDday(deadlineStr) {
  const parts = (deadlineStr || "").split(".").map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) return null;
  const deadline = new Date(parts[0], parts[1] - 1, parts[2]);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  deadline.setHours(0, 0, 0, 0);
  return Math.round((deadline - today) / 86400000);
}

// 앞면 카드 콘텐츠(배너+아바타+본문)를 만든다. 메인 카드와 좌우 미리보기 카드(.card-peek)가
// 이 함수를 그대로 공유하고, .card-peek 쪽은 CSS에서 코멘트/칩/힌트/마감일만 숨겨 축소판으로 보여준다.
function buildCardFrontHtml(job) {
  const dday = computeDday(job.deadline);
  const ddayText = dday === null ? "" : dday >= 0 ? `D-${dday}` : "마감";

  const chips = job.matched_keywords
    .slice(0, 2)
    .map((k) => `<span class="chip-front">${escapeHtml(k)}</span>`);
  if (dday !== null && dday >= 0 && dday <= 14)
    chips.push(`<span class="chip-front chip-meta">마감 임박</span>`);
  if (job.company_size === "D")
    chips.push(`<span class="chip-front chip-meta">성장 단계</span>`);

  return `
    <div class="card-top-badges">
      <span class="card-badge-hiring">● 지금 채용중</span>
      <div class="card-top-right">
        <span class="card-badge-ddate">${ddayText}</span>
        <button type="button" class="card-bookmark-btn" aria-label="관심 공고 저장" aria-pressed="false" tabindex="-1">
          <svg width="16" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
        </button>
      </div>
    </div>
    <div class="card-avatar-wrap">
      <div class="card-avatar">
        <img src="${getMascotImage(job.match_rate)}" alt="큐피" class="card-avatar-mascot" />
      </div>
    </div>
    <div class="card-body">
      <p class="card-company-big">${escapeHtml(job.company_name)}</p>
      <p class="card-position-sub">${escapeHtml(job.job_title)}</p>
      <div class="card-chips-front">${chips.join("")}</div>
      <div class="card-rate-center-wrap">
        <p class="card-rate-big">${job.match_rate}%</p>
        <div class="card-comment-bubble"><p class="card-comment">${getMatchComment(job.match_rate)}</p></div>
      </div>
      <div class="card-info-row">
        <span class="card-info-item">👆 탭해서 상세 보기</span>
        <span class="card-info-divider" aria-hidden="true"></span>
        <span class="card-info-item">지원 마감 📆 ${escapeHtml(job.deadline)}</span>
      </div>
    </div>`;
}

// 현재 카드 좌우로 살짝 보이는 이전/다음 공고 미리보기 카드를 채운다.
function renderCardPeeks() {
  const prevJob =
    resultState.jobs && resultState.currentIndex > 0
      ? resultState.jobs[resultState.currentIndex - 1]
      : null;
  const nextJob =
    resultState.jobs && resultState.currentIndex < resultState.jobs.length - 1
      ? resultState.jobs[resultState.currentIndex + 1]
      : null;
  document.getElementById("card-peek-prev").innerHTML = prevJob
    ? buildCardFrontHtml(prevJob)
    : "";
  document.getElementById("card-peek-next").innerHTML = nextJob
    ? buildCardFrontHtml(nextJob)
    : "";
}

function renderCardDots() {
  const dotsEl = document.getElementById("card-dots");
  if (!resultState.jobs) {
    dotsEl.innerHTML = "";
    return;
  }
  dotsEl.innerHTML = resultState.jobs
    .map(
      (_, i) =>
        `<span class="card-dot ${i === resultState.currentIndex ? "active" : ""}"></span>`,
    )
    .join("");
}

async function startResultScreen() {
  resultState.jobs = null;
  resultState.currentIndex = 0;
  resultState.isFlipped = false;
  resultState.error = null;
  document.getElementById("end-screen").style.display = "none";
  document.getElementById("card-area").style.display = "flex";
  document.getElementById("button-area").style.display = "flex";
  renderResultCard();

  // 매칭 자체는 순식간에 끝나지만, "분석 중" 느낌이 나도록 대기 화면(마스코트·하트·효과음)을
  // 충분히 오래 보여준다. 문구가 2.6초마다 바뀌므로(matchLoading.js) 7.8초 = 정확히 3번 바뀔 시간.
  const minDelay = new Promise((resolve) => setTimeout(resolve, 7800));
  try {
    const [data] = await Promise.all([matchJobs(AppState.profile), minDelay]);
    resultState.jobs = data.results;
  } catch (err) {
    resultState.error = "매칭 결과를 불러오지 못했어요: " + err.message;
  }
  renderResultCard();
}

function renderResultCard(direction = "forward") {
  const front = document.getElementById("card-front");
  const back = document.getElementById("card-back");
  const cardInner = document.getElementById("card-inner");
  const progressArea = document.getElementById("result-progress-area");

  cardInner.classList.remove("flipped");
  resultState.isFlipped = false;

  // 매칭을 기다리는 동안에는 헤더/히어로/조작 버튼을 다 숨기고 대기 카드만 화면 가운데 크게 띄운다.
  document
    .getElementById("screen-result")
    .classList.toggle(
      "is-loading",
      resultState.jobs === null && !resultState.error,
    );

  // 대기 화면(마스코트/하트/효과음)을 벗어나는 모든 경우에 인터벌·오디오를 정리한다.
  stopMatchLoadingAnimation();

  if (resultState.error) {
    front.innerHTML = `<div class="error-state"><span class="state-icon">😥</span><p class="state-title">${resultState.error}</p></div>`;
    progressArea.style.display = "none";
    document.getElementById("button-area").style.display = "none";
    renderCardPeeks();
    renderCardDots();
    return;
  }
  if (resultState.jobs === null) {
    startMatchLoadingAnimation(front, AppState.profile.basic_info.name);
    progressArea.style.display = "none";
    document.getElementById("button-area").style.display = "none";
    renderCardPeeks();
    renderCardDots();
    return;
  }
  if (resultState.jobs.length === 0) {
    front.innerHTML = `<div class="empty-state"><span class="state-icon">🔍</span><p class="state-title">현재 조건에 맞는 공고가 없습니다.</p><p class="state-desc">조건을 변경하거나 잠시 후 다시 시도해보세요.</p></div>`;
    progressArea.style.display = "none";
    document.getElementById("button-area").style.display = "none";
    renderCardPeeks();
    renderCardDots();
    return;
  }
  if (resultState.currentIndex >= resultState.jobs.length) {
    showEndScreen();
    return;
  }

  progressArea.style.display = "flex";
  document.getElementById("button-area").style.display = "flex";
  const userName = AppState.profile.basic_info.name.trim();
  document.getElementById("result-subtitle").textContent = userName
    ? `${userName}님께 꼭 맞는 공고 ${resultState.jobs.length}건을 찾았어요`
    : `꼭 맞는 공고 ${resultState.jobs.length}건을 찾았어요`;
  const job = resultState.jobs[resultState.currentIndex];

  front.innerHTML = buildCardFrontHtml(job);
  front.querySelector(".card-bookmark-btn")?.addEventListener("click", (e) => {
    e.stopPropagation();
    const btn = e.currentTarget;
    const active = btn.classList.toggle("is-active");
    btn.setAttribute("aria-pressed", String(active));
  });
  renderCardPeeks();
  renderCardDots();

  const kw = job.matched_keywords
    .slice(0, 3)
    .map((k) => `<span class="keyword-chip-back">#${escapeHtml(k)}</span>`)
    .join("");
  const reasons = job.match_reasons
    .map((r) => `<li class="reason-item-back">${escapeHtml(r)}</li>`)
    .join("");
  const safeUrl = /^https?:\/\//i.test(job.url) ? job.url : "#";

  // "공고 원문 발췌"는 매칭된 키워드 하나당 그 키워드가 실제로 등장하는 원문 한 줄을
  // (겹치는 부분 하이라이트해서) 각각 보여준다. 매칭 문장을 하나도 못 찾았으면 공고 요약으로 대체.
  const excerptRows =
    job.evidence_list && job.evidence_list.length > 0
      ? job.evidence_list.map(({ line, highlightStart, highlightEnd }) => {
          const truncated = truncateAroundHighlight(
            line,
            highlightStart,
            highlightEnd,
            46,
          );
          const before = escapeHtml(truncated.text.slice(0, truncated.start));
          const highlighted = escapeHtml(
            truncated.text.slice(truncated.start, truncated.end),
          );
          const after = escapeHtml(truncated.text.slice(truncated.end));
          return `<p class="job-excerpt-line">${before}<mark class="match-evidence-highlight">${highlighted}</mark>${after}</p>`;
        })
      : [
          `<p class="job-excerpt-line">${escapeHtml(job.short_description)}</p>`,
        ];

  back.innerHTML = `
    <div class="back-header-row">
      <span class="back-section-title">🏷 매칭 키워드</span>
      <span class="back-match-percent">${job.match_rate}% 일치</span>
    </div>
    <div class="keyword-chips-back">${kw}</div>
    <p class="back-section-title">✨ 이 공고가 잘 맞는 이유</p>
    <ul class="match-reasons-back">${reasons}</ul>
    <div class="job-excerpt-box">
      <p class="job-excerpt-label">공고 원문 발췌</p>
      ${excerptRows.join("")}
    </div>
    <a href="${safeUrl}" target="_blank" rel="noopener noreferrer" class="btn-original" id="btn-original-link">원본 채용공고 보기 →</a>
    <p class="flip-hint-back">👆 탭해서 앞면으로</p>`;
  document
    .getElementById("btn-original-link")
    ?.addEventListener("click", (e) => e.stopPropagation());

  document.getElementById("card-counter").textContent =
    `${resultState.currentIndex + 1} / ${resultState.jobs.length}`;
  document.getElementById("btn-prev-card").disabled =
    resultState.currentIndex === 0;

  const wrap = document.getElementById("card-wrap");
  wrap.classList.remove("entering", "entering-reverse");
  void wrap.offsetWidth;
  wrap.classList.add(direction === "back" ? "entering-reverse" : "entering");
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
  wrap.classList.remove("entering", "entering-reverse");
  setTimeout(() => {
    resultState.currentIndex++;
    wrap.classList.remove("leaving");
    renderResultCard("forward");
  }, 280);
}

// "관심 없어요"로 넘겨버린 공고도 다시 볼 수 있도록, 처음 카드가 아니면 이전 공고로 되돌아간다.
function showPreviousResultCard() {
  if (!resultState.jobs || resultState.currentIndex <= 0) return;
  const wrap = document.getElementById("card-wrap");
  wrap.classList.add("leaving-reverse");
  wrap.classList.remove("entering", "entering-reverse");
  setTimeout(() => {
    resultState.currentIndex--;
    wrap.classList.remove("leaving-reverse");
    renderResultCard("back");
  }, 280);
}

function openCurrentJobLink() {
  const job = resultState.jobs?.[resultState.currentIndex];
  if (job && /^https?:\/\//i.test(job.url))
    window.open(job.url, "_blank", "noopener,noreferrer");
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
    if (!window.confirm("입력한 내용을 전부 지우고 처음부터 다시 시작할까요?"))
      return;
    AppState.reset();
    resultState.jobs = null;
    resultState.currentIndex = 0;
    showScreen("basic-info");
  });

  [
    "btn-save-basic-info",
    "btn-save-work",
    "btn-save-extracurricular",
    "btn-save-awards",
    "btn-save-personality",
  ].forEach(wireInterimSaveButton);

  document
    .getElementById("btn-basic-info-next")
    .addEventListener("click", () => {
      if (isBasicInfoValid()) showScreen("work");
    });
  document
    .getElementById("btn-work-prev")
    .addEventListener("click", () => showScreen("basic-info"));
  document
    .getElementById("btn-work-next")
    .addEventListener("click", () => showScreen("extracurricular"));
  document
    .getElementById("btn-extracurricular-prev")
    .addEventListener("click", () => showScreen("work"));
  document
    .getElementById("btn-extracurricular-next")
    .addEventListener("click", () => showScreen("awards"));
  document
    .getElementById("btn-awards-prev")
    .addEventListener("click", () => showScreen("extracurricular"));
  document
    .getElementById("btn-awards-next")
    .addEventListener("click", () => showScreen("personality"));
  document
    .getElementById("btn-personality-prev")
    .addEventListener("click", () => showScreen("awards"));
  document
    .getElementById("btn-personality-next")
    .addEventListener("click", () => showScreen("result"));
  document
    .getElementById("btn-review-prev")
    .addEventListener("click", () => showScreen("personality"));
  document
    .getElementById("btn-review-restart")
    .addEventListener("click", () => showScreen("basic-info"));
  document
    .getElementById("btn-go-result")
    .addEventListener("click", () => showScreen("result"));
  document
    .getElementById("btn-result-back-to-review")
    .addEventListener("click", () => showScreen("personality"));

  document
    .getElementById("btn-add-work")
    .addEventListener("click", openPeriodModal);
  document
    .getElementById("btn-period-cancel")
    .addEventListener("click", closePeriodModal);

  ["period-start-year", "period-start-month"].forEach((id) => {
    document.getElementById(id).addEventListener("change", () => {
      periodState.start_date = readYearMonthPicker("period-start");
      document.getElementById("btn-period-next").disabled =
        !periodState.start_date;
    });
  });
  ["period-end-year", "period-end-month"].forEach((id) => {
    document.getElementById(id).addEventListener("change", () => {
      periodState.end_date = readYearMonthPicker("period-end");
    });
  });
  document.getElementById("period-ongoing").addEventListener("change", (e) => {
    document.getElementById("period-end-year").disabled = e.target.checked;
    document.getElementById("period-end-month").disabled = e.target.checked;
    periodState.end_date = e.target.checked
      ? null
      : readYearMonthPicker("period-end");
  });
  document.getElementById("btn-period-next").addEventListener("click", () => {
    if (!periodState.start_date) return;
    closePeriodModal();
    document.getElementById("interview-modal-title").textContent =
      "직장 경험 기록하기";
    openInterviewModal(WORK_INTERVIEW_QUESTIONS, (answers, keywords) => {
      AppState.addWorkExperience({ ...periodState }, answers, keywords);
      renderWork();
    });
  });

  document
    .getElementById("btn-interview-cancel")
    .addEventListener("click", closeInterviewModal);
  document
    .getElementById("btn-interview-prev")
    .addEventListener("click", goToPreviousInterviewAnswer);
  document.getElementById("interview-form").addEventListener("submit", (e) => {
    e.preventDefault();
    submitInterviewAnswer();
  });

  // 학내외경험: 유형을 먼저 고르고 나서 인터뷰 챗봇으로 이어진다.
  document
    .getElementById("btn-add-extracurricular")
    .addEventListener("click", openExtracurricularTypeModal);
  document
    .getElementById("btn-extracurricular-type-cancel")
    .addEventListener("click", closeExtracurricularTypeModal);
  document
    .getElementById("btn-extracurricular-type-next")
    .addEventListener("click", () => {
      closeExtracurricularTypeModal();
      document.getElementById("interview-modal-title").textContent =
        "학내외경험 기록하기";
      openInterviewModal(ACTIVITY_INTERVIEW_QUESTIONS, (answers, keywords) => {
        AppState.addExtracurricular(
          extracurricularTypeState.type,
          answers,
          keywords,
        );
        renderExtracurricular();
      });
    });

  // 수상/공모전: 별도 분류가 없어서 바로 인터뷰 챗봇으로 들어간다.
  document.getElementById("btn-add-award").addEventListener("click", () => {
    document.getElementById("interview-modal-title").textContent =
      "수상·공모전 기록하기";
    openInterviewModal(ACTIVITY_INTERVIEW_QUESTIONS, (answers, keywords) => {
      AppState.addAward(answers, keywords);
      renderAwards();
    });
  });

  document
    .getElementById("btn-copy-json")
    .addEventListener("click", async () => {
      await navigator.clipboard.writeText(
        JSON.stringify(AppState.profile, null, 2),
      );
      const btn = document.getElementById("btn-copy-json");
      const original = btn.textContent;
      btn.textContent = "복사됨!";
      setTimeout(() => (btn.textContent = original), 1500);
    });

  // 결과 카드 조작
  document.getElementById("job-card").addEventListener("click", flipResultCard);
  document
    .getElementById("btn-prev-card")
    .addEventListener("click", showPreviousResultCard);
  document
    .getElementById("btn-next-card")
    .addEventListener("click", showNextResultCard);
  document
    .getElementById("card-peek-prev")
    .addEventListener("click", showPreviousResultCard);
  document
    .getElementById("card-peek-next")
    .addEventListener("click", showNextResultCard);
  document
    .getElementById("btn-skip-card")
    .addEventListener("click", showNextResultCard);
  document
    .getElementById("btn-view-card")
    .addEventListener("click", openCurrentJobLink);
  document.getElementById("btn-reset-cards").addEventListener("click", () => {
    resultState.currentIndex = 0;
    resultState.isFlipped = false;
    document.getElementById("end-screen").style.display = "none";
    document.getElementById("card-area").style.display = "flex";
    renderResultCard();
  });
  // 카드 캐러셀만 처음으로 되돌리는 버튼과 달리, 이 버튼은 입력한 내용은 그대로 둔 채
  // 맨 처음 화면(기본 인적사항)으로 이동해서 원하면 처음부터 다시 입력할 수 있게 해준다.
  document
    .getElementById("btn-end-restart-basic-info")
    .addEventListener("click", () => showScreen("basic-info"));

  document.addEventListener("keydown", (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const tag = (document.activeElement?.tagName || "").toLowerCase();
    if (["input", "textarea", "select"].includes(tag)) return;
    if (!document.getElementById("screen-result").classList.contains("active"))
      return;
    if (document.getElementById("end-screen").style.display === "flex") return;

    if (e.key === "ArrowRight") {
      e.preventDefault();
      showNextResultCard();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      showPreviousResultCard();
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
