import { StepProgress } from "@/components/StepProgress";

export default function StepsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 pb-16">
      <StepProgress />
      <main className="flex-1 rounded-2xl bg-white p-6 shadow-sm sm:p-10">{children}</main>
    </div>
  );
}
