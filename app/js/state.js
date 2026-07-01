// 뽑아듀오 — 전역 상태 (프레임워크 없이 순수 JS 객체 + localStorage)

const STORAGE_KEY = "bbopaduo_user_profile_draft_v3";

function uuid() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function emptyProfile() {
  return {
    basic_info: {
      name: "",
      gender: "",
      birth_date: "",
      education: { level: "", major_category: "", major_detail: "" },
      contact: { phone: "", email: "" },
    },
    // job_subcategory: { M4: "백엔드", ... } 형태로 job_category 코드별 선택된 세부직무를 담는다.
    filters: { region: [], job_category: [], job_subcategory: {}, company_size: [], employment_type: [] },
    qualifications: {
      languages: [],
      certificates: [],
      tech_stack: Object.fromEntries(TECH_STACK_CATEGORY_KEYS.map((k) => [k, []])),
    },
    career: { career_status: "신입", total_career_years: 0, work_experiences: [] },
    activities: { academic_extracurricular: [], awards: [] },
    personality_survey: {
      answers: PERSONALITY_QUESTIONS.map((q) => ({ question_id: q.question_id, choice: null })),
      derived_tag_weights: {},
    },
    meta: { draft_id: "", updated_at: "" },
  };
}

function touchMeta(profile) {
  profile.meta.draft_id = profile.meta.draft_id || uuid();
  profile.meta.updated_at = new Date().toISOString();
  return profile;
}

// 재직 기간을 단순 합산해 총 경력연차를 계산 (겹치는 기간은 단순 합산되는 알려진 단순화).
function computeCareer(workExperiences) {
  if (workExperiences.length === 0) return { career_status: "신입", total_career_years: 0 };
  const now = new Date();
  const nowStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const monthsBetween = (start, end) => {
    const [sy, sm] = start.split("-").map(Number);
    const [ey, em] = end.split("-").map(Number);
    if (!sy || !sm || !ey || !em) return 0;
    return Math.max(0, (ey - sy) * 12 + (em - sm));
  };
  const totalMonths = workExperiences.reduce(
    (sum, exp) => (exp.start_date ? sum + monthsBetween(exp.start_date, exp.end_date || nowStr) : sum),
    0
  );
  return { career_status: "경력", total_career_years: Math.round((totalMonths / 12) * 10) / 10 };
}

// 질문마다 고른 진술(1 또는 2)의 태그만 가중치 1.0으로 반영한다. "잘 모르겠다"/미응답은 반영 안 함.
function computeDerivedTagWeights(answers) {
  const weights = {};
  for (const answer of answers) {
    if (answer.choice === null || answer.choice === "unknown") continue;
    const question = PERSONALITY_QUESTIONS.find((q) => q.question_id === answer.question_id);
    const option = question?.options.find((opt) => opt.option === answer.choice);
    if (!option) continue;
    for (const tag of option.tags) weights[tag] = Math.max(weights[tag] ?? 0, 1.0);
  }
  return weights;
}

// ANTHROPIC_API_KEY 없이(서버 자체가 없으므로) 인터뷰 답변에서 규칙 기반으로 키워드를 뽑는다.
function mockExtractKeywords(answers) {
  const text = answers.join(" ");
  const found = new Set();
  for (const [pattern, keywords] of KEYWORD_TRIGGERS) {
    if (pattern.test(text)) keywords.forEach((k) => found.add(k));
  }
  return Array.from(found);
}

// 세부직무를 문자열 하나(예: "백엔드")로 저장하던 예전 버전의 draft가 localStorage에
// 남아있으면 배열(예: ["백엔드"])로 바꿔준다. 안 바꾸면 matching.js의 .filter() 호출에서
// "필터/데이터.filter is not a function" 오류가 난다.
function migrateProfile(profile) {
  const jobSub = profile?.filters?.job_subcategory;
  if (jobSub && typeof jobSub === "object") {
    for (const code of Object.keys(jobSub)) {
      if (!Array.isArray(jobSub[code])) jobSub[code] = jobSub[code] ? [jobSub[code]] : [];
    }
  }
  return profile;
}

const AppState = {
  profile: null,

  load() {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        this.profile = migrateProfile(JSON.parse(raw));
        return;
      } catch {
        // 손상된 draft는 무시하고 새로 시작
      }
    }
    this.profile = touchMeta(emptyProfile());
    this.save();
  },

  save() {
    touchMeta(this.profile);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.profile));
  },

  // localStorage에 남아있는 이전 입력을 지우고 완전히 초기화된 상태로 되돌린다.
  reset() {
    window.localStorage.removeItem(STORAGE_KEY);
    this.profile = touchMeta(emptyProfile());
    this.save();
  },

  // 배열 토글(선택/해제) 헬퍼 — 필터, 기술스택 등에서 공통으로 사용
  toggleInArray(arr, value) {
    const i = arr.indexOf(value);
    if (i === -1) arr.push(value);
    else arr.splice(i, 1);
    this.save();
  },

  // period = { employment_type, start_date, end_date } — 인터뷰 시작 전 미니 모달에서 먼저 받아온 값
  addWorkExperience(period, answers, keywords) {
    this.profile.career.work_experiences.push({
      id: uuid(),
      employment_type: period.employment_type,
      start_date: period.start_date,
      end_date: period.end_date,
      answers,
      keywords,
    });
    Object.assign(this.profile.career, computeCareer(this.profile.career.work_experiences));
    this.save();
  },

  removeWorkExperience(id) {
    this.profile.career.work_experiences = this.profile.career.work_experiences.filter((e) => e.id !== id);
    Object.assign(this.profile.career, computeCareer(this.profile.career.work_experiences));
    this.save();
  },

  updateWorkExperience(id, patch) {
    const exp = this.profile.career.work_experiences.find((e) => e.id === id);
    if (!exp) return;
    Object.assign(exp, patch);
    Object.assign(this.profile.career, computeCareer(this.profile.career.work_experiences));
    this.save();
  },

  addExtracurricular() {
    this.profile.activities.academic_extracurricular.push({ id: uuid(), type: "프로젝트", description: "" });
    this.save();
  },

  removeExtracurricular(id) {
    this.profile.activities.academic_extracurricular = this.profile.activities.academic_extracurricular.filter(
      (e) => e.id !== id
    );
    this.save();
  },

  addAward() {
    this.profile.activities.awards.push({ id: uuid(), description: "" });
    this.save();
  },

  removeAward(id) {
    this.profile.activities.awards = this.profile.activities.awards.filter((a) => a.id !== id);
    this.save();
  },

  setPersonalityChoice(questionId, choice) {
    const answer = this.profile.personality_survey.answers.find((a) => a.question_id === questionId);
    answer.choice = answer.choice === choice ? null : choice;
    this.profile.personality_survey.derived_tag_weights = computeDerivedTagWeights(
      this.profile.personality_survey.answers
    );
    this.save();
  },
};
