"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import type { CustomerActionState } from "@/lib/customers/types";
import { isUuid, validateCustomerForm } from "@/lib/customers/validation";
import { createClient } from "@/lib/supabase/server";

type DatabaseError = {
  code?: string;
  status?: number;
};

function errorState(message: string): CustomerActionState {
  return { status: "error", message };
}

function logCustomerError(context: string, error: DatabaseError) {
  console.error(context, { code: error.code, status: error.status });
}

async function getAuthenticatedClient() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || typeof data?.claims?.sub !== "string") {
    if (error) logCustomerError("Customer action authentication failed.", error);
    return null;
  }

  return supabase;
}

export async function createCustomerAction(
  _previousState: CustomerActionState,
  formData: FormData,
): Promise<CustomerActionState> {
  const validation = validateCustomerForm(formData);
  if (!validation.success) return errorState(validation.message);

  let supabase;
  try {
    supabase = await getAuthenticatedClient();
  } catch {
    return errorState("Müşteri kaydı şu anda oluşturulamıyor. Lütfen daha sonra tekrar deneyin.");
  }

  if (!supabase) return errorState("Oturumunuz doğrulanamadı. Lütfen yeniden giriş yapın.");

  const { data: companyId, error: companyError } = await supabase.rpc("current_company_id");
  if (companyError || typeof companyId !== "string") {
    if (companyError) logCustomerError("Current company lookup failed.", companyError);
    return errorState("İşletme bilginiz doğrulanamadı. Lütfen yeniden giriş yapın.");
  }

  const values = validation.data;
  const { data, error } = await supabase
    .from("customers")
    .insert({
      company_id: companyId,
      name: values.name,
      contact_name: values.contactName,
      phone: values.phone,
      email: values.email,
      address: values.address,
      city: values.city,
      is_active: values.isActive,
    })
    .select("id")
    .single();

  if (error || !data?.id) {
    if (error) logCustomerError("Customer insert failed.", error);
    return errorState("Müşteri kaydı oluşturulamadı. Lütfen bilgileri kontrol edip tekrar deneyin.");
  }

  revalidatePath("/musteriler");
  redirect(`/musteriler/${data.id}`);
}

export async function updateCustomerAction(
  customerId: string,
  _previousState: CustomerActionState,
  formData: FormData,
): Promise<CustomerActionState> {
  if (!isUuid(customerId)) return errorState("Müşteri kaydı bulunamadı.");

  const validation = validateCustomerForm(formData);
  if (!validation.success) return errorState(validation.message);

  let supabase;
  try {
    supabase = await getAuthenticatedClient();
  } catch {
    return errorState("Müşteri kaydı şu anda güncellenemiyor. Lütfen daha sonra tekrar deneyin.");
  }

  if (!supabase) return errorState("Oturumunuz doğrulanamadı. Lütfen yeniden giriş yapın.");

  const values = validation.data;
  const { data, error } = await supabase
    .from("customers")
    .update({
      name: values.name,
      contact_name: values.contactName,
      phone: values.phone,
      email: values.email,
      address: values.address,
      city: values.city,
      is_active: values.isActive,
    })
    .eq("id", customerId)
    .select("id")
    .maybeSingle();

  if (error) {
    logCustomerError("Customer update failed.", error);
    return errorState("Müşteri kaydı güncellenemedi. Lütfen tekrar deneyin.");
  }
  if (!data) return errorState("Müşteri kaydı bulunamadı veya bu işlem için yetkiniz yok.");

  revalidatePath("/musteriler");
  revalidatePath(`/musteriler/${customerId}`);
  redirect(`/musteriler/${customerId}`);
}

export async function deleteCustomerAction(
  customerId: string,
  previousState: CustomerActionState,
  formData: FormData,
): Promise<CustomerActionState> {
  void previousState;
  void formData;
  if (!isUuid(customerId)) return errorState("Müşteri kaydı bulunamadı.");

  let supabase;
  try {
    supabase = await getAuthenticatedClient();
  } catch {
    return errorState("Müşteri kaydı şu anda silinemiyor. Lütfen daha sonra tekrar deneyin.");
  }

  if (!supabase) return errorState("Oturumunuz doğrulanamadı. Lütfen yeniden giriş yapın.");

  const { data, error } = await supabase
    .from("customers")
    .delete()
    .eq("id", customerId)
    .select("id")
    .maybeSingle();

  if (error) {
    logCustomerError("Customer delete failed.", error);
    if (error.code === "23503") {
      return errorState(
        "Bu müşteriye bağlı teklif veya işler bulunduğu için müşteri silinemiyor.",
      );
    }
    return errorState("Müşteri kaydı silinemedi. Lütfen tekrar deneyin.");
  }
  if (!data) return errorState("Müşteri kaydı bulunamadı veya bu işlem için yetkiniz yok.");

  revalidatePath("/musteriler");
  redirect("/musteriler");
}
