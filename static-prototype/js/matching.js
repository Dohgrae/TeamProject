// 뽑아듀오 — 1차 필터링 + 2차 스코어링(역량/업무성향/우대요건 가중합) (서버 없이 브라우저에서 fetch로 정적 json을 읽어 전부 계산)

let JOBS_CACHE = null;
let KEYWORDS_CACHE = null;
let PERSONALITY_KEYWORDS_CACHE = null;

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

async function loadPersonalityKeywords() {
  if (!PERSONALITY_KEYWORDS_CACHE) {
    const res = await fetch("data/personalityKeywords.json");
    PERSONALITY_KEYWORDS_CACHE = (await res.json()).keywords;
  }
  return PERSONALITY_KEYWORDS_CACHE;
}

// KEYWORD_TRIGGERS(constants.js)에서 나올 수 있는 역량 라벨을 keywords.json과 같은 {id, aliases}
// 사전 형태로 만든다. 인터뷰 답변에서 뽑힌 exp.keywords가 이 라벨 중 하나이므로, 공고 텍스트에도
// 그 라벨이 직접 등장하는지를 keywords.json과 동일한 방식으로 매칭할 수 있게 해준다.
const COMPETENCY_LABEL_DICT = Array.from(new Set(KEYWORD_TRIGGERS.flatMap(([, labels]) => labels))).map((label) => ({
  id: label,
  aliases: [label],
}));

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

// 사전(dict: [{id, aliases}]) 기준으로 텍스트 안에 등장하는 키워드 id 집합을 뽑는다.
function extractKeywordIds(text, dict) {
  const found = new Set();
  if (!text) return found;
  for (const keyword of dict) {
    if (textIncludesAnyAlias(text, keyword)) found.add(keyword.id);
  }
  return found;
}

function joinText(parts) {
  return parts.filter(Boolean).join("\n");
}

// ── 공고 쪽 카테고리별 키워드 집합 ──────────────────────────────
// 역량: 자격요건 + 주요업무 텍스트에서 keywords.json(하드스킬) + 역량 라벨 사전을 함께 뽑는다.
function extractJobCompetencyKeywords(job, keywords) {
  const text = joinText([job.qualifications, job.main_tasks]);
  const skillIds = extractKeywordIds(text, keywords);
  const labelIds = extractKeywordIds(text, COMPETENCY_LABEL_DICT);
  return new Set([...skillIds, ...labelIds]);
}

// 우대요건: 우대사항 + 우대 자격증/어학기준 텍스트에서 keywords.json 하드스킬을 뽑는다.
function extractJobPreferredKeywords(job, keywords) {
  const text = joinText([job.preferred_etc, job.preferred_cert, job.preferred_language]);
  return extractKeywordIds(text, keywords);
}

// 업무성향: 인재상 텍스트에서 성향 키워드 사전(personalityKeywords.json)을 뽑는다.
function extractJobPersonalityKeywords(job, personalityKeywords) {
  return extractKeywordIds(job.ideal_person || "", personalityKeywords);
}

// ── 사용자 쪽 카테고리별 키워드 집합 ──────────────────────────────
// 역량/우대요건에 공통으로 쓰는 하드스킬: 기술스택/자격증(구조화된 값) + 인터뷰 답변·학내외활동
// 설명(자유 텍스트)을 모두 keywords.json 사전으로 매칭한다.
function extractUserSkillKeywords(profile, keywords) {
  const structured = joinText([
    ...Object.values(profile.qualifications.tech_stack).flat(),
    ...profile.qualifications.certificates,
  ]);
  const freeText = joinText([
    ...profile.career.work_experiences.flatMap((exp) => exp.answers),
    ...profile.activities.academic_extracurricular.flatMap((item) => item.answers ?? []),
    ...profile.activities.awards.flatMap((item) => item.answers ?? []),
  ]);
  return new Set([...extractKeywordIds(structured, keywords), ...extractKeywordIds(freeText, keywords)]);
}

// 역량 카테고리 전용: 인터뷰에서 이미 라벨로 뽑아 둔 keywords(KEYWORD_TRIGGERS 라벨, 직장경험/학내외경험/수상공모전 공통)를 더한다.
function extractUserCompetencyLabels(profile) {
  return new Set([
    ...profile.career.work_experiences.flatMap((exp) => exp.keywords),
    ...profile.activities.academic_extracurricular.flatMap((item) => item.keywords ?? []),
    ...profile.activities.awards.flatMap((item) => item.keywords ?? []),
  ]);
}

// 업무성향: 성향 설문에서 이미 태그 id로 도출되어 있으므로 텍스트 매칭 없이 그대로 사용.
function extractUserPersonalityTags(profile) {
  return new Set(Object.keys(profile.personality_survey.derived_tag_weights));
}

// 공고 기준 재현율: 공고가 요구하는 키워드 중 사용자가 가진 비율(0~100).
// 공고 쪽에 해당 카테고리 텍스트/키워드가 아예 없으면 감점 요인이 아니므로 만점 처리한다.
function recallScore(jobIds, userIds) {
  if (jobIds.size === 0) return { score: 100, matched: [] };
  const matched = [...jobIds].filter((id) => userIds.has(id));
  return { score: Math.round((matched.length / jobIds.size) * 100), matched };
}

const CATEGORY_WEIGHTS = { competency: 0.5, personality: 0.2, preferred: 0.3 };

// 매칭률(%) = 역량점수×0.5 + 업무성향점수×0.2 + 우대요건점수×0.3
function scoreJob(job, userSignals, keywords, personalityKeywords) {
  const competency = recallScore(
    extractJobCompetencyKeywords(job, keywords),
    new Set([...userSignals.skillIds, ...userSignals.competencyLabels])
  );
  const personality = recallScore(extractJobPersonalityKeywords(job, personalityKeywords), userSignals.personalityTags);
  const preferred = recallScore(extractJobPreferredKeywords(job, keywords), userSignals.skillIds);

  const matchRate = Math.round(
    competency.score * CATEGORY_WEIGHTS.competency +
      personality.score * CATEGORY_WEIGHTS.personality +
      preferred.score * CATEGORY_WEIGHTS.preferred
  );

  const matchedKeywords = Array.from(new Set([...competency.matched, ...preferred.matched, ...personality.matched]));

  return { matchRate, matchedKeywords, breakdown: { competency, personality, preferred } };
}

// 공고 원문을 "한 줄" 단위로 쪼갠다. jobs.json 일부 필드는 실제 개행 문자 대신
// 이중 이스케이프된 리터럴 "\n"(백슬래시+n 두 글자)을 그대로 담고 있어서 둘 다 구분자로 처리한다.
// 그 다음 앞의 "•"/"-"/공백 같은 불릿 기호를 정리한다.
function splitIntoLines(text) {
  return text
    .split(/\\n|\n/)
    .map((line) => line.replace(/^[•\-\s]+/, "").trim())
    .filter(Boolean);
}

// 특정 키워드 하나가 실제로 등장하는 원문 한 줄과, 그 줄에서 하이라이트할 위치(alias가
// 실제로 발견된 구간)를 찾는다. 역량 > 우대요건 > 업무성향 순으로 텍스트를 뒤져보고,
// 못 찾으면 null.
function findEvidenceForKeyword(job, keywordLabel, keywords, personalityKeywords) {
  const sources = [
    { text: joinText([job.qualifications, job.main_tasks]), dict: [...keywords, ...COMPETENCY_LABEL_DICT] },
    { text: joinText([job.preferred_etc, job.preferred_cert, job.preferred_language]), dict: keywords },
    { text: job.ideal_person || "", dict: personalityKeywords },
  ];

  for (const { text, dict } of sources) {
    if (!text) continue;
    const entry = dict.find((k) => k.id === keywordLabel);
    if (!entry) continue;
    const lines = splitIntoLines(text);
    for (const line of lines) {
      for (const alias of entry.aliases) {
        const idx = line.toLowerCase().indexOf(alias.toLowerCase());
        if (idx !== -1) {
          return { keyword: keywordLabel, line, highlightStart: idx, highlightEnd: idx + alias.length };
        }
      }
    }
  }
  return null;
}

// "공고 원문 발췌"용 - 매칭된 키워드 각각에 대해(최대 개수 제한) 원문에서 등장하는 줄을
// 하나씩 찾아 배열로 돌려준다. 못 찾은 키워드는 건너뛴다.
function findMatchEvidenceList(job, matchedKeywords, keywords, personalityKeywords) {
  const results = [];
  for (const keywordLabel of matchedKeywords) {
    const evidence = findEvidenceForKeyword(job, keywordLabel, keywords, personalityKeywords);
    if (evidence) results.push(evidence);
  }
  return results;
}

function buildMatchReasons(job, breakdown, majorWarning) {
  const reasons = [];
  const topSkills = [...breakdown.competency.matched, ...breakdown.preferred.matched].slice(0, 3);
  if (topSkills.length > 0) {
    reasons.push(`${topSkills.map((k) => `#${k}`).join(", ")} 관련 역량이 이 공고와 겹쳐요.`);
  } else {
    reasons.push("직무·지역·경력 조건은 맞지만, 겹치는 역량 키워드는 아직 못 찾았어요.");
  }
  if (breakdown.personality.matched.length > 0) {
    reasons.push(`${breakdown.personality.matched.slice(0, 2).map((k) => `#${k}`).join(", ")} 업무성향이 이 회사 인재상과 잘 맞아요.`);
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
  const [jobs, keywords, personalityKeywords] = await Promise.all([loadJobs(), loadKeywords(), loadPersonalityKeywords()]);
  const { passed, majorWarnings } = filterJobs(profile, jobs);
  const majorWarningIds = new Set(majorWarnings.map((j) => j.id));

  const userSignals = {
    skillIds: extractUserSkillKeywords(profile, keywords),
    competencyLabels: extractUserCompetencyLabels(profile),
    personalityTags: extractUserPersonalityTags(profile),
  };

  const results = passed
    .map((job) => {
      const { matchRate, matchedKeywords, breakdown } = scoreJob(job, userSignals, keywords, personalityKeywords);
      const majorWarning = majorWarningIds.has(job.id);
      return {
        id: job.id,
        company_name: job.company_name,
        job_title: job.job_title,
        url: job.url,
        region: job.region,
        deadline: job.deadline,
        company_size: job.filter_company_size,
        employment_type: job.employment_type,
        career_type: job.career_type,
        career_years: job.career_years,
        short_description: job.main_tasks.slice(0, 60) + (job.main_tasks.length > 60 ? "..." : ""),
        match_rate: matchRate,
        matched_keywords: matchedKeywords,
        match_reasons: buildMatchReasons(job, breakdown, majorWarning),
        evidence_list: findMatchEvidenceList(job, matchedKeywords.slice(0, 3), keywords, personalityKeywords),
        major_warning: majorWarning,
      };
    })
    .sort((a, b) => b.match_rate - a.match_rate);

  return { total_jobs: jobs.length, passed_count: results.length, results: results.slice(0, 20) };
}
