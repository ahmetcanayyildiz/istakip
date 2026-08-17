import "server-only";

import { cache } from "react";

import { createClient } from "@/lib/supabase/server";
import { hasSupabaseConfig } from "@/lib/supabase/config";

type CurrentAccount =
  | { status: "misconfigured" }
  | { status: "signed_out" }
  | { status: "needs_onboarding" }
  | { status: "unavailable" }
  | {
      status: "ready";
      userId: string;
      email: string | null;
      fullName: string | null;
      companyName: string;
    };

type ProfileWithCompany = {
  full_name: string | null;
  company: { name: string } | { name: string }[] | null;
};

export const getCurrentAccount = cache(async (): Promise<CurrentAccount> => {
  if (!hasSupabaseConfig()) return { status: "misconfigured" };

  const supabase = await createClient();
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  if (claimsError || typeof userId !== "string") return { status: "signed_out" };

  const { data, error } = await supabase
    .from("profiles")
    .select("full_name, company:companies(name)")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("Profile lookup failed.", { code: error.code });
    return { status: "unavailable" };
  }

  if (!data) return { status: "needs_onboarding" };

  const profile = data as ProfileWithCompany;
  const company = Array.isArray(profile.company) ? profile.company[0] : profile.company;
  if (!company?.name) return { status: "unavailable" };

  return {
    status: "ready",
    userId,
    email:
      claimsData && typeof claimsData.claims.email === "string"
        ? claimsData.claims.email
        : null,
    fullName: profile.full_name,
    companyName: company.name,
  };
});
