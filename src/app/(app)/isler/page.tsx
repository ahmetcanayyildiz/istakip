import type { Metadata } from "next";

import JobList from "@/components/job-list";
import { calculateJobFinancials } from "@/lib/mock-finance";
import { JOBS } from "@/lib/mock-jobs";

export const metadata: Metadata = {
  title: "İşler | İşTakip",
  description: "Planlanan, devam eden ve tamamlanan işlerin finansal özeti.",
};

export default function IslerPage() {
  const jobs = JOBS.map((job) => ({ ...job, ...calculateJobFinancials(job) }));

  return (
    <div className="mx-auto w-full min-w-0 max-w-7xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">İşler</h1>
        <p className="mt-1 text-sm text-foreground-muted">
          İş süreçlerini, tarihlerini ve finansal durumlarını takip edin. Toplam{" "}
          <span className="font-medium text-foreground-secondary tabular-nums">{JOBS.length}</span> iş kayıtlı.
        </p>
      </div>

      <JobList jobs={jobs} />
    </div>
  );
}
