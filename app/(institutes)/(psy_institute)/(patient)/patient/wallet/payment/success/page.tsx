"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { financeKeys, useWallet } from "@/features/finance/hooks";
import { formatIrr } from "@/features/finance/types";

function SuccessInner() {
  const params = useSearchParams();
  const paymentId = params.get("payment_id");
  const next = params.get("next");
  const safeNext =
    next &&
    (next.startsWith("/psy/") ||
      next.startsWith("/patient/") ||
      next.startsWith("/therapist/") ||
      next.startsWith("/admin/"))
      ? next
      : null;
  const queryClient = useQueryClient();
  const { data: wallet } = useWallet();

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: financeKeys.wallet });
    queryClient.invalidateQueries({ queryKey: ["finance", "ledger"] });
  }, [queryClient]);

  return (
    <div className="mx-auto max-w-lg space-y-4 rounded-2xl border border-primary/30 bg-white/80 p-8 text-center dark:bg-[#121212]">
      <h1 className="title gradient-text text-2xl font-bold">پرداخت موفق</h1>
      {paymentId ? (
        <p className="text-sm text-foreground/60">شناسه پرداخت: {paymentId}</p>
      ) : null}
      <p className="text-lg font-medium">
        موجودی فعلی: {formatIrr(wallet?.balance ?? 0)}
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        {safeNext ? (
          <Link
            href={safeNext}
            className="inline-block rounded-lg bg-primary px-5 py-3 text-sm font-medium text-[#332B1A]"
          >
            ادامه ثبت‌نام
          </Link>
        ) : null}
        <Link
          href="/patient/wallet"
          className="inline-block rounded-lg border border-foreground/15 px-5 py-3 text-sm font-medium"
        >
          بازگشت به کیف پول
        </Link>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<p className="text-center">در حال بارگذاری…</p>}>
      <SuccessInner />
    </Suspense>
  );
}
