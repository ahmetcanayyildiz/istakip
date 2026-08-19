import "server-only";

import { cache } from "react";

import {
  COLLECTION_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  type PaymentMethod,
} from "@/lib/collections/types";
import { isUuid } from "@/lib/customers/validation";
import {
  EXPENSE_CATEGORY_LABELS,
  type ExpenseCategory,
} from "@/lib/expenses/types";
import {
  calculateOpenBalance,
  deriveCollectionStatus,
  getIstanbulToday,
} from "@/lib/finance/calculations";
import {
  JOB_STATUS_LABELS,
  type JobCollectionRecord,
  type JobCustomer,
  type JobDetail,
  type JobExpenseRecord,
  type JobListItem,
  type JobSourceQuote,
  type JobStatus,
} from "@/lib/jobs/types";
import { QUOTE_STATUS_LABELS, type QuoteStatus } from "@/lib/quotes/types";
import { createClient } from "@/lib/supabase/server";

type Numeric = number | string;

type CustomerRelation = {
  id: string;
  name: string;
  contact_name?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  city?: string | null;
};

type QuoteRelation = {
  id: string;
  code: string;
  title: string;
  status: QuoteStatus;
  issue_date: string;
};

type ExpenseRow = {
  id: string;
  expense_date: string;
  description: string;
  category: ExpenseCategory;
  amount: Numeric;
};

type CollectionRow = {
  id: string;
  amount: Numeric;
  due_date: string;
  status: "pending" | "paid";
  payment_method: PaymentMethod | null;
  paid_at: string | null;
};

type JobRow = {
  id: string;
  code: string;
  title: string;
  status: JobStatus;
  start_date: string;
  target_date: string;
  contract_amount: Numeric;
  customers: CustomerRelation | CustomerRelation[] | null;
  quotes: QuoteRelation | QuoteRelation[] | null;
  expenses?: ExpenseRow[] | null;
  collections?: CollectionRow[] | null;
};

export class JobDataError extends Error {
  constructor() {
    super("Job data could not be loaded.");
    this.name = "JobDataError";
  }
}

function logQueryError(context: string, error: { code?: string; status?: number }) {
  console.error(context, { code: error.code, status: error.status });
}

function firstRelation<T>(relation: T | T[] | null): T | null {
  return Array.isArray(relation) ? relation[0] ?? null : relation;
}

function mapSourceQuote(relation: JobRow["quotes"]): JobSourceQuote | null {
  const quote = firstRelation(relation);
  if (!quote) return null;

  return {
    id: quote.id,
    code: quote.code,
    title: quote.title,
    status: quote.status,
    statusLabel: QUOTE_STATUS_LABELS[quote.status],
    issueDate: quote.issue_date,
  };
}

function mapListJob(row: JobRow): JobListItem | null {
  const customer = firstRelation(row.customers);
  if (!customer) return null;

  return {
    id: row.id,
    code: row.code,
    title: row.title,
    status: row.status,
    statusLabel: JOB_STATUS_LABELS[row.status],
    startDate: row.start_date,
    targetDate: row.target_date,
    contractAmount: Number(row.contract_amount),
    customer: { id: customer.id, name: customer.name },
    sourceQuote: mapSourceQuote(row.quotes),
  };
}

function mapExpenses(rows: ExpenseRow[]): JobExpenseRecord[] {
  return rows.map((expense) => ({
    id: expense.id,
    date: expense.expense_date,
    description: expense.description,
    category: EXPENSE_CATEGORY_LABELS[expense.category],
    amount: Number(expense.amount),
  }));
}

function mapCollections(rows: CollectionRow[]): JobCollectionRecord[] {
  const today = getIstanbulToday();

  return rows.map((collection) => {
    const displayStatus = deriveCollectionStatus(collection.status, collection.due_date, today);

    return {
      id: collection.id,
      amount: Number(collection.amount),
      dueDate: collection.due_date,
      paidAt: collection.paid_at,
      displayDate: collection.paid_at?.slice(0, 10) ?? collection.due_date,
      paymentMethod: collection.payment_method
        ? PAYMENT_METHOD_LABELS[collection.payment_method]
        : "—",
      status: collection.status,
      statusLabel: COLLECTION_STATUS_LABELS[displayStatus],
    };
  });
}

export const getJobs = cache(async (): Promise<JobListItem[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("jobs")
    .select(
      "id, code, title, status, start_date, target_date, contract_amount, customers!jobs_customer_company_fkey(id, name), quotes!jobs_source_quote_customer_company_fkey(id, code, title, status, issue_date)",
    )
    .order("start_date", { ascending: false });

  if (error) {
    logQueryError("Job list query failed.", error);
    throw new JobDataError();
  }

  return ((data ?? []) as unknown as JobRow[])
    .map(mapListJob)
    .filter((job): job is JobListItem => job !== null);
});

export const getJobById = cache(async (id: string): Promise<JobDetail | null> => {
  if (!isUuid(id)) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("jobs")
    .select(
      "id, code, title, status, start_date, target_date, contract_amount, customers!jobs_customer_company_fkey(id, name, contact_name, phone, email, address, city), quotes!jobs_source_quote_customer_company_fkey(id, code, title, status, issue_date), expenses!expenses_job_company_fkey(id, expense_date, description, category, amount), collections!collections_job_company_fkey(id, amount, due_date, status, payment_method, paid_at)",
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    logQueryError("Job detail query failed.", error);
    throw new JobDataError();
  }

  if (!data) return null;

  const row = data as unknown as JobRow;
  const base = mapListJob(row);
  const customer = firstRelation(row.customers);
  if (!base || !customer) return null;

  const expenses = mapExpenses(row.expenses ?? []);
  const collections = mapCollections(row.collections ?? []);
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const collected = collections.reduce(
    (sum, collection) => sum + (collection.status === "paid" ? collection.amount : 0),
    0,
  );

  const fullCustomer: JobCustomer = {
    id: customer.id,
    name: customer.name,
    contactName: customer.contact_name ?? null,
    phone: customer.phone ?? null,
    email: customer.email ?? null,
    address: customer.address ?? null,
    city: customer.city ?? null,
  };

  return {
    ...base,
    customer: fullCustomer,
    expenses,
    collections,
    financials: {
      totalExpenses,
      collected,
      openBalance: calculateOpenBalance(base.contractAmount, collected),
      estimatedProfit: base.contractAmount - totalExpenses,
    },
  };
});
