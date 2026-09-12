"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import {
  formatJalaliDateTime,
  formatJalaliFriendlyDate,
  formatJalaliTime,
} from "@/lib/datetime/jalali";
import {
  useCreateFileAccessRequest,
  useMyPatient,
  useMyPatients,
} from "@/app/(institutes)/(psy_institute)/_shared/use-psy";
import {
  appointmentStatusLabel,
  fileAccessStatusLabel,
  psychometricResponseStatusLabel,
  riskFlagLabel,
} from "@/app/(institutes)/(psy_institute)/_shared/helpers";
import type { ClinicalReport } from "@/app/(institutes)/(psy_institute)/_shared/types";

function faCount(n: number) {
  return new Intl.NumberFormat("fa-IR").format(n);
}

function PatientStats({
  appointments,
  notes,
  lastAt,
}: {
  appointments: number;
  notes: number;
  lastAt?: string | null;
}) {
  return (
    <div className="mt-2 flex flex-wrap items-center gap-2">
      <span className="rounded-md bg-[#1a2423]/6 px-2 py-1 text-xs font-medium text-[#1a2423]/70 dark:bg-white/8 dark:text-white/70">
        {faCount(appointments)} نوبت
      </span>
      <span className="rounded-md bg-[#1a2423]/6 px-2 py-1 text-xs font-medium text-[#1a2423]/70 dark:bg-white/8 dark:text-white/70">
        {faCount(notes)} یادداشت
      </span>
      {lastAt ? (
        <span className="text-xs text-[#1a2423]/55 dark:text-white/50">
          آخرین نوبت {formatJalaliFriendlyDate(lastAt)}
          <span className="mx-1.5 opacity-40">·</span>
          ساعت {formatJalaliTime(lastAt)}
        </span>
      ) : null}
    </div>
  );
}

export function PatientsListClient() {
  const { data, isLoading } = useMyPatients();

  if (isLoading) return <p className="text-[#1a2423]/50">در حال بارگذاری…</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="title text-3xl font-extrabold">مراجعان من</h1>
        <p className="mt-2 text-sm text-[#1a2423]/55 dark:text-white/50">
          مراجعانی که حداقل یک نوبت با شما داشته‌اند.
        </p>
      </div>
      <ul className="space-y-2">
        {(data ?? []).map((p) => (
          <li key={p.id}>
            <Link
              href={`/therapist/patients/${p.id}`}
              className="block rounded-lg border border-[#1a2423]/10 bg-white px-4 py-3 transition hover:border-[#1a2423]/25 dark:border-white/10 dark:bg-[#121818]"
            >
              <div className="font-medium">{p.display_name}</div>
              <PatientStats
                appointments={p.appointments_count}
                notes={p.notes_count}
                lastAt={p.last_appointment_at}
              />
            </Link>
          </li>
        ))}
        {!data?.length ? (
          <li className="text-sm text-[#1a2423]/50">هنوز مراجعی ندارید.</li>
        ) : null}
      </ul>
    </div>
  );
}

function ClinicalReportCard({ report }: { report: ClinicalReport }) {
  return (
    <li className="rounded-md border border-[#1a2423]/8 p-3 dark:border-white/10">
      <p className="font-medium">{report.therapist_name}</p>
      <p className="mt-1 text-xs text-[#1a2423]/45">
        {report.session_type_name} · {formatJalaliDateTime(report.appointment_starts_at)}
      </p>
      <p className="mt-3 whitespace-pre-wrap text-sm leading-7">{report.summary}</p>
      <p className="mt-2 text-sm leading-7 opacity-80">{report.assessment}</p>
      <p className="mt-2 text-sm leading-7 opacity-80">{report.treatment_plan}</p>
      {report.risk_flags.length ? (
        <p className="mt-2 text-xs text-red-700">
          {report.risk_flags.map(riskFlagLabel).join(" · ")}
        </p>
      ) : null}
    </li>
  );
}

export function PatientDetailClient({ id }: { id: number }) {
  const { data, isLoading } = useMyPatient(id);
  const requestAccess = useCreateFileAccessRequest();
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (isLoading) return <p>در حال بارگذاری…</p>;
  if (!data) return <p>مراجع پیدا نشد.</p>;

  const reports = data.clinical_reports ?? [];
  const otherCount = data.other_therapists_report_count ?? 0;
  const pending = data.pending_file_access_request;
  const showRequest = !data.has_full_file_access && otherCount > 0;

  async function onRequest(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await requestAccess.mutateAsync({
        patient: id,
        reason: reason.trim(),
      });
      setReason("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "ارسال درخواست ناموفق بود.");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/therapist/patients"
          className="text-sm text-[#1a2423]/55 underline dark:text-white/50"
        >
          بازگشت به فهرست
        </Link>
        <h1 className="title mt-3 text-3xl font-extrabold">{data.display_name}</h1>
        <PatientStats
          appointments={data.appointments_count}
          notes={data.notes_count}
          lastAt={data.last_appointment_at}
        />
      </div>

      <section className="space-y-3 rounded-lg border border-[#1a2423]/10 bg-white p-5 dark:border-white/10 dark:bg-[#121818]">
        <h2 className="font-bold">نوبت‌های اخیر</h2>
        <ul className="divide-y divide-[#1a2423]/8 text-sm dark:divide-white/10">
          {data.recent_appointments.map((a) => (
            <li key={a.id} className="flex justify-between gap-3 py-2">
              <Link
                href={`/therapist/appointments/${a.id}`}
                className="hover:underline"
              >
                {a.session_type_name} · {formatJalaliDateTime(a.starts_at)}
              </Link>
              <span className="text-[#1a2423]/50">{appointmentStatusLabel(a.status)}</span>
            </li>
          ))}
          {!data.recent_appointments.length ? (
            <li className="py-2 text-[#1a2423]/50">نوبتی نیست.</li>
          ) : null}
        </ul>
      </section>

      <section className="space-y-3 rounded-lg border border-[#1a2423]/10 bg-white p-5 dark:border-white/10 dark:bg-[#121818]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-bold">پرونده بالینی</h2>
            <p className="mt-1 text-sm opacity-55">
              {data.has_full_file_access
                ? "دسترسی موقت به پرونده کامل تأیید شده است."
                : "گزارش‌های سایر درمانگران به‌صورت پیش‌فرض پنهان است."}
            </p>
          </div>
        </div>
        <ul className="space-y-3 text-sm">
          {reports.map((report) => (
            <ClinicalReportCard key={report.id} report={report} />
          ))}
          {!reports.length ? (
            <li className="text-[#1a2423]/50">گزارش بالینی قابل نمایش نیست.</li>
          ) : null}
        </ul>
        {showRequest ? (
          pending ? (
            <p className="text-sm text-amber-800 dark:text-amber-200">
              درخواست دسترسی {fileAccessStatusLabel(pending.status)} است.
            </p>
          ) : (
            <form className="space-y-3 border-t border-[#1a2423]/8 pt-4 dark:border-white/10" onSubmit={onRequest}>
              <label className="block text-sm">
                <span className="mb-1 block opacity-60">دلیل درخواست دسترسی به پرونده</span>
                <textarea
                  required
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full rounded-md border border-[#1a2423]/15 bg-transparent px-3 py-2 dark:border-white/15"
                />
              </label>
              {error ? <p className="text-sm text-red-600">{error}</p> : null}
              <button
                type="submit"
                disabled={requestAccess.isPending}
                className="rounded-md bg-[#1a2423] px-4 py-2 text-sm font-medium text-white disabled:opacity-40 dark:bg-primary dark:text-[#332B1A]"
              >
                درخواست دسترسی به پرونده
              </button>
            </form>
          )
        ) : null}
      </section>

      <section className="space-y-3 rounded-lg border border-[#1a2423]/10 bg-white p-5 dark:border-white/10 dark:bg-[#121818]">
        <h2 className="font-bold">یادداشت‌ها</h2>
        <ul className="space-y-3 text-sm">
          {data.recent_notes.map((n) => (
            <li
              key={n.id}
              className="rounded-md border border-[#1a2423]/8 p-3 dark:border-white/10"
            >
              <p className="whitespace-pre-wrap leading-7">{n.body}</p>
              <p className="mt-2 text-xs text-[#1a2423]/45">
                {formatJalaliDateTime(n.created_at)}
                {n.shared_with_patient ? " · اشتراکی" : ""}
              </p>
            </li>
          ))}
          {!data.recent_notes.length ? (
            <li className="text-[#1a2423]/50">یادداشتی نیست.</li>
          ) : null}
        </ul>
      </section>

      <section className="space-y-3 rounded-lg border border-[#1a2423]/10 bg-white p-5 dark:border-white/10 dark:bg-[#121818]">
        <h2 className="font-bold">آزمون‌های ارجاع‌شده</h2>
        <ul className="divide-y divide-[#1a2423]/8 text-sm dark:divide-white/10">
          {data.recent_responses.map((r) => (
            <li key={r.id} className="flex justify-between gap-3 py-2">
              <Link
                href={`/therapist/responses/${r.id}`}
                className="hover:underline"
              >
                فرم #{r.form} · {formatJalaliDateTime(r.submitted_at)}
              </Link>
              <span className="text-[#1a2423]/50">
                {psychometricResponseStatusLabel(r.status)}
              </span>
            </li>
          ))}
          {!data.recent_responses.length ? (
            <li className="py-2 text-[#1a2423]/50">آزمونی نیست.</li>
          ) : null}
        </ul>
      </section>
    </div>
  );
}
