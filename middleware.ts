import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function normalizeHost(hostHeader: string): string {
  return hostHeader.split(":")[0].toLowerCase().replace(/^www\./, "");
}

function envHost(value: string | undefined): string {
  return (value ?? "").trim().toLowerCase().replace(/^www\./, "");
}

function isLoopback(host: string): boolean {
  return host === "localhost" || host === "127.0.0.1";
}

function isSharedPath(pathname: string): boolean {
  const prefixes = [
    "/api",
    "/media",
    "/login",
    "/register",
    "/forgot-password",
    "/_next",
    "/static",
    "/fonts",
  ];
  return prefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

function isPsyPath(pathname: string): boolean {
  return (
    pathname === "/psy" ||
    pathname.startsWith("/psy/") ||
    pathname === "/patient" ||
    pathname.startsWith("/patient/") ||
    pathname === "/therapist" ||
    pathname.startsWith("/therapist/") ||
    pathname === "/admin" ||
    pathname.startsWith("/admin/")
  );
}

function psyPublicOrigin(): string {
  const origin = (process.env.NEXT_PUBLIC_PSY_ORIGIN ?? "").replace(/\/$/, "");
  if (origin) return origin;
  const host = envHost(process.env.NEXT_PUBLIC_PSY_HOST);
  return host ? `https://${host}` : "";
}

export function middleware(request: NextRequest) {
  const universityHost = envHost(process.env.NEXT_PUBLIC_UNIVERSITY_HOST);
  const psyHost = envHost(process.env.NEXT_PUBLIC_PSY_HOST);

  if (!universityHost && !psyHost) {
    return NextResponse.next();
  }

  const host = normalizeHost(request.headers.get("host") ?? "");
  if (isLoopback(host)) {
    return NextResponse.next();
  }

  const { pathname, search } = request.nextUrl;
  if (isSharedPath(pathname)) {
    return NextResponse.next();
  }

  if (psyHost && host === psyHost) {
    if (pathname === "/") {
      const url = request.nextUrl.clone();
      url.pathname = "/psy";
      return NextResponse.rewrite(url);
    }
    if (isPsyPath(pathname)) {
      return NextResponse.next();
    }
    return new NextResponse(null, { status: 404 });
  }

  if (universityHost && host === universityHost) {
    if (isPsyPath(pathname)) {
      const origin = psyPublicOrigin();
      if (origin) {
        return NextResponse.redirect(new URL(`${pathname}${search}`, origin));
      }
    }
    return NextResponse.next();
  }

  return new NextResponse(null, { status: 404 });
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|fonts/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|ttf|woff|woff2)$).*)",
  ],
};
