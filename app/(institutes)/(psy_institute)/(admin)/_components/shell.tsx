"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import { HiBars3, HiXMark } from "react-icons/hi2";
import { useAuthStore } from "@/features/auth/store";
import { useLogout } from "@/features/auth/hooks";
import ThemeToggle from "@/components/theme-toggle";
import { isPsyAdmin, isPsyTherapist, portalHomeForUser } from "@/features/auth/types";

const NAV = [
  { href: "/admin/overview", label: "نمای کلی" },
  { href: "/admin/schedule", label: "تقویم" },
  { href: "/admin/leave", label: "مرخصی‌ها" },
  { href: "/admin/file-access", label: "درخواست‌های دسترسی پرونده" },
  { href: "/admin/reviews", label: "نظرات" },
  { href: "/admin/appointments", label: "نوبت‌ها" },
  { href: "/admin/workshops", label: "کارگاه‌ها" },
  { href: "/admin/blog", label: "مقالات" },
  { href: "/admin/news", label: "اخبار" },
  { href: "/admin/users/patients", label: "مراجعان" },
  { href: "/admin/users/therapists", label: "درمانگران" },
  { href: "/admin/finance", label: "مالی" },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <ul className="flex flex-col gap-1">
      {NAV.map((item) => {
        const active =
          pathname === item.href ||
          (item.href !== "/admin/overview" && pathname?.startsWith(item.href));
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={onNavigate}
              className={`block rounded-md px-3 py-2.5 text-sm font-medium transition ${
                active
                  ? "bg-teal-500/20 text-teal-100"
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

/** Command-center shell for psy_admin — denser slate with teal accent. */
export function AdminShell({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();
  const [open, setOpen] = useState(false);
  const display = user?.first_name || user?.username || "مدیر";

  return (
    <div className="min-h-screen bg-[#e8eef0] text-[#0f1a1c] dark:bg-[#080c0d] dark:text-[#e6ecee]">
      <div className="mx-auto flex min-h-screen max-w-[1400px]">
        <aside className="hidden w-60 shrink-0 bg-[#0f1a1c] p-5 text-white lg:block dark:bg-[#0a1012]">
          <Link
            href="/admin/overview"
            className="title mb-8 block text-lg font-bold tracking-tight text-white"
          >
            پنل مدیریت مرکز
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
          <header className="flex items-center justify-between gap-3 border-b border-[#0f1a1c]/10 bg-white/75 px-4 py-3 backdrop-blur dark:border-white/10 dark:bg-[#0a1012]/85 lg:px-8">
            <div className="flex items-center gap-2 lg:hidden">
              <button
                type="button"
                aria-label="منو"
                onClick={() => setOpen(true)}
                className="rounded-md border border-[#0f1a1c]/15 p-2 dark:border-white/20"
              >
                <HiBars3 size={20} />
              </button>
              <span className="font-bold">پنل مدیریت</span>
            </div>
            <div className="ms-auto flex items-center gap-3">
              <ThemeToggle />
              <span className="hidden text-sm text-[#0f1a1c]/60 dark:text-white/60 sm:inline">
                {display}
              </span>
              <button
                type="button"
                onClick={() => logout.mutate()}
                className="rounded-md bg-[#0f1a1c] px-4 py-2 text-sm font-medium text-white dark:bg-teal-700"
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
        <DialogPanel className="fixed inset-y-0 right-0 w-72 bg-[#0f1a1c] p-5 text-white shadow-xl">
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


export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (!isHydrated) return;
    if (!isAuthenticated) {
      router.replace(`/login?next=${encodeURIComponent(pathname || "/admin")}`);
    }
  }, [isHydrated, isAuthenticated, router, pathname]);

  if (!isHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0c1214] text-white/60">
        در حال بررسی دسترسی…
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0c1214] text-white/60">
        در حال بررسی دسترسی…
      </div>
    );
  }

  if (!isPsyAdmin(user)) {
    const home = portalHomeForUser(user);
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#0c1214] px-6 text-center text-white/80">
        <p className="text-lg font-medium">این بخش فقط برای مدیر کلینیک است.</p>
        <p className="max-w-md text-sm text-white/55">
          با حساب درمانگر نمی‌توان برنامهٔ هفتگی و نوبت‌ها را از اینجا مدیریت کرد.
          از حساب فعلی خارج شوید و با کاربر مدیر وارد شوید.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
          {home ? (
            <Link
              href={home}
              className="rounded-md bg-teal-500/20 px-4 py-2 text-teal-100"
            >
              {isPsyTherapist(user) ? "بازگشت به پورتال درمانگر" : "بازگشت به پورتال"}
            </Link>
          ) : null}
          <Link href="/login" className="rounded-md bg-white/10 px-4 py-2">
            ورود با حساب مدیر
          </Link>
        </div>
      </div>
    );
  }

  return children;
}
