import Link from "next/link";
import { WIZARD_STEPS } from "@/lib/constants";

export default function Home() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center px-4 py-16 text-center">
      <p className="mb-3 rounded-full bg-pink-100 px-4 py-1 text-sm font-medium text-pink-600">
        나에게 딱 맞는 커리어 매칭
      </p>
      <h1 className="mb-4 text-4xl font-bold text-gray-900">뽑아듀오</h1>
      <p className="mb-10 text-gray-500">
        기본 인적사항, 경력·경험, 성향 정보를 입력하면 나와 잘 맞는 채용공고를 매칭해드려요.
      </p>
      <Link
        href={WIZARD_STEPS[0].path}
        className="rounded-full bg-pink-500 px-8 py-3 font-semibold text-white transition hover:bg-pink-600"
      >
        정보 입력 시작하기
      </Link>
      <ol className="mt-12 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-sm text-gray-400">
        {WIZARD_STEPS.map((step, i) => (
          <li key={step.path}>
            {i + 1}. {step.label}
            {i < WIZARD_STEPS.length - 1 && <span className="ml-2">→</span>}
          </li>
        ))}
      </ol>
    </div>
  );
}
