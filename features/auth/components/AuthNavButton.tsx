"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useAuthStore } from "../store";
import { useLogout } from "../hooks";
import { portalHomeForUser } from "../types";

type AuthNavButtonProps = {
  className?: string;
  onNavigate?: () => void;
  guestLabel?: string;
};

const PORTAL_LABEL: Record<string, string> = {
  "/admin/overview": "پنل مدیریت",
  "/therapist/overview": "پورتال درمانگر",
  "/patient/overview": "پورتال مراجع",
};

export default function AuthNavButton({
  className,
  onNavigate,
  guestLabel = "ورود و ثبت نام",
}: AuthNavButtonProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();

  if (!isHydrated) {
    return (
      <span className={className} aria-hidden style={{ visibility: "hidden" }}>
        {guestLabel}
      </span>
    );
  }

  if (isAuthenticated && user) {
    const home = portalHomeForUser(user);
    if (home) {
      return (
        <Link href={home} onClick={onNavigate} className={className}>
          {PORTAL_LABEL[home] ?? "پورتال"}
        </Link>
      );
    }

    return (
      <button
        type="button"
        onClick={() => {
          onNavigate?.();
          logout.mutate();
        }}
        disabled={logout.isPending}
        className={className}
        title={user.first_name || user.username}
      >
        {logout.isPending ? "در حال خروج…" : "خروج"}
      </button>
    );
  }

  return (
    <Link href="/login" onClick={onNavigate} className={className}>
      {guestLabel}
    </Link>
  );
}

/** Renders children only for guests; reserves layout while auth hydrates. */
export function AuthGuestOnly({ children }: { children: ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isHydrated = useAuthStore((s) => s.isHydrated);

  if (!isHydrated) {
    return (
      <span aria-hidden style={{ visibility: "hidden" }}>
        {children}
      </span>
    );
  }

  if (isAuthenticated) return null;
  return children;
}
