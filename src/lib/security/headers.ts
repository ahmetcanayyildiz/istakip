// Production security headers.
//
// The CSP is nonce based. Every İşTakip route is already server rendered on
// demand (cookie-backed Supabase auth), so reading the per-request nonce in the
// root layout costs no static prerendering. `'strict-dynamic'` lets the nonced
// Next.js bootstrap script load its own chunks without host allowlisting.

const PRODUCTION_ONLY_DIRECTIVES = ["upgrade-insecure-requests"];

/** Browser-side Supabase calls (auth refresh, sign-out) need their own origin. */
function getSupabaseConnectSources() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return [];

  try {
    const { origin, host, protocol } = new URL(url);
    const socketOrigin = `${protocol === "http:" ? "ws" : "wss"}://${host}`;
    return [origin, socketOrigin];
  } catch {
    return [];
  }
}

export function createNonce() {
  return crypto.randomUUID().replaceAll("-", "");
}

export function buildContentSecurityPolicy(nonce: string, isDevelopment: boolean) {
  const scriptSources = ["'self'", `'nonce-${nonce}'`, "'strict-dynamic'"];
  const connectSources = ["'self'", ...getSupabaseConnectSources()];

  if (isDevelopment) {
    // Turbopack dev builds evaluate compiled modules and open an HMR socket.
    scriptSources.push("'unsafe-eval'");
    connectSources.push("ws:", "http://localhost:*");
  }

  const directives: Record<string, string[]> = {
    "default-src": ["'self'"],
    "script-src": scriptSources,
    // Tailwind ships a stylesheet, but Next.js still emits inline <style> tags
    // for self-hosted next/font faces and streamed CSS.
    "style-src": ["'self'", "'unsafe-inline'"],
    "img-src": ["'self'", "data:", "blob:"],
    "font-src": ["'self'", "data:"],
    "connect-src": connectSources,
    "form-action": ["'self'"],
    "frame-ancestors": ["'none'"],
    "frame-src": ["'none'"],
    "base-uri": ["'none'"],
    "object-src": ["'none'"],
    "worker-src": ["'self'", "blob:"],
    "manifest-src": ["'self'"],
  };

  const policy = Object.entries(directives)
    .map(([directive, sources]) => `${directive} ${sources.join(" ")}`)
    .concat(isDevelopment ? [] : PRODUCTION_ONLY_DIRECTIVES);

  return policy.join("; ");
}

/**
 * Static headers applied through next.config.ts so they also cover
 * `/_next/static` responses, which the Proxy matcher deliberately skips.
 */
export function getStaticSecurityHeaders(isDevelopment: boolean) {
  const headers = [
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "X-Frame-Options", value: "DENY" },
    { key: "X-DNS-Prefetch-Control", value: "off" },
    { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
    {
      key: "Permissions-Policy",
      value: [
        "accelerometer=()",
        "camera=()",
        "display-capture=()",
        "geolocation=()",
        "gyroscope=()",
        "magnetometer=()",
        "microphone=()",
        "payment=()",
        "usb=()",
      ].join(", "),
    },
  ];

  // Browsers ignore HSTS delivered over plain HTTP, but keeping it out of dev
  // avoids pinning localhost to HTTPS in a shared browser profile.
  // `preload` is omitted: it is a hard-to-reverse public list submission.
  if (!isDevelopment) {
    headers.push({
      key: "Strict-Transport-Security",
      value: "max-age=63072000; includeSubDomains",
    });
  }

  return headers;
}
