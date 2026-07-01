// =============================================
// 뽑아듀오 — script.js
// =============================================
// 실행 흐름
//   1. 페이지 로드 → loadJobs()
//   2-A. API 성공 → normalizeJobData() → renderCard()
//   2-B. API 실패 → showErrorCard() → 1.8s 후 MOCK_JOBS → renderCard()
//   2-C. 공고 없음 → showEmptyState()
// =============================================


// ============================================================
// § 1. Mock 데이터 (API 실패 시 fallback)
// ============================================================
const MOCK_JOBS = [
  {
    companyName:    "한국국제협력단",
    jobTitle:       "사업기획 및 관리 담당",
    fitScore:       87,
    shortDescription: "글로벌 협력 경험과 문서화 역량이 잘 맞는 공고입니다.",
    matchKeywords:  ["#외국어", "#문서화", "#사업기획", "#공공기관"],
    matchReasons: [
      "사용자의 외국어 역량이 국제협력 업무와 연결됩니다.",
      "B2B 미팅 및 보고서 작성 경험이 사업관리 업무와 잘 맞습니다.",
      "공공기관 선호 조건과 근무 안정성 조건이 일치합니다."
    ],
    location:  "경기 성남시",
    salary:    "기관 내규에 따름",
    deadline:  "2026-07-15",
    originalUrl: "https://example.com/job1"
  },
  {
    companyName:    "한국고용정보원",
    jobTitle:       "고용정보 분석 및 콘텐츠 기획",
    fitScore:       82,
    shortDescription: "데이터 기반 고용시장 분석 경험이 있다면 딱 맞는 공고입니다.",
    matchKeywords:  ["#데이터분석", "#보고서작성", "#취업지원", "#공공기관"],
    matchReasons: [
      "통계 자료 해석 경험이 고용정보 분석 업무에 직접 활용됩니다.",
      "콘텐츠 기획 역량이 취업자 정보 서비스 개선에 연결됩니다.",
      "공공 취업 서비스에 관심 있는 사용자 성향과 기관 미션이 잘 맞습니다."
    ],
    location:  "충북 음성군",
    salary:    "3,500만원 ~ 4,000만원",
    deadline:  "2026-07-20",
    originalUrl: "https://example.com/job2"
  },
  {
    companyName:    "국민건강보험공단",
    jobTitle:       "디지털 혁신 서비스 기획",
    fitScore:       79,
    shortDescription: "공공 디지털 서비스 기획에 관심 있다면 성장 가능성이 높은 공고입니다.",
    matchKeywords:  ["#UX기획", "#디지털전환", "#헬스케어", "#공공기관"],
    matchReasons: [
      "IT 서비스 기획 역량이 공단 디지털 서비스 개선 업무에 활용됩니다.",
      "사용자 중심 사고방식이 민원 서비스 개선 업무와 잘 맞습니다.",
      "안정적인 공공기관 근무를 선호하는 조건과 일치합니다."
    ],
    location:  "강원 원주시",
    salary:    "기관 내규에 따름",
    deadline:  "2026-07-25",
    originalUrl: "https://example.com/job3"
  },
  {
    companyName:    "한국환경공단",
    jobTitle:       "환경정책 지원 및 대외 홍보",
    fitScore:       74,
    shortDescription: "환경 분야 관심과 커뮤니케이션 역량을 동시에 발휘할 수 있는 공고입니다.",
    matchKeywords:  ["#환경", "#홍보기획", "#SNS운영", "#공공기관"],
    matchReasons: [
      "SNS 및 콘텐츠 제작 경험이 환경 홍보 업무에 바로 활용됩니다.",
      "환경·사회 문제에 관심이 높은 가치관과 기관 미션이 일치합니다.",
      "유연한 협업 방식 선호 성향이 조직 문화와 잘 어울립니다."
    ],
    location:  "인천 서구",
    salary:    "3,200만원 ~ 3,800만원",
    deadline:  "2026-08-01",
    originalUrl: "https://example.com/job4"
  },
  {
    companyName:    "한국산업인력공단",
    jobTitle:       "NCS 직업훈련 프로그램 기획",
    fitScore:       71,
    shortDescription: "교육 설계 경험과 직업훈련 현장 이해도가 높다면 강점을 발휘할 수 있습니다.",
    matchKeywords:  ["#교육기획", "#NCS", "#직업훈련", "#공공기관"],
    matchReasons: [
      "교육 자료 제작 및 커리큘럼 설계 경험이 훈련 기획에 연결됩니다.",
      "자격증 취득 이력이 NCS 기반 직무 이해도를 높여줍니다.",
      "체계적인 문서화 역량이 프로그램 보고서 작성에 유리합니다."
    ],
    location:  "울산 중구",
    salary:    "기관 내규에 따름",
    deadline:  "2026-08-10",
    originalUrl: "https://example.com/job5"
  }
];


// ============================================================
// § 2. 상태(State) 변수
// ============================================================
let matchedJobs  = [];   // 현재 표시되는 공고 배열
let currentIndex = 0;    // 현재 카드 인덱스 (0 = 첫 번째)
let isFlipped    = false; // 카드 뒷면 여부


// ============================================================
// § 3. API 데이터 로딩
// ============================================================

async function loadJobs() {
  showLoadingCard();

  try {
    const response = await fetch('/api/jobs');
    const result   = await response.json();

    if (!result.success) throw new Error(result.message || 'API 응답 오류');

    const jobList = extractJobList(result.data);

    if (jobList.length === 0) {
      showEmptyState();
      return;
    }

    matchedJobs = jobList.map(normalizeJobData);
    hideApiNotice();
    console.log(`✅ API 연결 성공: 공고 ${matchedJobs.length}건`);
    renderCard();

  } catch (error) {
    console.warn('[API 연결 실패] Mock 데이터 사용:', error.message);
    showErrorCard('채용공고 데이터를 불러오지 못했습니다.\n샘플 추천 결과를 보여드릴게요.');

    setTimeout(() => {
      matchedJobs = MOCK_JOBS;
      renderCard();
    }, 1800);
  }
}


// ============================================================
// § 4. 데이터 정규화
// ============================================================

// normalizeJobData(apiItem)
// API 원시 응답 한 건 → 카드 공통 구조로 변환
//
// ★ 수정 필요: 사용하는 API의 실제 필드명으로 교체하세요.
function normalizeJobData(apiItem) {

  // ── 기본 필드 추출 (API별 필드명 매핑) ──
  const companyName = val(
    apiItem.instNm              ||  // 알리오(ALIO): 기관명
    apiItem.기관명               ||
    apiItem.company?.companyName,   // 워크넷: 중첩 구조
    '기관명 없음'
  );

  const jobTitle = val(
    apiItem.recrutPbancTtl      ||  // 알리오: 채용공고제목
    apiItem.채용공고제목          ||
    apiItem.job?.wantedTitle,
    '직무명 없음'
  );

  const location = val(
    apiItem.workRgnNm           ||  // 알리오: 근무지역명
    apiItem.근무지역              ||
    apiItem.workplace?.workplaceAddress,
    '지역 미정'
  );

  const salary = val(
    apiItem.acbgCndNm           ||  // 알리오: 급여/학력조건
    apiItem.급여조건              ||
    apiItem.job?.salaryName,
    '기관 내규에 따름'
  );

  const deadline = formatDeadline(
    apiItem.rcptDdlnDt          ||  // 알리오: 접수마감일
    apiItem.마감일               ||
    apiItem.close?.closingDate
  );

  const originalUrl = val(
    apiItem.pbancUrl            ||  // 알리오: 공고 URL
    apiItem.recrutPbancUrl      ||
    apiItem.공고URL,
    '#'
  );

  // ── 한 줄 설명 생성 ──
  const rawDesc = val(
    apiItem.recrutNtcnCn || apiItem.pbancCtnt || apiItem.공고내용,
    ''
  );
  const shortDescription = rawDesc.length > 0
    ? rawDesc.slice(0, 60) + (rawDesc.length > 60 ? '...' : '')
    : `${jobTitle} 직무로, ${companyName}에서 함께할 인재를 찾고 있습니다.`;

  // ── 파생 필드 계산 ──
  const baseJob = { companyName, jobTitle, location, salary, deadline, originalUrl };

  return {
    companyName,
    jobTitle,
    fitScore:      calculateMockFitScore(baseJob),
    shortDescription,
    matchKeywords: createMatchKeywords(baseJob),
    matchReasons:  createMatchReasons(baseJob),
    location,
    salary,
    deadline,
    originalUrl
  };
}

// calculateMockFitScore(job): 70~90점 임시 적합도 계산
// 실제 사용자 프로필 매칭 로직 완성 후 교체 예정
function calculateMockFitScore(job) {
  let score = 70;
  const text = `${job.jobTitle} ${job.companyName}`;

  const rules = [
    { pattern: /국제|글로벌|해외/,        bonus: 5 },
    { pattern: /기획|사업/,              bonus: 4 },
    { pattern: /디지털|IT|정보화|데이터/, bonus: 4 },
    { pattern: /관리|행정|운영/,          bonus: 3 },
    { pattern: /연구|분석|통계/,          bonus: 3 },
    { pattern: /홍보|마케팅|SNS/,         bonus: 2 },
    { pattern: /교육|훈련/,              bonus: 2 },
    { pattern: /청년|인턴/,              bonus: 2 },
  ];

  for (const rule of rules) {
    if (rule.pattern.test(text)) score += rule.bonus;
  }

  if (job.companyName !== '기관명 없음') score += 2;
  if (job.location    !== '지역 미정')   score += 2;

  return Math.min(90, Math.max(70, score));
}

// createMatchKeywords(job): 키워드 태그 정확히 4개 생성
// 구성: #공공기관 / 직무유형 / 지역 / 고용형태
function createMatchKeywords(job) {
  const keywords = [];
  const title    = job.jobTitle || '';
  const location = job.location || '';

  keywords.push('#공공기관');

  if      (/기획|사업/.test(title))              keywords.push('#사업기획');
  else if (/국제|글로벌|협력/.test(title))        keywords.push('#국제협력');
  else if (/디지털|IT|정보|데이터/.test(title))   keywords.push('#디지털');
  else if (/행정|관리|운영/.test(title))          keywords.push('#행정관리');
  else if (/연구|분석|통계/.test(title))          keywords.push('#연구분석');
  else if (/홍보|마케팅|SNS/.test(title))         keywords.push('#홍보기획');
  else if (/교육|훈련/.test(title))              keywords.push('#교육훈련');
  else if (/청년|인턴/.test(title))              keywords.push('#청년인턴');
  else                                            keywords.push('#행정지원');

  if (location && location !== '지역 미정') {
    const region = location
      .replace(/(특별시|광역시|특별자치시|특별자치도)/g, '')
      .trim()
      .split(/\s+/)[0];
    keywords.push(`#${region}`);
  } else {
    keywords.push('#전국');
  }

  if (/인턴/.test(title))     keywords.push('#인턴');
  else if (/계약/.test(title)) keywords.push('#계약직');
  else                         keywords.push('#정규직');

  return keywords.slice(0, 4);
}

// createMatchReasons(job): 매칭 사유 3줄 생성
function createMatchReasons(job) {
  const reasons  = [];
  const title    = job.jobTitle || '';
  const company  = (job.companyName !== '기관명 없음') ? job.companyName : '해당 기관';
  const location = job.location || '';
  const deadline = job.deadline || '마감일 미정';

  // 이유 1: 기관 안정성 (항상)
  reasons.push(
    `${company}은(는) 공공기관으로, 안정적인 근무 환경을 선호하는 사용자와 잘 맞습니다.`
  );

  // 이유 2: 직무 연관성 (공고명 분석)
  if      (/기획|사업/.test(title))
    reasons.push('기획·사업관리 직무로, 문서 작성 및 프로젝트 관리 경험이 있는 사용자에게 적합합니다.');
  else if (/국제|글로벌|협력/.test(title))
    reasons.push('국제협력 직무로, 외국어 역량과 글로벌 커뮤니케이션 경험을 보유한 사용자와 잘 연결됩니다.');
  else if (/디지털|IT|정보|데이터/.test(title))
    reasons.push('디지털·IT 관련 직무로, 기술 역량을 공공 서비스에 활용하고자 하는 사용자와 잘 맞습니다.');
  else if (/행정|관리|운영/.test(title))
    reasons.push('행정·관리 직무로, 꼼꼼한 업무 처리와 문서화 역량을 보유한 사용자에게 적합합니다.');
  else if (/인턴|청년/.test(title))
    reasons.push('청년 인턴십 공고로, 공공기관 실무 경험을 쌓고자 하는 사용자에게 좋은 기회입니다.');
  else
    reasons.push('공고명에 포함된 직무 키워드가 사용자의 경험 태그와 연결될 수 있습니다.');

  // 이유 3: 지역 · 마감일 (항상)
  if (location && location !== '지역 미정') {
    reasons.push(`근무지역(${location})과 지원 마감일(${deadline})을 기준으로 실제 지원 가능성을 확인해보세요.`);
  } else {
    reasons.push(`지원 마감일(${deadline})을 기준으로 실제 지원 가능성을 확인해보세요.`);
  }

  return reasons;
}


// ============================================================
// § 5. 유틸리티
// ============================================================

// val(v, fallback): 값이 비어있으면 fallback 반환
function val(v, fallback = '-') {
  return (v !== undefined && v !== null && String(v).trim() !== '') ? v : fallback;
}

// extractJobList(apiData): API 응답 객체에서 공고 배열 추출
// ★ 수정 필요: 사용하는 API 구조에 맞는 경로를 활성화하세요.
function extractJobList(apiData) {
  return (
    apiData?.result?.recrutPbancList     ||   // 알리오(ALIO)
    apiData?.wantedRoot?.wanted          ||   // 워크넷(Work24)
    apiData?.response?.body?.items?.item ||   // 공공데이터포털
    apiData?.items                       ||
    apiData?.list                        ||
    apiData?.data                        ||
    (Array.isArray(apiData) ? apiData : [])
  );
}

// formatDeadline(rawDate): 날짜 문자열 → "YYYY-MM-DD" 통일
// 예: "20260715" → "2026-07-15"
function formatDeadline(rawDate) {
  if (!rawDate) return '마감일 미정';
  const digits = String(rawDate).replace(/[^0-9]/g, '');
  if (digits.length === 8) {
    return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`;
  }
  return rawDate;
}


// ============================================================
// § 6. UI 상태 렌더링
// ============================================================

// showLoadingCard(): 카드 앞면에 로딩 스피너 표시
function showLoadingCard() {
  const front = document.getElementById('card-front');
  if (!front) return;
  front.innerHTML = `
    <div class="loading-state">
      <div class="loading-spinner" aria-hidden="true"></div>
      <p class="loading-text">채용공고를 찾는 중이에요...</p>
    </div>
  `;
}

// showErrorCard(message): 에러 메시지를 카드 앞면에 표시
function showErrorCard(message) {
  const front = document.getElementById('card-front');
  if (!front) return;
  front.innerHTML = `
    <div class="error-state">
      <span class="state-icon" aria-hidden="true">😥</span>
      <p class="state-title">${message}</p>
      <p class="state-desc">잠시 후 샘플 결과를 보여드릴게요.</p>
    </div>
  `;
}

// showEmptyState(): 공고 없음 상태를 카드 앞면에 표시, 버튼 숨김
function showEmptyState() {
  const front = document.getElementById('card-front');
  if (!front) return;
  front.innerHTML = `
    <div class="empty-state">
      <span class="state-icon" aria-hidden="true">🔍</span>
      <p class="state-title">현재 조건에 맞는 공고가 없습니다.</p>
      <p class="state-desc">조건을 변경하거나 잠시 후 다시 시도해보세요.</p>
    </div>
  `;
  document.getElementById('button-area').style.display  = 'none';
  document.getElementById('progress-area').style.display = 'none';
}

// showApiNotice(message): 카드 위 경고 배너 동적 추가
function showApiNotice(message) {
  let notice = document.getElementById('api-notice');
  if (!notice) {
    notice          = document.createElement('div');
    notice.id       = 'api-notice';
    notice.style.cssText = [
      'width:100%', 'padding:10px 14px', 'border-radius:12px',
      'background:#fff3cd', 'border:1px solid #ffc107',
      'font-size:13px', 'color:#856404', 'font-weight:500',
      'line-height:1.5', 'text-align:center'
    ].join(';');
    const counter = document.getElementById('card-counter');
    counter?.parentNode?.insertBefore(notice, counter);
  }
  notice.textContent   = message;
  notice.style.display = 'block';
}

// hideApiNotice(): 경고 배너 숨기기
function hideApiNotice() {
  const notice = document.getElementById('api-notice');
  if (notice) notice.style.display = 'none';
}


// ============================================================
// § 7. 카드 기능
// ============================================================

// renderCard(): currentIndex의 공고를 앞면/뒷면 모두 그림
function renderCard() {
  const front     = document.getElementById('card-front');
  const back      = document.getElementById('card-back');
  const cardInner = document.getElementById('card-inner');
  const job       = matchedJobs[currentIndex];

  // 항상 앞면 상태로 초기화
  if (isFlipped) {
    cardInner.classList.remove('flipped');
    isFlipped = false;
  }

  // 매칭률 색상 클래스 + 동적 멘트 (getMatchComment 사용)
  const scoreClass = job.fitScore >= 90 ? 'score-pct score-green'
                   : job.fitScore <  75 ? 'score-pct score-orange'
                   : 'score-pct';
  const scoreSub   = getMatchComment(job.fitScore); // 소개팅 앱 스타일 친구 리액션

  // ── 앞면: 회사명(상단) / 매칭률(중앙) ──
  front.innerHTML = `
    <div class="card-top">
      <p class="card-company-big">${escHtml(job.companyName)}</p>
      <p class="card-position-sub">${escHtml(job.jobTitle)}</p>
    </div>
    <div class="card-score-center" aria-label="매칭률 ${job.fitScore}%">
      <span class="score-heart" aria-hidden="true">❤️</span>
      <span class="${scoreClass}">${job.fitScore}%</span>
      <span class="score-label">${scoreSub}</span>
    </div>
    <p class="flip-hint">탭해서 상세 보기 👆</p>
  `;

  // ── 뒷면 ──
  const kw = job.matchKeywords
    .map(k => `<span class="keyword-chip-back">${escHtml(k)}</span>`)
    .join('');

  const reasons = job.matchReasons
    .map(r => `<li class="reason-item-back">${escHtml(r)}</li>`)
    .join('');

  // originalUrl 안전 처리 (javascript: 프로토콜 차단)
  const safeUrl = /^https?:\/\//i.test(job.originalUrl) ? job.originalUrl : '#';

  back.innerHTML = `
    <p class="back-section-title">🏷 매칭 키워드</p>
    <div class="keyword-chips-back" aria-label="매칭 키워드">${kw}</div>
    <p class="back-section-title">✨ 이 공고가 잘 맞는 이유</p>
    <ul class="match-reasons-back">${reasons}</ul>
    <p class="back-deadline">📅 지원 마감 : ${escHtml(job.deadline)}</p>
    <a href="${safeUrl}"
       target="_blank"
       rel="noopener noreferrer"
       class="btn-original"
       onclick="event.stopPropagation()"
       aria-label="${escHtml(job.jobTitle)} 원본 채용공고 새 탭에서 열기">
      원본 채용공고 보기 →
    </a>
    <p class="flip-hint-back">탭해서 앞면으로 👆</p>
  `;

  updateProgress();
  playEnterAnimation();
}

// flipCard(): 앞면 ↔ 뒷면 전환
function flipCard() {
  const inner = document.getElementById('card-inner');
  if (isFlipped) {
    inner.classList.remove('flipped');
    isFlipped = false;
  } else {
    inner.classList.add('flipped');
    isFlipped = true;
  }
}

// showNextCard(): 다음 카드 이동 또는 종료 화면 표시
function showNextCard() {
  if (currentIndex === matchedJobs.length - 1) {
    showEndScreen();
    return;
  }

  const wrap = document.getElementById('card-wrap');
  wrap.classList.add('leaving');
  wrap.classList.remove('entering');

  setTimeout(() => {
    currentIndex++;
    wrap.classList.remove('leaving');
    renderCard();
  }, 280);
}

// updateProgress(): 진행 카운터 및 프로그레스 바 갱신
function updateProgress() {
  const counter = document.getElementById('card-counter');
  const bar     = document.getElementById('progress-bar');
  const wrap    = document.getElementById('progress-bar-wrap');

  if (counter) counter.textContent = `${currentIndex + 1} / ${matchedJobs.length}`;

  if (bar && wrap) {
    const pct = ((currentIndex + 1) / matchedJobs.length) * 100;
    bar.style.width = `${pct}%`;
    wrap.setAttribute('aria-valuenow', Math.round(pct));
  }
}

// openJobLink(): 현재 공고를 새 탭에서 열기
function openJobLink() {
  const job = matchedJobs[currentIndex];
  if (!job) return;
  const safeUrl = /^https?:\/\//i.test(job.originalUrl) ? job.originalUrl : null;
  if (safeUrl) window.open(safeUrl, '_blank', 'noopener,noreferrer');
}

// showEndScreen(): 모든 카드 확인 후 종료 화면 표시
function showEndScreen() {
  const endScreen = document.getElementById('end-screen');
  document.getElementById('card-area').style.display    = 'none';
  document.getElementById('progress-area').style.display = 'none';
  document.getElementById('button-area').style.display  = 'none';
  endScreen.style.display = 'flex';
  endScreen.setAttribute('aria-hidden', 'false');
}

// resetCards(): 첫 번째 카드로 초기화
function resetCards() {
  currentIndex = 0;
  isFlipped    = false;

  const endScreen = document.getElementById('end-screen');
  endScreen.style.display = 'none';
  endScreen.setAttribute('aria-hidden', 'true');

  document.getElementById('card-area').style.display     = 'block';
  document.getElementById('progress-area').style.display = 'flex';
  document.getElementById('button-area').style.display   = 'flex';

  renderCard();
}


// ============================================================
// § 8. 내부 헬퍼
// ============================================================

// getMatchComment(score): 매칭률에 따라 소개팅 앱 스타일 친구 리액션 멘트 반환
// fitScore(0~100) → 단계별 멘트 (소개팅 앱 컨셉)
function getMatchComment(score) {
  if (score >= 95) {
    return "이건 운명입니다. 놓치지 마세요! 💘";
  } else if (score >= 90) {
    return "이 정도면 바로 만나봐야 해!";
  } else if (score >= 85) {
    return "어? 생각보다 진짜 잘 맞아요!";
  } else if (score >= 80) {
    return "오, 첫 만남 잡아봐도 되겠어요!";
  } else if (score >= 70) {
    return "나쁘지 않아요! 공고 한 번 보세요!";
  } else if (score >= 60) {
    return "조금 애매한데, 조건은 더 봐야 할 거 같아요.";
  } else if (score >= 50) {
    return "끌리는 포인트는 있는데 신중히 보셔야 해요.";
  } else {
    return "음… 더 좋은 상대가 있을거에요 ^^;;";
  }
}

// playEnterAnimation(): renderCard() 완료 후 카드 입장 애니메이션
function playEnterAnimation() {
  const wrap = document.getElementById('card-wrap');
  if (!wrap) return;
  wrap.classList.remove('entering');
  void wrap.offsetWidth; // 리플로우로 애니메이션 재시작
  wrap.classList.add('entering');
}

// escHtml(str): XSS 방지용 HTML 이스케이프
function escHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}


// ============================================================
// § 9. 초기화 — 키보드 단축키 + 페이지 로드
// ============================================================
document.addEventListener('DOMContentLoaded', () => {

  // ── 키보드 단축키 ──
  // 오른쪽 방향키 → 다음 카드
  // 스페이스바    → 카드 뒤집기
  // 엔터키        → 공고 보기
  document.addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;

    // 입력 요소에서는 단축키 비활성화
    const tag = (document.activeElement?.tagName || '').toLowerCase();
    if (['input', 'textarea', 'select'].includes(tag)) return;

    // 종료 화면에서는 단축키 비활성화
    const end = document.getElementById('end-screen');
    if (end && end.style.display === 'flex') return;

    switch (e.key) {
      case 'ArrowRight':
        e.preventDefault();
        showNextCard();
        break;
      case ' ':
        // 버튼에 포커스가 있을 때는 버튼 고유 동작 허용
        if (tag !== 'button' && tag !== 'a') {
          e.preventDefault();
          flipCard();
        }
        break;
      case 'Enter':
        // 버튼/링크에 포커스가 있을 때는 고유 동작 허용
        if (tag !== 'button' && tag !== 'a') {
          e.preventDefault();
          openJobLink();
        }
        break;
    }
  });

  // 카드 요소에서 Enter / Space 로 뒤집기
  const card = document.getElementById('job-card');
  if (card) {
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        flipCard();
      }
    });
  }

  // 데이터 로드 시작
  loadJobs();
});
