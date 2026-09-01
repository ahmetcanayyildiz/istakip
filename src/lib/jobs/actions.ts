"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { isUuid } from "@/lib/customers/validation";
import { isCurrentAccountDemo } from "@/lib/demo/access";
import { DEMO_READ_ONLY_MESSAGE, isDemoReadOnlyError } from "@/lib/demo/errors";
import type { JobActionState } from "@/lib/jobs/types";
import { validateJobConversion } from "@/lib/jobs/validation";
import { createClient } from "@/lib/supabase/server";

type DatabaseError = {
  code?: string;
  message?: string;
  status?: number;
};

function errorState(message: string): JobActionState {
  return { status: "error", message };
}

function logJobError(context: string, error: DatabaseError) {
  console.error(context, { code: error.code, status: error.status });
}

function mapJobError(error: DatabaseError) {
  const message = error.message?.toLowerCase() ?? "";

  if (isDemoReadOnlyError(error)) return DEMO_READ_ONLY_MESSAGE;
  if (error.code === "28000" || error.code === "42501" || error.code === "PGRST301") {
    return "Bu işlem için yetkiniz bulunmuyor. Lütfen yeniden giriş yapın.";
  }
  if (error.code === "P0002" && message.includes("quote")) {
    return "Teklif bulunamadı veya bu teklif için yetkiniz yok.";
  }
  if (error.code === "P0001" && message.includes("already")) {
    return "Bu teklif zaten işe dönüştürülmüş.";
  }
  if (error.code === "23505") {
    return "Bu teklif zaten işe dönüştürülmüş.";
  }
  if (error.code === "P0001" && message.includes("approved")) {
    return "Yalnız onaylanmış teklifler işe dönüştürülebilir.";
  }
  if (error.code === "22023" && message.includes("date")) {
    return "Başlangıç veya hedef tarihi geçersiz.";
  }

  return "İş oluşturulamadı. Lütfen bilgileri kontrol edip tekrar deneyin.";
}

export async function createJobFromQuoteAction(
  quoteId: string,
  _previousState: JobActionState,
  formData: FormData,
): Promise<JobActionState> {
  const validation = validateJobConversion(quoteId, formData);
  if (!validation.success) return errorState(validation.message);
  if (await isCurrentAccountDemo()) return errorState(DEMO_READ_ONLY_MESSAGE);

  let supabase;
  try {
    supabase = await createClient();
    const { data, error } = await supabase.auth.getClaims();

    if (error || typeof data?.claims?.sub !== "string") {
      if (error) logJobError("Job conversion authentication failed.", error);
      return errorState("Oturumunuz doğrulanamadı. Lütfen yeniden giriş yapın.");
    }
  } catch {
    return errorState("İş şu anda oluşturulamıyor. Lütfen daha sonra tekrar deneyin.");
  }

  let quote: { customer_id: string } | null;
  let jobId: unknown;

  try {
    const { data, error: quoteError } = await supabase
      .from("quotes")
      .select("customer_id")
      .eq("id", validation.data.quoteId)
      .maybeSingle();

    if (quoteError) {
      logJobError("Job conversion quote lookup failed.", quoteError);
      return errorState("Teklif bilgisi doğrulanamadı. Lütfen tekrar deneyin.");
    }
    if (!data) return errorState("Teklif bulunamadı veya bu teklif için yetkiniz yok.");
    quote = data;

    const { data: createdJobId, error } = await supabase.rpc("create_job_from_quote", {
      p_quote_id: validation.data.quoteId,
      p_start_date: validation.data.startDate,
      p_target_date: validation.data.targetDate,
    });

    if (error) {
      logJobError("Create job from quote RPC failed.", error);
      return errorState(mapJobError(error));
    }

    jobId = createdJobId;
  } catch {
    return errorState("İş şu anda oluşturulamıyor. Lütfen daha sonra tekrar deneyin.");
  }

  if (typeof jobId !== "string" || !isUuid(jobId)) {
    return errorState("İş oluşturuldu ancak sonuç doğrulanamadı. Lütfen İşler listesini kontrol edin.");
  }

  revalidatePath("/isler");
  revalidatePath(`/isler/${jobId}`);
  revalidatePath("/teklifler");
  revalidatePath(`/teklifler/${validation.data.quoteId}`);
  revalidatePath(`/musteriler/${quote.customer_id}`);
  redirect(`/isler/${jobId}`);
}
