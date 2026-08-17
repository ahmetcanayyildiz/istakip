import type { EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const redirectUrl = request.nextUrl.clone();
  const tokenHash = redirectUrl.searchParams.get("token_hash");
  const type = redirectUrl.searchParams.get("type") as EmailOtpType | null;
  const code = redirectUrl.searchParams.get("code");

  redirectUrl.pathname = "/onboarding";
  redirectUrl.search = "";

  try {
    const supabase = await createClient();
    const result = tokenHash && type
      ? await supabase.auth.verifyOtp({ token_hash: tokenHash, type })
      : code
        ? await supabase.auth.exchangeCodeForSession(code)
        : { error: new Error("Missing confirmation token.") };

    if (!result.error) return NextResponse.redirect(redirectUrl);

    console.error("Email confirmation failed.");
  } catch {
    console.error("Email confirmation could not be processed.");
  }

  redirectUrl.pathname = "/login";
  redirectUrl.searchParams.set("error", "confirmation");
  return NextResponse.redirect(redirectUrl);
}
