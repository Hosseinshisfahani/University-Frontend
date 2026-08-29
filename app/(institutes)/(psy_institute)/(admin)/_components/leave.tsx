"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { formatJalaliDate, formatJalaliTimeRange } from "@/lib/datetime/jalali";
import {
  useAdminLeaveRequests,
  useApproveLeaveRequest,
  useRejectLeaveRequest,
} from "@/app/(institutes)/(psy_institute)/_shared/use-psy-admin";
import {
  appointmentStatusLabel,
  leaveStatusLabel,
} from "@/app/(institutes)/(psy_institute)/_shared/helpers";
import type { Appointment, LeaveRequest } from "@/app/(institutes)/(psy_institute)/_shared/types";

const FILTERS = ["", "pending", "approved", "rejected", "canceled"] as const;

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

export default function LeaveInboxClient() {
  const [status, setStatus] = useState<string>("pending");
  const { data, isLoading, isError } = useAdminLeaveRequests(status || undefined);
  const approve = useApproveLeaveRequest();
  const reject = useRejectLeaveRequest();
  const [note, setNote] = useState("");
  const [conflicts, setConflicts] = useState<Appointment[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const pendingCount = useMemo(
    () => (status === "pending" ? (data ?? []).length : null),
    [data, status],
  );

  async function onApprove(row: LeaveRequest) {
    setError(null);
    setConflicts(null);
    try {
      const res = await approve.mutateAsync({ id: row.id, adminNote: note });
      setConflicts(res.conflicts);
      setNote("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "تأیید مرخصی ناموفق بود.");
    }
  }

  async function onReject(row: LeaveRequest) {
    setError(null);
    if (!confirm(`رد درخواست مرخصی ${row.therapist_name}؟`)) return;
    try {
      await reject.mutateAsync({ id: row.id, adminNote: note });
      setNote("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "رد درخواست ناموفق بود.");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="title text-2xl font-bold">مرخصی درمانگران</h1>
        <p className="mt-1 text-sm text-[#0f1a1c]/55 dark:text-white/50">
          بررسی درخواست‌ها. تأیید، زمان‌های خالی را می‌بندد ولی نوبت‌های رزروشده را لغو نمی‌کند.
        </p>
      </div>

      <div className="flex flex-wrap items-end gap-3 rounded-lg border border-[#0f1a1c]/10 bg-white p-4 dark:border-white/10 dark:bg-[#0f1618]">
        <label className="text-sm">
          <span className="mb-1 block opacity-60">وضعیت</span>
          <select
            className="rounded-md border border-[#0f1a1c]/15 bg-transparent px-2 py-2 dark:border-white/15"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            {FILTERS.map((value) => (
              <option key={value || "all"} value={value}>
                {value ? leaveStatusLabel(value) : "همه"}
              </option>
            ))}
          </select>
        </label>
        {pendingCount != null ? (
          <p className="text-sm opacity-55">
            {new Intl.NumberFormat("fa-IR").format(pendingCount)} درخواست در انتظار
          </p>
        ) : null}
      </div>

      <label className="block text-sm">
        <span className="mb-1 block opacity-60">یادداشت ادمین (اختیاری، هنگام تأیید/رد)</span>
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full max-w-xl rounded-md border border-[#0f1a1c]/15 bg-white px-3 py-2 dark:border-white/15 dark:bg-[#0f1618]"
        />
      </label>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {isLoading ? <p className="text-sm opacity-60">در حال بارگذاری…</p> : null}
      {isError ? <p className="text-sm text-red-600">خطا در دریافت درخواست‌ها</p> : null}

      {conflicts ? (
        <section className="space-y-2 rounded-lg border border-amber-500/30 bg-amber-50 p-4 text-sm dark:bg-amber-950/30">
          <h2 className="font-bold">نوبت‌های تداخل‌دار (لغو خودکار نشد)</h2>
          {!conflicts.length ? (
            <p className="opacity-70">نوبت فعالی در این بازه نبود.</p>
          ) : (
            <ul className="space-y-1">
              {conflicts.map((a) => (
                <li key={a.id}>
                  <Link
                    href={`/admin/appointments/${a.id}`}
                    className="text-teal-800 underline dark:text-teal-300"
                  >
                    #{a.id} · {a.patient_name} · {formatJalaliTimeRange(a.starts_at, a.ends_at)} ·{" "}
                    {appointmentStatusLabel(a.status)}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}

      <ul className="space-y-2">
        {(data ?? []).map((row) => (
          <li
            key={row.id}
            className="rounded-lg border border-[#0f1a1c]/10 bg-white px-4 py-3 dark:border-white/10 dark:bg-[#0f1618]"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-medium">
                  {row.therapist_name}
                  <span className="mr-2 rounded-md bg-[#0f1a1c]/6 px-2 py-0.5 text-xs font-medium dark:bg-white/8">
                    {leaveStatusLabel(row.status)}
                  </span>
                </p>
                <p className="mt-1 text-sm opacity-60">{rangeLabel(row)}</p>
                <p className="mt-2 text-sm leading-7">{row.reason}</p>
                {row.admin_note ? (
                  <p className="mt-1 text-xs opacity-50">یادداشت: {row.admin_note}</p>
                ) : null}
              </div>
              {row.status === "pending" ? (
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={approve.isPending}
                    className="rounded-md bg-teal-800 px-3 py-1.5 text-sm text-white disabled:opacity-40"
                    onClick={() => onApprove(row)}
                  >
                    تأیید
                  </button>
                  <button
                    type="button"
                    disabled={reject.isPending}
                    className="rounded-md border border-red-500/40 px-3 py-1.5 text-sm text-red-700"
                    onClick={() => onReject(row)}
                  >
                    رد
                  </button>
                </div>
              ) : null}
            </div>
          </li>
        ))}
        {!isLoading && !(data ?? []).length ? (
          <li className="text-sm opacity-50">درخواستی نیست.</li>
        ) : null}
      </ul>
    </div>
  );
}
