import { COLLECTIONS } from "@/lib/mock-collections";
import { EXPENSES } from "@/lib/mock-expenses";
import { JOBS, type Job, type JobStatus } from "@/lib/mock-jobs";
import { calculateQuoteTotals, QUOTES } from "@/lib/mock-quotes";

const ACTIVE_JOB_STATUSES = new Set<JobStatus>([
  "Planlandı",
  "Devam Ediyor",
  "Beklemede",
]);

export type JobFinancials = {
  totalExpenses: number;
  collected: number;
  openBalance: number;
  estimatedProfit: number;
};

export type CustomerFinancials = JobFinancials & {
  totalJobs: number;
  activeJobs: number;
  totalRevenue: number;
};

export type CollectionFinancials = {
  collected: number;
  duePending: number;
  overdue: number;
};

export type DashboardFinancials = {
  totalRevenue: number;
  totalExpenses: number;
  estimatedProfit: number;
  totalCollected: number;
  totalOpenBalance: number;
  activeJobs: number;
  pendingQuotes: number;
  pendingQuoteAmount: number;
};

export const getJobExpenses = (jobId: string) =>
  EXPENSES.reduce(
    (sum, expense) => sum + (expense.jobId === jobId ? expense.amount : 0),
    0,
  );

export const getJobCollected = (jobId: string) =>
  COLLECTIONS.reduce(
    (sum, collection) =>
      sum +
      (collection.jobId === jobId && collection.status === "Tahsil Edildi"
        ? collection.amount
        : 0),
    0,
  );

export const getJobOpenBalance = (job: Job) =>
  job.status === "İptal Edildi"
    ? 0
    : Math.max(job.amount - getJobCollected(job.id), 0);

export const getJobEstimatedProfit = (job: Job) =>
  job.status === "İptal Edildi" ? 0 : job.amount - getJobExpenses(job.id);

export const calculateJobFinancials = (job: Job): JobFinancials => ({
  totalExpenses: getJobExpenses(job.id),
  collected: getJobCollected(job.id),
  openBalance: getJobOpenBalance(job),
  estimatedProfit: getJobEstimatedProfit(job),
});

export const getCustomerFinancials = (customerId: string): CustomerFinancials => {
  const jobs = JOBS.filter((job) => job.customer.id === customerId);
  const activeJobs = jobs.filter((job) => ACTIVE_JOB_STATUSES.has(job.status)).length;
  const totalRevenue = jobs.reduce(
    (sum, job) => sum + (job.status === "İptal Edildi" ? 0 : job.amount),
    0,
  );
  const totalExpenses = jobs.reduce(
    (sum, job) => sum + getJobExpenses(job.id),
    0,
  );
  const collected = jobs.reduce((sum, job) => sum + getJobCollected(job.id), 0);

  return {
    totalJobs: jobs.length,
    activeJobs,
    totalRevenue,
    totalExpenses,
    collected,
    openBalance: Math.max(totalRevenue - collected, 0),
    estimatedProfit: totalRevenue - totalExpenses,
  };
};

export const getCollectionFinancials = (): CollectionFinancials =>
  COLLECTIONS.reduce<CollectionFinancials>(
    (totals, collection) => {
      if (collection.status === "Tahsil Edildi") totals.collected += collection.amount;
      if (collection.status === "Bekliyor") totals.duePending += collection.amount;
      if (collection.status === "Gecikmiş") totals.overdue += collection.amount;
      return totals;
    },
    { collected: 0, duePending: 0, overdue: 0 },
  );

export const getDashboardFinancials = (): DashboardFinancials => {
  const totalRevenue = JOBS.reduce(
    (sum, job) => sum + (job.status === "İptal Edildi" ? 0 : job.amount),
    0,
  );
  const totalExpenses = EXPENSES.reduce((sum, expense) => sum + expense.amount, 0);
  const totalCollected = getCollectionFinancials().collected;
  const pendingQuoteRecords = QUOTES.filter((quote) => quote.status === "Beklemede");

  return {
    totalRevenue,
    totalExpenses,
    estimatedProfit: totalRevenue - totalExpenses,
    totalCollected,
    totalOpenBalance: Math.max(totalRevenue - totalCollected, 0),
    activeJobs: JOBS.filter((job) => ACTIVE_JOB_STATUSES.has(job.status)).length,
    pendingQuotes: pendingQuoteRecords.length,
    pendingQuoteAmount: pendingQuoteRecords.reduce(
      (sum, quote) => sum + calculateQuoteTotals(quote).grandTotal,
      0,
    ),
  };
};
