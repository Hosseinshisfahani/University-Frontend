"use client";

import Link from "next/link";
import { formatJalaliFriendlyDate, formatJalaliTime } from "@/lib/datetime/jalali";
import { useTherapistWorkshops, useWorkshop, useWorkshopRoster } from "@/app/(institutes)/(psy_institute)/_shared/use-psy";
import { useParams } from "next/navigation";

function faCount(n: number) {
  return new Intl.NumberFormat("fa-IR").format(n);
}

const chipClass =
  "rounded-md bg-[#1a2423]/6 px-2 py-1 text-xs font-medium text-[#1a2423]/70 dark:bg-white/8 dark:text-white/70";

export function TherapistWorkshopsClient() {
  const { data, isLoading } = useTherapistWorkshops();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="title text-2xl font-bold">کارگاه‌های من</h1>
        <p className="mt-1 text-sm opacity-55">کارگاه‌هایی که مدرس آن‌ها هستید</p>
      </div>
      {isLoading ? <p className="text-sm opacity-60">در حال بارگذاری…</p> : null}
      <ul className="space-y-2">
        {(data ?? []).map((w) => (
          <li key={w.id}>
            <Link
              href={`/therapist/workshops/${w.slug}`}
              className="block rounded-lg border border-[#1a2423]/10 bg-white px-4 py-3 transition hover:border-[#1a2423]/25 dark:border-white/10 dark:bg-[#121818]"
            >
              <span className="font-medium">{w.title}</span>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {w.starts_at ? (
                  <span className="text-xs text-[#1a2423]/55 dark:text-white/50">
                    شروع کارگاه {formatJalaliFriendlyDate(w.starts_at)}
                    <span className="mx-1.5 opacity-40">·</span>
                    ساعت {formatJalaliTime(w.starts_at)}
                  </span>
                ) : null}
                <span className={chipClass}>
                  {faCount(w.seats_taken)} از {faCount(w.capacity)} نفر
                </span>
                <span className={chipClass}>
                  {w.is_published ? "منتشرشده" : "پیش‌نویس"}
                </span>
              </div>
            </Link>
          </li>
        ))}
        {!isLoading && !(data?.length) ? (
          <li className="text-sm opacity-50">کارگاهی به شما اختصاص داده نشده.</li>
        ) : null}
      </ul>
    </div>
  );
}


export function TherapistWorkshopRosterClient() {
  const params = useParams();
  const slug = String(params.slug || "");
  const { data: w } = useWorkshop(slug);
  const { data: roster, isLoading } = useWorkshopRoster(slug);

  return (
    <div className="space-y-6">
      <Link href="/therapist/workshops" className="text-sm text-teal-700 dark:text-teal-300">
        ← کارگاه‌های من
      </Link>
      <div>
        <h1 className="title text-2xl font-bold">{w?.title ?? slug}</h1>
        {w?.starts_at ? (
          <p className="mt-1 text-sm text-[#1a2423]/55 dark:text-white/50">
            شروع کارگاه {formatJalaliFriendlyDate(w.starts_at)}
            <span className="mx-1.5 opacity-40">·</span>
            ساعت {formatJalaliTime(w.starts_at)}
          </p>
        ) : (
          <p className="mt-1 text-sm opacity-55">فهرست شرکت‌کنندگان فعال</p>
        )}
      </div>
      {isLoading ? <p className="text-sm opacity-60">در حال بارگذاری…</p> : null}
      <ul className="space-y-2">
        {(roster ?? []).map((e) => (
          <li
            key={e.id}
            className="rounded-lg border border-[#1a2423]/10 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-[#121818]"
          >
            <div className="font-medium">{e.patient_name}</div>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {e.patient_phone ? (
                <span className={chipClass}>{e.patient_phone}</span>
              ) : (
                <span className={chipClass}>بدون تلفن</span>
              )}
              <span className="text-xs text-[#1a2423]/55 dark:text-white/50">
                ثبت‌نام {formatJalaliFriendlyDate(e.enrolled_at)}
                <span className="mx-1.5 opacity-40">·</span>
                ساعت {formatJalaliTime(e.enrolled_at)}
              </span>
            </div>
          </li>
        ))}
        {!isLoading && !(roster?.length) ? (
          <li className="text-sm opacity-50">هنوز شرکت‌کننده‌ای نیست.</li>
        ) : null}
      </ul>
    </div>
  );
}
