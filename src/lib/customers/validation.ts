import type { CustomerFormValues } from "@/lib/customers/types";

export const CUSTOMER_FIELD_LIMITS = {
  name: 160,
  contactName: 160,
  phone: 40,
  email: 254,
  address: 500,
  city: 100,
} as const;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type CustomerValidationResult =
  | { success: true; data: CustomerFormValues }
  | { success: false; message: string };

function optionalText(formData: FormData, key: string) {
  const value = String(formData.get(key) ?? "").trim();
  return value || null;
}

export function validateCustomerForm(formData: FormData): CustomerValidationResult {
  const name = String(formData.get("name") ?? "").trim();
  const contactName = optionalText(formData, "contactName");
  const phone = optionalText(formData, "phone");
  const emailValue = optionalText(formData, "email");
  const email = emailValue?.toLowerCase() ?? null;
  const address = optionalText(formData, "address");
  const city = optionalText(formData, "city");
  const status = String(formData.get("status") ?? "active");

  if (!name) return { success: false, message: "Müşteri / firma adı zorunludur." };
  if (name.length > CUSTOMER_FIELD_LIMITS.name) {
    return { success: false, message: `Müşteri / firma adı en fazla ${CUSTOMER_FIELD_LIMITS.name} karakter olabilir.` };
  }
  if (contactName && contactName.length > CUSTOMER_FIELD_LIMITS.contactName) {
    return { success: false, message: `Yetkili kişi en fazla ${CUSTOMER_FIELD_LIMITS.contactName} karakter olabilir.` };
  }
  if (phone && phone.length > CUSTOMER_FIELD_LIMITS.phone) {
    return { success: false, message: `Telefon en fazla ${CUSTOMER_FIELD_LIMITS.phone} karakter olabilir.` };
  }
  if (email && (!EMAIL_PATTERN.test(email) || email.length > CUSTOMER_FIELD_LIMITS.email)) {
    return { success: false, message: "Geçerli bir e-posta adresi girin." };
  }
  if (address && address.length > CUSTOMER_FIELD_LIMITS.address) {
    return { success: false, message: `Adres en fazla ${CUSTOMER_FIELD_LIMITS.address} karakter olabilir.` };
  }
  if (city && city.length > CUSTOMER_FIELD_LIMITS.city) {
    return { success: false, message: `Şehir en fazla ${CUSTOMER_FIELD_LIMITS.city} karakter olabilir.` };
  }
  if (status !== "active" && status !== "inactive") {
    return { success: false, message: "Geçerli bir müşteri durumu seçin." };
  }

  return {
    success: true,
    data: {
      name,
      contactName,
      phone,
      email,
      address,
      city,
      isActive: status === "active",
    },
  };
}

export function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}
