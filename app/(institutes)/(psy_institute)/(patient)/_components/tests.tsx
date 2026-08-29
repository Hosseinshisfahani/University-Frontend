"use client";

import Link from "next/link";
import { type FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { formatJalaliFriendlyDate, formatJalaliTime } from "@/lib/datetime/jalali";
import {
  useMyPsychometricResponses,
  usePsychometricForm,
  usePsychometricForms,
  useSubmitPsychometric,
  useTherapists,
} from "@/app/(institutes)/(psy_institute)/_shared/use-psy";
import type { PsychometricField, PsychometricSchema } from "@/app/(institutes)/(psy_institute)/_shared/types";
import { psychometricResponseStatusLabel } from "@/app/(institutes)/(psy_institute)/_shared/helpers";

export function TestsListClient() {
  const { data, isLoading } = usePsychometricForms();

  if (isLoading) return <p className="text-foreground/50">در حال بارگذاری…</p>;

  const forms = Array.isArray(data) ? data : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="title gradient-text text-3xl font-extrabold">آزمون‌ها</h1>
          <p className="mt-2 text-sm text-foreground/60">پرسشنامه‌های منتشرشده</p>
        </div>
        <Link href="/patient/tests/history" className="text-sm text-primary underline">
          سوابق ارسال
        </Link>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {forms.map((form) => (
          <Link
            key={form.id}
            href={`/patient/tests/${form.slug}`}
            className="rounded-xl border border-primary/20 p-4 transition hover:border-primary/40"
          >
            <h2 className="font-bold">{form.title}</h2>
            <p className="mt-2 line-clamp-2 text-sm text-foreground/60">
              {form.description || "بدون توضیح"}
            </p>
          </Link>
        ))}
        {!forms.length ? (
          <p className="text-sm text-foreground/50">آزمونی منتشر نشده است.</p>
        ) : null}
      </div>
    </div>
  );
}

export function TestsHistoryClient() {
  const { data, isLoading } = useMyPsychometricResponses();
  const { data: forms } = usePsychometricForms();
  const titleById = useMemo(() => {
    const map = new Map<number, string>();
    (Array.isArray(forms) ? forms : []).forEach((f) => map.set(f.id, f.title));
    return map;
  }, [forms]);

  if (isLoading) return <p className="text-foreground/50">در حال بارگذاری…</p>;

  return (
    <div className="space-y-6">
      <h1 className="title gradient-text text-3xl font-extrabold">سوابق آزمون</h1>
      <div className="space-y-3">
        {(data ?? []).map((r) => (
          <div
            key={r.id}
            className="rounded-xl border border-foreground/10 p-4 text-sm"
          >
            <div className="font-bold">
              {titleById.get(r.form) ?? `فرم #${r.form}`} (نسخه {r.form_version})
            </div>
            <div className="mt-2 text-sm text-foreground/60">
              <span className="text-[11px] font-medium tracking-wide text-foreground/45">
                ارسال آزمون
              </span>
              <span className="mx-2 text-foreground/25">·</span>
              {formatJalaliFriendlyDate(r.submitted_at)}
              <span className="mx-2 text-foreground/25">·</span>
              ساعت {formatJalaliTime(r.submitted_at)}
              <span className="mx-2 text-foreground/25">·</span>
              {psychometricResponseStatusLabel(r.status)}
            </div>
          </div>
        ))}
        {!data?.length ? (
          <p className="text-foreground/50">هنوز آزمونی ارسال نکرده‌اید.</p>
        ) : null}
      </div>
    </div>
  );
}

function FieldInput({
  field,
  value,
  onChange,
}: {
  field: PsychometricField;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  if (field.type === "text") {
    return (
      <textarea
        className="min-h-24 w-full rounded-lg border border-foreground/15 bg-background px-3 py-2"
        value={typeof value === "string" ? value : ""}
        onChange={(e) => onChange(e.target.value)}
        required={field.required}
      />
    );
  }

  if (field.type === "likert" || field.type === "single") {
    return (
      <div className="flex flex-wrap gap-2">
        {(field.options ?? []).map((opt) => (
          <label
            key={opt}
            className={`cursor-pointer rounded-lg border px-3 py-2 text-sm ${
              value === opt ? "border-primary bg-primary/15" : "border-foreground/15"
            }`}
          >
            <input
              type="radio"
              className="sr-only"
              name={field.id}
              checked={value === opt}
              onChange={() => onChange(opt)}
              required={field.required}
            />
            {opt}
          </label>
        ))}
      </div>
    );
  }

  if (field.type === "multi") {
    const selected = Array.isArray(value) ? (value as string[]) : [];
    return (
      <div className="flex flex-wrap gap-2">
        {(field.options ?? []).map((opt) => {
          const checked = selected.includes(opt);
          return (
            <label
              key={opt}
              className={`cursor-pointer rounded-lg border px-3 py-2 text-sm ${
                checked ? "border-primary bg-primary/15" : "border-foreground/15"
              }`}
            >
              <input
                type="checkbox"
                className="sr-only"
                checked={checked}
                onChange={() => {
                  onChange(
                    checked ? selected.filter((x) => x !== opt) : [...selected, opt],
                  );
                }}
              />
              {opt}
            </label>
          );
        })}
      </div>
    );
  }

  return (
    <input
      className="w-full rounded-lg border border-foreground/15 bg-background px-3 py-2"
      value={typeof value === "string" ? value : ""}
      onChange={(e) => onChange(e.target.value)}
      required={field.required}
    />
  );
}

export function PsychometricFormRenderer({ slug }: { slug: string }) {
  const { data: form, isLoading } = usePsychometricForm(slug);
  const { data: therapists } = useTherapists();
  const submit = useSubmitPsychometric(slug);
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [therapistId, setTherapistId] = useState<number | "">("");
  const [error, setError] = useState<string | null>(null);

  const schema: PsychometricSchema = form?.schema ?? { fields: [] };

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    for (const field of schema.fields ?? []) {
      if (!field.required) continue;
      const v = answers[field.id];
      if (v === undefined || v === "" || (Array.isArray(v) && !v.length)) {
        setError(`فیلد «${field.label}» الزامی است.`);
        return;
      }
    }
    try {
      await submit.mutateAsync({
        answers,
        routedTherapistId: therapistId === "" ? null : Number(therapistId),
      });
      router.push("/patient/tests/history");
    } catch {
      setError("ارسال آزمون ناموفق بود.");
    }
  }

  if (isLoading) return <p className="text-foreground/50">در حال بارگذاری…</p>;
  if (!form) return <p>فرم پیدا نشد.</p>;

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="title gradient-text text-3xl font-extrabold">{form.title}</h1>
        {form.description ? (
          <p className="mt-2 text-sm text-foreground/60">{form.description}</p>
        ) : null}
      </div>

      {(schema.fields ?? []).map((field) => (
        <div key={field.id} className="space-y-2 rounded-xl border border-foreground/10 p-4">
          <label className="block text-sm font-medium">
            {field.label}
            {field.required ? <span className="text-red-600"> *</span> : null}
          </label>
          <FieldInput
            field={field}
            value={answers[field.id]}
            onChange={(v) => setAnswers((prev) => ({ ...prev, [field.id]: v }))}
          />
        </div>
      ))}

      <label className="flex flex-col gap-2 text-sm">
        <span>ارجاع به درمانگر (اختیاری)</span>
        <select
          className="rounded-lg border border-foreground/15 bg-background px-3 py-2"
          value={therapistId}
          onChange={(e) =>
            setTherapistId(e.target.value ? Number(e.target.value) : "")
          }
        >
          <option value="">بدون ارجاع</option>
          {(therapists ?? []).map((t) => (
            <option key={t.id} value={t.id}>
              {t.display_name}
            </option>
          ))}
        </select>
      </label>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <button
        type="submit"
        disabled={submit.isPending}
        className="rounded-lg bg-primary px-6 py-3 font-medium text-[#332B1A] disabled:opacity-60"
      >
        {submit.isPending ? "در حال ارسال…" : "ارسال پاسخ‌ها"}
      </button>
    </form>
  );
}
