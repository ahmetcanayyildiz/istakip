import "server-only";

import { cache } from "react";

import { isUuid } from "@/lib/customers/validation";
import { calculateQuoteTotals } from "@/lib/quotes/calculations";
import {
  QUOTE_STATUS_LABELS,
  type QuoteCustomerOption,
  type QuoteDetail,
  type QuoteItem,
  type QuoteListItem,
  type QuoteStatus,
} from "@/lib/quotes/types";
import { createClient } from "@/lib/supabase/server";

type Numeric = number | string;

type CustomerRelation = {
  id: string;
  name: string;
  contact_name?: string | null;
  phone?: string | null;
  email?: string | null;
  is_active?: boolean;
};

type QuoteItemRow = {
  id?: string;
  position?: number;
  description?: string;
  quantity: Numeric;
  unit?: string;
  unit_price: Numeric;
};

type QuoteRow = {
  id: string;
  code: string;
  title: string;
  status: QuoteStatus;
  issue_date: string;
  valid_until: string;
  discount_amount: Numeric;
  vat_rate: Numeric;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
  customers: CustomerRelation | CustomerRelation[] | null;
  quote_items: QuoteItemRow[] | null;
};

type CustomerOptionRow = {
  id: string;
  name: string;
  is_active: boolean;
};

export class QuoteDataError extends Error {
  constructor() {
    super("Quote data could not be loaded.");
    this.name = "QuoteDataError";
  }
}

function logQueryError(context: string, error: { code?: string; status?: number }) {
  console.error(context, { code: error.code, status: error.status });
}

function getCustomer(relation: QuoteRow["customers"]): CustomerRelation | null {
  if (Array.isArray(relation)) return relation[0] ?? null;
  return relation;
}

function mapBaseQuote(row: QuoteRow): QuoteListItem | null {
  const customer = getCustomer(row.customers);
  if (!customer) return null;

  const items = row.quote_items ?? [];
  const totals = calculateQuoteTotals({
    items: items.map((item) => ({ quantity: item.quantity, unitPrice: item.unit_price })),
    discountAmount: row.discount_amount,
    vatRate: row.vat_rate,
  });

  return {
    id: row.id,
    code: row.code,
    title: row.title,
    customer: { id: customer.id, name: customer.name },
    status: row.status,
    statusLabel: QUOTE_STATUS_LABELS[row.status],
    issueDate: row.issue_date,
    validUntil: row.valid_until,
    vatRate: String(row.vat_rate),
    ...totals,
  };
}

export const getQuotes = cache(async (): Promise<QuoteListItem[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("quotes")
    .select(
      "id, code, title, status, issue_date, valid_until, discount_amount, vat_rate, customers!quotes_customer_company_fkey(id, name), quote_items(quantity, unit_price)",
    )
    .order("issue_date", { ascending: false });

  if (error) {
    logQueryError("Quote list query failed.", error);
    throw new QuoteDataError();
  }

  return ((data ?? []) as unknown as QuoteRow[])
    .map(mapBaseQuote)
    .filter((quote): quote is QuoteListItem => quote !== null);
});

export const getQuoteById = cache(async (id: string): Promise<QuoteDetail | null> => {
  if (!isUuid(id)) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("quotes")
    .select(
      "id, code, title, status, issue_date, valid_until, discount_amount, vat_rate, notes, created_at, updated_at, customers!quotes_customer_company_fkey(id, name, contact_name, phone, email, is_active), quote_items(id, position, description, quantity, unit, unit_price)",
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    logQueryError("Quote detail query failed.", error);
    throw new QuoteDataError();
  }

  if (!data) return null;

  const row = data as unknown as QuoteRow;
  const base = mapBaseQuote(row);
  const customer = getCustomer(row.customers);
  if (!base || !customer) return null;

  const items: QuoteItem[] = (row.quote_items ?? [])
    .map((item) => ({
      id: item.id ?? "",
      position: item.position ?? 0,
      description: item.description ?? "",
      quantity: String(item.quantity),
      unit: item.unit ?? "",
      unitPrice: String(item.unit_price),
    }))
    .sort((left, right) => left.position - right.position);

  return {
    ...base,
    customer: {
      id: customer.id,
      name: customer.name,
      contactName: customer.contact_name ?? null,
      phone: customer.phone ?? null,
      email: customer.email ?? null,
      isActive: customer.is_active ?? false,
    },
    notes: row.notes ?? null,
    createdAt: row.created_at ?? "",
    updatedAt: row.updated_at ?? "",
    discountAmount: String(row.discount_amount),
    items,
  };
});

export const getActiveQuoteCustomers = cache(async (): Promise<QuoteCustomerOption[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("customers")
    .select("id, name, is_active")
    .eq("is_active", true)
    .order("name");

  if (error) {
    logQueryError("Quote customer options query failed.", error);
    throw new QuoteDataError();
  }

  return ((data ?? []) as CustomerOptionRow[]).map((customer) => ({
    id: customer.id,
    name: customer.name,
    isActive: customer.is_active,
  }));
});
