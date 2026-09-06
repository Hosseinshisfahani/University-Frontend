"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { endOfMonth, startOfMonth, subMonths } from "date-fns-jalali";
import { formatIrr } from "@/features/finance/types";
import {
  formatJalaliDate,
  formatJalaliFriendlyDate,
  formatJalaliTime,
  toApiDate,
} from "@/lib/datetime/jalali";
import JalaliDatePicker from "@/app/(institutes)/(psy_institute)/_shared/jalali-date-picker";
import { useTherapistFinance } from "@/app/(institutes)/(psy_institute)/_shared/use-psy";
import { appointmentStatusLabel } from "@/app/(institutes)/(psy_institute)/_shared/helpers";

function currentJalaliMonthRange() {
  const now = new Date();
  return {
    start: toApiDate(startOfMonth(now)),
    end: toApiDate(endOfMonth(now)),
  };
}

function previousJalaliMonthRange() {
  const prev = subMonths(new Date(), 1);
  return {
    start: toApiDate(startOfMonth(prev)),
    end: toApiDate(endOfMonth(prev)),
  };
}

export default function FinanceClient() {
  const defaults = useMemo(() => currentJalaliMonthRange(), []);
  const [startDate, setStartDate] = useState(defaults.start);
  const [endDate, setEndDate] = useState(defaults.end);
  const { data, isLoading, isError } = useTherapistFinance(startDate, endDate);

  const cards = data
    ? [
        {
          label: "درآمد دوره انتخاب‌شده",
          value: formatIrr(data.total_income),
          hint: "جلسات تأییدشده و انجام‌شده",
        },
        {
          label: "جلسات پرداخت‌شده",
          value: new Intl.NumberFormat("fa-IR").format(data.paid_sessions_count),
          hint: "تعداد نوبت‌های محاسبه‌شده",
        },
        {
          label: "درآمد بالقوه پیش‌رو",
          value: formatIrr(data.upcoming_potential_revenue),
          hint: "نوبت‌های تأییدشدهٔ آینده در همین بازه",
        },
      ]
    : [];

  function applyRange(range: { start: string; end: string }) {
    setStartDate(range.start);
    setEndDate(range.end);
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="title text-3xl font-extrabold">گزارش مالی</h1>
        <p className="mt-2 text-sm text-[var(--psy-muted)] dark:text-white/50">
          درآمد شما از نوبت‌های تأییدشده و انجام‌شده. ارقام کلینیک و درمانگران
          دیگر در این صفحه نیست.
        </p>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <label className="text-sm">
          <span className="mb-1 block opacity-55">از</span>
          <JalaliDatePicker value={startDate} onChange={setStartDate} />
        </label>
        <label className="text-sm">
          <span className="mb-1 block opacity-55">تا</span>
          <JalaliDatePicker value={endDate} onChange={setEndDate} />
        </label>
        <div className="flex flex-wrap gap-2 pb-0.5">
          <button
            type="button"
            onClick={() => applyRange(currentJalaliMonthRange())}
            className="rounded-md border border-psy-neutral-200 px-3 py-2 text-sm dark:border-white/15"
          >
            این ماه
          </button>
          <button
            type="button"
            onClick={() => applyRange(previousJalaliMonthRange())}
            className="rounded-md border border-psy-neutral-200 px-3 py-2 text-sm dark:border-white/15"
          >
            ماه قبل
          </button>
        </div>
      </div>

      {isLoading ? (
        <p className="text-[var(--psy-muted)]">در حال بارگذاری…</p>
      ) : null}
      {isError ? (
        <p className="text-sm text-red-700 dark:text-red-300">
          بارگذاری گزارش مالی ممکن نشد.
        </p>
      ) : null}

      {data ? (
        <div className="grid gap-4 sm:grid-cols-3">
          {cards.map((card) => (
            <div
              key={card.label}
              className="rounded-3xl border border-psy-neutral-200 bg-psy-surface p-5 shadow-psy-sm dark:border-white/10 dark:bg-psy-surface-dark"
            >
              <div className="text-xs text-[var(--psy-muted)] dark:text-white/40">
                {card.label}
              </div>
              <div className="mt-2 text-2xl font-bold tabular-nums">
                {card.value}
              </div>
              <p className="mt-1 text-xs text-[var(--psy-muted)] dark:text-white/40">
                {card.hint}
              </p>
            </div>
          ))}
        </div>
      ) : null}

      <section className="space-y-3">
        <h2 className="font-bold">نوبت‌های درآمدزا</h2>
        <div className="overflow-x-auto rounded-3xl border border-psy-neutral-200 bg-psy-surface shadow-psy-sm dark:border-white/10 dark:bg-psy-surface-dark">
          <table className="min-w-full text-sm">
            <thead className="border-b border-psy-neutral-200 text-start opacity-55 dark:border-white/10">
              <tr>
                <th className="px-3 py-2 text-start">تاریخ</th>
                <th className="px-3 py-2 text-start">نوع جلسه</th>
                <th className="px-3 py-2 text-start">مراجع</th>
                <th className="px-3 py-2 text-start">مبلغ</th>
              </tr>
            </thead>
            <tbody>
              {(data?.appointments ?? []).map((row) => (
                <tr
                  key={row.id}
                  className="border-t border-psy-neutral-200/60 dark:border-white/5"
                >
                  <td className="px-3 py-2">
                    <Link
                      href={`/therapist/appointments/${row.id}`}
                      className="hover:underline"
                    >
                      {formatJalaliFriendlyDate(row.starts_at)}
                      <span className="mx-1.5 opacity-40">·</span>
                      {formatJalaliTime(row.starts_at)}
                    </Link>
                    <div className="mt-1 text-xs opacity-50">
                      {formatJalaliDate(row.starts_at)} ·{" "}
                      {appointmentStatusLabel(row.status)}
                    </div>
                  </td>
                  <td className="px-3 py-2">{row.session_type_name}</td>
                  <td className="px-3 py-2">
                    <Link
                      href={`/therapist/patients/${row.patient_id}`}
                      className="hover:underline"
                    >
                      {row.patient_name || `مراجع #${row.patient_id}`}
                    </Link>
                  </td>
                  <td className="px-3 py-2 tabular-nums">
                    {formatIrr(row.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {data && !data.appointments.length ? (
            <p className="p-4 text-sm opacity-50">
              در این بازه نوبت تأییدشده یا انجام‌شده‌ای نیست.
            </p>
          ) : null}
        </div>
      </section>
    </div>
  );
}
