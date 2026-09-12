"use client";

import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useState, FormEvent } from "react";
import {
  useCreateNewsSlide,
  useDeleteNewsSlide,
  useNewsSlide,
  useNewsSlides,
  useUpdateNewsSlide,
} from "@/app/(institutes)/(psy_institute)/_shared/use-psy";
import type {
  NewsSlide,
  NewsSlideWrite,
} from "@/app/(institutes)/(psy_institute)/_shared/types";
import { ApiError } from "@/lib/api/client";

export function NewsAdminListClient() {
  const { data, isLoading } = useNewsSlides();
  const del = useDeleteNewsSlide();
  const router = useRouter();
  const slides = data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="title text-2xl font-bold">اخبار و اطلاع‌رسانی</h1>
          <p className="mt-1 text-sm opacity-55">
            اسلایدهای صفحهٔ مرکز را با تصویر و متن به‌روز کنید
          </p>
        </div>
        <Link
          href="/admin/news/new"
          className="rounded-md bg-teal-800 px-4 py-2 text-sm text-white"
        >
          اسلاید جدید
        </Link>
      </div>

      {isLoading ? <p className="text-sm opacity-60">در حال بارگذاری…</p> : null}

      <ul className="space-y-2">
        {slides.map((slide) => (
          <li
            key={slide.id}
            className="flex flex-wrap items-center gap-3 rounded-lg border border-[#0f1a1c]/10 bg-white px-4 py-3 dark:border-white/10 dark:bg-[#0f1618]"
          >
            {slide.image ? (
              <div
                className="h-14 w-20 shrink-0 rounded-md bg-cover bg-center"
                style={{ backgroundImage: `url(${slide.image})` }}
                role="img"
                aria-label={slide.title}
              />
            ) : (
              <div className="h-14 w-20 shrink-0 rounded-md bg-teal-800/15" />
            )}
            <Link href={`/admin/news/${slide.id}`} className="min-w-0 flex-1 hover:underline">
              <span className="font-medium">{slide.title}</span>{" "}
              <span className="text-sm font-normal opacity-50">
                {slide.is_published ? "منتشرشده" : "پیش‌نویس"}
              </span>
              <p className="mt-0.5 line-clamp-1 text-sm opacity-55">
                ترتیب {slide.sort_order}
                {slide.body ? ` · ${slide.body}` : ""}
              </p>
            </Link>
            <div className="flex gap-2 text-sm">
              <Link
                href={`/admin/news/${slide.id}`}
                className="rounded border px-3 py-1 dark:border-white/15"
              >
                ویرایش
              </Link>
              <button
                type="button"
                className="rounded border border-red-600/40 px-3 py-1 text-red-700"
                disabled={del.isPending}
                onClick={async () => {
                  if (!window.confirm(`حذف «${slide.title}»؟`)) return;
                  await del.mutateAsync(slide.id);
                  router.refresh();
                }}
              >
                حذف
              </button>
            </div>
          </li>
        ))}
        {!isLoading && !slides.length ? (
          <li className="text-sm opacity-50">اسلایدی نیست.</li>
        ) : null}
      </ul>
    </div>
  );
}

function emptyForm(): NewsSlideWrite {
  return {
    title: "",
    body: "",
    link_url: "",
    link_label: "",
    sort_order: 0,
    is_published: false,
  };
}

function formFromSlide(slide: NewsSlide): NewsSlideWrite {
  return {
    title: slide.title,
    body: slide.body,
    link_url: slide.link_url,
    link_label: slide.link_label,
    sort_order: slide.sort_order,
    is_published: slide.is_published,
  };
}

function newsWritePayload(payload: NewsSlideWrite): NewsSlideWrite {
  return {
    title: payload.title,
    body: payload.body ?? "",
    link_url: payload.link_url ?? "",
    link_label: payload.link_label ?? "",
    sort_order: Number(payload.sort_order) || 0,
    is_published: Boolean(payload.is_published),
  };
}

function saveErrorMessage(err: unknown): string {
  if (err instanceof ApiError && err.body && typeof err.body === "object") {
    const parts = Object.values(err.body as Record<string, unknown>).flatMap(
      (value) => (Array.isArray(value) ? value.map(String) : [String(value)]),
    );
    if (parts.length) return parts.join(" ");
  }
  return err instanceof Error ? err.message : "ذخیره ناموفق بود.";
}

function newsPayloadToFormData(
  payload: NewsSlideWrite,
  imageFile: File | null,
): FormData {
  const fd = new FormData();
  fd.append("title", payload.title);
  fd.append("body", payload.body ?? "");
  fd.append("link_url", payload.link_url ?? "");
  fd.append("link_label", payload.link_label ?? "");
  fd.append("sort_order", String(payload.sort_order ?? 0));
  fd.append("is_published", payload.is_published ? "true" : "false");
  if (imageFile) fd.append("image", imageFile);
  return fd;
}

function NewsFormFields({
  mode,
  initial,
  idParam,
  currentImage = "",
}: {
  mode: "new" | "edit";
  initial: NewsSlideWrite;
  idParam: number;
  currentImage?: string;
}) {
  const router = useRouter();
  const create = useCreateNewsSlide();
  const update = useUpdateNewsSlide();
  const del = useDeleteNewsSlide();
  const [form, setForm] = useState(initial);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function onImageChange(file: File | null) {
    setImageFile(file);
    setImagePreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return file ? URL.createObjectURL(file) : null;
    });
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const payload = newsWritePayload(form);
    const data: NewsSlideWrite | FormData = imageFile
      ? newsPayloadToFormData(payload, imageFile)
      : payload;
    try {
      if (mode === "new") {
        await create.mutateAsync(data);
      } else {
        await update.mutateAsync({ id: idParam, data });
      }
      router.push("/admin/news");
    } catch (err) {
      setError(saveErrorMessage(err));
    }
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-2xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="title text-2xl font-bold">
          {mode === "new" ? "اسلاید جدید" : "ویرایش اسلاید"}
        </h1>
        <Link href="/admin/news" className="text-sm text-teal-700">
          ← لیست اسلایدها
        </Link>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <label className="block text-sm">
        <span className="mb-1 block opacity-60">عنوان</span>
        <input
          required
          className="w-full rounded-md border px-3 py-2 dark:border-white/15 dark:bg-transparent"
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
        />
      </label>

      <label className="block text-sm">
        <span className="mb-1 block opacity-60">متن</span>
        <textarea
          rows={4}
          className="w-full rounded-md border px-3 py-2 dark:border-white/15 dark:bg-transparent"
          value={form.body ?? ""}
          onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
        />
      </label>

      <label className="block text-sm">
        <span className="mb-1 block opacity-60">تصویر اسلاید</span>
        <input
          type="file"
          accept="image/*"
          className="w-full rounded-md border px-3 py-2 text-sm dark:border-white/15 dark:bg-transparent"
          onChange={(e) => onImageChange(e.target.files?.[0] ?? null)}
        />
      </label>
      {imagePreview || currentImage ? (
        <div
          className="mt-1 aspect-[21/9] w-full rounded-lg bg-cover bg-center"
          style={{
            backgroundImage: `url(${imagePreview || currentImage})`,
          }}
          role="img"
          aria-label="پیش‌نمایش تصویر"
        />
      ) : null}

      <label className="block text-sm">
        <span className="mb-1 block opacity-60">لینک (اختیاری)</span>
        <input
          className="w-full rounded-md border px-3 py-2 font-mono text-sm dark:border-white/15 dark:bg-transparent"
          placeholder="/psy/workshops یا https://…"
          value={form.link_url ?? ""}
          onChange={(e) => setForm((f) => ({ ...f, link_url: e.target.value }))}
        />
      </label>

      <label className="block text-sm">
        <span className="mb-1 block opacity-60">متن دکمه</span>
        <input
          className="w-full rounded-md border px-3 py-2 dark:border-white/15 dark:bg-transparent"
          placeholder="بیشتر بخوانید"
          value={form.link_label ?? ""}
          onChange={(e) => setForm((f) => ({ ...f, link_label: e.target.value }))}
        />
      </label>

      <label className="block text-sm">
        <span className="mb-1 block opacity-60">ترتیب نمایش</span>
        <input
          type="number"
          min={0}
          className="w-full rounded-md border px-3 py-2 dark:border-white/15 dark:bg-transparent"
          value={form.sort_order ?? 0}
          onChange={(e) =>
            setForm((f) => ({ ...f, sort_order: Number(e.target.value) }))
          }
        />
      </label>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={Boolean(form.is_published)}
          onChange={(e) =>
            setForm((f) => ({ ...f, is_published: e.target.checked }))
          }
        />
        منتشر شود
      </label>

      <div className="flex flex-wrap gap-3 pt-2">
        <button
          type="submit"
          disabled={create.isPending || update.isPending}
          className="rounded-md bg-teal-800 px-5 py-2 text-sm text-white disabled:opacity-50"
        >
          ذخیره
        </button>
        {mode === "edit" ? (
          <button
            type="button"
            className="rounded-md border border-red-600/40 px-5 py-2 text-sm text-red-700"
            disabled={del.isPending}
            onClick={async () => {
              if (!window.confirm("حذف این اسلاید؟")) return;
              await del.mutateAsync(idParam);
              router.push("/admin/news");
            }}
          >
            حذف
          </button>
        ) : null}
      </div>
    </form>
  );
}

export function NewsEditorClient({ mode }: { mode: "new" | "edit" }) {
  const params = useParams();
  const idParam = Number(params.id || 0);
  const { data, isLoading, isError } = useNewsSlide(mode === "edit" ? idParam : 0);

  if (mode === "new") {
    return <NewsFormFields mode="new" initial={emptyForm()} idParam={0} />;
  }

  if (isLoading) return <p className="text-sm opacity-60">در حال بارگذاری…</p>;
  if (isError || !data) return <p className="text-red-600">اسلاید یافت نشد.</p>;

  return (
    <NewsFormFields
      mode="edit"
      initial={formFromSlide(data)}
      idParam={idParam}
      currentImage={data.image || ""}
    />
  );
}
