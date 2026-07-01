// 문항 데이터: 각 문항의 (1)/(2) 응답에 업무 성향 태그를 매칭한다.
// (3) 모르겠음은 태그를 부여하지 않고 "판단 보류"로만 기록한다.
const QUESTIONS = [
  {
    question: "나는 어떤 업무 환경에서 더 힘이 나는가?",
    options: [
      { text: "내 페이스대로 혼자 몰입", tag: "독립적" },
      { text: "사람들과 자주 논의하며 맞춰감", tag: "협동적" },
    ],
  },
  {
    question: "일을 진행하는 나의 방식은?",
    options: [
      { text: "빠르게 실행하고 고쳐나감", tag: "실행력" },
      { text: "다듬어 완성도를 높인 뒤 내놓음", tag: "완성도지향" },
    ],
  },
  {
    question: "나는 어느 쪽에서 더 보람을 느끼는가?",
    options: [
      { text: "풀 문제가 뭔지 정의하는 것", tag: "기획형" },
      { text: "정해진 목표를 끝까지 완수", tag: "책임감" },
    ],
  },
  {
    question: "새로운 방식·도구를 마주하면 나는?",
    options: [
      { text: "겁 없이 먼저 시도", tag: "도전적" },
      { text: "검증된 방식을 선호", tag: "신중함" },
    ],
  },
  {
    question: "나는 어떻게 일할 때 편한가?",
    options: [
      { text: "시키기 전에 스스로 벌임", tag: "자율적" },
      { text: "명확한 방향이 주어졌을 때 잘함", tag: "체계지향" },
    ],
  },
  {
    question: "나는 어디에 더 강한가?",
    options: [
      { text: "전체 구조·큰 그림", tag: "전략적" },
      { text: "디테일을 챙겨 굴러가게 함", tag: "디테일형" },
    ],
  },
  {
    question: "일에서 나를 움직이는 건?",
    options: [
      { text: "변화를 만들고 큰 영향을 줌", tag: "변화지향" },
      { text: "맡은 걸 안정적으로 지켜냄", tag: "안정지향" },
    ],
  },
  {
    question: "AI 같은 새 도구를 대하는 태도는?",
    options: [
      { text: "동료처럼 적극 활용", tag: "AI친화적" },
      { text: "결과를 검증하며 신중히 씀", tag: "신중함" },
    ],
  },
];

const UNSURE_LABEL = "모르겠음";

const state = {
  current: 0,
  answers: [], // { question, choice: 1|2|3, text, tag: string|null }
};

const introScreen = document.getElementById("intro-screen");
const quizScreen = document.getElementById("quiz-screen");
const resultScreen = document.getElementById("result-screen");

const startBtn = document.getElementById("start-btn");
const restartBtn = document.getElementById("restart-btn");
const copyBtn = document.getElementById("copy-btn");

const progressFill = document.getElementById("progress-fill");
const progressText = document.getElementById("progress-text");
const questionText = document.getElementById("question-text");
const optionsEl = document.getElementById("options");

const tagListEl = document.getElementById("tag-list");
const unsureNoteEl = document.getElementById("unsure-note");
const answerListEl = document.getElementById("answer-list");
const resultJsonEl = document.getElementById("result-json");

function showScreen(screen) {
  [introScreen, quizScreen, resultScreen].forEach((s) => s.classList.remove("active"));
  screen.classList.add("active");
}

function startQuiz() {
  state.current = 0;
  state.answers = [];
  showScreen(quizScreen);
  renderQuestion();
}

function renderQuestion() {
  const index = state.current;
  const q = QUESTIONS[index];

  progressFill.style.width = `${(index / QUESTIONS.length) * 100}%`;
  progressText.textContent = `${index + 1} / ${QUESTIONS.length}`;
  questionText.textContent = `Q${index + 1}. ${q.question}`;

  optionsEl.innerHTML = "";

  q.options.forEach((opt, i) => {
    const btn = document.createElement("button");
    btn.className = "option-btn";
    btn.textContent = `(${i + 1}) ${opt.text}`;
    btn.addEventListener("click", () => selectAnswer(i + 1, opt.text, opt.tag));
    optionsEl.appendChild(btn);
  });

  const unsureBtn = document.createElement("button");
  unsureBtn.className = "option-btn unsure";
  unsureBtn.textContent = "(3) 모르겠음";
  unsureBtn.addEventListener("click", () => selectAnswer(3, UNSURE_LABEL, null));
  optionsEl.appendChild(unsureBtn);
}

function selectAnswer(choice, text, tag) {
  state.answers.push({
    question: QUESTIONS[state.current].question,
    choice,
    text,
    tag,
  });

  if (state.current < QUESTIONS.length - 1) {
    state.current += 1;
    renderQuestion();
  } else {
    progressFill.style.width = "100%";
    progressText.textContent = `${QUESTIONS.length} / ${QUESTIONS.length}`;
    renderResult();
  }
}

function renderResult() {
  showScreen(resultScreen);

  const tagCounts = {};
  state.answers.forEach((a) => {
    if (a.tag) {
      tagCounts[a.tag] = (tagCounts[a.tag] || 0) + 1;
    }
  });

  const sortedTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]);

  tagListEl.innerHTML = "";
  sortedTags.forEach(([tag, count]) => {
    const pill = document.createElement("span");
    pill.className = "tag-pill";
    pill.textContent = `#${tag}`;
    if (count > 1) {
      const countEl = document.createElement("span");
      countEl.className = "count";
      countEl.textContent = `x${count}`;
      pill.appendChild(countEl);
    }
    tagListEl.appendChild(pill);
  });

  const unsureCount = state.answers.filter((a) => a.choice === 3).length;
  unsureNoteEl.textContent =
    unsureCount > 0 ? `판단을 보류한 문항이 ${unsureCount}개 있어요.` : "";

  answerListEl.innerHTML = "";
  state.answers.forEach((a, i) => {
    const li = document.createElement("li");
    li.textContent = `Q${i + 1}. ${a.text}${a.tag ? ` (#${a.tag})` : ""}`;
    answerListEl.appendChild(li);
  });

  const resultData = {
    answers: state.answers.map((a, i) => ({
      questionIndex: i + 1,
      question: a.question,
      choice: a.choice,
      tag: a.tag,
    })),
    tags: sortedTags.map(([tag, count]) => ({ tag, count })),
  };
  resultJsonEl.value = JSON.stringify(resultData, null, 2);
}

startBtn.addEventListener("click", startQuiz);
restartBtn.addEventListener("click", startQuiz);

copyBtn.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(resultJsonEl.value);
    copyBtn.textContent = "복사됨!";
    setTimeout(() => (copyBtn.textContent = "JSON 복사하기"), 1500);
  } catch (e) {
    resultJsonEl.select();
    document.execCommand("copy");
  }
});
