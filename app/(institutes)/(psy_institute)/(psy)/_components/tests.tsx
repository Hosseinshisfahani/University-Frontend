"use client";

import Link from "next/link";
import { useAuthStore } from "@/features/auth/store";
import { isPsyPatient } from "@/features/auth/types";
import { usePsychometricForms } from "@/app/(institutes)/(psy_institute)/_shared/use-psy";

export function TestsPublicList() {
  const { data, isLoading, isError } = usePsychometricForms();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const forms = (Array.isArray(data) ? data : []).filter((f) => f.is_published);

  function formHref(slug: string) {
    const next = `/patient/tests/${slug}`;
    if (isAuthenticated && isPsyPatient(user)) return next;
    return `/login?next=${encodeURIComponent(next)}`;
  }

  return (
    <div className="psy-root mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-10 max-w-2xl">
        <p className="text-sm font-medium text-[var(--psy-accent)]">آزمون‌ها</p>
        <h1 className="title mt-2 text-3xl font-bold tracking-tight text-[var(--psy-ink)] sm:text-4xl">
          آزمون‌های روان‌سنجی
        </h1>
        <p className="mt-3 text-[var(--psy-muted)]">
          پرسشنامه‌های منتشرشده مرکز — برای تکمیل آزمون وارد پورتال بیمار شوید.
        </p>
      </header>

      {isLoading ? <p className="text-[var(--psy-muted)]">در حال بارگذاری…</p> : null}
      {isError ? <p className="text-red-600">خطا در دریافت آزمون‌ها</p> : null}

      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {forms.map((form) => (
          <li key={form.id}>
            <Link
              href={formHref(form.slug)}
              className="flex h-full flex-col gap-3 rounded-2xl border border-[var(--psy-line)] bg-[var(--psy-surface)] p-6 transition hover:border-[var(--psy-sage)]/50"
            >
              <h2 className="text-lg font-semibold text-[var(--psy-ink)]">{form.title}</h2>
              <p className="line-clamp-3 text-sm leading-7 text-[var(--psy-muted)]">
                {form.description || "بدون توضیح"}
              </p>
              <span className="mt-auto text-sm font-medium text-[var(--psy-sage)]">
                شروع آزمون ←
              </span>
            </Link>
          </li>
        ))}
      </ul>
      {!isLoading && !forms.length ? (
        <p className="text-[var(--psy-muted)]">آزمون منتشرشده‌ای ثبت نشده است.</p>
      ) : null}
    </div>
  );
}
