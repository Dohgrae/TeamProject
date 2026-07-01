import { loadJobs, loadKeywords } from "@/lib/jobsData";
import { buildMatchReasons, matchJobs } from "@/lib/matching";
import type { UserProfileDraft } from "@/types/profile";

export async function POST(request: Request) {
  const profile = (await request.json()) as UserProfileDraft;
  const jobs = loadJobs();
  const keywords = loadKeywords();

  const allMatches = matchJobs(profile, jobs, keywords);

  return Response.json({
    total_jobs: jobs.length,
    passed_count: allMatches.length,
    results: allMatches.slice(0, 20).map((r) => ({
      id: r.job.id,
      company_name: r.job.company_name,
      job_title: r.job.job_title,
      url: r.job.url,
      region: r.job.region,
      deadline: r.job.deadline,
      short_description: r.job.main_tasks.slice(0, 60) + (r.job.main_tasks.length > 60 ? "..." : ""),
      match_rate: r.matchRate,
      matched_keywords: r.matchedKeywords,
      match_reasons: buildMatchReasons(r.job, r.matchedKeywords, r.majorWarning),
      major_warning: r.majorWarning,
    })),
  });
}
