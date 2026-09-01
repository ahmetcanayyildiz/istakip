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
      isDemo: boolean;
    };

type ProfileWithCompany = {
  full_name: string | null;
  company: { name: string; is_demo: boolean } | { name: string; is_demo: boolean }[] | null;
};

type LegacyProfileWithCompany = {
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
    .select("full_name, company:companies(name, is_demo)")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    // Keep normal sign-in available during a safe DB-first rollout. Before the
    // demo migration exists, the legacy schema has no companies.is_demo column.
    // Once migrated, the primary query succeeds and this compatibility path is
    // no longer used. DB-level demo mutation guards remain the security boundary.
    const { data: legacyData, error: legacyError } = await supabase
      .from("profiles")
      .select("full_name, company:companies(name)")
      .eq("id", userId)
      .maybeSingle();

    if (legacyError) {
      console.error("Profile lookup failed.", {
        code: error.code,
        fallbackCode: legacyError.code,
      });
      return { status: "unavailable" };
    }

    if (!legacyData) return { status: "needs_onboarding" };

    const legacyProfile = legacyData as LegacyProfileWithCompany;
    const legacyCompany = Array.isArray(legacyProfile.company)
      ? legacyProfile.company[0]
      : legacyProfile.company;
    if (!legacyCompany?.name) return { status: "unavailable" };

    return {
      status: "ready",
      userId,
      email:
        claimsData && typeof claimsData.claims.email === "string"
          ? claimsData.claims.email
          : null,
      fullName: legacyProfile.full_name,
      companyName: legacyCompany.name,
      isDemo: false,
    };
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
    isDemo: company.is_demo,
  };
});
