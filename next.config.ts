import type { NextConfig } from "next";

/**
 * Proxy /api/* to the Django backend so auth cookies and the CSRF cookie
 * stay same-origin. Relative NEXT_PUBLIC_API_BASE_URL=/api/v1 then works in
 * both local development and production (where nginx also routes /api/).
 */
const API_PROXY_TARGET =
  process.env.API_PROXY_TARGET ?? "http://127.0.0.1:8000";

const nextConfig: NextConfig = {
  output: "standalone",
  // Keep trailing slashes on /api/* so Django APPEND_SLASH does not break POSTs
  // (e.g. /api/v1/auth/login/ proxied without the slash → 500).
  skipTrailingSlashRedirect: true,
  async rewrites() {
    return [
      // Prefer explicit trailing slash so Django receives /api/.../.
      {
        source: "/api/:path+/",
        destination: `${API_PROXY_TARGET}/api/:path+/`,
      },
      {
        source: "/api/:path+",
        destination: `${API_PROXY_TARGET}/api/:path+/`,
      },
      {
        source: "/media/:path*",
        destination: `${API_PROXY_TARGET}/media/:path*`,
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/authentication",
        destination: "/login",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
