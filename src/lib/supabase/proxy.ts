import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

import {
  buildContentSecurityPolicy,
  createNonce,
} from "@/lib/security/headers";
import { getSupabaseConfig, hasSupabaseConfig } from "@/lib/supabase/config";

const PUBLIC_PATHS = new Set(["/login", "/register"]);

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.has(pathname) || pathname.startsWith("/auth/confirm");
}

/**
 * Builds the continuation response. The request headers are re-read on every
 * call so Supabase cookie refreshes written to `request.cookies` are carried
 * forward, and Next.js receives the CSP header it uses to nonce its own
 * bootstrap scripts.
 */
function nextWithNonce(request: NextRequest, nonce: string, csp: string) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("content-security-policy", csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("content-security-policy", csp);
  return response;
}

function redirectWithCookies(
  request: NextRequest,
  response: NextResponse,
  pathname: string,
  csp: string,
) {
  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = pathname;
  redirectUrl.search = "";

  const redirectResponse = NextResponse.redirect(redirectUrl);
  response.cookies.getAll().forEach((cookie) => redirectResponse.cookies.set(cookie));
  redirectResponse.headers.set("content-security-policy", csp);
  return redirectResponse;
}

export async function updateSession(request: NextRequest) {
  const nonce = createNonce();
  const csp = buildContentSecurityPolicy(nonce, process.env.NODE_ENV !== "production");

  if (!hasSupabaseConfig()) return nextWithNonce(request, nonce, csp);

  const { url, publishableKey } = getSupabaseConfig();
  let response = nextWithNonce(request, nonce, csp);

  const supabase = createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = nextWithNonce(request, nonce, csp);
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const { data, error } = await supabase.auth.getClaims();
  const isAuthenticated = !error && typeof data?.claims?.sub === "string";

  if (!isAuthenticated && !isPublicPath(request.nextUrl.pathname)) {
    return redirectWithCookies(request, response, "/login", csp);
  }

  return response;
}
