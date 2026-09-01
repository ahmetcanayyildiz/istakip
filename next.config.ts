import type { NextConfig } from "next";

import { getStaticSecurityHeaders } from "@/lib/security/headers";

const isDevelopment = process.env.NODE_ENV !== "production";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      {
        // Also covers /_next/static, which the Proxy matcher skips.
        source: "/:path*",
        headers: getStaticSecurityHeaders(isDevelopment),
      },
    ];
  },
};

export default nextConfig;
