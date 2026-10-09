"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { usePayment } from "@/features/finance/hooks";

function FailureInner() {
  const params = useSearchParams();
  const paymentId = params.get("payment_id");
  const payment = usePayment(paymentId ? Number(paymentId) : null);
  const isShop =
    params.get("source") === "shop" ||
    (payment.data?.purpose ?? "").startsWith("psy.order:");

  return (
    <div className="mx-auto max-w-lg space-y-4 rounded-2xl border border-red-500/30 bg-white/80 p-8 text-center dark:bg-[#121212]">
      <h1 className="text-2xl font-bold text-red-700 dark:text-red-300">
        پرداخت ناموفق
      </h1>
      {paymentId ? (
        <p className="text-sm text-foreground/60">شناسه پرداخت: {paymentId}</p>
      ) : null}
      <p className="text-sm text-foreground/70">
        {isShop
          ? "تراکنش تکمیل نشد یا لغو شد. سفارش در انتظار پرداخت می‌ماند."
          : "تراکنش تکمیل نشد یا لغو شد. می‌توانید دوباره شارژ کنید."}
      </p>
      <Link
        href={isShop ? "/patient/shop/cart" : "/patient/wallet"}
        className="inline-block rounded-lg bg-primary px-5 py-3 text-sm font-medium text-[#332B1A]"
      >
        {isShop ? "بازگشت به سبد خرید" : "تلاش مجدد"}
      </Link>
    </div>
  );
}

export default function PaymentFailurePage() {
  return (
    <Suspense fallback={<p className="text-center">در حال بارگذاری…</p>}>
      <FailureInner />
    </Suspense>
  );
}
