"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useSearchParams } from "next/navigation";
import { formatJalaliDateTime } from "@/lib/datetime/jalali";
import { useLedger, useSepInitiate, useWallet } from "../hooks";
import { formatIrr, formatLedgerEntryType, formatToman } from "../types";

function formatAmountInput(raw: string) {
  const digits = raw.replace(/[^\d]/g, "");
  if (!digits) return "";
  return Number(digits).toLocaleString("en-US");
}

export default function WalletPageClient() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next");
  const safeNext =
    next &&
    (next.startsWith("/psy/") || next.startsWith("/patient/"))
      ? next
      : null;
  const { data: wallet, isLoading: walletLoading } = useWallet();
  const [page, setPage] = useState(1);
  const { data: ledger, isLoading: ledgerLoading } = useLedger(page);
  const initiate = useSepInitiate();
  const [amount, setAmount] = useState("500,000");
  const [error, setError] = useState<string | null>(null);

  async function onTopUp(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const value = Number(amount.replace(/,/g, ""));
    if (!Number.isFinite(value) || value < 1) {
      setError("مبلغ معتبر وارد کنید.");
      return;
    }
    try {
      await initiate.mutateAsync(value);
    } catch {
      setError("شروع پرداخت ناموفق بود. دوباره تلاش کنید.");
    }
  }

  const totalPages = ledger
    ? Math.max(1, Math.ceil(ledger.count / ledger.page_size))
    : 1;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="title gradient-text text-3xl font-extrabold">کیف پول</h1>
        <p className="mt-2 text-sm text-foreground/60">موجودی و شارژ حساب</p>
        {safeNext ? (
          <p className="mt-2 text-sm text-primary">
            پس از شارژ، برای ادامه ثبت‌نام{" "}
            <Link href={safeNext} className="underline">
              اینجا را بزنید
            </Link>
            .
          </p>
        ) : null}
      </div>

      <div className="rounded-2xl border border-primary/20 bg-white/70 p-6 dark:bg-[#121212]/80">
        {walletLoading ? (
          <p className="text-foreground/50">در حال بارگذاری…</p>
        ) : (
          <>
            <p className="text-sm text-foreground/60">موجودی</p>
            <p className="mt-1 text-3xl font-bold">
              {formatIrr(wallet?.balance ?? 0)}
            </p>
            <p className="mt-1 text-sm text-foreground/50">
              معادل تقریبی {formatToman(wallet?.balance ?? 0)}
            </p>
          </>
        )}
      </div>

      <form
        onSubmit={onTopUp}
        className="flex flex-col gap-4 rounded-2xl border border-foreground/10 p-5 sm:flex-row sm:items-end"
      >
        <label className="flex flex-1 flex-col gap-2 text-sm">
          <span>مبلغ شارژ (ریال)</span>
          <input
            type="text"
            inputMode="numeric"
            autoComplete="off"
            value={amount}
            onChange={(e) => setAmount(formatAmountInput(e.target.value))}
            className="rounded-lg border border-foreground/15 bg-background px-4 py-3"
          />
        </label>
        <button
          type="submit"
          disabled={initiate.isPending}
          className="rounded-lg bg-primary px-6 py-3 font-medium text-[#332B1A] disabled:opacity-60"
        >
          {initiate.isPending ? "در حال اتصال به درگاه…" : "شارژ از طریق سپ"}
        </button>
      </form>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div>
        <h2 className="mb-3 text-lg font-bold">گردش حساب</h2>
        {ledgerLoading ? (
          <p className="text-foreground/50">در حال بارگذاری…</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-foreground/10">
            <table className="w-full min-w-[640px] text-right text-sm">
              <thead className="bg-foreground/5">
                <tr>
                  <th className="p-3 font-medium">تاریخ</th>
                  <th className="p-3 font-medium">نوع</th>
                  <th className="p-3 font-medium">جهت</th>
                  <th className="p-3 font-medium">مبلغ</th>
                  <th className="p-3 font-medium">مانده</th>
                </tr>
              </thead>
              <tbody>
                {(ledger?.results ?? []).map((row) => (
                  <tr key={row.id} className="border-t border-foreground/10">
                    <td className="p-3">
                      {formatJalaliDateTime(row.created_at)}
                    </td>
                    <td className="p-3">{formatLedgerEntryType(row.entry_type)}</td>
                    <td className="p-3">
                      {row.direction === "credit" ? "واریز" : "برداشت"}
                    </td>
                    <td className="p-3">{formatIrr(row.amount)}</td>
                    <td className="p-3">{formatIrr(row.balance_after)}</td>
                  </tr>
                ))}
                {!ledger?.results.length ? (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-foreground/50">
                      تراکنشی ثبت نشده است.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        )}
        {totalPages > 1 ? (
          <div className="mt-4 flex items-center justify-center gap-3">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-lg border px-3 py-1.5 text-sm disabled:opacity-40"
            >
              قبلی
            </button>
            <span className="text-sm">
              صفحه {page} از {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg border px-3 py-1.5 text-sm disabled:opacity-40"
            >
              بعدی
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
