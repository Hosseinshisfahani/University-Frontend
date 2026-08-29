"use client";

import Link from "next/link";
import { type FormEvent, useMemo, useState } from "react";
import { formatJalaliFriendlyDate, formatJalaliTime } from "@/lib/datetime/jalali";
import {
  usePsychometricForms,
  usePsychometricResponse,
  useRoutedPsychometricResponses,
  useUpdatePsychometricResponse,
} from "@/app/(institutes)/(psy_institute)/_shared/use-psy";
import { psychometricResponseStatusLabel } from "@/app/(institutes)/(psy_institute)/_shared/helpers";

export function ResponsesInbox() {
  const { data, isLoading } = useRoutedPsychometricResponses();
  const { data: forms } = usePsychometricForms();
  const titleById = useMemo(() => {
    const map = new Map<number, string>();
    (Array.isArray(forms) ? forms : []).forEach((f) => map.set(f.id, f.title));
    return map;
  }, [forms]);

  if (isLoading) return <p className="text-[#1a2423]/50">در حال بارگذاری…</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="title text-3xl font-extrabold">پاسخ آزمون‌ها</h1>
        <p className="mt-2 text-sm text-[#1a2423]/55 dark:text-white/50">
          پاسخ‌هایی که مراجعان به شما ارجاع داده‌اند.
        </p>
      </div>
      <ul className="space-y-2">
        {(data ?? []).map((r) => (
          <li key={r.id}>
            <Link
              href={`/therapist/responses/${r.id}`}
              className="block rounded-lg border border-[#1a2423]/10 bg-white px-4 py-3 transition hover:border-[#1a2423]/25 dark:border-white/10 dark:bg-[#121818]"
            >
              <div className="font-medium">
                {r.patient_name || "مراجع"}
              </div>
              <div className="mt-0.5 text-sm text-[#1a2423]/55 dark:text-white/50">
                {titleById.get(r.form) ?? `فرم #${r.form}`}
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="text-xs text-[#1a2423]/55 dark:text-white/50">
                  ارسال آزمون {formatJalaliFriendlyDate(r.submitted_at)}
                  <span className="mx-1.5 opacity-40">·</span>
                  ساعت {formatJalaliTime(r.submitted_at)}
                </span>
                <span className="rounded-md bg-[#1a2423]/6 px-2 py-1 text-xs font-medium text-[#1a2423]/70 dark:bg-white/8 dark:text-white/70">
                  نسخه {r.form_version}
                </span>
                <span className="rounded-md bg-[#1a2423]/6 px-2 py-1 text-xs font-medium text-[#1a2423]/70 dark:bg-white/8 dark:text-white/70">
                  {psychometricResponseStatusLabel(r.status)}
                </span>
              </div>
            </Link>
          </li>
        ))}
        {!data?.length ? (
          <li className="text-sm text-[#1a2423]/50">پاسخی ارجاع نشده است.</li>
        ) : null}
      </ul>
    </div>
  );
}

export function ResponseReviewClient({ id }: { id: number }) {
  const { data, isLoading } = usePsychometricResponse(id);
  const { data: forms } = usePsychometricForms();
  const update = useUpdatePsychometricResponse();
  const [notes, setNotes] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formTitle = useMemo(() => {
    if (!data || !forms) return null;
    return (Array.isArray(forms) ? forms : []).find((f) => f.id === data.form)
      ?.title;
  }, [data, forms]);

  const formSchema = useMemo(() => {
    if (!data || !forms) return null;
    return (Array.isArray(forms) ? forms : []).find((f) => f.id === data.form)
      ?.schema;
  }, [data, forms]);

  async function onSave(e: FormEvent) {
    e.preventDefault();
    if (!data) return;
    setError(null);
    setSaved(false);
    try {
      await update.mutateAsync({
        id: data.id,
        reviewer_notes: notes ?? data.reviewer_notes ?? "",
      });
      setSaved(true);
    } catch {
      setError("ذخیره یادداشت بررسی ناموفق بود.");
    }
  }

  if (isLoading) return <p>در حال بارگذاری…</p>;
  if (!data) return <p>پاسخ پیدا نشد.</p>;

  const reviewerNotes = notes ?? data.reviewer_notes ?? "";

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/therapist/responses"
          className="text-sm text-[#1a2423]/55 underline dark:text-white/50"
        >
          بازگشت به فهرست
        </Link>
        <h1 className="title mt-3 text-3xl font-extrabold">
          {formTitle ?? `فرم #${data.form}`}
        </h1>
        {data.patient_name ? (
          <p className="mt-1 text-sm font-medium text-[#1a2423]/70 dark:text-white/70">
            مراجع: {data.patient_name}
          </p>
        ) : null}
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className="text-sm text-[#1a2423]/55 dark:text-white/50">
            ارسال آزمون {formatJalaliFriendlyDate(data.submitted_at)}
            <span className="mx-1.5 opacity-40">·</span>
            ساعت {formatJalaliTime(data.submitted_at)}
          </span>
          <span className="rounded-md bg-[#1a2423]/6 px-2 py-1 text-xs font-medium text-[#1a2423]/70 dark:bg-white/8 dark:text-white/70">
            {psychometricResponseStatusLabel(data.status)}
          </span>
        </div>
      </div>

      <section className="space-y-3 rounded-lg border border-[#1a2423]/10 bg-white p-5 dark:border-white/10 dark:bg-[#121818]">
        <h2 className="font-bold">پاسخ‌ها</h2>
        {(formSchema?.fields ?? []).map((field) => {
          const value = data.answers[field.id];
          const display = Array.isArray(value)
            ? value.join("، ")
            : value === undefined || value === null
              ? "—"
              : String(value);
          return (
            <div key={field.id} className="border-t border-[#1a2423]/8 py-3 text-sm first:border-0 dark:border-white/10">
              <div className="font-medium text-[#1a2423]/80 dark:text-white/80">
                {field.label}
              </div>
              <div className="mt-1 text-[#1a2423]/65 dark:text-white/55">{display}</div>
            </div>
          );
        })}
        {!formSchema?.fields?.length ? (
          <pre className="overflow-auto rounded-md bg-[#1a2423]/5 p-3 text-xs dark:bg-white/5">
            {JSON.stringify(data.answers, null, 2)}
          </pre>
        ) : null}
      </section>

      <form
        onSubmit={onSave}
        className="space-y-3 rounded-lg border border-[#1a2423]/10 bg-white p-5 dark:border-white/10 dark:bg-[#121818]"
      >
        <h2 className="font-bold">یادداشت بررسی</h2>
        <textarea
          value={reviewerNotes}
          onChange={(e) => setNotes(e.target.value)}
          className="min-h-28 w-full rounded-md border border-[#1a2423]/15 bg-transparent px-3 py-2 text-sm dark:border-white/15"
        />
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {saved ? (
          <p className="text-sm text-emerald-700 dark:text-emerald-400">ذخیره شد.</p>
        ) : null}
        <button
          type="submit"
          disabled={update.isPending}
          className="rounded-md bg-[#1a2423] px-4 py-2 text-sm font-medium text-white disabled:opacity-60 dark:bg-primary dark:text-[#332B1A]"
        >
          ذخیره یادداشت
        </button>
      </form>
    </div>
  );
}
