"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { isUuid } from "@/lib/customers/validation";
import { isCurrentAccountDemo } from "@/lib/demo/access";
import { DEMO_READ_ONLY_MESSAGE, isDemoReadOnlyError } from "@/lib/demo/errors";
import type { QuoteActionState, QuoteMutationValues } from "@/lib/quotes/types";
import { validateQuoteForm } from "@/lib/quotes/validation";
import { createClient } from "@/lib/supabase/server";

type DatabaseError = {
  code?: string;
  message?: string;
  status?: number;
};

function errorState(message: string): QuoteActionState {
  return { status: "error", message };
}

function logQuoteError(context: string, error: DatabaseError) {
  console.error(context, { code: error.code, status: error.status });
}

function mapQuoteError(error: DatabaseError, operation: "create" | "update") {
  const message = error.message?.toLowerCase() ?? "";

  if (isDemoReadOnlyError(error)) return DEMO_READ_ONLY_MESSAGE;
  if (error.code === "28000" || error.code === "42501" || error.code === "PGRST301") {
    return "Bu işlem için yetkiniz yok. Lütfen yeniden giriş yapın.";
  }
  if (error.code === "P0001" && message.includes("approved")) {
    return "Onaylanmış teklifler düzenlenemez.";
  }
  if (error.code === "P0002" && message.includes("customer")) {
    return "Seçilen müşteri bulunamadı veya bu müşteri için yetkiniz yok.";
  }
  if (error.code === "P0002" && message.includes("quote")) {
    return "Teklif bulunamadı veya bu işlem için yetkiniz yok.";
  }
  if (message.includes("at least one item") || message.includes("contain at least one item")) {
    return "En az bir teklif kalemi ekleyin.";
  }
  if (message.includes("quantity")) return "Teklif kalemlerinden birinin miktarı geçersiz.";
  if (message.includes("unit price")) return "Teklif kalemlerinden birinin birim fiyatı geçersiz.";
  if (message.includes("date")) return "Teklif veya geçerlilik tarihi geçersiz.";
  if (message.includes("vat")) return "KDV oranı geçersiz.";
  if (message.includes("discount")) return "İndirim tutarı geçersiz.";

  return operation === "create"
    ? "Teklif oluşturulamadı. Lütfen bilgileri kontrol edip tekrar deneyin."
    : "Teklif güncellenemedi. Lütfen bilgileri kontrol edip tekrar deneyin.";
}

async function getAuthenticatedClient() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || typeof data?.claims?.sub !== "string") {
    if (error) logQuoteError("Quote action authentication failed.", error);
    return null;
  }

  return supabase;
}

function toRpcParameters(values: QuoteMutationValues) {
  return {
    p_customer_id: values.customerId,
    p_title: values.title,
    p_issue_date: values.issueDate,
    p_valid_until: values.validUntil,
    p_status: values.status,
    p_discount_amount: values.discountAmount,
    p_vat_rate: values.vatRate,
    p_notes: values.notes,
    p_items: values.items,
  };
}

export async function createQuoteAction(
  _previousState: QuoteActionState,
  formData: FormData,
): Promise<QuoteActionState> {
  const validation = validateQuoteForm(formData);
  if (!validation.success) return errorState(validation.message);
  if (await isCurrentAccountDemo()) return errorState(DEMO_READ_ONLY_MESSAGE);

  let supabase;
  try {
    supabase = await getAuthenticatedClient();
  } catch {
    return errorState("Teklif şu anda oluşturulamıyor. Lütfen daha sonra tekrar deneyin.");
  }

  if (!supabase) return errorState("Oturumunuz doğrulanamadı. Lütfen yeniden giriş yapın.");

  let quoteId: unknown;
  try {
    const result = await supabase.rpc("create_quote", toRpcParameters(validation.data));
    if (result.error) {
      logQuoteError("Create quote RPC failed.", result.error);
      return errorState(mapQuoteError(result.error, "create"));
    }
    quoteId = result.data;
  } catch {
    return errorState("Teklif şu anda oluşturulamıyor. Lütfen daha sonra tekrar deneyin.");
  }

  if (typeof quoteId !== "string" || !isUuid(quoteId)) {
    return errorState("Teklif oluşturuldu ancak sonuç doğrulanamadı. Lütfen teklif listesini kontrol edin.");
  }

  revalidatePath("/teklifler");
  revalidatePath(`/teklifler/${quoteId}`);
  revalidatePath(`/musteriler/${validation.data.customerId}`);
  redirect(`/teklifler/${quoteId}`);
}

export async function updateQuoteAction(
  quoteId: string,
  previousCustomerId: string,
  _previousState: QuoteActionState,
  formData: FormData,
): Promise<QuoteActionState> {
  if (!isUuid(quoteId)) return errorState("Teklif bulunamadı.");

  const validation = validateQuoteForm(formData);
  if (!validation.success) return errorState(validation.message);
  if (await isCurrentAccountDemo()) return errorState(DEMO_READ_ONLY_MESSAGE);

  let supabase;
  try {
    supabase = await getAuthenticatedClient();
  } catch {
    return errorState("Teklif şu anda güncellenemiyor. Lütfen daha sonra tekrar deneyin.");
  }

  if (!supabase) return errorState("Oturumunuz doğrulanamadı. Lütfen yeniden giriş yapın.");

  let updatedQuoteId: unknown;
  try {
    const result = await supabase.rpc("update_quote", {
      p_quote_id: quoteId,
      ...toRpcParameters(validation.data),
    });
    if (result.error) {
      logQuoteError("Update quote RPC failed.", result.error);
      return errorState(mapQuoteError(result.error, "update"));
    }
    updatedQuoteId = result.data;
  } catch {
    return errorState("Teklif şu anda güncellenemiyor. Lütfen daha sonra tekrar deneyin.");
  }

  if (typeof updatedQuoteId !== "string" || updatedQuoteId !== quoteId) {
    return errorState("Teklif güncellendi ancak sonuç doğrulanamadı. Lütfen teklif detayını kontrol edin.");
  }

  revalidatePath("/teklifler");
  revalidatePath(`/teklifler/${quoteId}`);
  revalidatePath(`/musteriler/${previousCustomerId}`);
  if (validation.data.customerId !== previousCustomerId) {
    revalidatePath(`/musteriler/${validation.data.customerId}`);
  }
  redirect(`/teklifler/${quoteId}`);
}
