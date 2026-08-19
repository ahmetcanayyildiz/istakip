import "server-only";

import { cache } from "react";

import {
  COLLECTION_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  type CollectionJob,
  type CollectionJobOption,
  type CollectionListItem,
  type CollectionStatus,
  type PaymentMethod,
} from "@/lib/collections/types";
import { deriveCollectionStatus, getIstanbulToday } from "@/lib/finance/calculations";
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
  contract_amount: Numeric;
  customers: CustomerRelation | CustomerRelation[] | null;
};

type CollectionRow = {
  id: string;
  amount: Numeric;
  due_date: string;
  status: CollectionStatus;
  payment_method: PaymentMethod | null;
  paid_at: string | null;
  jobs: JobRelation | JobRelation[] | null;
};

type JobOptionRow = JobRelation & {
  collections: Array<{ amount: Numeric }> | null;
};

export class CollectionDataError extends Error {
  constructor() {
    super("Collection data could not be loaded.");
    this.name = "CollectionDataError";
  }
}

function logQueryError(context: string, error: { code?: string; status?: number }) {
  console.error(context, { code: error.code, status: error.status });
}

function firstRelation<T>(relation: T | T[] | null): T | null {
  return Array.isArray(relation) ? relation[0] ?? null : relation;
}

function mapJob(row: JobRelation): CollectionJob | null {
  const customer = firstRelation(row.customers);
  if (!customer) return null;

  return {
    id: row.id,
    code: row.code,
    title: row.title,
    contractAmount: Number(row.contract_amount),
    customer,
  };
}

export const getCollections = cache(async (): Promise<CollectionListItem[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("collections")
    .select(
      "id, amount, due_date, status, payment_method, paid_at, jobs!collections_job_company_fkey(id, code, title, contract_amount, customers!jobs_customer_company_fkey(id, name))",
    )
    .order("due_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    logQueryError("Collection list query failed.", error);
    throw new CollectionDataError();
  }

  const today = getIstanbulToday();

  return ((data ?? []) as unknown as CollectionRow[]).flatMap((row) => {
    const jobRelation = firstRelation(row.jobs);
    const job = jobRelation ? mapJob(jobRelation) : null;
    if (!job) return [];

    const displayStatus = deriveCollectionStatus(row.status, row.due_date, today);
    return [{
      id: row.id,
      amount: Number(row.amount),
      dueDate: row.due_date,
      paidDate: row.paid_at?.slice(0, 10) ?? null,
      status: row.status,
      displayStatus,
      statusLabel: COLLECTION_STATUS_LABELS[displayStatus],
      paymentMethod: row.payment_method,
      paymentMethodLabel: row.payment_method ? PAYMENT_METHOD_LABELS[row.payment_method] : null,
      job,
    }];
  });
});

export const getCollectionJobOptions = cache(async (): Promise<CollectionJobOption[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("jobs")
    .select(
      "id, code, title, contract_amount, customers!jobs_customer_company_fkey(id, name), collections!collections_job_company_fkey(amount)",
    )
    .order("start_date", { ascending: false });

  if (error) {
    logQueryError("Collection job options query failed.", error);
    throw new CollectionDataError();
  }

  return ((data ?? []) as unknown as JobOptionRow[]).flatMap((row) => {
    const job = mapJob(row);
    if (!job) return [];

    let allocatedAmount = 0;
    for (const collection of row.collections ?? []) {
      allocatedAmount += Number(collection.amount);
    }

    return [{
      ...job,
      allocatedAmount,
      availableAmount: job.contractAmount - allocatedAmount,
    }];
  });
});
