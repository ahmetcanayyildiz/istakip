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
        <h1 className="text-xl font-semibold tracking-tight text-slate-900">İşler</h1>
        <p className="mt-1 text-sm text-slate-500">
          İş süreçlerini, tarihlerini ve finansal durumlarını takip edin. Toplam{" "}
          <span className="font-medium text-slate-700 tabular-nums">{JOBS.length}</span> iş kayıtlı.
        </p>
      </div>

      <JobList jobs={jobs} />
    </div>
  );
}
