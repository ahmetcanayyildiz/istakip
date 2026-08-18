import "server-only";

import { cache } from "react";

import {
  EXPENSE_CATEGORY_LABELS,
  type ExpenseCategory,
  type ExpenseJob,
  type ExpenseListItem,
} from "@/lib/expenses/types";
import { createClient } from "@/lib/supabase/server";

type Numeric = number | string;

type CustomerRelation = {
  id: string;
  name: string;
};

type JobRelation = {
  id: string;
  code: string;
  title: string;
  customers: CustomerRelation | CustomerRelation[] | null;
};

type ExpenseRow = {
  id: string;
  expense_date: string;
  description: string;
  category: ExpenseCategory;
  amount: Numeric;
  jobs: JobRelation | JobRelation[] | null;
};

type JobOptionRow = Omit<JobRelation, "customers"> & {
  customers: CustomerRelation | CustomerRelation[] | null;
};

export class ExpenseDataError extends Error {
  constructor() {
    super("Expense data could not be loaded.");
    this.name = "ExpenseDataError";
  }
}

function logQueryError(context: string, error: { code?: string; status?: number }) {
  console.error(context, { code: error.code, status: error.status });
}

function firstRelation<T>(relation: T | T[] | null): T | null {
  return Array.isArray(relation) ? relation[0] ?? null : relation;
}

function mapJob(row: JobRelation | JobOptionRow): ExpenseJob | null {
  const customer = firstRelation(row.customers);
  if (!customer) return null;

  return {
    id: row.id,
    code: row.code,
    title: row.title,
    customer,
  };
}

export const getExpenses = cache(async (): Promise<ExpenseListItem[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("expenses")
    .select(
      "id, expense_date, description, category, amount, jobs!expenses_job_company_fkey(id, code, title, customers!jobs_customer_company_fkey(id, name))",
    )
    .order("expense_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    logQueryError("Expense list query failed.", error);
    throw new ExpenseDataError();
  }

  return ((data ?? []) as unknown as ExpenseRow[]).flatMap((row) => {
    const jobRelation = firstRelation(row.jobs);
    const job = jobRelation ? mapJob(jobRelation) : null;
    if (!job) return [];

    return [{
      id: row.id,
      date: row.expense_date,
      description: row.description,
      category: row.category,
      categoryLabel: EXPENSE_CATEGORY_LABELS[row.category],
      amount: Number(row.amount),
      job,
    }];
  });
});

export const getExpenseJobOptions = cache(async (): Promise<ExpenseJob[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("jobs")
    .select("id, code, title, customers!jobs_customer_company_fkey(id, name)")
    .order("start_date", { ascending: false });

  if (error) {
    logQueryError("Expense job options query failed.", error);
    throw new ExpenseDataError();
  }

  return ((data ?? []) as unknown as JobOptionRow[]).flatMap((row) => {
    const job = mapJob(row);
    return job ? [job] : [];
  });
});
