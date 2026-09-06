"use client";

import { useMemo } from "react";
import { formatJalaliFriendlyDate } from "@/lib/datetime/jalali";
import { useTherapistReviews } from "@/app/(institutes)/(psy_institute)/_shared/use-psy";
import { formatStarAverage } from "@/app/(institutes)/(psy_institute)/_shared/helpers";

export default function TherapistReviewsClient() {
  const { data, isLoading, isError } = useTherapistReviews();

  const rows = data ?? [];
  const avg = useMemo(() => {
    const list = data ?? [];
    if (!list.length) return null;
    return list.reduce((sum, row) => sum + row.rating, 0) / list.length;
  }, [data]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="title text-3xl font-extrabold">نظرات</h1>
        <p className="mt-2 text-sm text-[var(--psy-muted)] dark:text-white/50">
          میانگین امتیازها بلافاصله به‌روز می‌شود. متن نظر فقط پس از تأیید مدیریت دیده می‌شود.
        </p>
      </div>

      <div className="rounded-3xl border border-psy-neutral-200 bg-psy-surface p-5 shadow-psy-sm dark:border-white/10 dark:bg-psy-surface-dark">
        <p className="text-sm opacity-60">میانگین امتیاز</p>
        <p className="mt-1 text-2xl font-bold">
          {formatStarAverage(avg, data?.length ?? 0)}
        </p>
      </div>

      {isLoading ? <p className="text-sm opacity-60">در حال بارگذاری…</p> : null}
      {isError ? <p className="text-sm text-psy-error">خطا در دریافت نظرات</p> : null}

      <ul className="space-y-3">
        {rows.map((row) => (
          <li
            key={row.id}
            className="rounded-3xl border border-psy-neutral-200 bg-psy-surface p-5 shadow-psy-sm dark:border-white/10 dark:bg-psy-surface-dark"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-medium">{row.patient_first_name}</p>
              <p className="text-psy-gold" dir="ltr">
                {"★".repeat(row.rating)}
                {"☆".repeat(5 - row.rating)}
              </p>
            </div>
            {row.body ? <p className="mt-3 text-sm leading-7">{row.body}</p> : null}
            <p className="mt-2 text-xs opacity-50">
              {formatJalaliFriendlyDate(row.created_at)}
            </p>
          </li>
        ))}
        {!isLoading && !rows.length ? (
          <li className="text-sm opacity-50">امتیازی ثبت نشده است.</li>
        ) : null}
      </ul>
    </div>
  );
}
