"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import { ApiError } from "@/lib/api/client";
import { useAuthStore } from "@/features/auth/store";
import { isPsyPatient } from "@/features/auth/types";
import { formatIrr } from "@/features/finance/types";
import { productKindLabel } from "@/app/(institutes)/(psy_institute)/_shared/helpers";
import {
  useAddToCart,
  useShopCategories,
  useShopProduct,
  useShopProducts,
} from "@/app/(institutes)/(psy_institute)/_shared/use-psy";

function errorDetail(err: unknown): string {
  if (err instanceof ApiError && err.body && typeof err.body === "object") {
    const body = err.body as { detail?: string };
    if (body.detail) return body.detail;
  }
  return "خطا در انجام درخواست";
}

export function ShopCatalog() {
  const [category, setCategory] = useState("");
  const [kind, setKind] = useState("");
  const [ordering, setOrdering] = useState("sort_order");
  const [q, setQ] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const categories = useShopCategories();
  const products = useShopProducts({
    category: category || undefined,
    kind: kind || undefined,
    ordering,
    q: search || undefined,
    page,
  });

  function onSearch(e: FormEvent) {
    e.preventDefault();
    setPage(1);
    setSearch(q.trim());
  }

  const results = products.data?.results ?? [];

  return (
    <div className="psy-root mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-8 max-w-2xl">
        <p className="text-sm font-medium text-[var(--psy-accent)]">فروشگاه</p>
        <h1 className="title mt-2 text-3xl font-bold tracking-tight text-[var(--psy-ink)] sm:text-4xl">
          کتاب و فایل‌های مرکز
        </h1>
        <p className="mt-3 text-[var(--psy-muted)]">
          کالای فیزیکی با ارسال، و فایل دیجیتال قابل دانلود پس از پرداخت.
        </p>
      </header>

      <form onSubmit={onSearch} className="mb-4 flex flex-col gap-3 sm:flex-row">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="جستجو"
          className="flex-1 rounded-xl border border-[var(--psy-line)] bg-transparent px-4 py-2.5 text-sm"
        />
        <select
          value={ordering}
          onChange={(e) => {
            setOrdering(e.target.value);
            setPage(1);
          }}
          className="rounded-xl border border-[var(--psy-line)] bg-transparent px-3 py-2.5 text-sm"
        >
          <option value="sort_order">پیش‌فرض</option>
          <option value="price">ارزان‌ترین</option>
          <option value="-price">گران‌ترین</option>
          <option value="-created_at">جدیدترین</option>
          <option value="title">نام</option>
        </select>
        <button
          type="submit"
          className="rounded-xl bg-[var(--psy-ink)] px-5 py-2.5 text-sm text-white"
        >
          جستجو
        </button>
      </form>

      <div className="mb-6 flex flex-wrap gap-2">
        <FilterChip active={!category} onClick={() => { setCategory(""); setPage(1); }}>
          همه دسته‌ها
        </FilterChip>
        {(categories.data ?? []).map((item) => (
          <FilterChip
            key={item.id}
            active={category === item.slug}
            onClick={() => {
              setCategory(item.slug);
              setPage(1);
            }}
          >
            {item.name}
          </FilterChip>
        ))}
        <span className="mx-1 w-px bg-[var(--psy-line)]" />
        {[
          ["", "همه"],
          ["physical", "فیزیکی"],
          ["digital", "دیجیتال"],
        ].map(([value, label]) => (
          <FilterChip
            key={value || "all-kinds"}
            active={kind === value}
            onClick={() => {
              setKind(value);
              setPage(1);
            }}
          >
            {label}
          </FilterChip>
        ))}
      </div>

      {products.isLoading ? <p className="text-[var(--psy-muted)]">در حال بارگذاری…</p> : null}
      {products.isError ? <p className="text-red-600">خطا در دریافت محصولات</p> : null}

      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {results.map((product) => (
          <li key={product.id}>
            <Link
              href={`/psy/shop/${product.slug}`}
              className="group block overflow-hidden rounded-2xl border border-[var(--psy-line)] bg-[var(--psy-surface)] transition hover:-translate-y-0.5 hover:border-[var(--psy-accent)]/50"
            >
              <div
                className="aspect-[4/3] bg-cover bg-center"
                style={{
                  backgroundImage: product.image
                    ? `url(${product.image})`
                    : "linear-gradient(135deg, #1a3a3c, #0f1a1c)",
                }}
              />
              <div className="space-y-2 p-4">
                <div className="flex items-center justify-between gap-2 text-xs text-[var(--psy-muted)]">
                  <span>{product.category_name || "بدون دسته"}</span>
                  <span>{productKindLabel(product.kind)}</span>
                </div>
                <h2 className="title text-lg font-bold text-[var(--psy-ink)]">{product.title}</h2>
                <p className="line-clamp-2 text-sm text-[var(--psy-muted)]">{product.description}</p>
                <p className="font-medium text-[var(--psy-ink)]">
                  {formatIrr(product.price)}
                  {product.compare_at_price ? (
                    <span className="ms-2 text-sm text-[var(--psy-muted)] line-through">
                      {formatIrr(product.compare_at_price)}
                    </span>
                  ) : null}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
      {!products.isLoading && !results.length ? (
        <p className="text-[var(--psy-muted)]">محصولی پیدا نشد.</p>
      ) : null}

      {products.data && products.data.count > results.length ? (
        <div className="mt-8 flex items-center justify-center gap-3">
          <button
            type="button"
            disabled={!products.data.previous}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="rounded-lg border px-3 py-1.5 text-sm disabled:opacity-40"
          >
            قبلی
          </button>
          <span className="text-sm">صفحه {page}</span>
          <button
            type="button"
            disabled={!products.data.next}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-lg border px-3 py-1.5 text-sm disabled:opacity-40"
          >
            بعدی
          </button>
        </div>
      ) : null}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-sm ${
        active
          ? "border-[var(--psy-ink)] bg-[var(--psy-ink)] text-white"
          : "border-[var(--psy-line)] text-[var(--psy-ink)]"
      }`}
    >
      {children}
    </button>
  );
}

export function ShopProductDetail() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const router = useRouter();
  const { data: product, isLoading, isError } = useShopProduct(slug);
  const add = useAddToCart();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function onAdd() {
    if (!product) return;
    setError(null);
    setMessage(null);
    const nextPath = `/psy/shop/${product.slug}`;
    if (!isAuthenticated) {
      router.push(`/login?next=${encodeURIComponent(nextPath)}`);
      return;
    }
    if (!isPsyPatient(user)) {
      setError("خرید فقط برای مراجعان مرکز امکان‌پذیر است.");
      return;
    }
    try {
      await add.mutateAsync({ slug: product.slug, quantity: 1 });
      setMessage("به سبد خرید اضافه شد.");
      router.push("/patient/shop/cart");
    } catch (err) {
      setError(errorDetail(err));
    }
  }

  if (isLoading) {
    return <p className="psy-root px-4 py-16 text-center text-[var(--psy-muted)]">در حال بارگذاری…</p>;
  }
  if (isError || !product) {
    return <p className="psy-root px-4 py-16 text-center text-red-600">محصول پیدا نشد.</p>;
  }

  return (
    <div className="psy-root mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:px-8">
      <article>
        <div
          className="mb-6 aspect-[16/9] rounded-2xl bg-cover bg-center"
          style={{
            backgroundImage: product.image
              ? `url(${product.image})`
              : "linear-gradient(135deg, #1a3a3c, #0f1a1c)",
          }}
        />
        <p className="text-sm text-[var(--psy-accent)]">
          {product.category_name || "فروشگاه"} · {productKindLabel(product.kind)}
        </p>
        <h1 className="title mt-2 text-3xl font-bold text-[var(--psy-ink)]">{product.title}</h1>
        {product.body_md ? (
          <div className="prose mt-6 max-w-none text-[var(--psy-ink)]">
            <ReactMarkdown rehypePlugins={[rehypeSanitize]}>{product.body_md}</ReactMarkdown>
          </div>
        ) : (
          <p className="mt-4 text-[var(--psy-muted)]">{product.description}</p>
        )}
      </article>
      <aside className="h-fit space-y-4 rounded-2xl border border-[var(--psy-line)] bg-[var(--psy-surface)] p-5">
        <p className="text-2xl font-bold text-[var(--psy-ink)]">{formatIrr(product.price)}</p>
        {product.compare_at_price ? (
          <p className="text-sm text-[var(--psy-muted)] line-through">
            {formatIrr(product.compare_at_price)}
          </p>
        ) : null}
        {!product.is_available ? (
          <p className="text-sm text-red-600">این محصول فعلاً قابل خرید نیست.</p>
        ) : (
          <button
            type="button"
            onClick={onAdd}
            disabled={add.isPending}
            className="w-full rounded-xl bg-[var(--psy-ink)] px-4 py-3 text-sm font-medium text-white disabled:opacity-60"
          >
            {add.isPending ? "در حال افزودن…" : "افزودن به سبد"}
          </button>
        )}
        {message ? <p className="text-sm text-[var(--psy-sage)]">{message}</p> : null}
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <Link href="/psy/shop" className="block text-center text-sm text-[var(--psy-muted)]">
          بازگشت به فروشگاه
        </Link>
      </aside>
    </div>
  );
}
