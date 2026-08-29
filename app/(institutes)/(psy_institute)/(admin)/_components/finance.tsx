"use client";

import { useMemo, useState } from "react";
import {
  LEDGER_ENTRY_TYPE_OPTIONS,
  formatIrr,
  formatLedgerDirection,
  formatLedgerEntryType,
  formatPaymentPurpose,
} from "@/features/finance/types";
import { formatJalaliDateTime } from "@/lib/datetime/jalali";
import JalaliDatePicker from "@/app/(institutes)/(psy_institute)/_shared/jalali-date-picker";
import { toApiDate } from "@/lib/datetime/jalali";
import {
  useFinanceLedger,
  useFinancePayments,
  useFinanceRevenue,
  useFinanceSummary,
} from "@/app/(institutes)/(psy_institute)/_shared/use-psy-admin";

type Tab = "ledger" | "sep" | "revenue";

const REVENUE_ENTRY_TYPES = new Set(["appointment_capture", "refund"]);

export default function FinanceOverviewClient() {
  const defaults = useMemo(() => {
    const to = toApiDate(new Date());
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - 30);
    return { from: toApiDate(fromDate), to };
  }, []);
  const [from, setFrom] = useState(defaults.from);
  const [to, setTo] = useState(defaults.to);
  const [tab, setTab] = useState<Tab>("ledger");
  const [entryType, setEntryType] = useState("");
  const [page, setPage] = useState(1);

  const typeOptions = useMemo(() => {
    if (tab === "revenue") {
      return LEDGER_ENTRY_TYPE_OPTIONS.filter((option) =>
        REVENUE_ENTRY_TYPES.has(option.value),
      );
    }
    return LEDGER_ENTRY_TYPE_OPTIONS;
  }, [tab]);

  const effectiveEntryType =
    tab === "revenue" && entryType && !REVENUE_ENTRY_TYPES.has(entryType)
      ? ""
      : entryType;

  const { data: summary } = useFinanceSummary(from, to);
  const { data: ledger } = useFinanceLedger({
    from,
    to,
    page,
    entry_type: effectiveEntryType || undefined,
  });
  const { data: payments } = useFinancePayments({
    status: "succeeded",
    provider: "sep",
    from,
    to,
    page,
  });
  const { data: revenue } = useFinanceRevenue({
    from,
    to,
    page,
    entry_type: effectiveEntryType || undefined,
  });

  const active =
    tab === "ledger" ? ledger : tab === "sep" ? payments : revenue;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="title text-2xl font-bold">نمای مالی</h1>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <label className="text-sm">
          <span className="mb-1 block opacity-55">از</span>
          <JalaliDatePicker
            value={from}
            onChange={(v) => {
              setPage(1);
              setFrom(v);
            }}
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block opacity-55">تا</span>
          <JalaliDatePicker
            value={to}
            onChange={(v) => {
              setPage(1);
              setTo(v);
            }}
          />
        </label>
        {tab !== "sep" ? (
          <label className="text-sm">
            <span className="mb-1 block opacity-55">نوع</span>
            <select
              className="rounded-md border border-[#0f1a1c]/15 bg-transparent px-2 py-2 dark:border-white/15"
              value={effectiveEntryType}
              onChange={(e) => {
                setPage(1);
                setEntryType(e.target.value);
              }}
            >
              <option value="">همه انواع</option>
              {typeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        ) : null}
      </div>

      {summary ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              label: "SEP موفق",
              value: formatIrr(summary.sep_succeeded_total),
              sub: `${summary.sep_succeeded_count} تراکنش`,
            },
            {
              label: "دریافت نوبت",
              value: formatIrr(summary.appointment_capture_total),
              sub: `${summary.appointment_capture_count} مورد`,
            },
            {
              label: "بازپرداخت",
              value: formatIrr(summary.refund_total),
              sub: `${summary.refund_count} مورد`,
            },
            {
              label: "درآمد خالص نوبت",
              value: formatIrr(summary.net_appointment_revenue),
              sub: "دریافت − بازپرداخت",
            },
          ].map((card) => (
            <div
              key={card.label}
              className="rounded-lg border border-[#0f1a1c]/10 bg-white p-4 dark:border-white/10 dark:bg-[#0f1618]"
            >
              <div className="text-xs opacity-50">{card.label}</div>
              <div className="mt-1 text-lg font-bold">{card.value}</div>
              <div className="mt-1 text-xs opacity-45">{card.sub}</div>
            </div>
          ))}
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2 border-b border-[#0f1a1c]/10 pb-2 dark:border-white/10">
        {(
          [
            ["ledger", "کلی"],
            ["sep", "درگاه پرداخت"],
            ["revenue", " درآمد نوبت ها "],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => {
              setTab(key);
              setPage(1);
            }}
            className={`rounded-md px-3 py-1.5 text-sm ${
              tab === key
                ? "bg-teal-800 text-white"
                : "bg-white dark:bg-[#0f1618]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-lg border border-[#0f1a1c]/10 bg-white dark:border-white/10 dark:bg-[#0f1618]">
        <table className="min-w-full text-sm">
          <thead className="border-b border-[#0f1a1c]/10 text-start opacity-55 dark:border-white/10">
            {tab === "ledger" ? (
              <tr>
                <th className="px-3 py-2 text-start">زمان</th>
                <th className="px-3 py-2 text-start">کاربر</th>
                <th className="px-3 py-2 text-start">نوع</th>
                <th className="px-3 py-2 text-start">مبلغ</th>
                <th className="px-3 py-2 text-start">مرجع</th>
              </tr>
            ) : null}
            {tab === "sep" ? (
              <tr>
                <th className="px-3 py-2 text-start">زمان</th>
                <th className="px-3 py-2 text-start">کاربر</th>
                <th className="px-3 py-2 text-start">مبلغ</th>
                <th className="px-3 py-2 text-start">کد درگاه</th>
                <th className="px-3 py-2 text-start">هدف</th>
              </tr>
            ) : null}
            {tab === "revenue" ? (
              <tr>
                <th className="px-3 py-2 text-start">زمان</th>
                <th className="px-3 py-2 text-start">کاربر</th>
                <th className="px-3 py-2 text-start">نوع</th>
                <th className="px-3 py-2 text-start">مبلغ</th>
                <th className="px-3 py-2 text-start">نوبت</th>
              </tr>
            ) : null}
          </thead>
          <tbody>
            {tab === "ledger"
              ? (ledger?.results ?? []).map((row) => (
                  <tr key={row.id} className="border-t border-[#0f1a1c]/5 dark:border-white/5">
                    <td className="px-3 py-2">{formatJalaliDateTime(row.created_at)}</td>
                    <td className="px-3 py-2">{row.username}</td>
                    <td className="px-3 py-2">
                      {formatLedgerEntryType(row.entry_type)} ·{" "}
                      {formatLedgerDirection(row.direction)}
                    </td>
                    <td className="px-3 py-2">{formatIrr(row.amount)}</td>
                    <td className="px-3 py-2 font-mono text-xs">{row.reference || "—"}</td>
                  </tr>
                ))
              : null}
            {tab === "sep"
              ? (payments?.results ?? []).map((row) => (
                  <tr key={row.id} className="border-t border-[#0f1a1c]/5 dark:border-white/5">
                    <td className="px-3 py-2">{formatJalaliDateTime(row.created_at)}</td>
                    <td className="px-3 py-2">{row.username}</td>
                    <td className="px-3 py-2">{formatIrr(row.amount)}</td>
                    <td className="px-3 py-2 font-mono text-xs">
                      {row.provider_ref || "—"}
                    </td>
                    <td className="px-3 py-2">{formatPaymentPurpose(row.purpose)}</td>
                  </tr>
                ))
              : null}
            {tab === "revenue"
              ? (revenue?.results ?? []).map((row) => (
                  <tr key={row.id} className="border-t border-[#0f1a1c]/5 dark:border-white/5">
                    <td className="px-3 py-2">{formatJalaliDateTime(row.created_at)}</td>
                    <td className="px-3 py-2">{row.username}</td>
                    <td className="px-3 py-2">{formatLedgerEntryType(row.entry_type)}</td>
                    <td className="px-3 py-2">{formatIrr(row.amount)}</td>
                    <td className="px-3 py-2">
                      {row.appointment_id ? `#${row.appointment_id}` : "—"}
                    </td>
                  </tr>
                ))
              : null}
          </tbody>
        </table>
        {active && !active.results.length ? (
          <p className="p-4 text-sm opacity-50">موردی در این بازه نیست.</p>
        ) : null}
      </div>

      {active && active.count > active.page_size ? (
        <div className="flex items-center gap-3 text-sm">
          <button
            type="button"
            disabled={page <= 1}
            className="rounded border px-3 py-1 disabled:opacity-40"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            قبلی
          </button>
          <span>
            صفحه {active.page} / {Math.ceil(active.count / active.page_size)}
          </span>
          <button
            type="button"
            disabled={page * active.page_size >= active.count}
            className="rounded border px-3 py-1 disabled:opacity-40"
            onClick={() => setPage((p) => p + 1)}
          >
            بعدی
          </button>
        </div>
      ) : null}
    </div>
  );
}
