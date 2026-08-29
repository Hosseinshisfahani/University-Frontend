"use client";

import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { formatJalaliFriendlyDate } from "@/lib/datetime/jalali";
import { useBlogPosts, useDeleteBlogPost, useBlogPost, useCreateBlogPost, useUpdateBlogPost } from "@/app/(institutes)/(psy_institute)/_shared/use-psy";
import { useState, FormEvent } from "react";
import type { BlogPost, BlogPostWrite } from "@/app/(institutes)/(psy_institute)/_shared/types";

export function BlogAdminListClient() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useBlogPosts(page);
  const del = useDeleteBlogPost();
  const router = useRouter();
  const results = data?.results ?? [];
  const totalPages = data ? Math.max(1, Math.ceil(data.count / 9)) : 1;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="title text-2xl font-bold">مقالات</h1>
          <p className="mt-1 text-sm opacity-55">ایجاد، انتشار و ویرایش نوشته‌ها</p>
        </div>
        <Link
          href="/admin/blog/new"
          className="rounded-md bg-teal-800 px-4 py-2 text-sm text-white"
        >
          مقاله جدید
        </Link>
      </div>

      {isLoading ? <p className="text-sm opacity-60">در حال بارگذاری…</p> : null}

      <ul className="space-y-2">
        {results.map((post) => (
          <li
            key={post.id}
            className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[#0f1a1c]/10 bg-white px-4 py-3 dark:border-white/10 dark:bg-[#0f1618]"
          >
            <Link href={`/admin/blog/${post.slug}`} className="min-w-0 flex-1 hover:underline">
              <span className="font-medium">{post.title}</span>{" "}
              <span className="text-sm font-normal opacity-50">
                {post.is_published ? "منتشرشده" : "پیش‌نویس"}
              </span>
              <p className="mt-0.5 text-sm opacity-55">
                {post.published_at
                  ? formatJalaliFriendlyDate(post.published_at)
                  : "هنوز منتشر نشده"}
                {post.author_name ? ` · ${post.author_name}` : ""}
              </p>
            </Link>
            <div className="flex gap-2 text-sm">
              <Link
                href={`/admin/blog/${post.slug}`}
                className="rounded border px-3 py-1 dark:border-white/15"
              >
                ویرایش
              </Link>
              <button
                type="button"
                className="rounded border border-red-600/40 px-3 py-1 text-red-700"
                disabled={del.isPending}
                onClick={async () => {
                  if (!window.confirm(`حذف «${post.title}»؟`)) return;
                  await del.mutateAsync(post.slug);
                  router.refresh();
                }}
              >
                حذف
              </button>
            </div>
          </li>
        ))}
        {!isLoading && !results.length ? (
          <li className="text-sm opacity-50">مقاله‌ای نیست.</li>
        ) : null}
      </ul>

      {data && data.count > 9 ? (
        <div className="flex items-center justify-center gap-4 text-sm">
          <button
            type="button"
            disabled={page <= 1}
            className="rounded border px-3 py-1 disabled:opacity-40 dark:border-white/15"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            قبلی
          </button>
          <span className="opacity-55">
            {page} / {totalPages}
          </span>
          <button
            type="button"
            disabled={!data.next}
            className="rounded border px-3 py-1 disabled:opacity-40 dark:border-white/15"
            onClick={() => setPage((p) => p + 1)}
          >
            بعدی
          </button>
        </div>
      ) : null}
    </div>
  );
}


function slugify(input: string) {
  return (
    input
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/gi, "")
      .slice(0, 80) || `post-${Date.now()}`
  );
}

function emptyForm(): BlogPostWrite {
  return {
    title: "",
    slug: "",
    excerpt: "",
    body: "",
    is_published: false,
    published_at: null,
  };
}

function formFromPost(post: BlogPost): BlogPostWrite {
  return {
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    body: post.body,
    cover_image: post.cover_image || "",
    is_published: post.is_published,
    published_at: post.published_at,
  };
}

function blogPayloadToFormData(
  payload: BlogPostWrite,
  coverFile: File | null,
): FormData {
  const fd = new FormData();
  fd.append("title", payload.title);
  fd.append("slug", payload.slug);
  fd.append("excerpt", payload.excerpt ?? "");
  fd.append("body", payload.body);
  fd.append("is_published", payload.is_published ? "true" : "false");
  if (payload.published_at) fd.append("published_at", payload.published_at);
  if (coverFile) fd.append("cover_image", coverFile);
  return fd;
}

function BlogFormFields({
  mode,
  initial,
  slugParam,
  authorName,
}: {
  mode: "new" | "edit";
  initial: BlogPostWrite;
  slugParam: string;
  authorName?: string | null;
}) {
  const router = useRouter();
  const create = useCreateBlogPost();
  const update = useUpdateBlogPost();
  const del = useDeleteBlogPost();
  const [form, setForm] = useState(initial);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const existingCover =
    mode === "edit" && typeof initial.cover_image === "string"
      ? initial.cover_image
      : "";

  function onCoverChange(file: File | null) {
    setCoverFile(file);
    setCoverPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return file ? URL.createObjectURL(file) : null;
    });
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const payload: BlogPostWrite = {
      ...form,
      slug: form.slug || slugify(form.title),
      published_at:
        form.is_published && !form.published_at
          ? new Date().toISOString()
          : form.published_at,
    };
    const { cover_image: _cover, ...jsonPayload } = payload;
    void _cover;
    const data: BlogPostWrite | FormData = coverFile
      ? blogPayloadToFormData(payload, coverFile)
      : jsonPayload;
    try {
      if (mode === "new") {
        const created = await create.mutateAsync(data);
        router.push(`/admin/blog/${created.slug}`);
      } else {
        await update.mutateAsync({ slug: slugParam, data });
        if (payload.slug && payload.slug !== slugParam) {
          router.push(`/admin/blog/${payload.slug}`);
        } else {
          router.refresh();
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "ذخیره ناموفق بود.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-2xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="title text-2xl font-bold">
          {mode === "new" ? "مقاله جدید" : "ویرایش مقاله"}
        </h1>
        <Link href="/admin/blog" className="text-sm text-teal-700">
          ← لیست مقالات
        </Link>
      </div>

      {authorName ? (
        <p className="text-sm opacity-55">نویسنده: {authorName}</p>
      ) : null}

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <label className="block text-sm">
        <span className="mb-1 block opacity-60">عنوان</span>
        <input
          required
          className="w-full rounded-md border px-3 py-2 dark:border-white/15 dark:bg-transparent"
          value={form.title}
          onChange={(e) => {
            const title = e.target.value;
            setForm((f) => ({
              ...f,
              title,
              slug: mode === "new" && !f.slug ? slugify(title) : f.slug,
            }));
          }}
        />
      </label>

      <label className="block text-sm">
        <span className="mb-1 block opacity-60">اسلاگ</span>
        <input
          required
          className="w-full rounded-md border px-3 py-2 font-mono text-sm dark:border-white/15 dark:bg-transparent"
          value={form.slug}
          onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
        />
      </label>

      <label className="block text-sm">
        <span className="mb-1 block opacity-60">خلاصه</span>
        <textarea
          rows={2}
          className="w-full rounded-md border px-3 py-2 dark:border-white/15 dark:bg-transparent"
          value={form.excerpt ?? ""}
          onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
        />
      </label>

      <label className="block text-sm">
        <span className="mb-1 block opacity-60">متن (Markdown)</span>
        <textarea
          required
          rows={14}
          className="w-full rounded-md border px-3 py-2 font-mono text-xs dark:border-white/15 dark:bg-transparent"
          value={form.body}
          onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
        />
      </label>

      <label className="block text-sm">
        <span className="mb-1 block opacity-60">تصویر کاور</span>
        <input
          type="file"
          accept="image/*"
          className="w-full rounded-md border px-3 py-2 text-sm dark:border-white/15 dark:bg-transparent"
          onChange={(e) => onCoverChange(e.target.files?.[0] ?? null)}
        />
      </label>
      {(coverPreview || existingCover) ? (
        <div
          className="mt-1 aspect-[21/9] w-full rounded-lg bg-cover bg-center"
          style={{
            backgroundImage: `url(${coverPreview || existingCover})`,
          }}
          role="img"
          aria-label="پیش‌نمایش کاور"
        />
      ) : null}

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
          <>
            <Link
              href={`/psy/blog/${slugParam}`}
              className="rounded-md border px-5 py-2 text-sm dark:border-white/15"
              target="_blank"
            >
              مشاهده عمومی
            </Link>
            <button
              type="button"
              className="rounded-md border border-red-600/40 px-5 py-2 text-sm text-red-700"
              disabled={del.isPending}
              onClick={async () => {
                if (!window.confirm("حذف این مقاله؟")) return;
                await del.mutateAsync(slugParam);
                router.push("/admin/blog");
              }}
            >
              حذف
            </button>
          </>
        ) : null}
      </div>
    </form>
  );
}

export function BlogEditorClient({ mode }: { mode: "new" | "edit" }) {
  const params = useParams();
  const slugParam = String(params.slug || "");
  const { data, isLoading, isError } = useBlogPost(
    mode === "edit" ? slugParam : "",
  );

  if (mode === "new") {
    return <BlogFormFields mode="new" initial={emptyForm()} slugParam="" />;
  }

  if (isLoading) return <p className="text-sm opacity-60">در حال بارگذاری…</p>;
  if (isError || !data) return <p className="text-red-600">مقاله یافت نشد.</p>;

  return (
    <BlogFormFields
      mode="edit"
      initial={formFromPost(data)}
      slugParam={slugParam}
      authorName={data.author_name}
    />
  );
}
