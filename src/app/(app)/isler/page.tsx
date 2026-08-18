import type { Metadata } from "next";

import JobList from "@/components/job-list";
import JobDataError from "@/components/jobs/job-data-error";
import { getJobs } from "@/lib/jobs/data";

export const metadata: Metadata = {
  title: "İşler | İşTakip",
  description: "Planlanan, devam eden ve tamamlanan işlerin finansal özeti.",
};

export default async function IslerPage() {
  let jobs;

  try {
    jobs = await getJobs();
  } catch {
    return (
      <div className="mx-auto w-full min-w-0 max-w-7xl space-y-6">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">İşler</h1>
          <p className="mt-1 text-sm text-foreground-muted">İşletmenize ait gerçek iş kayıtları.</p>
        </div>
        <JobDataError message="İş kayıtları şu anda yüklenemiyor. Lütfen daha sonra tekrar deneyin." />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full min-w-0 max-w-7xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">İşler</h1>
        <p className="mt-1 text-sm text-foreground-muted">
          İş süreçlerini, tarihlerini ve sözleşme bedellerini takip edin. Toplam{" "}
          <span className="font-medium text-foreground-secondary tabular-nums">{jobs.length}</span> iş kayıtlı.
        </p>
      </div>

      <JobList jobs={jobs} />
    </div>
  );
}
