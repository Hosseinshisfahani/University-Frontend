"use client";

import Link from "next/link";
import { formatIrr } from "@/features/finance/types";
import { formatJalaliFriendlyDate, formatJalaliTime, formatJalaliTimeRange } from "@/lib/datetime/jalali";
import { useWorkshops, psyKeys, useCompleteWorkshopSession, useConfirmWorkshopEnrollment, useEnrollWorkshop, useIssueWorkshopCertificate, useWorkshop } from "@/app/(institutes)/(psy_institute)/_shared/use-psy";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import { useQueryClient } from "@tanstack/react-query";
import { ApiError } from "@/lib/api/client";
import { useWallet } from "@/features/finance/hooks";
import { useAuthStore } from "@/features/auth/store";
import { isPsyPatient } from "@/features/auth/types";
import type { Workshop, WorkshopResourcePublic, WorkshopSessionPublic } from "@/app/(institutes)/(psy_institute)/_shared/types";

export function WorkshopPublicList() {
  const { data, isLoading, isError } = useWorkshops(true);

  return (
    <div className="psy-root mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-10 max-w-2xl">
        <p className="text-sm font-medium text-[var(--psy-accent)]">کارگاه‌ها</p>
        <h1 className="title mt-2 text-3xl font-bold tracking-tight text-[var(--psy-ink)] sm:text-4xl">
          کارگاه‌های پیش‌رو
        </h1>
        <p className="mt-3 text-[var(--psy-muted)]">
          ثبت‌نام آنلاین با کیف پول — ظرفیت محدود
        </p>
      </header>

      {isLoading ? <p className="text-[var(--psy-muted)]">در حال بارگذاری…</p> : null}
      {isError ? <p className="text-red-600">خطا در دریافت کارگاه‌ها</p> : null}

      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {(data ?? []).map((w) => (
          <li key={w.id}>
            <Link
              href={`/psy/workshops/${w.slug}`}
              className="group relative block overflow-hidden rounded-2xl border border-[var(--psy-line)] bg-[var(--psy-surface)] shadow-[0_1px_0_rgba(15,26,28,0.04)] transition duration-300 hover:-translate-y-0.5 hover:border-[var(--psy-accent)]/50 hover:shadow-[0_12px_32px_-16px_rgba(15,26,28,0.35)]"
            >
              <div
                className="aspect-[4/3] bg-cover bg-center transition duration-500 group-hover:scale-[1.03]"
                style={{
                  backgroundImage: w.banner_image
                    ? `url(${w.banner_image})`
                    : "linear-gradient(135deg, #1a3a3c, #0f1a1c)",
                }}
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[rgba(8,14,16,0.92)] via-[rgba(8,14,16,0.55)] to-transparent px-5 pb-5 pt-16">
                <h2 className="title text-lg font-bold leading-snug text-white sm:text-xl">
                  {w.title}
                </h2>
                <span className="mt-2 inline-flex items-center gap-1 text-sm text-white/70 transition group-hover:text-[var(--psy-accent)]">
                  مشاهده کارگاه
                  <span aria-hidden className="transition group-hover:-translate-x-0.5">
                    ←
                  </span>
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
      {!isLoading && !(data?.length) ? (
        <p className="text-[var(--psy-muted)]">کارگاه پیش‌رویی ثبت نشده است.</p>
      ) : null}
    </div>
  );
}


function errorPayload(err: unknown): { code?: string; detail?: string } {
  if (err instanceof ApiError && err.body && typeof err.body === "object") {
    return err.body as { code?: string; detail?: string };
  }
  return { detail: err instanceof Error ? err.message : "خطا" };
}

function LockedBadge() {
  return (
    <span className="inline-flex items-center rounded-full bg-[var(--psy-mist)] px-2.5 py-1 text-xs text-[var(--psy-muted)]">
      قفل — پس از ثبت‌نام
    </span>
  );
}

function ResourceLinks({ items }: { items: WorkshopResourcePublic[] }) {
  if (!items.length) return null;
  return (
    <ul className="mt-3 space-y-2">
      {items.map((r) => (
        <li
          key={r.id}
          className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-[var(--psy-mist)]/70 px-3 py-2.5 text-sm"
        >
          <span className="text-[var(--psy-ink)]">
            {r.title}
            <span className="ms-2 text-xs text-[var(--psy-muted)]">{r.kind}</span>
          </span>
          {r.is_locked || !r.file_url ? (
            <LockedBadge />
          ) : (
            <a
              href={r.file_url}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-[var(--psy-sage)] underline-offset-2 hover:underline"
            >
              دانلود
            </a>
          )}
        </li>
      ))}
    </ul>
  );
}

function SessionRow({
  session,
  slug,
  canComplete,
  index,
}: {
  session: WorkshopSessionPublic;
  slug: string;
  canComplete: boolean;
  index: number;
}) {
  const complete = useCompleteWorkshopSession();
  return (
    <li className="relative overflow-hidden rounded-2xl border border-[var(--psy-line)] bg-[var(--psy-surface)] p-5 shadow-[0_1px_0_rgba(28,43,42,0.04)]">
      <div className="flex gap-4">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
            session.completed
              ? "bg-[var(--psy-sage)] text-white"
              : "bg-[var(--psy-mist)] text-[var(--psy-sage)]"
          }`}
        >
          {session.completed ? "✓" : index + 1}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h3 className="text-base font-semibold text-[var(--psy-ink)]">
                {session.title}
              </h3>
              <p className="mt-1 text-sm text-[var(--psy-muted)]">
                {formatJalaliTimeRange(session.starts_at, session.ends_at)}
              </p>
            </div>
            {session.completed ? (
              <span className="rounded-full bg-[var(--psy-sage)]/15 px-2.5 py-1 text-xs font-medium text-[var(--psy-sage)]">
                تکمیل‌شده
              </span>
            ) : null}
          </div>
          {session.summary ? (
            <p className="mt-3 text-sm leading-7 text-[var(--psy-muted)]">
              {session.summary}
            </p>
          ) : null}
          <div className="mt-4 flex flex-wrap gap-2 text-sm">
            {session.has_meeting ? (
              session.meeting_url ? (
                <a
                  href={session.meeting_url}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-xl bg-[var(--psy-sage)] px-4 py-2 font-medium text-white transition hover:opacity-90"
                >
                  ورود به جلسه زنده
                </a>
              ) : (
                <LockedBadge />
              )
            ) : null}
            {session.has_recording ? (
              session.recording_url ? (
                <a
                  href={session.recording_url}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-xl border border-[var(--psy-sage)]/40 bg-[var(--psy-mist)] px-4 py-2 font-medium text-[var(--psy-ink)] transition hover:border-[var(--psy-sage)]"
                >
                  مشاهده ضبط
                </a>
              ) : (
                <LockedBadge />
              )
            ) : null}
            {canComplete && !session.completed ? (
              <button
                type="button"
                disabled={complete.isPending}
                className="rounded-xl border border-[var(--psy-line)] px-4 py-2 text-[var(--psy-muted)] transition hover:border-[var(--psy-sage)] hover:text-[var(--psy-sage)] disabled:opacity-50"
                onClick={() => complete.mutate({ slug, sessionId: session.id })}
              >
                علامت‌گذاری تکمیل
              </button>
            ) : null}
          </div>
          <ResourceLinks items={session.resources} />
        </div>
      </div>
    </li>
  );
}

function RegisterPanel({ w }: { w: Workshop }) {
  const router = useRouter();
  const qc = useQueryClient();
  const { data: wallet } = useWallet();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const enroll = useEnrollWorkshop();
  const confirm = useConfirmWorkshopEnrollment();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<number | null>(null);
  const price = Number(w.price);
  const balance = Number(wallet?.balance ?? 0);
  const nextPath = `/psy/workshops/${w.slug}`;

  async function refreshAccess() {
    await qc.invalidateQueries({ queryKey: psyKeys.workshop(w.slug) });
    await qc.invalidateQueries({ queryKey: psyKeys.myWorkshopEnrollments });
  }

  if (w.viewer_has_access) {
    return (
      <div className="rounded-2xl border border-[var(--psy-sage)]/35 bg-[var(--psy-sage)]/10 p-5">
        <p className="text-sm font-medium text-[var(--psy-sage)]">ثبت‌نام فعال</p>
        <p className="mt-2 text-sm leading-7 text-[var(--psy-ink)]">
          شما در این کارگاه هستید. از برنامه جلسات برای ادامه مسیر یادگیری استفاده کنید.
        </p>
      </div>
    );
  }

  async function onRegister() {
    setError(null);
    setMessage(null);
    if (!isAuthenticated) {
      router.push(`/login?next=${encodeURIComponent(nextPath)}`);
      return;
    }
    if (!isPsyPatient(user)) {
      setError("برای ثبت‌نام باید حساب کاربری داشته باشید.");
      return;
    }
    try {
      const enrollment = await enroll.mutateAsync(w.slug);
      if (enrollment.status === "active") {
        setMessage("ثبت‌نام با موفقیت انجام شد.");
        await refreshAccess();
        return;
      }
      setPendingId(enrollment.id);
      if (price > 0 && balance < price) {
        setError("موجودی کیف پول کافی نیست. ابتدا شارژ کنید.");
        return;
      }
      await confirm.mutateAsync({
        slug: w.slug,
        enrollmentId: enrollment.id,
        paymentRef: "wallet",
        idempotencyKey: `ws-confirm:${enrollment.id}`,
      });
      setMessage("پرداخت و ثبت‌نام انجام شد.");
      await refreshAccess();
    } catch (err) {
      const body = errorPayload(err);
      if (body.code === "insufficient_funds") setError("موجودی کافی نیست.");
      else if (body.code === "already_enrolled")
        setError("قبلاً در این کارگاه ثبت‌نام کرده‌اید.");
      else if (body.code === "workshop_full") setError("ظرفیت کارگاه تکمیل است.");
      else setError(body.detail || "ثبت‌نام ناموفق بود.");
    }
  }

  return (
    <div className="space-y-4 rounded-2xl border border-[var(--psy-line)] bg-[var(--psy-surface)] p-5 shadow-[0_1px_0_rgba(28,43,42,0.04)]">
      <div>
        <p className="text-xs font-medium tracking-wide text-[var(--psy-sage)]">
          ثبت‌نام
        </p>
        <p className="title mt-1 text-2xl font-bold text-[var(--psy-ink)]">
          {price === 0 ? "رایگان" : formatIrr(w.price)}
        </p>
      </div>
      {isAuthenticated && isPsyPatient(user) ? (
        <p className="rounded-xl bg-[var(--psy-mist)] px-3 py-2 text-sm text-[var(--psy-muted)]">
          موجودی کیف پول:{" "}
          <span className="font-medium text-[var(--psy-ink)]">
            {formatIrr(balance)}
          </span>
        </p>
      ) : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {message ? (
        <p className="text-sm text-[var(--psy-sage)]">{message}</p>
      ) : null}
      {w.is_full ? (
        <p className="text-sm text-[var(--psy-muted)]">ظرفیت تکمیل است.</p>
      ) : (
        <div className="flex flex-col gap-2">
          <button
            type="button"
            disabled={enroll.isPending || confirm.isPending}
            onClick={() => void onRegister()}
            className="w-full rounded-xl bg-[var(--psy-sage)] px-5 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
          >
            ثبت‌نام در کارگاه
          </button>
          {error?.includes("موجودی") || pendingId ? (
            <Link
              href={`/patient/wallet?next=${encodeURIComponent(nextPath)}`}
              className="rounded-xl border border-[var(--psy-line)] px-5 py-2.5 text-center text-sm text-[var(--psy-ink)] transition hover:border-[var(--psy-sage)]"
            >
              شارژ کیف پول
            </Link>
          ) : null}
        </div>
      )}
    </div>
  );
}

function CertificatePanel({ w }: { w: Workshop }) {
  const issue = useIssueWorkshopCertificate();
  const [error, setError] = useState<string | null>(null);
  if (!w.certificate_enabled || !w.viewer_has_access) return null;

  const progress = w.progress_percent ?? 0;

  return (
    <div className="space-y-3 rounded-2xl border border-[var(--psy-line)] bg-[var(--psy-mist)]/50 p-5">
      <h2 className="font-bold text-[var(--psy-ink)]">گواهی پایان دوره</h2>
      <p className="text-sm text-[var(--psy-muted)]">
        پس از تکمیل همه جلسات می‌توانید گواهی دریافت کنید.
      </p>
      <div className="h-2 overflow-hidden rounded-full bg-[var(--psy-surface)]">
        <div
          className="h-full rounded-full bg-[var(--psy-sage)] transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-xs text-[var(--psy-muted)]">{progress}٪ تکمیل شده</p>
      {w.certificate ? (
        <Link
          href={`/patient/workshops/${w.slug}/certificate`}
          className="inline-block rounded-xl bg-[var(--psy-sage)] px-4 py-2.5 text-sm font-medium text-white"
        >
          مشاهده / چاپ گواهی
        </Link>
      ) : (
        <button
          type="button"
          disabled={issue.isPending || progress < 100}
          className="rounded-xl bg-[var(--psy-sage)] px-4 py-2.5 text-sm font-medium text-white disabled:opacity-40"
          onClick={async () => {
            setError(null);
            try {
              await issue.mutateAsync(w.slug);
            } catch (err) {
              setError(errorPayload(err).detail || "صدور گواهی ممکن نیست.");
            }
          }}
        >
          صدور گواهی
        </button>
      )}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}

function MetaChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[var(--psy-line)] bg-[var(--psy-surface)]/80 px-4 py-3 backdrop-blur-sm">
      <p className="text-[11px] font-medium text-[var(--psy-sage)]">{label}</p>
      <p className="mt-1 text-sm font-medium text-[var(--psy-ink)]">{value}</p>
    </div>
  );
}

export function WorkshopPublicDetail() {
  const params = useParams();
  const slug = String(params.slug || "");
  const { data: w, isLoading, isError } = useWorkshop(slug);

  if (isLoading) {
    return (
      <p className="psy-root px-4 py-16 text-center text-[var(--psy-muted)]">
        در حال بارگذاری…
      </p>
    );
  }
  if (isError || !w) {
    return (
      <p className="psy-root px-4 py-16 text-center text-red-600">کارگاه یافت نشد.</p>
    );
  }

  const intro = w.body_md?.trim() || w.description;
  const sessions = w.sessions ?? [];
  const workshopResources = w.resources ?? [];
  const seatsLabel = w.is_full
    ? "ظرفیت تکمیل"
    : `${w.seats_remaining} جای خالی از ${w.capacity}`;

  return (
    <div className="psy-root">
      <section className="relative isolate overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: w.banner_image
              ? `url(${w.banner_image})`
              : "linear-gradient(135deg, #2a4a46, #1c2b2a)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(12,20,19,0.94)] via-[rgba(12,20,19,0.55)] to-[rgba(12,20,19,0.25)]" />
        <div className="relative mx-auto max-w-6xl px-4 pb-10 pt-8 sm:px-6 lg:px-8">
          <Link
            href="/psy/workshops"
            className="inline-flex items-center gap-1 text-sm text-white/75 transition hover:text-white"
          >
            <span aria-hidden>→</span>
            همه کارگاه‌ها
          </Link>
          <h1 className="title mt-8 max-w-3xl text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
            {w.title}
          </h1>
          {w.body_md?.trim() && w.description ? (
            <p className="mt-4 max-w-2xl text-base leading-8 text-white/75">
              {w.description}
            </p>
          ) : null}
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <MetaChip
              label="مدرس"
              value={w.instructor_name ?? "اعلام می‌شود"}
            />
            <MetaChip
              label="شروع"
              value={`${formatJalaliFriendlyDate(w.starts_at)} · ${formatJalaliTime(w.starts_at)}`}
            />
            <MetaChip
              label="هزینه"
              value={Number(w.price) === 0 ? "رایگان" : formatIrr(w.price)}
            />
            <MetaChip label="ظرفیت" value={seatsLabel} />
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-10 lg:px-8 lg:py-12">
        <div className="min-w-0 space-y-10">
          {intro ? (
            <section>
              <p className="text-sm font-medium text-[var(--psy-sage)]">درباره کارگاه</p>
              <article className="prose prose-neutral mt-3 max-w-none text-[var(--psy-ink)] dark:prose-invert prose-headings:text-[var(--psy-ink)] prose-a:text-[var(--psy-sage)]">
                <ReactMarkdown rehypePlugins={[rehypeSanitize]}>
                  {intro}
                </ReactMarkdown>
              </article>
            </section>
          ) : null}

          {w.viewer_has_access && typeof w.progress_percent === "number" ? (
            <section className="rounded-2xl border border-[var(--psy-line)] bg-[var(--psy-mist)]/40 p-5">
              <div className="mb-3 flex items-center justify-between text-sm">
                <span className="font-medium text-[var(--psy-ink)]">
                  پیشرفت یادگیری
                </span>
                <span className="text-[var(--psy-sage)]">{w.progress_percent}٪</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-[var(--psy-surface)]">
                <div
                  className="h-full rounded-full bg-[var(--psy-sage)] transition-all"
                  style={{ width: `${w.progress_percent}%` }}
                />
              </div>
            </section>
          ) : null}

          <section className="space-y-4">
            <div>
              <p className="text-sm font-medium text-[var(--psy-sage)]">برنامه</p>
              <h2 className="title mt-1 text-2xl font-bold text-[var(--psy-ink)]">
                جلسات و منابع
              </h2>
            </div>
            <ul className="space-y-4">
              {sessions.map((s, i) => (
                <SessionRow
                  key={s.id}
                  session={s}
                  slug={w.slug}
                  canComplete={Boolean(w.viewer_has_access)}
                  index={i}
                />
              ))}
            </ul>
            {!sessions.length ? (
              <p className="rounded-2xl border border-dashed border-[var(--psy-line)] px-4 py-8 text-center text-sm text-[var(--psy-muted)]">
                هنوز جلسه‌ای برای این کارگاه تعریف نشده است.
              </p>
            ) : null}
            {workshopResources.length ? (
              <div className="rounded-2xl border border-[var(--psy-line)] p-5">
                <h3 className="font-semibold text-[var(--psy-ink)]">منابع کارگاه</h3>
                <ResourceLinks items={workshopResources} />
              </div>
            ) : null}
            <CertificatePanel w={w} />
          </section>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <RegisterPanel w={w} />
        </aside>
      </div>
    </div>
  );
}
