"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import type { CollectionActionState } from "@/lib/collections/types";
import {
  validateCollectionForm,
  validateMarkCollectionPaidForm,
} from "@/lib/collections/validation";
import { isUuid } from "@/lib/customers/validation";
import { isCurrentAccountDemo } from "@/lib/demo/access";
import { DEMO_READ_ONLY_MESSAGE, isDemoReadOnlyError } from "@/lib/demo/errors";
import { createClient } from "@/lib/supabase/server";

type DatabaseError = {
  code?: string;
  message?: string;
  status?: number;
};

function errorState(message: string): CollectionActionState {
  return { status: "error", message };
}

function logCollectionError(context: string, error: DatabaseError) {
  console.error(context, { code: error.code, status: error.status });
}

function mapCollectionError(error: DatabaseError) {
  const message = error.message?.toLowerCase() ?? "";

  if (isDemoReadOnlyError(error)) return DEMO_READ_ONLY_MESSAGE;
  if (error.code === "28000" || error.code === "42501" || error.code === "PGRST301") {
    return "Bu işlem için yetkiniz bulunmuyor. Lütfen yeniden giriş yapın.";
  }
  if (error.code === "P0002" && message.includes("job")) {
    return "Seçilen iş bulunamadı veya bu iş için yetkiniz yok.";
  }
  if (error.code === "P0002" && message.includes("collection")) {
    return "Tahsilat bulunamadı veya bu tahsilat için yetkiniz yok.";
  }
  if (error.code === "23514" || message.includes("contract amount")) {
    return "Planlanan toplam tahsilat iş bedelini aşamaz.";
  }
  if (message.includes("only pending")) return "Yalnız bekleyen tahsilatlar ödendi olarak işaretlenebilir.";
  if (message.includes("payment method")) return "Geçerli bir ödeme yöntemi seçin.";
  if (message.includes("date")) return "Geçerli bir tarih girin.";
  if (message.includes("amount") || error.code === "22P02") {
    return "Tutar sıfırdan büyük ve geçerli bir para değeri olmalıdır.";
  }

  return "Tahsilat işlemi tamamlanamadı. Lütfen bilgileri kontrol edip tekrar deneyin.";
}

async function getAuthenticatedClient() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || typeof data?.claims?.sub !== "string") {
    if (error) logCollectionError("Collection action authentication failed.", error);
    return null;
  }

  return supabase;
}

function revalidateCollectionPaths(jobId?: string) {
  revalidatePath("/");
  revalidatePath("/tahsilatlar");
  revalidatePath("/isler");
  if (jobId) revalidatePath(`/isler/${jobId}`);
}

export async function createCollectionAction(
  _previousState: CollectionActionState,
  formData: FormData,
): Promise<CollectionActionState> {
  const validation = validateCollectionForm(formData);
  if (!validation.success) return errorState(validation.message);
  if (await isCurrentAccountDemo()) return errorState(DEMO_READ_ONLY_MESSAGE);

  let supabase;
  try {
    supabase = await getAuthenticatedClient();
    if (!supabase) return errorState("Oturumunuz doğrulanamadı. Lütfen yeniden giriş yapın.");
  } catch {
    return errorState("Tahsilat şu anda oluşturulamıyor. Lütfen daha sonra tekrar deneyin.");
  }

  let collectionId: unknown;
  try {
    const { data, error } = await supabase.rpc("create_collection", {
      p_job_id: validation.data.jobId,
      p_amount: validation.data.amount,
      p_due_date: validation.data.dueDate,
    });

    if (error) {
      logCollectionError("Create collection RPC failed.", error);
      return errorState(mapCollectionError(error));
    }
    collectionId = data;
  } catch {
    return errorState("Tahsilat şu anda oluşturulamıyor. Lütfen daha sonra tekrar deneyin.");
  }

  if (typeof collectionId !== "string" || !isUuid(collectionId)) {
    return errorState("Tahsilat oluşturuldu ancak sonuç doğrulanamadı. Lütfen tahsilat listesini kontrol edin.");
  }

  revalidateCollectionPaths(validation.data.jobId);
  redirect("/tahsilatlar");
}

export async function markCollectionPaidAction(
  _previousState: CollectionActionState,
  formData: FormData,
): Promise<CollectionActionState> {
  const validation = validateMarkCollectionPaidForm(formData);
  if (!validation.success) return errorState(validation.message);
  if (await isCurrentAccountDemo()) return errorState(DEMO_READ_ONLY_MESSAGE);

  let supabase;
  try {
    supabase = await getAuthenticatedClient();
    if (!supabase) return errorState("Oturumunuz doğrulanamadı. Lütfen yeniden giriş yapın.");
  } catch {
    return errorState("Tahsilat şu anda güncellenemiyor. Lütfen daha sonra tekrar deneyin.");
  }

  let collectionId: unknown;
  try {
    const { data, error } = await supabase.rpc("mark_collection_paid", {
      p_collection_id: validation.data.collectionId,
      p_paid_date: validation.data.paidDate,
      p_payment_method: validation.data.paymentMethod,
    });

    if (error) {
      logCollectionError("Mark collection paid RPC failed.", error);
      return errorState(mapCollectionError(error));
    }
    collectionId = data;
  } catch {
    return errorState("Tahsilat şu anda güncellenemiyor. Lütfen daha sonra tekrar deneyin.");
  }

  if (typeof collectionId !== "string" || !isUuid(collectionId)) {
    return errorState("Tahsilat güncellendi ancak sonuç doğrulanamadı. Lütfen listeyi yenileyin.");
  }

  revalidateCollectionPaths();
  redirect("/tahsilatlar");
}
