"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import { HiBars3, HiXMark } from "react-icons/hi2";
import ThemeToggle from "@/components/theme-toggle";
import AuthNavButton from "@/features/auth/components/AuthNavButton";

const NAV = [
  { href: "/psy/therapists", label: "درمانگران" },
  { href: "/psy/workshops", label: "کارگاه‌ها" },
  { href: "/psy/blog", label: "مقالات" },
  { href: "/psy/tests", label: "آزمون ها" },
];

export default function PsyHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

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

      <Dialog open={open} onClose={() => setOpen(false)} className="relative z-50 md:hidden">
        <DialogBackdrop className="fixed inset-0 bg-black/40" />
        <DialogPanel className="fixed inset-y-0 right-0 flex w-72 flex-col gap-6 bg-[var(--psy-surface)] p-5 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="font-bold text-[var(--psy-ink)]">منو</span>
            <button
              type="button"
              aria-label="بستن"
              onClick={() => setOpen(false)}
              className="rounded-full border border-[var(--psy-line)] p-2"
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
                    className={`block rounded-lg px-3 py-2.5 hover:bg-[var(--psy-mist)] hover:text-[var(--psy-ink)] ${
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
          <AuthNavButton
            onNavigate={() => setOpen(false)}
            className="mt-auto rounded-lg bg-primary px-5 py-3 text-center text-sm font-medium text-[#332B1A]"
          />
        </DialogPanel>
      </Dialog>
    </header>
  );
}
