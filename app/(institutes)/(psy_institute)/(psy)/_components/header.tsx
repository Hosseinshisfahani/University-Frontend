"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import { HiBars3, HiXMark, HiShoppingBag } from "react-icons/hi2";
import ThemeToggle from "@/components/theme-toggle";
import AuthNavButton from "@/features/auth/components/AuthNavButton";
import { useAuthStore } from "@/features/auth/store";
import { isPsyPatient } from "@/features/auth/types";
import { useCart } from "@/app/(institutes)/(psy_institute)/_shared/use-psy";

const NAV = [
  { href: "/psy/therapists", label: "درمانگران" },
  { href: "/psy/workshops", label: "کارگاه‌ها" },
  { href: "/psy/shop", label: "فروشگاه" },
  { href: "/psy/blog", label: "مقالات" },
  { href: "/psy/tests", label: "آزمون ها" },
];

export default function PsyHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const user = useAuthStore((s) => s.user);
  const patient = isHydrated && isPsyPatient(user);
  const cart = useCart(patient);
  const count = (cart.data?.items ?? []).reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="psy-header sticky top-0 z-50 border-b border-[var(--psy-line)] bg-[var(--psy-surface)]/85 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:h-[4.5rem] sm:px-6 lg:px-8">
        <Link
          href="/psy"
          className="title text-lg font-bold tracking-tight text-[var(--psy-ink)] sm:text-xl"
        >
          مرکز مشاوره آیه
        </Link>

        <ul className="hidden items-center gap-8 text-sm font-medium text-[var(--psy-muted)] md:flex">
          {NAV.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`transition hover:text-[var(--psy-ink)] ${
                    active ? "text-[var(--psy-ink)]" : ""
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="hidden items-center gap-3 md:flex">
          {patient ? (
            <Link href="/patient/shop/cart" className="flex items-center gap-1.5 text-sm text-[var(--psy-ink)] hover:text-[var(--psy-persian-blue)]">
              <HiShoppingBag size={20} className="shrink-0 text-[var(--psy-persian-blue)]" />
              <span className="whitespace-nowrap">{count ? ` (${count})` : ""}</span>
            </Link>
          ) : null}
          <ThemeToggle />
          <AuthNavButton className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-[#332B1A] transition hover:opacity-90" />
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            aria-label="منو"
            onClick={() => setOpen(true)}
            className="rounded-full border border-[var(--psy-line)] p-2"
          >
            <HiBars3 size={20} />
          </button>
        </div>
      </nav>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        className="relative z-50 md:hidden"
        dir="rtl"
      >
        {/* لایه تیره پس‌زمینه با فید شدن ملایم */}
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ease-out data-[closed]:opacity-0"
        />

        {/* پنل کشویی با انیمیشن ورود و خروج نرم از سمت راست */}
        <DialogPanel
          transition
          className="fixed inset-y-0 right-0 z-10 flex w-72 flex-col gap-6 bg-white p-5 shadow-2xl transition-transform duration-300 ease-out data-[closed]:translate-x-full dark:bg-neutral-900"
        >
          <div className="flex items-center justify-between">
            <span className="font-bold text-[var(--psy-ink)]">منو</span>
            <button
              type="button"
              aria-label="بستن"
              onClick={() => setOpen(false)}
              className="rounded-full border border-[var(--psy-line)] p-2 text-[var(--psy-ink)] transition hover:bg-[var(--psy-mist)]"
            >
              <HiXMark size={18} />
            </button>
          </div>

          <ul className="flex flex-col gap-1">
            {NAV.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`block rounded-lg px-3 py-2.5 text-right transition hover:bg-[var(--psy-mist)] hover:text-[var(--psy-ink)] ${
                      active
                        ? "bg-[var(--psy-mist)] text-[var(--psy-ink)]"
                        : "text-[var(--psy-muted)]"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          {patient ? (
            <Link
              href="/patient/shop/cart"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-right text-sm text-[var(--psy-ink)] transition hover:bg-[var(--psy-mist)]">
              <HiShoppingBag size={20} className="shrink-0 text-[var(--psy-persian-blue)]" />
              سبد خرید{count ? ` (${count})` : ""}
            </Link>
          ) : null}

          <AuthNavButton
            onNavigate={() => setOpen(false)}
            className="mt-auto rounded-lg bg-primary px-5 py-3 text-center text-sm font-medium text-[#332B1A] transition hover:opacity-95"
          />
        </DialogPanel>
      </Dialog>
     </header>
  );
}
