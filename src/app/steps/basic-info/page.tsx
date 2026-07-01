"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useProfile } from "@/context/ProfileContext";
import { ButtonGroup } from "@/components/ButtonGroup";
import {
  COMPANY_SIZE_OPTIONS,
  COMPANY_TYPE_OPTIONS,
  EDUCATION_LEVEL_OPTIONS,
  EMPLOYMENT_TYPE_OPTIONS,
  INDUSTRY_OPTIONS,
  JOB_CATEGORY_OPTIONS,
  LANGUAGE_TEST_OPTIONS,
  MAJOR_CATEGORY_OPTIONS,
  REGION_OPTIONS,
  TECH_STACK_CATEGORIES,
} from "@/lib/constants";
import type { Filters, Gender, TechStackCategory } from "@/types/profile";

const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: "male", label: "남성" },
  { value: "female", label: "여성" },
  { value: "other", label: "기타" },
  { value: "prefer_not_to_say", label: "응답 안함" },
];

export default function BasicInfoPage() {
  const router = useRouter();
  const { profile, dispatch } = useProfile();
  const { basic_info, qualifications, filters } = profile;

  const [certInput, setCertInput] = useState("");
  const [langTest, setLangTest] = useState(LANGUAGE_TEST_OPTIONS[0]);
  const [langScore, setLangScore] = useState("");

  function singleToggle<T extends string>(current: T | "", value: T, set: (v: T | "") => void) {
    set(current === value ? "" : value);
  }

  function addCertificate() {
    const value = certInput.trim();
    if (!value) return;
    dispatch({ type: "ADD_CERTIFICATE", value });
    setCertInput("");
  }

  function addLanguage() {
    if (!langScore.trim()) return;
    dispatch({ type: "ADD_LANGUAGE", value: { test: langTest, score: langScore.trim() } });
    setLangScore("");
  }

  const canProceed = basic_info.name.trim() && basic_info.birth_date && basic_info.education.level;

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">기본 인적사항</h1>
        <p className="mt-1 text-sm text-gray-500">취업 방향 추천을 위한 기본 정보를 입력해주세요.</p>
      </div>

      <section className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700">이름 *</label>
          <input
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-pink-500 focus:outline-none"
            value={basic_info.name}
            onChange={(e) => dispatch({ type: "SET_BASIC_INFO", value: { name: e.target.value } })}
            placeholder="이름을 입력해주세요"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700">출생년월일 *</label>
          <input
            type="date"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-pink-500 focus:outline-none"
            value={basic_info.birth_date}
            onChange={(e) => dispatch({ type: "SET_BASIC_INFO", value: { birth_date: e.target.value } })}
          />
        </div>
      </section>

      <section>
        <label className="mb-2 block text-sm font-semibold text-gray-700">성별</label>
        <ButtonGroup
          options={GENDER_OPTIONS}
          selected={basic_info.gender ? [basic_info.gender] : []}
          onToggle={(v) =>
            singleToggle(basic_info.gender, v as Gender, (val) =>
              dispatch({ type: "SET_BASIC_INFO", value: { gender: val } })
            )
          }
        />
      </section>

      <section>
        <label className="mb-2 block text-sm font-semibold text-gray-700">학력 단계 *</label>
        <ButtonGroup
          options={EDUCATION_LEVEL_OPTIONS}
          selected={basic_info.education.level ? [basic_info.education.level] : []}
          onToggle={(v) =>
            singleToggle(basic_info.education.level, v, (val) =>
              dispatch({ type: "SET_BASIC_INFO", value: { education: { ...basic_info.education, level: val } } })
            )
          }
        />
      </section>

      <section className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700">전공 대분류</label>
          <ButtonGroup
            options={MAJOR_CATEGORY_OPTIONS}
            selected={basic_info.education.major_category ? [basic_info.education.major_category] : []}
            onToggle={(v) =>
              singleToggle(basic_info.education.major_category, v, (val) =>
                dispatch({
                  type: "SET_BASIC_INFO",
                  value: { education: { ...basic_info.education, major_category: val } },
                })
              )
            }
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700">학과</label>
          <input
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-pink-500 focus:outline-none"
            value={basic_info.education.major_detail}
            onChange={(e) =>
              dispatch({
                type: "SET_BASIC_INFO",
                value: { education: { ...basic_info.education, major_detail: e.target.value } },
              })
            }
            placeholder="예: 컴퓨터공학과"
          />
        </div>
      </section>

      <section>
        <label className="mb-2 block text-sm font-semibold text-gray-700">보유 자격증</label>
        <div className="flex gap-2">
          <input
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-pink-500 focus:outline-none"
            value={certInput}
            onChange={(e) => setCertInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCertificate())}
            placeholder="예: 정보처리기사 (Enter로 추가)"
          />
          <button
            type="button"
            onClick={addCertificate}
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-700"
          >
            추가
          </button>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {qualifications.certificates.map((cert, i) => (
            <span key={`${cert}-${i}`} className="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-sm">
              {cert}
              <button type="button" onClick={() => dispatch({ type: "REMOVE_CERTIFICATE", index: i })} className="text-gray-400 hover:text-gray-700">
                ×
              </button>
            </span>
          ))}
        </div>
      </section>

      <section>
        <label className="mb-2 block text-sm font-semibold text-gray-700">어학 능력</label>
        <div className="flex flex-wrap gap-2">
          <select
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
            value={langTest}
            onChange={(e) => setLangTest(e.target.value)}
          >
            {LANGUAGE_TEST_OPTIONS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <input
            className="w-32 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-pink-500 focus:outline-none"
            value={langScore}
            onChange={(e) => setLangScore(e.target.value)}
            placeholder="점수/등급"
          />
          <button type="button" onClick={addLanguage} className="rounded-lg bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-700">
            추가
          </button>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {qualifications.languages.map((lang, i) => (
            <span key={`${lang.test}-${i}`} className="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-sm">
              {lang.test} {lang.score}
              <button type="button" onClick={() => dispatch({ type: "REMOVE_LANGUAGE", index: i })} className="text-gray-400 hover:text-gray-700">
                ×
              </button>
            </span>
          ))}
        </div>
      </section>

      <section>
        <label className="mb-2 block text-sm font-semibold text-gray-700">기술스택</label>
        <div className="flex flex-col gap-4">
          {TECH_STACK_CATEGORIES.map((cat) => (
            <div key={cat.key}>
              <p className="mb-1 text-xs font-medium text-gray-500">{cat.label}</p>
              <ButtonGroup
                options={cat.options.map((o) => ({ value: o, label: o }))}
                selected={qualifications.tech_stack[cat.key as TechStackCategory]}
                onToggle={(v) => dispatch({ type: "TOGGLE_TECH_STACK", category: cat.key as TechStackCategory, value: v })}
              />
            </div>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700">전화번호</label>
          <input
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-pink-500 focus:outline-none"
            value={basic_info.contact.phone}
            onChange={(e) => dispatch({ type: "SET_BASIC_INFO", value: { contact: { ...basic_info.contact, phone: e.target.value } } })}
            placeholder="010-0000-0000"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700">이메일</label>
          <input
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-pink-500 focus:outline-none"
            value={basic_info.contact.email}
            onChange={(e) => dispatch({ type: "SET_BASIC_INFO", value: { contact: { ...basic_info.contact, email: e.target.value } } })}
            placeholder="example@email.com"
          />
        </div>
      </section>

      <hr className="border-gray-100" />

      <div>
        <h2 className="text-lg font-bold text-gray-900">선호 조건 (필터)</h2>
        <p className="mt-1 text-sm text-gray-500">
          채용공고 1차 필터링에 사용돼요. 선택하지 않으면 전체 공고를 대상으로 매칭합니다.
        </p>
      </div>

      {(
        [
          ["region", "희망 지역", REGION_OPTIONS],
          ["industry", "산업군", INDUSTRY_OPTIONS],
          ["job_category", "직무/세부직무", JOB_CATEGORY_OPTIONS],
          ["company_size", "기업규모", COMPANY_SIZE_OPTIONS],
          ["company_type", "기업형태", COMPANY_TYPE_OPTIONS],
          ["employment_type", "희망 고용형태", EMPLOYMENT_TYPE_OPTIONS],
        ] as [keyof Filters, string, { value: string; label: string }[]][]
      ).map(([key, label, options]) => (
        <section key={key}>
          <label className="mb-2 block text-sm font-semibold text-gray-700">{label}</label>
          <ButtonGroup
            options={options}
            selected={filters[key]}
            onToggle={(v) => dispatch({ type: "TOGGLE_FILTER_VALUE", key, value: v })}
          />
        </section>
      ))}

      <div className="flex justify-end pt-4">
        <button
          type="button"
          disabled={!canProceed}
          onClick={() => router.push("/steps/career")}
          className="rounded-full bg-pink-500 px-8 py-3 font-semibold text-white transition hover:bg-pink-600 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
        >
          다음 단계
        </button>
      </div>
    </div>
  );
}
