"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  useMyAppointments,
  useMyLeaveRequests,
  useRoutedPsychometricResponses,
} from "@/app/(institutes)/(psy_institute)/_shared/use-psy";
import { isOpenAppointmentStatus } from "@/app/(institutes)/(psy_institute)/_shared/helpers";

export default function OverviewClient() {
  const { data: appointments } = useMyAppointments();
  const { data: leaveRequests } = useMyLeaveRequests();
  const { data: responses } = useRoutedPsychometricResponses();
  const [now] = useState(() => Date.now());

  const upcoming = useMemo(
    () =>
      (appointments ?? []).filter(
        (a) =>
          new Date(a.starts_at).getTime() >= now &&
          isOpenAppointmentStatus(a.status),
      ).length,
    [appointments, now],
  );

  const openResponses = useMemo(
    () => (responses ?? []).filter((r) => r.status === "submitted").length,
    [responses],
  );

  const pendingLeave = useMemo(
    () => (leaveRequests ?? []).filter((r) => r.status === "pending").length,
    [leaveRequests],
  );

  const cards = [
    {
      href: "/therapist/appointments",
      label: "نوبت‌های پیش‌رو",
      value: String(upcoming),
      hint: "تأییدشده یا در انتظار پرداخت",
    },
    {
      href: "/therapist/schedule",
      label: "درخواست مرخصی در انتظار",
      value: String(pendingLeave),
      hint: "منتظر بررسی مدیریت",
    },
    {
      href: "/therapist/responses",
      label: "آزمون‌های در انتظار بررسی",
      value: String(openResponses),
      hint: "ارجاع‌شده با وضعیت submitted",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="title text-3xl font-extrabold text-[#1a2423] dark:text-[#e8efed]">
          نمای کلی
        </h1>
        <p className="mt-2 text-sm text-[#1a2423]/55 dark:text-white/50">
          خلاصهٔ فعالیت بالینی و میانبرهای پورتال درمانگر.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="rounded-lg border border-[#1a2423]/10 bg-white p-5 transition hover:border-[#1a2423]/25 dark:border-white/10 dark:bg-[#121818]"
          >
            <div className="text-3xl font-bold tabular-nums">{c.value}</div>
            <div className="mt-2 font-medium">{c.label}</div>
            <p className="mt-1 text-xs text-[#1a2423]/50 dark:text-white/40">{c.hint}</p>
          </Link>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/therapist/schedule"
          className="rounded-md bg-[#1a2423] px-5 py-2.5 text-sm font-medium text-white dark:bg-primary dark:text-[#332B1A]"
        >
          درخواست مرخصی
        </Link>
        <Link
          href="/therapist/appointments"
          className="rounded-md border border-[#1a2423]/20 px-5 py-2.5 text-sm font-medium dark:border-white/20"
        >
          فهرست نوبت‌ها
        </Link>
      </div>
    </div>
  );
}
