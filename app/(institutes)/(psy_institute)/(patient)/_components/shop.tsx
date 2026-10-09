"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ApiError } from "@/lib/api/client";
import { formatJalaliDateTime } from "@/lib/datetime/jalali";
import { useWallet } from "@/features/finance/hooks";
import { formatIrr } from "@/features/finance/types";
import {
  orderStatusLabel,
  productKindLabel,
} from "@/app/(institutes)/(psy_institute)/_shared/helpers";
import {
  useApplyCoupon,
  useCancelOrder,
  useCart,
  useCheckout,
  useMyOrders,
  useOrder,
  usePayOrder,
  useRemoveCartItem,
  useRemoveCoupon,
  useStartGatewayPayment,
  useUpdateCartItem,
} from "@/app/(institutes)/(psy_institute)/_shared/use-psy";
import type { ShippingAddress, ShopOrder } from "@/app/(institutes)/(psy_institute)/_shared/types";

const PAID = new Set(["paid", "processing", "shipped", "delivered"]);

function errorDetail(err: unknown): string {
  if (err instanceof ApiError && err.body && typeof err.body === "object") {
    const body = err.body as { detail?: string; code?: string };
    if (body.code === "insufficient_funds") return "موجودی کیف پول کافی نیست.";
    if (body.detail) return body.detail;
  }
  return "خطا در انجام درخواست";
}

const emptyShipping = (): ShippingAddress => ({
  full_name: "",
  phone: "",
  province: "",
  city: "",
  address: "",
  postal_code: "",
});

export function PatientCartClient() {
  const router = useRouter();
  const cart = useCart();
  const wallet = useWallet();
  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveCartItem();
  const apply = useApplyCoupon();
  const clearCoupon = useRemoveCoupon();
  const checkout = useCheckout();
  const pay = usePayOrder();
  const [code, setCode] = useState("");
  const [shipping, setShipping] = useState<ShippingAddress>(emptyShipping);
  const [error, setError] = useState<string | null>(null);

  const data = cart.data;
  const balance = Number(wallet.data?.balance ?? 0);
  const total = Number(data?.total ?? 0);

  async function onCheckout(e: FormEvent) {
    e.preventDefault();
    if (!data) return;
    setError(null);
    if (data.requires_shipping) {
      const missing = Object.values(shipping).some((value) => !value.trim());
      if (missing) {
        setError("نشانی ارسال را کامل کنید.");
        return;
      }
    }
    try {
      const order = await checkout.mutateAsync(data.requires_shipping ? shipping : {});
      if (order.status !== "paid" && Number(order.total) > 0 && balance >= Number(order.total)) {
        try {
          await pay.mutateAsync({
            id: order.id,
            idempotencyKey: `order-pay:${order.id}`,
          });
        } catch {
          router.push(`/patient/shop/orders/${order.id}`);
          return;
        }
      }
      router.push(`/patient/shop/orders/${order.id}`);
    } catch (err) {
      setError(errorDetail(err));
    }
  }

  if (cart.isLoading) return <p className="text-foreground/60">در حال بارگذاری…</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="title gradient-text text-3xl font-extrabold">سبد خرید</h1>
        <p className="mt-2 text-sm text-foreground/60">
          موجودی کیف پول: {formatIrr(wallet.data?.balance ?? 0)}
        </p>
      </div>

      {!data?.items.length ? (
        <p className="text-sm text-foreground/60">
          سبد خالی است.{" "}
          <Link href="/psy/shop" className="text-primary underline">
            مشاهده فروشگاه
          </Link>
        </p>
      ) : (
        <form onSubmit={onCheckout} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <ul className="space-y-3">
            {data.items.map((item) => (
              <li
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-foreground/10 p-4"
              >
                <div>
                  <Link href={`/psy/shop/${item.product.slug}`} className="font-bold">
                    {item.product.title}
                  </Link>
                  <p className="text-xs text-foreground/50">
                    {productKindLabel(item.product.kind)}
                    {!item.buyable ? " · غیرقابل خرید" : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="rounded border px-2"
                    onClick={() =>
                      updateItem.mutate({ id: item.id, quantity: Math.max(1, item.quantity - 1) })
                    }
                  >
                    −
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    type="button"
                    className="rounded border px-2"
                    onClick={() =>
                      updateItem.mutate({ id: item.id, quantity: item.quantity + 1 })
                    }
                  >
                    +
                  </button>
                  <button
                    type="button"
                    className="text-sm text-red-600"
                    onClick={() => removeItem.mutate(item.id)}
                  >
                    حذف
                  </button>
                </div>
                <p className="text-sm">{formatIrr(item.line_total)}</p>
              </li>
            ))}
          </ul>

          <aside className="h-fit space-y-4 rounded-2xl border border-primary/20 bg-white/70 p-5 dark:bg-[#121212]/80">
            <div className="flex gap-2">
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="کد تخفیف"
                className="flex-1 rounded-lg border px-3 py-2 text-sm"
              />
              <button
                type="button"
                className="rounded-lg border px-3 text-sm"
                onClick={() => apply.mutate(code)}
              >
                اعمال
              </button>
            </div>
            {data.coupon ? (
              <p className="text-sm">
                کد {data.coupon.code}{" "}
                <button type="button" className="text-red-600" onClick={() => clearCoupon.mutate()}>
                  حذف
                </button>
              </p>
            ) : null}
            {data.coupon_error ? (
              <p className="text-sm text-red-600">{data.coupon_error.detail}</p>
            ) : null}
            {apply.isError ? <p className="text-sm text-red-600">{errorDetail(apply.error)}</p> : null}

            {data.requires_shipping ? (
              <div className="space-y-2">
                {(
                  [
                    ["full_name", "نام گیرنده"],
                    ["phone", "تلفن"],
                    ["province", "استان"],
                    ["city", "شهر"],
                    ["address", "نشانی"],
                    ["postal_code", "کد پستی"],
                  ] as const
                ).map(([key, label]) => (
                  <label key={key} className="block text-sm">
                    <span className="mb-1 block text-foreground/60">{label}</span>
                    <input
                      required
                      value={shipping[key]}
                      onChange={(e) =>
                        setShipping((current) => ({ ...current, [key]: e.target.value }))
                      }
                      className="w-full rounded-lg border px-3 py-2"
                    />
                  </label>
                ))}
              </div>
            ) : null}

            <dl className="space-y-1 text-sm">
              <Row label="جمع" value={formatIrr(data.subtotal)} />
              <Row label="تخفیف" value={formatIrr(data.discount_total)} />
              <Row label="ارسال" value={formatIrr(data.shipping_fee)} />
              <Row label="قابل پرداخت" value={formatIrr(data.total)} />
            </dl>
            {total > 0 && balance < total ? (
              <p className="text-sm text-foreground/60">
                موجودی کافی نیست. سفارش ثبت می‌شود و می‌توانید مابه‌التفاوت را از درگاه بپردازید.
              </p>
            ) : null}
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            <button
              type="submit"
              disabled={checkout.isPending || pay.isPending}
              className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-medium text-[#332B1A] disabled:opacity-60"
            >
              {checkout.isPending || pay.isPending ? "در حال ثبت…" : "ثبت سفارش"}
            </button>
          </aside>
        </form>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-foreground/60">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

export function PatientOrdersClient() {
  const orders = useMyOrders();
  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-3">
        <h1 className="title gradient-text text-3xl font-extrabold">سفارش‌ها</h1>
        <Link href="/psy/shop" className="text-sm text-primary underline">
          فروشگاه
        </Link>
      </div>
      {orders.isLoading ? <p className="text-foreground/60">در حال بارگذاری…</p> : null}
      <ul className="space-y-3">
        {(orders.data ?? []).map((order) => (
          <li key={order.id}>
            <Link
              href={`/patient/shop/orders/${order.id}`}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-foreground/10 p-4"
            >
              <span className="font-bold">{order.number}</span>
              <span className="text-sm">{orderStatusLabel(order.status)}</span>
              <span className="text-sm">{formatIrr(order.total)}</span>
              <span className="text-xs text-foreground/50">
                {formatJalaliDateTime(order.created_at)}
              </span>
            </Link>
          </li>
        ))}
      </ul>
      {!orders.isLoading && !orders.data?.length ? (
        <p className="text-sm text-foreground/60">هنوز سفارشی ثبت نشده است.</p>
      ) : null}
    </div>
  );
}

export function PatientOrderDetailClient() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const order = useOrder(Number.isFinite(id) ? id : 0);
  const wallet = useWallet();
  const pay = usePayOrder();
  const gateway = useStartGatewayPayment();
  const cancel = useCancelOrder();
  const [error, setError] = useState<string | null>(null);
  const data = order.data;

  async function onPay() {
    if (!data) return;
    setError(null);
    try {
      await pay.mutateAsync({ id: data.id, idempotencyKey: `order-pay:${data.id}` });
    } catch (err) {
      setError(errorDetail(err));
    }
  }

  if (order.isLoading) return <p className="text-foreground/60">در حال بارگذاری…</p>;
  if (!data) return <p className="text-red-600">سفارش پیدا نشد.</p>;

  const balance = Number(wallet.data?.balance ?? 0);
  const total = Number(data.total);
  const canPatientCancel =
    data.status === "pending_payment" ||
    (data.status === "paid" && data.requires_shipping && !data.shipped_at);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-foreground/50">{data.number}</p>
        <h1 className="title gradient-text text-3xl font-extrabold">
          {orderStatusLabel(data.status)}
        </h1>
      </div>
      <OrderTimeline order={data} />
      {data.tracking_code ? (
        <p className="text-sm">کد رهگیری: {data.tracking_code}</p>
      ) : null}
      {data.requires_shipping ? (
        <p className="text-sm text-foreground/70">
          {data.shipping_full_name} — {data.shipping_province}، {data.shipping_city}،{" "}
          {data.shipping_address}، {data.shipping_postal_code}
        </p>
      ) : null}
      <ul className="space-y-2">
        {data.items.map((item) => (
          <li
            key={item.id}
            className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-foreground/10 px-4 py-3 text-sm"
          >
            <span>
              {item.title} × {item.quantity}
            </span>
            <span>{formatIrr(item.line_total)}</span>
            {item.kind === "digital" && item.has_digital_file && PAID.has(data.status) ? (
              <a
                href={`/api/v1/psy/shop/products/${item.product_slug}/download/`}
                className="text-primary underline"
              >
                دانلود
              </a>
            ) : null}
          </li>
        ))}
      </ul>
      <p className="font-bold">مبلغ: {formatIrr(data.total)}</p>
      {data.status === "pending_payment" ? (
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onPay}
            disabled={pay.isPending}
            className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-[#332B1A] disabled:opacity-60"
          >
            پرداخت از کیف پول
          </button>
          {balance < total ? (
            <button
              type="button"
              onClick={() => gateway.mutate(data.id)}
              disabled={gateway.isPending}
              className="rounded-lg border px-4 py-2.5 text-sm disabled:opacity-60"
            >
              پرداخت مابه‌التفاوت با وندار
            </button>
          ) : null}
          <Link href="/patient/wallet" className="self-center text-sm underline">
            شارژ کیف پول
          </Link>
        </div>
      ) : null}
      {canPatientCancel ? (
        <button
          type="button"
          className="text-sm text-red-600"
          onClick={() => cancel.mutate({ id: data.id, reason: "انصراف مراجع" })}
        >
          لغو سفارش
        </button>
      ) : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {cancel.isError ? <p className="text-sm text-red-600">{errorDetail(cancel.error)}</p> : null}
      {gateway.isError ? (
        <p className="text-sm text-red-600">{errorDetail(gateway.error)}</p>
      ) : null}
    </div>
  );
}

function OrderTimeline({ order }: { order: ShopOrder }) {
  if (order.status === "canceled" || order.status === "refunded") return null;
  const steps = order.requires_shipping
    ? ["pending_payment", "paid", "processing", "shipped", "delivered"]
    : ["pending_payment", "paid", "delivered"];
  const index = steps.indexOf(order.status);
  return (
    <ol className="flex flex-wrap gap-2 text-xs">
      {steps.map((step, i) => (
        <li
          key={step}
          className={`rounded-full px-3 py-1 ${
            i <= index ? "bg-primary/30" : "bg-foreground/5 text-foreground/50"
          }`}
        >
          {orderStatusLabel(step)}
        </li>
      ))}
    </ol>
  );
}
