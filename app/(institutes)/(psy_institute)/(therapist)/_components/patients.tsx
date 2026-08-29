"use client";

import Link from "next/link";
import {
  formatJalaliDateTime,
  formatJalaliFriendlyDate,
  formatJalaliTime,
} from "@/lib/datetime/jalali";
import { useMyPatient, useMyPatients } from "@/app/(institutes)/(psy_institute)/_shared/use-psy";
import {
  appointmentStatusLabel,
  psychometricResponseStatusLabel,
} from "@/app/(institutes)/(psy_institute)/_shared/helpers";

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

export function PatientDetailClient({ id }: { id: number }) {
  const { data, isLoading } = useMyPatient(id);

  if (isLoading) return <p>در حال بارگذاری…</p>;
  if (!data) return <p>مراجع پیدا نشد.</p>;

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
        <p className="mt-2 text-sm text-[#1a2423]/55 dark:text-white/50">
          {data.phone || "بدون تلفن"}
        </p>
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
