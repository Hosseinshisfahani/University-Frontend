"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { formatIrr } from "@/features/finance/types";
import { productKindLabel } from "@/app/(institutes)/(psy_institute)/_shared/helpers";
import { useShopCategories, useShopProduct, useShopProducts } from "@/app/(institutes)/(psy_institute)/_shared/use-psy";
import {
  useDeleteShopCategory,
  useDeleteShopProduct,
  useSaveShopCategory,
  useSaveShopProduct,
} from "@/app/(institutes)/(psy_institute)/_shared/use-psy-admin";
import type { Product, ProductWrite } from "@/app/(institutes)/(psy_institute)/_shared/types";

const inputClass =
  "w-full rounded-md border px-3 py-2 dark:border-white/15 dark:bg-transparent";

export function ShopAdminProductsClient() {
  const products = useShopProducts({});
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">محصولات</h1>
        <Link href="/admin/shop/products/new" className="rounded-lg bg-primary px-4 py-2 text-sm text-[#332B1A]">
          محصول جدید
        </Link>
      </div>
      <ul className="divide-y rounded-lg border border-[#0f1a1c]/10 dark:border-white/10">
        {(products.data?.results ?? []).map((product) => (
          <li key={product.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm">
            <Link href={`/admin/shop/products/${product.slug}`} className="font-medium">
              {product.title}
            </Link>
            <span>{productKindLabel(product.kind)}</span>
            <span>{formatIrr(product.price)}</span>
            <span className="opacity-60">{product.is_published ? "منتشر" : "پیش‌نویس"}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ShopProductEditorClient({ mode }: { mode: "new" | "edit" }) {
  const params = useParams<{ slug: string }>();
  const slug = mode === "edit" ? params.slug : "";
  const existing = useShopProduct(slug);
  if (mode === "edit" && existing.isLoading) {
    return <p className="text-sm opacity-60">در حال بارگذاری…</p>;
  }
  if (mode === "edit" && !existing.data) {
    return <p className="text-sm text-red-600">محصول پیدا نشد.</p>;
  }
  return <ShopProductForm mode={mode} product={existing.data} />;
}

function ShopProductForm({
  mode,
  product,
}: {
  mode: "new" | "edit";
  product?: Product;
}) {
  const categories = useShopCategories();
  const save = useSaveShopProduct();
  const remove = useDeleteShopProduct();
  const router = useRouter();
  const [form, setForm] = useState<ProductWrite>(() =>
    product
      ? {
          title: product.title,
          slug: product.slug,
          kind: product.kind,
          description: product.description,
          body_md: product.body_md,
          price: product.price,
          compare_at_price: product.compare_at_price ?? "",
          category: product.category,
          is_published: product.is_published,
          is_available: product.is_available,
          sort_order: product.sort_order,
        }
      : {
          title: "",
          slug: "",
          kind: "physical",
          description: "",
          body_md: "",
          price: "",
          compare_at_price: "",
          category: null,
          is_published: false,
          is_available: true,
          sort_order: 0,
        },
  );
  const [image, setImage] = useState<File | null>(null);
  const [digitalFile, setDigitalFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const payload: ProductWrite = {
      ...form,
      category: form.category || null,
      compare_at_price: form.compare_at_price || null,
    };
    const body =
      image || digitalFile ? productToFormData(payload, image, digitalFile) : payload;
    try {
      const saved = await save.mutateAsync({
        slug: mode === "edit" ? form.slug : undefined,
        data: body,
      });
      router.push(`/admin/shop/products/${saved.slug}`);
    } catch {
      setError("ذخیره محصول ناموفق بود.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-lg border border-[#0f1a1c]/10 bg-white p-5 dark:border-white/10 dark:bg-[#0f1618]">
      <h1 className="text-2xl font-bold">{mode === "new" ? "محصول جدید" : "ویرایش محصول"}</h1>
      <label className="block text-sm">
        <span className="mb-1 block opacity-60">عنوان</span>
        <input required className={inputClass} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
      </label>
      <label className="block text-sm">
        <span className="mb-1 block opacity-60">نامک</span>
        <input required disabled={mode === "edit"} className={inputClass} value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
      </label>
      <label className="block text-sm">
        <span className="mb-1 block opacity-60">دسته</span>
        <select
          className={inputClass}
          value={form.category ?? ""}
          onChange={(e) => setForm({ ...form, category: e.target.value ? Number(e.target.value) : null })}
        >
          <option value="">بدون دسته</option>
          {(categories.data ?? []).map((category) => (
            <option key={category.id} value={category.id}>{category.name}</option>
          ))}
        </select>
      </label>
      <label className="block text-sm">
        <span className="mb-1 block opacity-60">نوع</span>
        <select className={inputClass} value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value })}>
          <option value="physical">فیزیکی</option>
          <option value="digital">دیجیتال</option>
        </select>
      </label>
      <label className="block text-sm">
        <span className="mb-1 block opacity-60">قیمت (ریال)</span>
        <input required className={inputClass} value={String(form.price)} onChange={(e) => setForm({ ...form, price: e.target.value })} />
      </label>
      <label className="block text-sm">
        <span className="mb-1 block opacity-60">قیمت قبلی (ریال)</span>
        <input className={inputClass} value={String(form.compare_at_price ?? "")} onChange={(e) => setForm({ ...form, compare_at_price: e.target.value })} />
      </label>
      <label className="block text-sm">
        <span className="mb-1 block opacity-60">خلاصه</span>
        <textarea className={inputClass} rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      </label>
      <label className="block text-sm">
        <span className="mb-1 block opacity-60">توضیحات</span>
        <textarea className={inputClass} rows={5} value={form.body_md} onChange={(e) => setForm({ ...form, body_md: e.target.value })} />
      </label>
      <label className="block text-sm">
        <span className="mb-1 block opacity-60">تصویر</span>
        <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] ?? null)} />
      </label>
      {form.kind === "digital" ? (
        <label className="block text-sm">
          <span className="mb-1 block opacity-60">فایل دیجیتال</span>
          <input type="file" onChange={(e) => setDigitalFile(e.target.files?.[0] ?? null)} />
        </label>
      ) : null}
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={Boolean(form.is_published)} onChange={(e) => setForm({ ...form, is_published: e.target.checked })} />
        منتشر شود
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={form.is_available !== false} onChange={(e) => setForm({ ...form, is_available: e.target.checked })} />
        قابل خرید
      </label>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <div className="flex gap-3">
        <button type="submit" disabled={save.isPending} className="rounded-lg bg-primary px-4 py-2 text-sm text-[#332B1A] disabled:opacity-60">
          ذخیره
        </button>
        {mode === "edit" ? (
          <button
            type="button"
            className="text-sm text-red-600"
            onClick={async () => {
              await remove.mutateAsync(form.slug);
              router.push("/admin/shop/products");
            }}
          >
            حذف
          </button>
        ) : null}
      </div>
    </form>
  );
}

function productToFormData(payload: ProductWrite, image: File | null, digitalFile: File | null) {
  const body = new FormData();
  body.set("title", payload.title);
  body.set("slug", payload.slug);
  body.set("kind", payload.kind);
  body.set("description", payload.description ?? "");
  body.set("body_md", payload.body_md ?? "");
  body.set("price", String(payload.price));
  if (payload.compare_at_price) body.set("compare_at_price", String(payload.compare_at_price));
  if (payload.category) body.set("category", String(payload.category));
  body.set("is_published", payload.is_published ? "true" : "false");
  body.set("is_available", payload.is_available === false ? "false" : "true");
  body.set("sort_order", String(payload.sort_order ?? 0));
  if (image) body.set("image", image);
  if (digitalFile) body.set("digital_file", digitalFile);
  return body;
}

export function ShopAdminCategoriesClient() {
  const categories = useShopCategories();
  const save = useSaveShopCategory();
  const remove = useDeleteShopCategory();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">دسته‌ها</h1>
      <form
        className="flex flex-wrap gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate({ data: { name, slug, is_active: true } }, { onSuccess: () => { setName(""); setSlug(""); } });
        }}
      >
        <input required placeholder="نام" className={inputClass} value={name} onChange={(e) => setName(e.target.value)} />
        <input required placeholder="نامک" className={inputClass} value={slug} onChange={(e) => setSlug(e.target.value)} />
        <button className="rounded-lg bg-primary px-4 py-2 text-sm text-[#332B1A]">افزودن</button>
      </form>
      <ul className="space-y-2">
        {(categories.data ?? []).map((category) => (
          <li key={category.id} className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm">
            <span>{category.name} · {category.slug}</span>
            <button type="button" className="text-red-600" onClick={() => remove.mutate(category.slug)}>حذف</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
