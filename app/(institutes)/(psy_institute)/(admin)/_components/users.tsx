"use client";

import Link from "next/link";
import { useState } from "react";
import { formatIrr } from "@/features/finance/types";
import {
  formatJalaliFriendlyDate,
  formatJalaliTime,
} from "@/lib/datetime/jalali";
import { useAdminPatients, useAdminPatient, useAdminTherapists, useAdminTherapist } from "@/app/(institutes)/(psy_institute)/_shared/use-psy-admin";
import { useParams } from "next/navigation";
import {
  appointmentStatusLabel,
  psychometricResponseStatusLabel,
} from "@/app/(institutes)/(psy_institute)/_shared/helpers";

export function PatientsDirectoryClient() {
  const [q, setQ] = useState("");
  const [submitted, setSubmitted] = useState("");
  const [page, setPage] = useState(1);
  const { data, isLoading } = useAdminPatients(submitted, page);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="title text-2xl font-bold">مراجعان</h1>
        <p className="mt-1 text-sm opacity-55">فهرست و جستجوی همه مراجعان مرکز</p>
      </div>

      <form
        className="flex flex-wrap gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          setPage(1);
          setSubmitted(q.trim());
        }}
      >
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="نام، نام کاربری، تلفن، کد ملی…"
          className="min-w-[220px] flex-1 rounded-md border border-[#0f1a1c]/15 bg-white px-3 py-2 text-sm dark:border-white/15 dark:bg-[#0f1618]"
        />
        <button
          type="submit"
          className="rounded-md bg-[#0f1a1c] px-4 py-2 text-sm text-white dark:bg-teal-700"
        >
          جستجو
        </button>
      </form>

      {isLoading ? <p className="text-sm opacity-60">در حال بارگذاری…</p> : null}

      <ul className="space-y-2">
        {(data?.results ?? []).map((p) => (
          <li key={p.id}>
            <Link
              href={`/admin/users/patients/${p.id}`}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[#0f1a1c]/10 bg-white px-4 py-3 hover:border-teal-600/40 dark:border-white/10 dark:bg-[#0f1618]"
            >
              <div>
                <div className="font-medium">
                  {p.display_name}{" "}
                  <span className="text-sm font-normal opacity-50">@{p.username}</span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {p.phone ? (
                    <span className="rounded-md bg-[#0f1a1c]/6 px-2 py-1 text-xs font-medium opacity-80 dark:bg-white/8">
                      {p.phone}
                    </span>
                  ) : null}
                  <span className="rounded-md bg-[#0f1a1c]/6 px-2 py-1 text-xs font-medium opacity-80 dark:bg-white/8">
                    {p.appointments_count} نوبت
                  </span>
                  <span className="rounded-md bg-[#0f1a1c]/6 px-2 py-1 text-xs font-medium opacity-80 dark:bg-white/8">
                    کیف پول {formatIrr(p.wallet_balance)}
                  </span>
                  {p.last_appointment_at ? (
                    <span className="text-xs opacity-55">
                      آخرین نوبت {formatJalaliFriendlyDate(p.last_appointment_at)}
                      <span className="mx-1.5 opacity-40">·</span>
                      ساعت {formatJalaliTime(p.last_appointment_at)}
                    </span>
                  ) : null}
                </div>
              </div>
            </Link>
          </li>
        ))}
        {!isLoading && !(data?.results?.length) ? (
          <li className="text-sm opacity-50">موردی یافت نشد.</li>
        ) : null}
      </ul>

      {data && data.count > data.page_size ? (
        <div className="flex items-center gap-3 text-sm">
          <button
            type="button"
            disabled={page <= 1}
            className="rounded border px-3 py-1 disabled:opacity-40"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            قبلی
          </button>
          <span>
            صفحه {data.page} / {Math.ceil(data.count / data.page_size)}
          </span>
          <button
            type="button"
            disabled={page * data.page_size >= data.count}
            className="rounded border px-3 py-1 disabled:opacity-40"
            onClick={() => setPage((p) => p + 1)}
          >
            بعدی
          </button>
        </div>
      ) : null}
    </div>
  );
}


export function PatientSummaryClient() {
  const params = useParams();
  const id = Number(params.id);
  const { data: p, isLoading, isError } = useAdminPatient(id);

  if (isLoading) return <p className="text-sm opacity-60">در حال بارگذاری…</p>;
  if (isError || !p) return <p className="text-sm text-red-600">مراجع یافت نشد.</p>;

  return (
    <div className="space-y-6">
      <Link href="/admin/users/patients" className="text-sm text-teal-700 dark:text-teal-300">
        ← فهرست مراجعان
      </Link>
      <div>
        <h1 className="title text-2xl font-bold">{p.display_name}</h1>
        <p className="mt-1 text-sm opacity-55">
          @{p.username} · {p.email || "بدون ایمیل"}
        </p>
      </div>

      <dl className="grid gap-3 rounded-lg border border-[#0f1a1c]/10 bg-white p-5 text-sm dark:border-white/10 dark:bg-[#0f1618] sm:grid-cols-2">
        <div>
          <dt className="opacity-50">تلفن</dt>
          <dd>{p.phone || "—"}</dd>
        </div>
        <div>
          <dt className="opacity-50">کد ملی</dt>
          <dd>{p.national_id || "—"}</dd>
        </div>
        <div>
          <dt className="opacity-50">موجودی کیف پول</dt>
          <dd>{formatIrr(p.wallet_balance)}</dd>
        </div>
        <div>
          <dt className="opacity-50">تعداد نوبت</dt>
          <dd>{p.appointments_count}</dd>
        </div>
      </dl>

      <section className="space-y-2">
        <h2 className="font-bold">نوبت‌های اخیر</h2>
        <ul className="space-y-2">
          {p.recent_appointments.map((a) => (
            <li key={a.id}>
              <Link
                href={`/admin/appointments/${a.id}`}
                className="block rounded-md border border-[#0f1a1c]/10 bg-white px-3 py-2 text-sm hover:underline dark:border-white/10 dark:bg-[#0f1618]"
              >
                {a.therapist_name} · {appointmentStatusLabel(a.status)} ·{" "}
                {formatIrr(a.price_snapshot)}
                <div className="mt-1 text-xs opacity-55">
                  {formatJalaliFriendlyDate(a.starts_at)} · ساعت{" "}
                  {formatJalaliTime(a.starts_at)}
                </div>
              </Link>
            </li>
          ))}
          {!p.recent_appointments.length ? (
            <li className="text-sm opacity-50">نوبتی نیست.</li>
          ) : null}
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="font-bold">پاسخ آزمون‌های اخیر</h2>
        <ul className="space-y-2 text-sm">
          {p.recent_responses.map((r) => (
            <li
              key={r.id}
              className="rounded-md border border-[#0f1a1c]/10 bg-white px-3 py-2 dark:border-white/10 dark:bg-[#0f1618]"
            >
              #{r.id} · {psychometricResponseStatusLabel(r.status)}
              <div className="mt-1 text-xs opacity-55">
                ارسال آزمون {formatJalaliFriendlyDate(r.submitted_at)} · ساعت{" "}
                {formatJalaliTime(r.submitted_at)}
              </div>
              {r.reviewer_notes ? (
                <p className="mt-1 opacity-60">{r.reviewer_notes}</p>
              ) : null}
            </li>
          ))}
          {!p.recent_responses.length ? (
            <li className="opacity-50">پاسخی نیست.</li>
          ) : null}
        </ul>
      </section>
    </div>
  );
}


export function TherapistsDirectoryClient() {
  const [q, setQ] = useState("");
  const [submitted, setSubmitted] = useState("");
  const [activeOnly, setActiveOnly] = useState(false);
  const [page, setPage] = useState(1);
  const { data, isLoading } = useAdminTherapists({
    q: submitted,
    is_active: activeOnly ? "true" : undefined,
    page,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="title text-2xl font-bold">درمانگران</h1>
        <p className="mt-1 text-sm opacity-55">فهرست کامل درمانگران (فعال و غیرفعال)</p>
      </div>

      <form
        className="flex flex-wrap items-center gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          setPage(1);
          setSubmitted(q.trim());
        }}
      >
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="نام نمایشی یا نام کاربری…"
          className="min-w-[220px] flex-1 rounded-md border border-[#0f1a1c]/15 bg-white px-3 py-2 text-sm dark:border-white/15 dark:bg-[#0f1618]"
        />
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={activeOnly}
            onChange={(e) => {
              setPage(1);
              setActiveOnly(e.target.checked);
            }}
          />
          فقط فعال
        </label>
        <button
          type="submit"
          className="rounded-md bg-[#0f1a1c] px-4 py-2 text-sm text-white dark:bg-teal-700"
        >
          جستجو
        </button>
      </form>

      {isLoading ? <p className="text-sm opacity-60">در حال بارگذاری…</p> : null}

      <ul className="space-y-2">
        {(data?.results ?? []).map((t) => (
          <li key={t.id}>
            <Link
              href={`/admin/users/therapists/${t.id}`}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[#0f1a1c]/10 bg-white px-4 py-3 hover:border-teal-600/40 dark:border-white/10 dark:bg-[#0f1618]"
            >
              <div>
                <div className="font-medium">
                  {t.display_name}{" "}
                  <span className="text-sm font-normal opacity-50">@{t.username}</span>
                </div>
                <div className="mt-1 text-sm opacity-55">
                  {t.is_active ? "فعال" : "غیرفعال"}
                  {t.is_accepting_patients ? " · پذیرش مراجع" : " · توقف پذیرش"} ·{" "}
                  {t.appointments_count} نوبت · {t.open_slots_14d} زمان خالی (۱۴روز)
                </div>
              </div>
            </Link>
          </li>
        ))}
        {!isLoading && !(data?.results?.length) ? (
          <li className="text-sm opacity-50">موردی یافت نشد.</li>
        ) : null}
      </ul>

      {data && data.count > data.page_size ? (
        <div className="flex items-center gap-3 text-sm">
          <button
            type="button"
            disabled={page <= 1}
            className="rounded border px-3 py-1 disabled:opacity-40"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            قبلی
          </button>
          <span>
            صفحه {data.page} / {Math.ceil(data.count / data.page_size)}
          </span>
          <button
            type="button"
            disabled={page * data.page_size >= data.count}
            className="rounded border px-3 py-1 disabled:opacity-40"
            onClick={() => setPage((p) => p + 1)}
          >
            بعدی
          </button>
        </div>
      ) : null}
    </div>
  );
}


export function TherapistSummaryClient() {
  const params = useParams();
  const id = Number(params.id);
  const { data: t, isLoading, isError } = useAdminTherapist(id);

  if (isLoading) return <p className="text-sm opacity-60">در حال بارگذاری…</p>;
  if (isError || !t) return <p className="text-sm text-red-600">درمانگر یافت نشد.</p>;

  return (
    <div className="space-y-6">
      <Link
        href="/admin/users/therapists"
        className="text-sm text-teal-700 dark:text-teal-300"
      >
        ← فهرست درمانگران
      </Link>
      <div>
        <h1 className="title text-2xl font-bold">{t.display_name}</h1>
        <p className="mt-1 text-sm opacity-55">
          @{t.username} · {t.email || "بدون ایمیل"}
        </p>
      </div>

      <dl className="grid gap-3 rounded-lg border border-[#0f1a1c]/10 bg-white p-5 text-sm dark:border-white/10 dark:bg-[#0f1618] sm:grid-cols-2">
        <div>
          <dt className="opacity-50">وضعیت</dt>
          <dd>
            {t.is_active ? "فعال" : "غیرفعال"}
            {t.is_accepting_patients ? " · پذیرش مراجع" : ""}
          </dd>
        </div>
        <div>
          <dt className="opacity-50">دسترسی‌های فعال</dt>
          <dd>{t.availability_count}</dd>
        </div>
        <div>
          <dt className="opacity-50">زمان خالی (۱۴ روز)</dt>
          <dd>{t.open_slots_14d}</dd>
        </div>
        <div>
          <dt className="opacity-50">تخصص‌ها</dt>
          <dd>{(t.specialties ?? []).join("، ") || "—"}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="opacity-50">بیو</dt>
          <dd className="whitespace-pre-wrap">{t.bio || "—"}</dd>
        </div>
      </dl>

      <section className="space-y-2">
        <h2 className="font-bold">پیشنهادهای جلسه</h2>
        <ul className="space-y-1 text-sm">
          {t.offers.map((o) => (
            <li key={o.id}>
              {o.session_type_name} {o.is_active ? "" : "(غیرفعال)"}
            </li>
          ))}
          {!t.offers.length ? <li className="opacity-50">موردی نیست.</li> : null}
        </ul>
      </section>

      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="font-bold">نوبت‌های اخیر</h2>
          <Link href="/admin/schedule" className="text-sm text-teal-700 dark:text-teal-300">
            بازتولید زمان‌های خالی
          </Link>
        </div>
        <ul className="space-y-2">
          {t.recent_appointments.map((a) => (
            <li key={a.id}>
              <Link
                href={`/admin/appointments/${a.id}`}
                className="block rounded-md border border-[#0f1a1c]/10 bg-white px-3 py-2 text-sm hover:underline dark:border-white/10 dark:bg-[#0f1618]"
              >
                {a.patient_name ?? `مراجع #${a.patient}`} ·{" "}
                {appointmentStatusLabel(a.status)}
                <div className="mt-1 text-xs opacity-55">
                  {formatJalaliFriendlyDate(a.starts_at)} · ساعت{" "}
                  {formatJalaliTime(a.starts_at)}
                </div>
              </Link>
            </li>
          ))}
          {!t.recent_appointments.length ? (
            <li className="text-sm opacity-50">نوبتی نیست.</li>
          ) : null}
        </ul>
      </section>
    </div>
  );
}
