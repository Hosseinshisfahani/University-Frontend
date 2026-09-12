"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { formatJalaliDateTime } from "@/lib/datetime/jalali";
import {
  useCreateClinicalReport,
  useMissingReports,
} from "@/app/(institutes)/(psy_institute)/_shared/use-psy";
import { riskFlagLabel } from "@/app/(institutes)/(psy_institute)/_shared/helpers";
import type { MissingReportAppointment } from "@/app/(institutes)/(psy_institute)/_shared/types";

const RISK_FLAGS = [
  "suicidal_ideation",
  "self_harm",
  "violence_risk",
  "substance_use",
] as const;

function ClinicalReportForm({
  appointment,
  onDone,
}: {
  appointment: MissingReportAppointment;
  onDone: () => void;
}) {
  const create = useCreateClinicalReport();
  const [summary, setSummary] = useState("");
  const [assessment, setAssessment] = useState("");
  const [treatmentPlan, setTreatmentPlan] = useState("");
  const [flags, setFlags] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  function toggleFlag(flag: string) {
    setFlags((current) =>
      current.includes(flag)
        ? current.filter((item) => item !== flag)
        : [...current, flag],
    );
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await create.mutateAsync({
        appointment: appointment.id,
        summary: summary.trim(),
        assessment: assessment.trim(),
        treatment_plan: treatmentPlan.trim(),
        risk_flags: flags,
      });
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "ثبت گزارش ناموفق بود.");
    }
  }

  return (
    <form className="mt-4 space-y-3" onSubmit={onSubmit}>
      <label className="block text-sm">
        <span className="mb-1 block opacity-60">خلاصه جلسه</span>
        <textarea
          required
          rows={3}
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          className="w-full rounded-md border border-[#1a2423]/15 bg-transparent px-3 py-2 dark:border-white/15"
        />
      </label>
      <label className="block text-sm">
        <span className="mb-1 block opacity-60">ارزیابی بالینی</span>
        <textarea
          required
          rows={3}
          value={assessment}
          onChange={(e) => setAssessment(e.target.value)}
          className="w-full rounded-md border border-[#1a2423]/15 bg-transparent px-3 py-2 dark:border-white/15"
        />
      </label>
      <label className="block text-sm">
        <span className="mb-1 block opacity-60">طرح درمان</span>
        <textarea
          required
          rows={3}
          value={treatmentPlan}
          onChange={(e) => setTreatmentPlan(e.target.value)}
          className="w-full rounded-md border border-[#1a2423]/15 bg-transparent px-3 py-2 dark:border-white/15"
        />
      </label>
      <fieldset className="space-y-2 text-sm">
        <legend className="opacity-60">پرچم‌های خطر</legend>
        {RISK_FLAGS.map((flag) => (
          <label key={flag} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={flags.includes(flag)}
              onChange={() => toggleFlag(flag)}
            />
            {riskFlagLabel(flag)}
          </label>
        ))}
      </fieldset>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button
        type="submit"
        disabled={create.isPending}
        className="rounded-md bg-[#1a2423] px-4 py-2 text-sm font-medium text-white disabled:opacity-40 dark:bg-primary dark:text-[#332B1A]"
      >
        ثبت گزارش بالینی
      </button>
    </form>
  );
}

export function ClinicalReportsInboxClient() {
  const { data, isLoading, isError } = useMissingReports();
  const [openId, setOpenId] = useState<number | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="title text-3xl font-extrabold">گزارش‌های بالینی</h1>
        <p className="mt-2 text-sm text-[#1a2423]/55 dark:text-white/50">
          پس از اتمام جلسه، ثبت گزارش بالینی الزامی است. این گزارش هرگز به مراجع
          نمایش داده نمی‌شود.
        </p>
      </div>

      {isLoading ? <p className="text-sm opacity-60">در حال بارگذاری…</p> : null}
      {isError ? (
        <p className="text-sm text-red-600">خطا در دریافت جلسات بدون گزارش.</p>
      ) : null}

      <ul className="space-y-3">
        {(data?.items ?? []).map((item) => (
          <li
            key={item.id}
            className="rounded-lg border border-[#1a2423]/10 bg-white p-4 dark:border-white/10 dark:bg-[#121818]"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-medium">{item.patient_name}</p>
                <p className="mt-1 text-sm opacity-60">
                  {item.session_type_name} · {formatJalaliDateTime(item.starts_at)}
                </p>
              </div>
              <button
                type="button"
                className="rounded-md border border-[#1a2423]/15 px-3 py-1.5 text-sm dark:border-white/20"
                onClick={() => setOpenId(openId === item.id ? null : item.id)}
              >
                {openId === item.id ? "بستن فرم" : "ثبت گزارش"}
              </button>
            </div>
            {openId === item.id ? (
              <ClinicalReportForm
                appointment={item}
                onDone={() => setOpenId(null)}
              />
            ) : null}
          </li>
        ))}
        {!isLoading && !(data?.items ?? []).length ? (
          <li className="text-sm opacity-50">جلسه‌ای بدون گزارش بالینی نیست.</li>
        ) : null}
      </ul>

      <Link
        href="/therapist/appointments"
        className="inline-block text-sm text-[#1a2423]/55 underline dark:text-white/50"
      >
        بازگشت به نوبت‌ها
      </Link>
    </div>
  );
}
