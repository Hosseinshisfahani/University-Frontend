"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import { HiBars3, HiXMark } from "react-icons/hi2";
import { useAuthStore } from "@/features/auth/store";
import { useLogout } from "@/features/auth/hooks";
import ThemeToggle from "@/components/theme-toggle";
import { isPsyTherapist } from "@/features/auth/types";

const NAV = [
  { href: "/therapist/overview", label: "نمای کلی" },
  { href: "/therapist/schedule", label: "مرخصی" },
  { href: "/therapist/appointments", label: "نوبت‌ها" },
  { href: "/therapist/finance", label: "گزارش مالی" },
  { href: "/therapist/reviews", label: "نظرات" },
  { href: "/therapist/patients", label: "مراجعان من" },
  { href: "/therapist/workshops", label: "کارگاه‌های من" },
  { href: "/therapist/responses", label: "پاسخ آزمون‌ها" },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <ul className="flex flex-col gap-1">
      {NAV.map((item) => {
        const active =
          pathname === item.href ||
          (item.href !== "/therapist/overview" && pathname?.startsWith(item.href));
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={onNavigate}
              className={`block rounded-md px-3 py-2.5 text-sm font-medium transition ${
                active
                  ? "bg-white/10 text-white"
                  : "text-white/55 hover:bg-white/5 hover:text-white/90"
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

/** Clinical professional shell — denser, slate ink, distinct from patient portal. */
export function TherapistShell({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();
  const [open, setOpen] = useState(false);
  const display = user?.first_name || user?.username || "درمانگر";

  return (
    <div className="min-h-screen bg-[#eef1f0] text-[#1a2423] dark:bg-[#0b1010] dark:text-[#e8efed]">
      <div className="mx-auto flex min-h-screen max-w-7xl">
        <aside className="hidden w-60 shrink-0 bg-[#1a2423] p-5 text-white lg:block dark:bg-[#121818]">
          <Link
            href="/therapist/overview"
            className="title mb-8 block text-lg font-bold tracking-tight text-white"
          >
            پورتال درمانگر
          </Link>
          <NavLinks />
          <Link
            href="/psy"
            className="mt-10 block text-xs text-white/40 transition hover:text-white/70"
          >
            ← صفحه مرکز
          </Link>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center justify-between gap-3 border-b border-[#1a2423]/10 bg-white/70 px-4 py-3 backdrop-blur dark:border-white/10 dark:bg-[#121818]/80 lg:px-8">
            <div className="flex items-center gap-2 lg:hidden">
              <button
                type="button"
                aria-label="منو"
                onClick={() => setOpen(true)}
                className="rounded-md border border-[#1a2423]/15 p-2 dark:border-white/20"
              >
                <HiBars3 size={20} />
              </button>
              <span className="font-bold">پورتال درمانگر</span>
            </div>
            <div className="ms-auto flex items-center gap-3">
              <ThemeToggle />
              <span className="hidden text-sm text-[#1a2423]/60 dark:text-white/60 sm:inline">
                {display}
              </span>
              <button
                type="button"
                onClick={() => logout.mutate()}
                className="rounded-md bg-[#1a2423] px-4 py-2 text-sm font-medium text-white dark:bg-primary dark:text-[#332B1A]"
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
        <DialogPanel className="fixed inset-y-0 right-0 w-72 bg-[#1a2423] p-5 text-white shadow-xl">
          <div className="mb-4 flex items-center justify-between">
            <span className="font-bold">منو</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-md border border-white/20 p-2"
            >
              <HiXMark size={20} />
            </button>
          </div>
          <NavLinks onNavigate={() => setOpen(false)} />
        </DialogPanel>
      </Dialog>
    </div>
  );
}


export function TherapistGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (!isHydrated) return;
    if (!isAuthenticated) {
      router.replace(`/login?next=${encodeURIComponent(pathname || "/therapist")}`);
      return;
    }
    if (!isPsyTherapist(user)) {
      router.replace("/psy");
    }
  }, [isHydrated, isAuthenticated, user, router, pathname]);

  if (!isHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0f1413] text-white/60">
        در حال بررسی دسترسی…
      </div>
    );
  }

  if (!isAuthenticated || !isPsyTherapist(user)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0f1413] text-white/60">
        در حال بررسی دسترسی…
      </div>
    );
  }

  return children;
}
