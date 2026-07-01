import { loadJobs, loadKeywords } from "@/lib/jobsData";
import { matchJobs } from "@/lib/matching";
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
      posting_title: r.job.posting_title,
      url: r.job.url,
      match_rate: r.matchRate,
      matched_keywords: r.matchedKeywords,
      major_warning: r.majorWarning,
    })),
  });
}
