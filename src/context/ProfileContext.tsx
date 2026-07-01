"use client";

import { createContext, useContext, useEffect, useMemo, useReducer } from "react";
import type {
  AwardItem,
  BasicInfo,
  ExtracurricularItem,
  Filters,
  LanguageScore,
  PersonalityChoice,
  Qualifications,
  TechStackCategory,
  UserProfileDraft,
  WorkExperience,
} from "@/types/profile";
import { computeCareer, computeDerivedTagWeights, createEmptyPersonalityAnswers } from "@/lib/deriveProfile";

// 스키마가 바뀔 때마다 버전을 올려서, 예전 구조의 draft가 localStorage에 남아 있어도
// 새 코드가 없는 필드를 읽다가 조용히 죽는 일이 없게 한다.
const STORAGE_KEY = "bbopaduo_user_profile_draft_v2";

function emptyProfile(): UserProfileDraft {
  return {
    basic_info: {
      name: "",
      gender: "",
      birth_date: "",
      education: { level: "", major_category: "", major_detail: "" },
      contact: { phone: "", email: "" },
    },
    filters: {
      region: [],
      job_category: [],
      company_size: [],
      employment_type: [],
    },
    qualifications: {
      languages: [],
      certificates: [],
      tech_stack: {
        언어: [],
        프레임워크_라이브러리: [],
        데이터베이스: [],
        클라우드_인프라: [],
        AI_데이터: [],
        협업툴_형상관리: [],
      },
    },
    career: { career_status: "신입", total_career_years: 0, work_experiences: [] },
    activities: { academic_extracurricular: [], awards: [] },
    personality_survey: { answers: createEmptyPersonalityAnswers(), derived_tag_weights: {} },
    meta: { draft_id: "", updated_at: "" },
  };
}

type Action =
  | { type: "LOAD"; profile: UserProfileDraft }
  | { type: "SET_BASIC_INFO"; value: Partial<BasicInfo> }
  | { type: "SET_FILTERS"; value: Partial<Filters> }
  | { type: "TOGGLE_FILTER_VALUE"; key: keyof Filters; value: string }
  | { type: "TOGGLE_TECH_STACK"; category: TechStackCategory; value: string }
  | { type: "ADD_LANGUAGE"; value: LanguageScore }
  | { type: "REMOVE_LANGUAGE"; index: number }
  | { type: "ADD_CERTIFICATE"; value: string }
  | { type: "REMOVE_CERTIFICATE"; index: number }
  | { type: "ADD_WORK_EXPERIENCE"; answers: string[]; keywords: string[] }
  | { type: "UPDATE_WORK_EXPERIENCE"; id: string; value: Partial<WorkExperience> }
  | { type: "REMOVE_WORK_EXPERIENCE"; id: string }
  | { type: "ADD_EXTRACURRICULAR" }
  | { type: "UPDATE_EXTRACURRICULAR"; id: string; value: Partial<ExtracurricularItem> }
  | { type: "REMOVE_EXTRACURRICULAR"; id: string }
  | { type: "ADD_AWARD" }
  | { type: "UPDATE_AWARD"; id: string; value: Partial<AwardItem> }
  | { type: "REMOVE_AWARD"; id: string }
  | { type: "SET_PERSONALITY_CHOICE"; question_id: number; choice: PersonalityChoice };

function withMeta(profile: UserProfileDraft): UserProfileDraft {
  return {
    ...profile,
    meta: {
      draft_id: profile.meta.draft_id || crypto.randomUUID(),
      updated_at: new Date().toISOString(),
    },
  };
}

function reducer(state: UserProfileDraft, action: Action): UserProfileDraft {
  switch (action.type) {
    case "LOAD":
      return action.profile;
    case "SET_BASIC_INFO":
      return withMeta({ ...state, basic_info: { ...state.basic_info, ...action.value } });
    case "SET_FILTERS":
      return withMeta({ ...state, filters: { ...state.filters, ...action.value } });
    case "TOGGLE_FILTER_VALUE": {
      const current = state.filters[action.key];
      const next = current.includes(action.value)
        ? current.filter((v) => v !== action.value)
        : [...current, action.value];
      return withMeta({ ...state, filters: { ...state.filters, [action.key]: next } });
    }
    case "TOGGLE_TECH_STACK": {
      const current = state.qualifications.tech_stack[action.category];
      const next = current.includes(action.value)
        ? current.filter((v) => v !== action.value)
        : [...current, action.value];
      return withMeta({
        ...state,
        qualifications: {
          ...state.qualifications,
          tech_stack: { ...state.qualifications.tech_stack, [action.category]: next },
        },
      });
    }
    case "ADD_LANGUAGE":
      return withMeta({
        ...state,
        qualifications: {
          ...state.qualifications,
          languages: [...state.qualifications.languages, action.value],
        },
      });
    case "REMOVE_LANGUAGE":
      return withMeta({
        ...state,
        qualifications: {
          ...state.qualifications,
          languages: state.qualifications.languages.filter((_, i) => i !== action.index),
        },
      });
    case "ADD_CERTIFICATE":
      return withMeta({
        ...state,
        qualifications: {
          ...state.qualifications,
          certificates: [...state.qualifications.certificates, action.value],
        },
      });
    case "REMOVE_CERTIFICATE":
      return withMeta({
        ...state,
        qualifications: {
          ...state.qualifications,
          certificates: state.qualifications.certificates.filter((_, i) => i !== action.index),
        },
      });
    case "ADD_WORK_EXPERIENCE": {
      const newExp: WorkExperience = {
        id: crypto.randomUUID(),
        employment_type: "정규직",
        start_date: "",
        end_date: null,
        answers: action.answers,
        keywords: action.keywords,
      };
      const work_experiences = [...state.career.work_experiences, newExp];
      return withMeta({ ...state, career: { ...state.career, work_experiences, ...computeCareer(work_experiences) } });
    }
    case "UPDATE_WORK_EXPERIENCE": {
      const work_experiences = state.career.work_experiences.map((exp) =>
        exp.id === action.id ? { ...exp, ...action.value } : exp
      );
      return withMeta({ ...state, career: { ...state.career, work_experiences, ...computeCareer(work_experiences) } });
    }
    case "REMOVE_WORK_EXPERIENCE": {
      const work_experiences = state.career.work_experiences.filter((exp) => exp.id !== action.id);
      return withMeta({ ...state, career: { ...state.career, work_experiences, ...computeCareer(work_experiences) } });
    }
    case "ADD_EXTRACURRICULAR": {
      const newItem: ExtracurricularItem = { id: crypto.randomUUID(), type: "프로젝트", description: "" };
      return withMeta({
        ...state,
        activities: {
          ...state.activities,
          academic_extracurricular: [...state.activities.academic_extracurricular, newItem],
        },
      });
    }
    case "UPDATE_EXTRACURRICULAR":
      return withMeta({
        ...state,
        activities: {
          ...state.activities,
          academic_extracurricular: state.activities.academic_extracurricular.map((item) =>
            item.id === action.id ? { ...item, ...action.value } : item
          ),
        },
      });
    case "REMOVE_EXTRACURRICULAR":
      return withMeta({
        ...state,
        activities: {
          ...state.activities,
          academic_extracurricular: state.activities.academic_extracurricular.filter((item) => item.id !== action.id),
        },
      });
    case "ADD_AWARD": {
      const newItem: AwardItem = { id: crypto.randomUUID(), description: "" };
      return withMeta({ ...state, activities: { ...state.activities, awards: [...state.activities.awards, newItem] } });
    }
    case "UPDATE_AWARD":
      return withMeta({
        ...state,
        activities: {
          ...state.activities,
          awards: state.activities.awards.map((item) => (item.id === action.id ? { ...item, ...action.value } : item)),
        },
      });
    case "REMOVE_AWARD":
      return withMeta({
        ...state,
        activities: { ...state.activities, awards: state.activities.awards.filter((item) => item.id !== action.id) },
      });
    case "SET_PERSONALITY_CHOICE": {
      const answers = state.personality_survey.answers.map((a) =>
        a.question_id === action.question_id
          ? { ...a, choice: a.choice === action.choice ? null : action.choice }
          : a
      );
      return withMeta({
        ...state,
        personality_survey: { answers, derived_tag_weights: computeDerivedTagWeights(answers) },
      });
    }
    default:
      return state;
  }
}

interface ProfileContextValue {
  profile: UserProfileDraft;
  dispatch: React.Dispatch<Action>;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, dispatch] = useReducer(reducer, undefined, emptyProfile);

  // 마운트 시 localStorage에서 임시저장된 draft 복원 (서버 렌더링과의 hydration 불일치를 피하려 클라이언트에서만 로드)
  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        dispatch({ type: "LOAD", profile: JSON.parse(raw) as UserProfileDraft });
        return;
      } catch {
        // 손상된 draft는 무시하고 새로 시작
      }
    }
    dispatch({ type: "LOAD", profile: withMeta(emptyProfile()) });
  }, []);

  // 값이 바뀔 때마다 자동으로 임시저장
  useEffect(() => {
    if (!profile.meta.draft_id) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  }, [profile]);

  const value = useMemo(() => ({ profile, dispatch }), [profile]);

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfile must be used within ProfileProvider");
  return ctx;
}
