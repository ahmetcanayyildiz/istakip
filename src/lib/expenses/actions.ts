"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { isUuid } from "@/lib/customers/validation";
import { isCurrentAccountDemo } from "@/lib/demo/access";
import { DEMO_READ_ONLY_MESSAGE, isDemoReadOnlyError } from "@/lib/demo/errors";
import type { ExpenseActionState } from "@/lib/expenses/types";
import { validateExpenseForm } from "@/lib/expenses/validation";
import { createClient } from "@/lib/supabase/server";

type DatabaseError = {
  code?: string;
  message?: string;
  status?: number;
};

function errorState(message: string): ExpenseActionState {
  return { status: "error", message };
}

function logExpenseError(context: string, error: DatabaseError) {
  console.error(context, { code: error.code, status: error.status });
}

function mapExpenseError(error: DatabaseError) {
  const message = error.message?.toLowerCase() ?? "";

  if (isDemoReadOnlyError(error)) return DEMO_READ_ONLY_MESSAGE;
  if (error.code === "28000" || error.code === "42501" || error.code === "PGRST301") {
    return "Bu işlem için yetkiniz bulunmuyor. Lütfen yeniden giriş yapın.";
  }
  if (error.code === "P0002" && message.includes("job")) {
    return "Seçilen iş bulunamadı veya bu iş için yetkiniz yok.";
  }
  if (message.includes("category")) return "Geçerli bir gider kategorisi seçin.";
  if (message.includes("amount") || error.code === "22P02") {
    return "Tutar sıfırdan büyük ve geçerli bir para değeri olmalıdır.";
  }
  if (message.includes("date")) return "Geçerli bir gider tarihi girin.";
  if (message.includes("description")) return "Gider açıklaması zorunludur ve 500 karakteri aşamaz.";

  return "Gider oluşturulamadı. Lütfen bilgileri kontrol edip tekrar deneyin.";
}

export async function createExpenseAction(
  _previousState: ExpenseActionState,
  formData: FormData,
): Promise<ExpenseActionState> {
  const validation = validateExpenseForm(formData);
  if (!validation.success) return errorState(validation.message);
  if (await isCurrentAccountDemo()) return errorState(DEMO_READ_ONLY_MESSAGE);

  let supabase;
  try {
    supabase = await createClient();
    const { data, error } = await supabase.auth.getClaims();

    if (error || typeof data?.claims?.sub !== "string") {
      if (error) logExpenseError("Expense action authentication failed.", error);
      return errorState("Oturumunuz doğrulanamadı. Lütfen yeniden giriş yapın.");
    }
  } catch {
    return errorState("Gider şu anda oluşturulamıyor. Lütfen daha sonra tekrar deneyin.");
  }

  let expenseId: unknown;
  try {
    const { data, error } = await supabase.rpc("create_expense", {
      p_job_id: validation.data.jobId,
      p_expense_date: validation.data.expenseDate,
      p_description: validation.data.description,
      p_category: validation.data.category,
      p_amount: validation.data.amount,
    });

    if (error) {
      logExpenseError("Create expense RPC failed.", error);
      return errorState(mapExpenseError(error));
    }
    expenseId = data;
  } catch {
    return errorState("Gider şu anda oluşturulamıyor. Lütfen daha sonra tekrar deneyin.");
  }

  if (typeof expenseId !== "string" || !isUuid(expenseId)) {
    return errorState("Gider oluşturuldu ancak sonuç doğrulanamadı. Lütfen gider listesini kontrol edin.");
  }

  revalidatePath("/giderler");
  revalidatePath("/isler");
  revalidatePath(`/isler/${validation.data.jobId}`);
  redirect("/giderler");
}
