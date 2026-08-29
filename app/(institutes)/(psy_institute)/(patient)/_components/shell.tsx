"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import { HiBars3, HiXMark } from "react-icons/hi2";
import { useAuthStore } from "@/features/auth/store";
import { useLogout } from "@/features/auth/hooks";
import ThemeToggle from "@/components/theme-toggle";
import { isPsyPatient } from "@/features/auth/types";

const NAV = [
  { href: "/patient/overview", label: "نمای کلی" },
  { href: "/patient/wallet", label: "کیف پول" },
  { href: "/patient/appointments", label: "نوبت‌ها" },
  { href: "/patient/appointments/book", label: "رزرو نوبت" },
  { href: "/patient/workshops", label: "کارگاه‌ها" },
  { href: "/patient/notes", label: "یادداشت‌ها" },
  { href: "/patient/tests", label: "آزمون‌ها" },
  { href: "/patient/tests/history", label: "سوابق آزمون" },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <ul className="flex flex-col gap-1">
      {NAV.map((item) => {
        const active =
          pathname === item.href ||
          (item.href !== "/patient/overview" &&
            item.href !== "/patient/appointments/book" &&
            item.href !== "/patient/tests" &&
            pathname?.startsWith(item.href));
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={onNavigate}
              className={`block rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                active
                  ? "bg-primary/20 text-foreground"
                  : "text-foreground/70 hover:bg-foreground/5 hover:text-foreground"
              }`}
            >
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function PatientShell({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();
  const [open, setOpen] = useState(false);
  const display = user?.first_name || user?.username || "بیمار";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen max-w-6xl">
        <aside className="hidden w-64 shrink-0 border-l border-foreground/10 bg-white/40 p-5 dark:bg-black/20 lg:block">
          <Link href="/patient/overview" className="title gradient-text mb-8 block text-xl font-bold">
            پورتال مراجع
          </Link>
          <NavLinks />
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center justify-between gap-3 border-b border-foreground/10 px-4 py-3 lg:px-8">
            <div className="flex min-w-0 items-center gap-2">
              <button
                type="button"
                aria-label="منو"
                onClick={() => setOpen(true)}
                className="rounded-full border border-foreground/20 p-2 lg:hidden"
              >
                <HiBars3 size={20} />
              </button>
              <Link
                href="/psy"
                className="inline-flex shrink-0 items-center rounded-lg border border-foreground/15 px-3 py-2 text-sm font-medium transition hover:border-primary/40 hover:bg-primary/10"
              >
                بازگشت به صفحه اصلی
              </Link>
            </div>
            <div className="ms-auto flex items-center gap-3">
              <ThemeToggle />
              <span className="hidden text-sm text-foreground/70 sm:inline">{display}</span>
              <button
                type="button"
                onClick={() => logout.mutate()}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-[#332B1A]"
              >
                خروج
              </button>
            </div>
          </header>

          <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">{children}</main>
        </div>
      </div>

      <Dialog open={open} onClose={() => setOpen(false)} className="relative z-50 lg:hidden">
        <DialogBackdrop className="fixed inset-0 bg-black/50" />
        <DialogPanel className="fixed inset-y-0 right-0 w-72 bg-background p-5 shadow-xl">
          <div className="mb-4 flex items-center justify-between">
            <span className="font-bold">منو</span>
            <button type="button" onClick={() => setOpen(false)} className="rounded-full border p-2">
              <HiXMark size={20} />
            </button>
          </div>
          <NavLinks onNavigate={() => setOpen(false)} />
        </DialogPanel>
      </Dialog>
    </div>
  );
}


export function PatientGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (!isHydrated) return;
    if (!isAuthenticated) {
      router.replace(`/login?next=${encodeURIComponent(pathname || "/patient")}`);
      return;
    }
    if (!isPsyPatient(user)) {
      router.replace("/");
    }
  }, [isHydrated, isAuthenticated, user, router, pathname]);

  // Keep the previous patient view mounted while auth re-checks, so a brief
  // unauthenticated flash after mutations does not remount the whole portal.
  if (!isHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center text-foreground/60">
        در حال بررسی دسترسی…
      </div>
    );
  }

  if (!isAuthenticated || !isPsyPatient(user)) {
    return (
      <div className="flex min-h-screen items-center justify-center text-foreground/60">
        در حال بررسی دسترسی…
      </div>
    );
  }

  return children;
}
