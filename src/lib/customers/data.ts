import "server-only";

import { cache } from "react";

import type {
  Customer,
  CustomerListItem,
  CustomerRelatedData,
  CustomerRelatedRecord,
} from "@/lib/customers/types";
import { isUuid } from "@/lib/customers/validation";
import { createClient } from "@/lib/supabase/server";

type CustomerRow = {
  id: string;
  name: string;
  contact_name: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  is_active: boolean;
  created_at: string;
};

type CustomerListRow = Omit<CustomerRow, "address">;

type CollectionRow = {
  amount: number | string;
  status: "pending" | "paid";
};

type JobRow = {
  id: string;
  code: string;
  title: string;
  status: "planned" | "in_progress" | "on_hold" | "completed" | "cancelled";
  start_date: string;
  contract_amount: number | string;
  collections: CollectionRow[] | null;
};

type QuoteItemRow = {
  quantity: number | string;
  unit_price: number | string;
};

type QuoteRow = {
  id: string;
  code: string;
  title: string;
  status: "draft" | "sent" | "pending" | "approved" | "rejected";
  issue_date: string;
  discount_amount: number | string;
  vat_rate: number | string;
  quote_items: QuoteItemRow[] | null;
};

const JOB_STATUS_LABELS: Record<JobRow["status"], string> = {
  planned: "Planlandı",
  in_progress: "Devam Ediyor",
  on_hold: "Beklemede",
  completed: "Tamamlandı",
  cancelled: "İptal Edildi",
};

const QUOTE_STATUS_LABELS: Record<QuoteRow["status"], string> = {
  draft: "Taslak",
  sent: "Gönderildi",
  pending: "Beklemede",
  approved: "Onaylandı",
  rejected: "Reddedildi",
};

export class CustomerDataError extends Error {
  constructor() {
    super("Customer data could not be loaded.");
    this.name = "CustomerDataError";
  }
}

function logQueryError(context: string, error: { code?: string; status?: number }) {
  console.error(context, { code: error.code, status: error.status });
}

function mapCustomer(row: CustomerRow): Customer {
  return {
    id: row.id,
    name: row.name,
    contactName: row.contact_name,
    phone: row.phone,
    email: row.email,
    address: row.address,
    city: row.city,
    isActive: row.is_active,
    status: row.is_active ? "Aktif" : "Pasif",
    createdAt: row.created_at,
  };
}

function mapCustomerListItem(row: CustomerListRow): CustomerListItem {
  return {
    id: row.id,
    name: row.name,
    contactName: row.contact_name,
    phone: row.phone,
    email: row.email,
    city: row.city,
    isActive: row.is_active,
    status: row.is_active ? "Aktif" : "Pasif",
    createdAt: row.created_at,
  };
}

export const getCustomers = cache(async (): Promise<CustomerListItem[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("customers")
    .select("id, name, contact_name, phone, email, city, is_active, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    logQueryError("Customer list query failed.", error);
    throw new CustomerDataError();
  }

  return ((data ?? []) as CustomerListRow[]).map(mapCustomerListItem);
});

export const getCustomerById = cache(async (id: string): Promise<Customer | null> => {
  if (!isUuid(id)) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("customers")
    .select("id, name, contact_name, phone, email, address, city, is_active, created_at")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    logQueryError("Customer detail query failed.", error);
    throw new CustomerDataError();
  }

  return data ? mapCustomer(data as CustomerRow) : null;
});

export const getCustomerRelatedData = cache(async (customerId: string): Promise<CustomerRelatedData> => {
  const supabase = await createClient();
  const [jobsResult, quotesResult] = await Promise.all([
    supabase
      .from("jobs")
      .select("id, code, title, status, start_date, contract_amount, collections(amount, status)")
      .eq("customer_id", customerId)
      .order("start_date", { ascending: false }),
    supabase
      .from("quotes")
      .select("id, code, title, status, issue_date, discount_amount, vat_rate, quote_items(quantity, unit_price)")
      .eq("customer_id", customerId)
      .order("issue_date", { ascending: false }),
  ]);

  if (jobsResult.error || quotesResult.error) {
    if (jobsResult.error) logQueryError("Customer jobs query failed.", jobsResult.error);
    if (quotesResult.error) logQueryError("Customer quotes query failed.", quotesResult.error);
    throw new CustomerDataError();
  }

  const jobs = (jobsResult.data ?? []) as unknown as JobRow[];
  const quotes = (quotesResult.data ?? []) as unknown as QuoteRow[];
  const activeStatuses = new Set<JobRow["status"]>(["planned", "in_progress", "on_hold"]);
  let totalRevenue = 0;
  let collectedAmount = 0;

  const jobRecords: CustomerRelatedRecord[] = jobs.map((job) => {
    const contractAmount = Number(job.contract_amount);
    if (job.status !== "cancelled") totalRevenue += contractAmount;
    collectedAmount += (job.collections ?? [])
      .filter((collection) => collection.status === "paid")
      .reduce((sum, collection) => sum + Number(collection.amount), 0);

    return {
      id: job.id,
      code: job.code,
      title: job.title,
      status: JOB_STATUS_LABELS[job.status],
      amount: contractAmount,
      date: job.start_date,
    };
  });

  const quoteRecords: CustomerRelatedRecord[] = quotes.map((quote) => {
    const subtotal = (quote.quote_items ?? []).reduce(
      (sum, item) => sum + Number(item.quantity) * Number(item.unit_price),
      0,
    );
    const discountedSubtotal = Math.max(0, subtotal - Number(quote.discount_amount));
    const grandTotal = discountedSubtotal * (1 + Number(quote.vat_rate) / 100);

    return {
      id: quote.id,
      code: quote.code,
      title: quote.title,
      status: QUOTE_STATUS_LABELS[quote.status],
      amount: grandTotal,
      date: quote.issue_date,
    };
  });

  return {
    financials: {
      totalJobs: jobs.length,
      activeJobs: jobs.filter((job) => activeStatuses.has(job.status)).length,
      totalRevenue,
      openBalance: Math.max(0, totalRevenue - collectedAmount),
    },
    jobs: jobRecords.slice(0, 5),
    quotes: quoteRecords.slice(0, 5),
  };
});
