"use client";

import { type FormEvent, useMemo, useState } from "react";
import JalaliDatePicker from "@/app/(institutes)/(psy_institute)/_shared/jalali-date-picker";
import { formatJalaliDate, toApiDate } from "@/lib/datetime/jalali";
import {
  useCancelLeaveRequest,
  useCreateLeaveRequest,
  useMyLeaveRequests,
} from "@/app/(institutes)/(psy_institute)/_shared/use-psy";
import { leaveStatusLabel } from "@/app/(institutes)/(psy_institute)/_shared/helpers";
import type { LeaveRequest } from "@/app/(institutes)/(psy_institute)/_shared/types";

function rangeLabel(row: LeaveRequest): string {
  const dates =
    row.starts_on === row.ends_on
      ? formatJalaliDate(row.starts_on)
      : `${formatJalaliDate(row.starts_on)} تا ${formatJalaliDate(row.ends_on)}`;
  if (row.start_time && row.end_time) {
    return `${dates} · ${row.start_time.slice(0, 5)}–${row.end_time.slice(0, 5)}`;
  }
  return `${dates} · تمام‌روز`;
}

export default function SchedulePageClient() {
  const { data, isLoading } = useMyLeaveRequests();
  const create = useCreateLeaveRequest();
  const cancel = useCancelLeaveRequest();
  const [startsOn, setStartsOn] = useState(toApiDate(new Date()));
  const [endsOn, setEndsOn] = useState(toApiDate(new Date()));
  const [allDay, setAllDay] = useState(true);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("14:00");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  const pending = useMemo(
    () => (data ?? []).filter((r) => r.status === "pending"),
    [data],
  );
  const others = useMemo(
    () => (data ?? []).filter((r) => r.status !== "pending"),
    [data],
  );

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await create.mutateAsync({
        starts_on: startsOn,
        ends_on: endsOn,
        reason: reason.trim(),
        start_time: allDay ? null : startTime,
        end_time: allDay ? null : endTime,
      });
      setReason("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "ارسال درخواست ناموفق بود.");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="title text-3xl font-extrabold">مرخصی</h1>
        <p className="mt-2 text-sm text-[#1a2423]/55 dark:text-white/50">
          درخواست مرخصی را ثبت کنید. برنامه هفتگی و زمان‌های خالی فقط توسط مدیریت کلینیک تنظیم می‌شود.
        </p>
      </div>

      <form
        onSubmit={onSubmit}
        className="space-y-4 rounded-lg border border-[#1a2423]/10 bg-white p-5 dark:border-white/10 dark:bg-[#121818]"
      >
        <h2 className="text-lg font-bold">درخواست جدید</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm">
            <span className="mb-1 block opacity-60">از تاریخ</span>
            <JalaliDatePicker value={startsOn} onChange={setStartsOn} required />
          </label>
          <label className="text-sm">
            <span className="mb-1 block opacity-60">تا تاریخ</span>
            <JalaliDatePicker value={endsOn} onChange={setEndsOn} required />
          </label>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={allDay}
            onChange={(e) => setAllDay(e.target.checked)}
          />
          تمام‌روز
        </label>
        {!allDay ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm">
              <span className="mb-1 block opacity-60">از ساعت</span>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full rounded-md border border-[#1a2423]/15 bg-transparent px-2 py-2 dark:border-white/15"
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block opacity-60">تا ساعت</span>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full rounded-md border border-[#1a2423]/15 bg-transparent px-2 py-2 dark:border-white/15"
              />
            </label>
          </div>
        ) : null}
        <label className="block text-sm">
          <span className="mb-1 block opacity-60">دلیل</span>
          <textarea
            required
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="min-h-24 w-full rounded-md border border-[#1a2423]/15 bg-transparent px-3 py-2 dark:border-white/15"
          />
        </label>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button
          type="submit"
          disabled={create.isPending}
          className="rounded-md bg-[#1a2423] px-4 py-2 text-sm font-medium text-white disabled:opacity-60 dark:bg-primary dark:text-[#332B1A]"
        >
          {create.isPending ? "در حال ارسال…" : "ارسال درخواست"}
        </button>
      </form>

      {isLoading ? <p className="text-sm opacity-50">در حال بارگذاری…</p> : null}

      <LeaveList
        title="در انتظار بررسی"
        items={pending}
        onCancel={(row) => {
          if (!confirm("لغو این درخواست؟")) return;
          cancel.mutate(row.id);
        }}
      />
      <LeaveList title="سوابق" items={others} />
    </div>
  );
}

function LeaveList({
  title,
  items,
  onCancel,
}: {
  title: string;
  items: LeaveRequest[];
  onCancel?: (row: LeaveRequest) => void;
}) {
  return (
    <section className="space-y-3">
      <h2 className="font-bold">{title}</h2>
      <ul className="space-y-2">
        {items.map((row) => (
          <li
            key={row.id}
            className="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-[#1a2423]/10 bg-white px-4 py-3 dark:border-white/10 dark:bg-[#121818]"
          >
            <div>
              <p className="font-medium">{rangeLabel(row)}</p>
              <p className="mt-1 text-sm leading-7">{row.reason}</p>
              <p className="mt-1 text-xs opacity-55">
                {leaveStatusLabel(row.status)}
                {row.admin_note ? ` · ${row.admin_note}` : ""}
              </p>
            </div>
            {onCancel && row.status === "pending" ? (
              <button
                type="button"
                className="text-sm text-red-600"
                onClick={() => onCancel(row)}
              >
                انصراف
              </button>
            ) : null}
          </li>
        ))}
        {!items.length ? (
          <li className="text-sm opacity-50">موردی نیست.</li>
        ) : null}
      </ul>
    </section>
  );
}
