export type CollectionFinancialRecord = {
  amount: number;
  dueDate: string;
  status: "pending" | "paid";
};

export type CollectionDisplayStatus = "paid" | "pending" | "overdue";

export type CollectionSummary = {
  collected: number;
  duePending: number;
  overdue: number;
};

export type DashboardFinancials = CollectionSummary & {
  totalJobAmount: number;
  totalExpenses: number;
  estimatedProfit: number;
  totalOpenBalance: number;
  activeJobs: number;
  pendingQuotes: number;
  pendingQuoteAmount: number;
};

export function getIstanbulToday(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Istanbul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function deriveCollectionStatus(
  status: CollectionFinancialRecord["status"],
  dueDate: string,
  today: string,
): CollectionDisplayStatus {
  if (status === "paid") return "paid";
  return dueDate < today ? "overdue" : "pending";
}

export function calculateCollectionSummary(
  collections: CollectionFinancialRecord[],
  today: string,
): CollectionSummary {
  const summary: CollectionSummary = { collected: 0, duePending: 0, overdue: 0 };

  for (const collection of collections) {
    const displayStatus = deriveCollectionStatus(collection.status, collection.dueDate, today);
    if (displayStatus === "paid") summary.collected += collection.amount;
    else if (displayStatus === "overdue") summary.overdue += collection.amount;
    else summary.duePending += collection.amount;
  }

  return summary;
}

export function calculateOpenBalance(totalJobAmount: number, collected: number) {
  return totalJobAmount - collected;
}

export function calculateDashboardFinancials({
  jobs,
  expenses,
  collections,
  quotes,
  today,
}: {
  jobs: Array<{ status: string; contractAmount: number }>;
  expenses: Array<{ amount: number }>;
  collections: CollectionFinancialRecord[];
  quotes: Array<{ status: string; grandTotalCents: number }>;
  today: string;
}): DashboardFinancials {
  let totalJobAmount = 0;
  let activeJobs = 0;
  for (const job of jobs) {
    if (job.status !== "cancelled") totalJobAmount += job.contractAmount;
    if (job.status === "planned" || job.status === "in_progress" || job.status === "on_hold") {
      activeJobs += 1;
    }
  }

  let totalExpenses = 0;
  for (const expense of expenses) totalExpenses += expense.amount;

  let pendingQuotes = 0;
  let pendingQuoteAmount = 0;
  for (const quote of quotes) {
    if (quote.status !== "pending") continue;
    pendingQuotes += 1;
    pendingQuoteAmount += quote.grandTotalCents / 100;
  }

  const collectionSummary = calculateCollectionSummary(collections, today);

  return {
    ...collectionSummary,
    totalJobAmount,
    totalExpenses,
    estimatedProfit: totalJobAmount - totalExpenses,
    totalOpenBalance: calculateOpenBalance(totalJobAmount, collectionSummary.collected),
    activeJobs,
    pendingQuotes,
    pendingQuoteAmount,
  };
}
