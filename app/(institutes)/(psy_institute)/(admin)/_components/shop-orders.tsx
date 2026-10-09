"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useParams } from "next/navigation";
import { formatJalaliDateTime } from "@/lib/datetime/jalali";
import { formatIrr } from "@/features/finance/types";
import {
  couponKindLabel,
  orderStatusLabel,
} from "@/app/(institutes)/(psy_institute)/_shared/helpers";
import {
  useAdminCoupons,
  useAdminShopOrder,
  useAdminShopOrders,
  useDeleteCoupon,
  useRefundAdminShopOrder,
  useSaveCoupon,
  useShopStats,
  useUpdateAdminShopOrder,
} from "@/app/(institutes)/(psy_institute)/_shared/use-psy-admin";
import type { CouponWrite } from "@/app/(institutes)/(psy_institute)/_shared/types";

const inputClass =
  "w-full rounded-md border px-3 py-2 dark:border-white/15 dark:bg-transparent";

export function ShopAdminStatsClient() {
  const stats = useShopStats();
  const data = stats.data;
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">فروشگاه</h1>
      <div className="flex flex-wrap gap-3 text-sm">
        <Link href="/admin/shop/products" className="rounded-lg border px-3 py-2">محصولات</Link>
        <Link href="/admin/shop/categories" className="rounded-lg border px-3 py-2">دسته‌ها</Link>
        <Link href="/admin/shop/orders" className="rounded-lg border px-3 py-2">سفارش‌ها</Link>
        <Link href="/admin/shop/coupons" className="rounded-lg border px-3 py-2">کدهای تخفیف</Link>
      </div>
      {data ? (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <Stat label="درآمد کل" value={formatIrr(data.revenue_total)} sub={`${data.orders_paid_count} سفارش`} />
            <Stat label="۷ روز" value={formatIrr(data.revenue_7d)} sub={`${data.orders_7d} سفارش`} />
            <Stat label="۳۰ روز" value={formatIrr(data.revenue_30d)} sub={`${data.orders_30d} سفارش`} />
          </div>
          <div>
            <h2 className="mb-2 font-bold">پرفروش‌ها</h2>
            <ul className="space-y-1 text-sm">
              {data.top_products.map((row) => (
                <li key={row.title} className="flex justify-between">
                  <span>{row.title}</span>
                  <span>{formatIrr(row.revenue)}</span>
                </li>
              ))}
            </ul>
          </div>
        </>
      ) : (
        <p className="text-sm opacity-60">در حال بارگذاری…</p>
      )}
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-lg border border-[#0f1a1c]/10 bg-white p-4 dark:border-white/10 dark:bg-[#0f1618]">
      <div className="text-xs opacity-50">{label}</div>
      <div className="mt-1 text-lg font-bold">{value}</div>
      <div className="mt-1 text-xs opacity-45">{sub}</div>
    </div>
  );
}

export function ShopAdminOrdersClient() {
  const [status, setStatus] = useState("");
  const [q, setQ] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const orders = useAdminShopOrders({ status: status || undefined, q: search || undefined, page });
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">سفارش‌ها</h1>
      <form
        className="flex flex-wrap gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          setPage(1);
          setSearch(q.trim());
        }}
      >
        <input className={inputClass} placeholder="شماره یا نام" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className={inputClass} value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
          <option value="">همه وضعیت‌ها</option>
          {["pending_payment", "paid", "processing", "shipped", "delivered", "canceled", "refunded"].map((item) => (
            <option key={item} value={item}>{orderStatusLabel(item)}</option>
          ))}
        </select>
        <button className="rounded-lg border px-3 text-sm">جستجو</button>
      </form>
      <ul className="divide-y rounded-lg border">
        {(orders.data?.results ?? []).map((order) => (
          <li key={order.id}>
            <Link href={`/admin/shop/orders/${order.id}`} className="flex flex-wrap justify-between gap-2 px-4 py-3 text-sm">
              <span>{order.number}</span>
              <span>{order.patient_name}</span>
              <span>{orderStatusLabel(order.status)}</span>
              <span>{formatIrr(order.total)}</span>
              <span className="opacity-50">{formatJalaliDateTime(order.created_at)}</span>
            </Link>
          </li>
        ))}
      </ul>
      <div className="flex justify-center gap-3 text-sm">
        <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>قبلی</button>
        <span>صفحه {page}</span>
        <button
          type="button"
          disabled={(orders.data?.results.length ?? 0) < 25}
          onClick={() => setPage((p) => p + 1)}
        >
          بعدی
        </button>
      </div>
    </div>
  );
}

export function ShopAdminOrderDetailClient() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const order = useAdminShopOrder(Number.isFinite(id) ? id : 0);
  const update = useUpdateAdminShopOrder();
  const refund = useRefundAdminShopOrder();
  const [tracking, setTracking] = useState("");
  const [note, setNote] = useState("");
  const data = order.data;
  const next = data ? nextStatus(data.status, data.requires_shipping) : null;

  if (!data) return <p className="text-sm opacity-60">در حال بارگذاری…</p>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{data.number}</h1>
      <p className="text-sm">{data.patient_name} · {orderStatusLabel(data.status)} · {formatIrr(data.total)}</p>
      {data.requires_shipping ? (
        <p className="text-sm">
          {data.shipping_full_name}، {data.shipping_province}، {data.shipping_city}، {data.shipping_address}
        </p>
      ) : null}
      <ul className="text-sm">
        {data.items.map((item) => (
          <li key={item.id}>{item.title} × {item.quantity} — {formatIrr(item.line_total)}</li>
        ))}
      </ul>
      {next ? (
        <form
          className="flex flex-wrap items-end gap-2"
          onSubmit={(e: FormEvent) => {
            e.preventDefault();
            update.mutate({
              id: data.id,
              status: next,
              tracking_code: tracking || undefined,
            });
          }}
        >
          {next === "shipped" ? (
            <input required placeholder="کد رهگیری" className={inputClass} value={tracking} onChange={(e) => setTracking(e.target.value)} />
          ) : null}
          <button className="rounded-lg bg-primary px-4 py-2 text-sm text-[#332B1A]">
            تغییر به {orderStatusLabel(next)}
          </button>
        </form>
      ) : null}
      <form
        className="space-y-2"
        onSubmit={(e) => {
          e.preventDefault();
          update.mutate({ id: data.id, admin_note: note });
        }}
      >
        <textarea className={inputClass} rows={3} placeholder="یادداشت مدیر" value={note} onChange={(e) => setNote(e.target.value)} />
        <button className="rounded-lg border px-3 py-2 text-sm">ثبت یادداشت</button>
      </form>
      {data.status !== "refunded" && data.status !== "canceled" && data.status !== "pending_payment" ? (
        <button type="button" className="text-sm text-red-600" onClick={() => refund.mutate({ id: data.id, reason: "بازپرداخت مدیر" })}>
          بازپرداخت
        </button>
      ) : null}
      {data.status === "pending_payment" ? (
        <button type="button" className="text-sm text-red-600" onClick={() => refund.mutate({ id: data.id, reason: "لغو مدیر" })}>
          لغو سفارش
        </button>
      ) : null}
      {update.isError || refund.isError ? <p className="text-sm text-red-600">عملیات ناموفق بود.</p> : null}
    </div>
  );
}

function nextStatus(status: string, requiresShipping: boolean): string | null {
  if (requiresShipping) {
    if (status === "paid") return "processing";
    if (status === "processing") return "shipped";
    if (status === "shipped") return "delivered";
    return null;
  }
  if (status === "paid") return "delivered";
  return null;
}

const emptyCoupon = (): CouponWrite => ({
  code: "",
  kind: "percent",
  value: "10",
  max_discount: "",
  min_order_total: "0",
  max_uses_per_user: 1,
  is_active: true,
});

export function ShopAdminCouponsClient() {
  const coupons = useAdminCoupons();
  const save = useSaveCoupon();
  const remove = useDeleteCoupon();
  const [form, setForm] = useState<CouponWrite>(emptyCoupon());

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">کدهای تخفیف</h1>
      <form
        className="grid gap-2 sm:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate(
            {
              data: {
                ...form,
                max_discount: form.max_discount || null,
                max_uses: form.max_uses || null,
              },
            },
            { onSuccess: () => setForm(emptyCoupon()) },
          );
        }}
      >
        <input required placeholder="کد" className={inputClass} value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
        <select className={inputClass} value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value })}>
          <option value="percent">درصد</option>
          <option value="fixed">مبلغ ثابت (ریال)</option>
        </select>
        <input required placeholder="مقدار" className={inputClass} value={String(form.value)} onChange={(e) => setForm({ ...form, value: e.target.value })} />
        <input placeholder="حداقل سفارش (ریال)" className={inputClass} value={String(form.min_order_total ?? "")} onChange={(e) => setForm({ ...form, min_order_total: e.target.value })} />
        <button className="rounded-lg bg-primary px-4 py-2 text-sm text-[#332B1A]">ثبت کد</button>
      </form>
      <ul className="space-y-2 text-sm">
        {(coupons.data ?? []).map((coupon) => (
          <li key={coupon.id} className="flex items-center justify-between rounded-lg border px-3 py-2">
            <span>
              {coupon.code} · {couponKindLabel(coupon.kind)} · {coupon.used_count} مصرف
              {!coupon.is_active ? " · غیرفعال" : ""}
            </span>
            <button type="button" className="text-red-600" onClick={() => remove.mutate(coupon.id)}>حذف</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
