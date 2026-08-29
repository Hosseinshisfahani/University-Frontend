"use client";

import Link from "next/link";
import { formatIrr } from "@/features/finance/types";
import {
  formatJalaliFriendlyDate,
  formatJalaliTime,
} from "@/lib/datetime/jalali";
import { useAdminOverview } from "@/app/(institutes)/(psy_institute)/_shared/use-psy-admin";
import { appointmentStatusLabel } from "@/app/(institutes)/(psy_institute)/_shared/helpers";

export default function OverviewClient() {
  const { data, isLoading, isError } = useAdminOverview();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="title text-2xl font-bold tracking-tight">نمای کلی</h1>
        <p className="mt-1 text-sm text-[#0f1a1c]/55 dark:text-white/50">
          مرکز فرماندهی مدیریت مؤسسه روان‌شناسی
        </p>
      </div>

      {isLoading ? <p className="text-sm opacity-60">در حال بارگذاری…</p> : null}
      {isError ? <p className="text-sm text-red-600">خطا در دریافت خلاصه</p> : null}

      {data ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {[
            {
              label: "نوبت‌های پیش‌رو",
              value: String(data.upcoming_confirmed_count),
              href: "/admin/appointments",
            },
            {
              label: "لغو این هفته",
              value: String(data.canceled_this_week),
              href: "/admin/appointments",
            },
            {
              label: "مراجعان",
              value: String(data.patients_count),
              href: "/admin/users/patients",
            },
            {
              label: "درمانگران فعال",
              value: String(data.therapists_active_count),
              href: "/admin/users/therapists",
            },
            {
              label: "درآمد خالص ۷ روز",
              value: formatIrr(data.revenue_7d),
              href: "/admin/finance",
            },
          ].map((card) => (
            <Link
              key={card.label}
              href={card.href}
              className="rounded-lg border border-[#0f1a1c]/10 bg-white p-4 transition hover:border-teal-600/40 dark:border-white/10 dark:bg-[#0f1618]"
            >
              <div className="text-xs opacity-50">{card.label}</div>
              <div className="mt-1 text-xl font-bold">{card.value}</div>
            </Link>
          ))}
        </div>
      ) : null}

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-bold">نوبت‌های اخیر</h2>
          <Link
            href="/admin/appointments"
            className="text-sm text-teal-700 dark:text-teal-300"
          >
            همه نوبت‌ها
          </Link>
        </div>
        <ul className="space-y-2">
          {(data?.recent_appointments ?? []).map((a) => (
            <li key={a.id}>
              <Link
                href={`/admin/appointments/${a.id}`}
                className="block rounded-lg border border-[#0f1a1c]/10 bg-white px-4 py-3 text-sm transition hover:border-teal-600/40 dark:border-white/10 dark:bg-[#0f1618]"
              >
                <div className="font-medium">
                  {a.patient_name ?? `مراجع #${a.patient}`}
                  <span className="font-normal opacity-55">
                    {" "}
                    · {a.therapist_name} · {a.session_type_name}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="text-xs opacity-55">
                    {formatJalaliFriendlyDate(a.starts_at)}
                    <span className="mx-1.5 opacity-40">·</span>
                    ساعت {formatJalaliTime(a.starts_at)}
                  </span>
                  <span className="rounded-md bg-[#0f1a1c]/6 px-2 py-1 text-xs font-medium opacity-80 dark:bg-white/8">
                    {appointmentStatusLabel(a.status)}
                  </span>
                </div>
              </Link>
            </li>
          ))}
          {data && !data.recent_appointments.length ? (
            <li className="text-sm opacity-50">نوبتی ثبت نشده.</li>
          ) : null}
        </ul>
      </section>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { href: "/admin/schedule", label: "عملیات برنامه", desc: "بازتولید زمان‌های خالی درمانگران" },
          { href: "/admin/finance", label: "مالی", desc: "دفترکل، SEP و درآمد نوبت" },
          { href: "/admin/users/patients", label: "کاربران", desc: "فهرست مراجعان و درمانگران" },
        ].map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="rounded-lg border border-[#0f1a1c]/10 bg-white p-5 transition hover:border-teal-600/40 dark:border-white/10 dark:bg-[#0f1618]"
          >
            <div className="font-semibold">{card.label}</div>
            <p className="mt-1 text-sm opacity-55">{card.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
