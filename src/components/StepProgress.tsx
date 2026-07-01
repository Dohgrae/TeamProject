"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { WIZARD_STEPS } from "@/lib/constants";

export function StepProgress() {
  const pathname = usePathname();
  const currentIndex = WIZARD_STEPS.findIndex((s) => s.path === pathname);

  return (
    <nav className="flex items-center justify-center gap-2 py-6">
      {WIZARD_STEPS.map((step, i) => {
        const isActive = i === currentIndex;
        const isDone = currentIndex >= 0 && i < currentIndex;
        return (
          <div key={step.path} className="flex items-center gap-2">
            <Link
              href={step.path}
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                isActive
                  ? "bg-pink-500 text-white"
                  : isDone
                    ? "bg-pink-200 text-pink-700"
                    : "bg-gray-100 text-gray-400"
              }`}
            >
              {i + 1}
            </Link>
            <span className={`text-sm ${isActive ? "font-semibold text-gray-900" : "text-gray-400"}`}>
              {step.label}
            </span>
            {i < WIZARD_STEPS.length - 1 && <span className="mx-2 h-px w-6 bg-gray-200" />}
          </div>
        );
      })}
    </nav>
  );
}
