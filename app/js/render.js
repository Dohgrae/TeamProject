// 뽑아듀오 — 화면별 렌더링 함수 (DOM을 직접 그린다, 프레임워크 없음)

function chipGroupHtml(options, selectedValues) {
  return options
    .map(
      (opt) =>
        `<button type="button" data-value="${opt.value}" class="${selectedValues.includes(opt.value) ? "selected" : ""}">${opt.label}</button>`
    )
    .join("");
}

function bindChipGroup(containerId, options, getSelected, onToggle) {
  const el = document.getElementById(containerId);
  el.innerHTML = chipGroupHtml(options, getSelected());
  el.querySelectorAll("button").forEach((btn) => {
    btn.addEventListener("click", () => {
      onToggle(btn.dataset.value);
    });
  });
}

// ============================================================
// 상단 스텝 네비게이션
// ============================================================
function renderStepNav(currentScreenId) {
  const nav = document.getElementById("step-nav");
  const currentIndex = WIZARD_SCREENS.findIndex((s) => s.id === currentScreenId);
  nav.innerHTML = WIZARD_SCREENS.map((s, i) => {
    const cls = i === currentIndex ? "active" : i < currentIndex ? "done" : "";
    return `<span class="step ${cls}"><span class="step-dot">${i + 1}</span>${s.label}</span>`;
  }).join('<span style="color:#e5e7eb">—</span>');
}

// ============================================================
// 1. 기본 인적사항
// ============================================================
function renderBasicInfo() {
  const p = AppState.profile;

  document.getElementById("input-name").value = p.basic_info.name;
  document.getElementById("input-birth").value = p.basic_info.birth_date;
  document.getElementById("input-major-detail").value = p.basic_info.education.major_detail;
  document.getElementById("input-phone").value = p.basic_info.contact.phone;
  document.getElementById("input-email").value = p.basic_info.contact.email;

  const GENDER_OPTIONS = [
    { value: "male", label: "남성" },
    { value: "female", label: "여성" },
    { value: "other", label: "기타" },
    { value: "prefer_not_to_say", label: "응답 안함" },
  ];
  bindChipGroup("gender-chips", GENDER_OPTIONS, () => (p.basic_info.gender ? [p.basic_info.gender] : []), (v) => {
    p.basic_info.gender = p.basic_info.gender === v ? "" : v;
    AppState.save();
    renderBasicInfo();
  });

  bindChipGroup(
    "education-level-chips",
    EDUCATION_LEVEL_OPTIONS,
    () => (p.basic_info.education.level ? [p.basic_info.education.level] : []),
    (v) => {
      p.basic_info.education.level = p.basic_info.education.level === v ? "" : v;
      AppState.save();
      renderBasicInfo();
    }
  );

  bindChipGroup(
    "major-category-chips",
    MAJOR_CATEGORY_OPTIONS,
    () => (p.basic_info.education.major_category ? [p.basic_info.education.major_category] : []),
    (v) => {
      p.basic_info.education.major_category = p.basic_info.education.major_category === v ? "" : v;
      AppState.save();
      renderBasicInfo();
    }
  );

  // 자격증
  const certList = document.getElementById("cert-list");
  certList.innerHTML = p.qualifications.certificates
    .map((c, i) => `<span class="tag">${c}<button type="button" data-index="${i}">×</button></span>`)
    .join("");
  certList.querySelectorAll("button").forEach((btn) =>
    btn.addEventListener("click", () => {
      p.qualifications.certificates.splice(Number(btn.dataset.index), 1);
      AppState.save();
      renderBasicInfo();
    })
  );

  // 어학
  const langSelect = document.getElementById("select-lang-test");
  if (!langSelect.dataset.filled) {
    langSelect.innerHTML = LANGUAGE_TEST_OPTIONS.map((t) => `<option value="${t}">${t}</option>`).join("");
    langSelect.dataset.filled = "1";
  }
  const langList = document.getElementById("lang-list");
  langList.innerHTML = p.qualifications.languages
    .map((l, i) => `<span class="tag">${l.test} ${l.score}<button type="button" data-index="${i}">×</button></span>`)
    .join("");
  langList.querySelectorAll("button").forEach((btn) =>
    btn.addEventListener("click", () => {
      p.qualifications.languages.splice(Number(btn.dataset.index), 1);
      AppState.save();
      renderBasicInfo();
    })
  );

  // 기술스택
  const techContainer = document.getElementById("tech-stack-container");
  techContainer.innerHTML = TECH_STACK_CATEGORIES.map(
    (cat) => `<div class="tech-category"><p class="tech-category-label">${cat.label}</p><div class="chip-group" id="tech-${cat.key}"></div></div>`
  ).join("");
  TECH_STACK_CATEGORIES.forEach((cat) => {
    bindChipGroup(
      `tech-${cat.key}`,
      cat.options.map((o) => ({ value: o, label: o })),
      () => p.qualifications.tech_stack[cat.key],
      (v) => {
        AppState.toggleInArray(p.qualifications.tech_stack[cat.key], v);
        renderBasicInfo();
      }
    );
  });

  // 필터
  bindChipGroup("filter-region-chips", REGION_OPTIONS, () => p.filters.region, (v) => {
    AppState.toggleInArray(p.filters.region, v);
    renderBasicInfo();
  });
  bindChipGroup("filter-job-category-chips", JOB_CATEGORY_OPTIONS, () => p.filters.job_category, (v) => {
    AppState.toggleInArray(p.filters.job_category, v);
    renderBasicInfo();
  });
  renderJobSubcategories();
  bindChipGroup("filter-company-size-chips", COMPANY_SIZE_OPTIONS, () => p.filters.company_size, (v) => {
    AppState.toggleInArray(p.filters.company_size, v);
    renderBasicInfo();
  });
  bindChipGroup("filter-employment-type-chips", EMPLOYMENT_TYPE_OPTIONS, () => p.filters.employment_type, (v) => {
    AppState.toggleInArray(p.filters.employment_type, v);
    renderBasicInfo();
  });

  if (typeof isBasicInfoValid === "function") {
    document.getElementById("btn-basic-info-next").disabled = !isBasicInfoValid();
  }
}

// 직무를 하나 이상 고르면, 고른 직무마다 세부직무 선택 칩(전체 포함)을 아래에 띄운다.
function renderJobSubcategories() {
  const p = AppState.profile;
  const container = document.getElementById("job-subcategory-container");

  // 선택 해제된 직무의 세부직무 값은 정리
  Object.keys(p.filters.job_subcategory).forEach((code) => {
    if (!p.filters.job_category.includes(code)) delete p.filters.job_subcategory[code];
  });

  if (p.filters.job_category.length === 0) {
    container.innerHTML = "";
    return;
  }

  container.innerHTML = p.filters.job_category
    .map(
      (code) =>
        `<div class="job-subcategory-group">
          <p class="tech-category-label">${JOB_CATEGORY_OPTIONS.find((o) => o.value === code)?.label ?? code} 세부직무</p>
          <div class="chip-group" id="job-subcategory-${code}"></div>
        </div>`
    )
    .join("");

  p.filters.job_category.forEach((code) => {
    const options = (JOB_SUBCATEGORY_OPTIONS[code] || []).map((o) => ({ value: o.value, label: o.value }));
    if (!p.filters.job_subcategory[code] || p.filters.job_subcategory[code].length === 0) {
      p.filters.job_subcategory[code] = ["전체"];
    }
    const selected = p.filters.job_subcategory[code];
    bindChipGroup(`job-subcategory-${code}`, options, () => selected, (v) => {
      toggleJobSubcategory(code, v);
      renderJobSubcategories();
    });
  });
}

// 세부직무는 카테고리별 복수선택이 가능하되, "전체"를 고르면 다른 선택은 다 지워지고,
// 특정 세부직무를 고르면 "전체"는 자동으로 빠진다 (전체 vs 특정은 서로 배타적).
function toggleJobSubcategory(code, value) {
  const p = AppState.profile;
  const raw = p.filters.job_subcategory[code];
  const current = Array.isArray(raw) ? raw : raw ? [raw] : [];

  if (value === "전체") {
    p.filters.job_subcategory[code] = current.includes("전체") ? [] : ["전체"];
  } else {
    const withoutAll = current.filter((v) => v !== "전체");
    p.filters.job_subcategory[code] = withoutAll.includes(value)
      ? withoutAll.filter((v) => v !== value)
      : [...withoutAll, value];
  }
  if (p.filters.job_subcategory[code].length === 0) p.filters.job_subcategory[code] = ["전체"];
  AppState.save();
}

// ============================================================
// 2. 직장 경험
// ============================================================
function renderWork() {
  const p = AppState.profile;
  document.getElementById("career-badge").textContent = `${p.career.career_status} · 총 ${p.career.total_career_years}년`;

  const list = document.getElementById("work-experience-list");
  list.innerHTML = p.career.work_experiences
    .map(
      (exp) => `
    <div class="entry-card" data-id="${exp.id}">
      <div class="entry-card-head">
        <div class="chip-group work-emptype-chips"></div>
        <button type="button" class="entry-card-remove" data-remove="${exp.id}">삭제</button>
      </div>
      <div class="entry-date-row">
        입사 <input type="month" data-field="start_date" value="${exp.start_date}" />
        퇴사 <input type="month" data-field="end_date" value="${exp.end_date ?? ""}" ${exp.end_date === null ? "disabled" : ""} />
        <label><input type="checkbox" data-field="ongoing" ${exp.end_date === null ? "checked" : ""} /> 재직중</label>
      </div>
      <div class="interview-answers">
        ${WORK_INTERVIEW_QUESTIONS.map((q, i) => `<p class="q">${q.text}</p><p class="a">${exp.answers[i] ?? ""}</p>`).join("")}
      </div>
    </div>`
    )
    .join("");

  p.career.work_experiences.forEach((exp) => {
    const card = list.querySelector(`.entry-card[data-id="${exp.id}"]`);
    const empGroup = card.querySelector(".work-emptype-chips");
    empGroup.innerHTML = chipGroupHtml(
      WORK_EMPLOYMENT_TYPE_OPTIONS.map((v) => ({ value: v, label: v })),
      [exp.employment_type]
    );
    empGroup.querySelectorAll("button").forEach((btn) =>
      btn.addEventListener("click", () => {
        AppState.updateWorkExperience(exp.id, { employment_type: btn.dataset.value });
        renderWork();
      })
    );
    card.querySelector('[data-field="start_date"]').addEventListener("change", (e) => {
      AppState.updateWorkExperience(exp.id, { start_date: e.target.value });
      renderWork();
    });
    card.querySelector('[data-field="end_date"]').addEventListener("change", (e) => {
      AppState.updateWorkExperience(exp.id, { end_date: e.target.value });
    });
    card.querySelector('[data-field="ongoing"]').addEventListener("change", (e) => {
      AppState.updateWorkExperience(exp.id, { end_date: e.target.checked ? null : "" });
      renderWork();
    });
    card.querySelector("[data-remove]").addEventListener("click", () => {
      AppState.removeWorkExperience(exp.id);
      renderWork();
    });
  });
}

// ============================================================
// 3. 학내외경험
// ============================================================
function renderExtracurricular() {
  const p = AppState.profile;
  const list = document.getElementById("extracurricular-list");
  list.innerHTML = p.activities.academic_extracurricular
    .map(
      (item) => `
    <div class="entry-card" data-id="${item.id}">
      <div class="entry-card-head">
        <div class="chip-group ext-type-chips"></div>
        <button type="button" class="entry-card-remove" data-remove="${item.id}">삭제</button>
      </div>
      <div class="interview-answers">
        ${ACTIVITY_INTERVIEW_QUESTIONS.map((q, i) => `<p class="q">${q.text}</p><p class="a">${item.answers?.[i] ?? ""}</p>`).join("")}
      </div>
    </div>`
    )
    .join("");

  p.activities.academic_extracurricular.forEach((item) => {
    const card = list.querySelector(`.entry-card[data-id="${item.id}"]`);
    const typeGroup = card.querySelector(".ext-type-chips");
    typeGroup.innerHTML = chipGroupHtml(
      EXTRACURRICULAR_TYPE_OPTIONS.map((v) => ({ value: v, label: EXTRACURRICULAR_TYPE_LABELS[v] })),
      [item.type]
    );
    typeGroup.querySelectorAll("button").forEach((btn) =>
      btn.addEventListener("click", () => {
        AppState.updateExtracurricularType(item.id, btn.dataset.value);
        renderExtracurricular();
      })
    );
    card.querySelector("[data-remove]").addEventListener("click", () => {
      AppState.removeExtracurricular(item.id);
      renderExtracurricular();
    });
  });
}

// ============================================================
// 4. 수상/공모전
// ============================================================
function renderAwards() {
  const p = AppState.profile;
  const list = document.getElementById("award-list");
  list.innerHTML = p.activities.awards
    .map(
      (item, i) => `
    <div class="entry-card" data-id="${item.id}">
      <div class="entry-card-head">
        <span style="font-size:13px;font-weight:600;color:#374151">수상/공모전 ${i + 1}</span>
        <button type="button" class="entry-card-remove" data-remove="${item.id}">삭제</button>
      </div>
      <div class="interview-answers">
        ${ACTIVITY_INTERVIEW_QUESTIONS.map((q, i2) => `<p class="q">${q.text}</p><p class="a">${item.answers?.[i2] ?? ""}</p>`).join("")}
      </div>
    </div>`
    )
    .join("");

  p.activities.awards.forEach((item) => {
    const card = list.querySelector(`.entry-card[data-id="${item.id}"]`);
    card.querySelector("[data-remove]").addEventListener("click", () => {
      AppState.removeAward(item.id);
      renderAwards();
    });
  });
}

// ============================================================
// 5. 성향 질문
// ============================================================
function renderPersonality() {
  const p = AppState.profile;
  const answers = p.personality_survey.answers;
  const answeredCount = answers.filter((a) => a.choice !== null).length;

  document.getElementById("personality-progress-text").textContent = `나와 더 가까운 쪽을 골라주세요. (${answeredCount} / ${answers.length})`;
  document.getElementById("personality-progress-bar").style.width = `${(answeredCount / answers.length) * 100}%`;

  const container = document.getElementById("personality-questions");
  container.innerHTML = PERSONALITY_QUESTIONS.map((q) => {
    const choice = answers.find((a) => a.question_id === q.question_id)?.choice;
    const optionsHtml = q.options
      .map(
        (opt) =>
          `<button type="button" class="option-btn ${choice === opt.option ? "selected" : ""}" data-q="${q.question_id}" data-choice="${opt.option}">${opt.statement}</button>`
      )
      .join("");
    return `
      <div class="question-card focus-card">
        <p class="q-title">Q${q.question_id}. ${q.question}</p>
        ${optionsHtml}
        <button type="button" class="option-btn ${choice === "unknown" ? "selected" : ""}" data-q="${q.question_id}" data-choice="unknown">잘 모르겠어요</button>
      </div>`;
  }).join("");

  container.querySelectorAll(".option-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const qId = Number(btn.dataset.q);
      const choice = btn.dataset.choice === "unknown" ? "unknown" : Number(btn.dataset.choice);
      AppState.setPersonalityChoice(qId, choice);
      renderPersonality();
      // renderPersonality()가 카드를 통째로 다시 그려서 이전에 표시해둔 강조(active) 클래스가
      // 사라지므로, 다시 그려진 "다음" 카드에 강조를 새로 입혀야 한다 (main.js).
      if (typeof advanceToNextPersonalityCard === "function") advanceToNextPersonalityCard(qId);
    });
  });
}

// ============================================================
// 6. 완료 (JSON 뷰)
// ============================================================
function renderReview() {
  const p = AppState.profile;
  document.getElementById("draft-id-label").textContent = `draft_id: ${p.meta.draft_id}`;
  document.getElementById("json-view").textContent = JSON.stringify(p, null, 2);
}
