// 뽑아듀오 — 1차 필터링 + 키워드 매칭 (서버 없이 브라우저에서 fetch로 정적 json을 읽어 전부 계산)

let JOBS_CACHE = null;
let KEYWORDS_CACHE = null;

async function loadJobs() {
  if (!JOBS_CACHE) {
    const res = await fetch("data/jobs.json");
    JOBS_CACHE = (await res.json()).jobs;
  }
  return JOBS_CACHE;
}

async function loadKeywords() {
  if (!KEYWORDS_CACHE) {
    const res = await fetch("data/keywords.json");
    KEYWORDS_CACHE = (await res.json()).keywords;
  }
  return KEYWORDS_CACHE;
}

// ekgus020330-lgtm의 filterlogic runFilter()를 그대로 이식한 1차 필터링.
function filterJobs(profile, jobs) {
  const { filters, basic_info, career } = profile;
  const passed = [];
  const majorWarnings = [];

  for (const job of jobs) {
    const fail = [];

    if (filters.company_size.length > 0 && !filters.company_size.includes(job.filter_company_size)) {
      fail.push("규모");
    }
    if (filters.region.length > 0) {
      const isRemote = job.region.includes("재택") || job.region.includes("전국");
      if (!isRemote && !filters.region.includes(String(job.filter_region))) fail.push("지역");
    }
    if (filters.job_category.length > 0 && !filters.job_category.includes(job.filter_job_major)) {
      fail.push("직무");
    }
    // 세부직무(전체가 아닌 값, 복수선택 가능)를 골랐으면, 그중 하나라도 job_title에
    // 키워드가 있는 공고만 남긴다 (선택한 세부직무들 사이는 OR 조건).
    const rawSubcategory = filters.job_subcategory?.[job.filter_job_major];
    const subcategories = (Array.isArray(rawSubcategory) ? rawSubcategory : rawSubcategory ? [rawSubcategory] : []).filter(
      (v) => v !== "전체"
    );
    if (subcategories.length > 0) {
      const subOptions = JOB_SUBCATEGORY_OPTIONS[job.filter_job_major] || [];
      const matchesAny = subcategories.some((value) => {
        const sub = subOptions.find((o) => o.value === value);
        return sub && sub.keywords.some((k) => job.job_title.includes(k));
      });
      if (!matchesAny) fail.push("세부직무");
    }
    if (filters.employment_type.length > 0) {
      if (!filters.employment_type.some((t) => job.employment_type.includes(t))) fail.push("근무형태");
    }

    const userEduLevel = basic_info.education.level;
    if (userEduLevel) {
      const userLv = EDU_LEVEL_RANK[userEduLevel] ?? 1;
      const jdLv = EDU_LEVEL_RANK[job.education_level] ?? 1;
      if (userLv < jdLv) fail.push("학력");
    }

    const jdType = job.career_type_code || "";
    if (career.career_status === "신입") {
      if (!jdType.includes("신입") && !jdType.includes("무관")) fail.push("경력");
    } else {
      if (!jdType.includes("경력") && !jdType.includes("무관") && !jdType.includes("신입+경력")) {
        fail.push("경력");
      } else if (career.total_career_years < job.career_years_min) {
        fail.push("연차");
      }
    }

    if (fail.length === 0) passed.push(job);

    const jdMajor = job.major || "";
    if (jdMajor.trim() !== "" && !jdMajor.includes("무관")) majorWarnings.push(job);
  }

  return { passed, majorWarnings };
}

// "R", "Go", "JS"처럼 짧은 순수 영문 alias는 "developer" 같은 단어 속 오탐을 막기 위해 단어 경계로 매칭.
function aliasMatches(text, alias) {
  const isShortAsciiWord = /^[A-Za-z0-9]+$/.test(alias) && alias.length <= 3;
  if (isShortAsciiWord) return new RegExp(`\\b${alias}\\b`, "i").test(text);
  return text.toLowerCase().includes(alias.toLowerCase());
}

function textIncludesAnyAlias(text, keyword) {
  return keyword.aliases.some((alias) => aliasMatches(text, alias));
}

// 사용자 신호(기술스택/자격증 → keywords.json 사전 매칭, 인터뷰 키워드/성향 태그 → 원문 직접 매칭)를 만든다.
function buildUserSignals(profile, keywords) {
  const signals = [];

  const taggedSources = [...Object.values(profile.qualifications.tech_stack).flat(), ...profile.qualifications.certificates];
  for (const keyword of keywords) {
    if (taggedSources.some((tag) => textIncludesAnyAlias(tag, keyword))) {
      signals.push({ label: keyword.id, weight: 1.0, matchesJobText: (t) => textIncludesAnyAlias(t, keyword) });
    }
  }

  // 직장경험/학내외경험/수상공모전 모두 인터뷰 챗봇 답변에서 mock 추출된 키워드를 가지고 있다.
  const experienceKeywords = new Set([
    ...profile.career.work_experiences.flatMap((e) => e.keywords),
    ...profile.activities.academic_extracurricular.flatMap((e) => e.keywords ?? []),
    ...profile.activities.awards.flatMap((e) => e.keywords ?? []),
  ]);
  for (const phrase of experienceKeywords) {
    signals.push({ label: phrase, weight: 1.0, matchesJobText: (t) => t.includes(phrase) });
  }

  for (const [tag, weight] of Object.entries(profile.personality_survey.derived_tag_weights)) {
    signals.push({ label: tag, weight, matchesJobText: (t) => t.includes(tag) });
  }

  return signals;
}

function buildJobText(job) {
  return [job.job_title, job.main_tasks, job.qualifications, job.ideal_person, job.preferred_cert, job.preferred_language, job.preferred_etc]
    .filter(Boolean)
    .join("\n");
}

// 사용자가 가진 신호 중 이 공고 원문에서 실제로 발견되는 비율로 매칭률을 계산 (0~100 정수, 초안 버전).
function scoreJob(job, signals) {
  if (signals.length === 0) return { matchRate: 0, matchedKeywords: [] };
  const jobText = buildJobText(job);
  const matched = signals.filter((s) => s.matchesJobText(jobText));
  const weightSum = matched.reduce((sum, s) => sum + s.weight, 0);
  return { matchRate: Math.min(100, Math.round((weightSum / signals.length) * 100)), matchedKeywords: matched.map((s) => s.label) };
}

function buildMatchReasons(job, matchedKeywords, majorWarning) {
  const reasons = [];
  if (matchedKeywords.length > 0) {
    reasons.push(`${matchedKeywords.slice(0, 3).map((k) => `#${k}`).join(", ")} 관련 역량이 이 공고와 겹쳐요.`);
  } else {
    reasons.push("직무·지역·경력 조건은 맞지만, 겹치는 역량 키워드는 아직 못 찾았어요.");
  }
  reasons.push(`${job.career_type}(${job.career_years}) · ${job.employment_type} 조건이 회원님과 맞아요.`);
  if (majorWarning) {
    reasons.push("전공 요건이 있는 공고예요 — 실무 경험으로 어필할 수 있는지 확인해보세요.");
  } else {
    reasons.push(`지원 마감일(${job.deadline})을 기준으로 실제 지원 가능성을 확인해보세요.`);
  }
  return reasons;
}

// profile을 받아 필터링+매칭까지 끝난 결과 배열(매칭률 내림차순)을 돌려준다.
async function matchJobs(profile) {
  const [jobs, keywords] = await Promise.all([loadJobs(), loadKeywords()]);
  const { passed, majorWarnings } = filterJobs(profile, jobs);
  const majorWarningIds = new Set(majorWarnings.map((j) => j.id));
  const signals = buildUserSignals(profile, keywords);

  const results = passed
    .map((job) => {
      const { matchRate, matchedKeywords } = scoreJob(job, signals);
      const majorWarning = majorWarningIds.has(job.id);
      return {
        id: job.id,
        company_name: job.company_name,
        job_title: job.job_title,
        url: job.url,
        region: job.region,
        deadline: job.deadline,
        short_description: job.main_tasks.slice(0, 60) + (job.main_tasks.length > 60 ? "..." : ""),
        match_rate: matchRate,
        matched_keywords: matchedKeywords,
        match_reasons: buildMatchReasons(job, matchedKeywords, majorWarning),
        major_warning: majorWarning,
      };
    })
    .sort((a, b) => b.match_rate - a.match_rate);

  return { total_jobs: jobs.length, passed_count: results.length, results: results.slice(0, 20) };
}
