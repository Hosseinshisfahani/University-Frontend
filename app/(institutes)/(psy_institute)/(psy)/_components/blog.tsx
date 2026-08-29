"use client";

import { useState } from "react";
import { useBlogPosts, useBlogPost } from "@/app/(institutes)/(psy_institute)/_shared/use-psy";
import Link from "next/link";
import { useParams } from "next/navigation";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import { formatJalaliFriendlyDate } from "@/lib/datetime/jalali";
import type { BlogPost } from "@/app/(institutes)/(psy_institute)/_shared/types";

export function BlogPublicList() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useBlogPosts(page);
  const results = data?.results ?? [];
  const totalPages = data ? Math.max(1, Math.ceil(data.count / 9)) : 1;

  return (
    <div className="psy-root mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-10 max-w-2xl">
        <p className="text-sm font-medium text-[var(--psy-accent)]">مقالات</p>
        <h1 className="title mt-2 text-3xl font-bold tracking-tight text-[var(--psy-ink)] sm:text-4xl">
          دانش و بینش روان‌شناختی
        </h1>
        <p className="mt-3 text-[var(--psy-muted)]">
          نوشته‌های تخصصی درباره سلامت روان، اضطراب، و مسیر درمان
        </p>
      </header>

      {isLoading ? <p className="text-[var(--psy-muted)]">در حال بارگذاری…</p> : null}
      {isError ? <p className="text-red-600">خطا در دریافت مقالات</p> : null}

      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {results.map((post) => (
          <li key={post.id}>
            <BlogCard post={post} />
          </li>
        ))}
      </ul>

      {!isLoading && !results.length ? (
        <p className="text-[var(--psy-muted)]">هنوز مقاله‌ای منتشر نشده است.</p>
      ) : null}

      {data && data.count > 9 ? (
        <div className="mt-10 flex items-center justify-center gap-4 text-sm">
          <button
            type="button"
            disabled={page <= 1}
            className="rounded-lg border border-[var(--psy-line)] px-4 py-2 disabled:opacity-40"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            قبلی
          </button>
          <span className="text-[var(--psy-muted)]">
            صفحه {page} از {totalPages}
          </span>
          <button
            type="button"
            disabled={!data.next}
            className="rounded-lg border border-[var(--psy-line)] px-4 py-2 disabled:opacity-40"
            onClick={() => setPage((p) => p + 1)}
          >
            بعدی
          </button>
        </div>
      ) : null}
    </div>
  );
}


export function BlogPublicDetail() {
  const params = useParams();
  const slug = String(params.slug || "");
  const { data: post, isLoading, isError } = useBlogPost(slug);

  if (isLoading) {
    return <p className="p-8 text-[var(--psy-muted)]">در حال بارگذاری…</p>;
  }
  if (isError || !post) {
    return <p className="p-8 text-red-600">مقاله یافت نشد.</p>;
  }

  return (
    <article className="psy-root mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <Link href="/psy/blog" className="text-sm text-[var(--psy-accent)]">
        ← همه مقالات
      </Link>

      <div
        className="mt-6 aspect-[21/9] rounded-xl bg-cover bg-center"
        style={{
          backgroundImage: post.cover_image
            ? `url(${post.cover_image})`
            : "linear-gradient(135deg, #1a3a3c, #0f1a1c)",
        }}
      />

      <h1 className="title mt-8 text-3xl font-bold text-[var(--psy-ink)] sm:text-4xl">
        {post.title}
      </h1>

      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm text-[var(--psy-muted)]">
        {post.published_at ? (
          <time dateTime={post.published_at}>
            {formatJalaliFriendlyDate(post.published_at)}
          </time>
        ) : null}
        {post.author_name ? (
          post.author_therapist_id ? (
            <Link
              href={`/psy/therapists/${post.author_therapist_id}`}
              className="text-[var(--psy-accent)] hover:underline"
            >
              {post.author_name}
            </Link>
          ) : (
            <span>{post.author_name}</span>
          )
        ) : null}
      </div>

      {post.excerpt ? (
        <p className="mt-6 text-lg leading-8 text-[var(--psy-muted)]">{post.excerpt}</p>
      ) : null}

      <div className="prose prose-neutral mt-10 max-w-none dark:prose-invert">
        <ReactMarkdown rehypePlugins={[rehypeSanitize]}>{post.body}</ReactMarkdown>
      </div>

      {post.author_therapist_id ? (
        <div className="mt-12 rounded-xl border border-[var(--psy-line)] p-5">
          <p className="text-sm text-[var(--psy-muted)]">درباره نویسنده</p>
          <Link
            href={`/psy/therapists/${post.author_therapist_id}`}
            className="mt-2 inline-block font-medium text-[var(--psy-accent)] hover:underline"
          >
            مشاهده پروفایل و رزرو نوبت با {post.author_name}
          </Link>
        </div>
      ) : null}
    </article>
  );
}


export function BlogCard({ post }: { post: BlogPost }) {
  return (
    <Link
      href={`/psy/blog/${post.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-[var(--psy-line)] bg-[var(--psy-surface)] transition hover:border-[var(--psy-accent)]"
    >
      <div
        className="aspect-[16/9] bg-cover bg-center"
        style={{
          backgroundImage: post.cover_image
            ? `url(${post.cover_image})`
            : "linear-gradient(135deg, #1a3a3c, #0f1a1c)",
        }}
      />
      <div className="flex flex-1 flex-col p-5">
        <h2 className="font-bold text-[var(--psy-ink)] group-hover:underline">
          {post.title}
        </h2>
        <p className="mt-2 line-clamp-2 text-sm text-[var(--psy-muted)]">
          {post.excerpt || "—"}
        </p>
        <div className="mt-auto space-y-1 pt-4 text-sm text-[var(--psy-muted)]">
          {post.published_at ? (
            <div>{formatJalaliFriendlyDate(post.published_at)}</div>
          ) : null}
          {post.author_name ? <div>{post.author_name}</div> : null}
        </div>
      </div>
    </Link>
  );
}
