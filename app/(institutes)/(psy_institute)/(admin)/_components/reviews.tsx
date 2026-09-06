"use client";

import { useMemo, useState } from "react";
import { formatJalaliFriendlyDate } from "@/lib/datetime/jalali";
import {
  useAdminReviews,
  useApproveReview,
  useRejectReview,
} from "@/app/(institutes)/(psy_institute)/_shared/use-psy-admin";
import { reviewTextStatusLabel } from "@/app/(institutes)/(psy_institute)/_shared/helpers";
import type { TherapistReview } from "@/app/(institutes)/(psy_institute)/_shared/types";

const FILTERS = ["", "pending", "approved", "rejected", "none"] as const;

export default function ReviewInboxClient() {
  const [status, setStatus] = useState<string>("pending");
  const { data, isLoading, isError } = useAdminReviews(status || undefined);
  const approve = useApproveReview();
  const reject = useRejectReview();
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  const pendingCount = useMemo(
    () => (status === "pending" ? (data ?? []).length : null),
    [data, status],
  );

  async function onApprove(row: TherapistReview) {
    setError(null);
    try {
      await approve.mutateAsync({ id: row.id, adminNote: note });
      setNote("");
    } catch {
      setError("تأیید نظر ناموفق بود.");
    }
  }

  async function onReject(row: TherapistReview) {
    setError(null);
    try {
      await reject.mutateAsync({ id: row.id, adminNote: note });
      setNote("");
    } catch {
      setError("رد نظر ناموفق بود.");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="title text-2xl font-bold tracking-tight">نظرات</h1>
        <p className="mt-1 text-sm text-[var(--psy-muted)] dark:text-white/50">
          متن نظر مراجعان فقط پس از تأیید اینجا در پروفایل عمومی و پورتال درمانگر دیده می‌شود.
        </p>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <label className="text-sm">
          <span className="mb-1 block opacity-60">وضعیت متن</span>
          <select
            className="rounded-md border border-psy-neutral-200 bg-transparent px-2 py-2 dark:border-white/15"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            {FILTERS.map((value) => (
              <option key={value || "all"} value={value}>
                {value ? reviewTextStatusLabel(value) : "همه"}
              </option>
            ))}
          </select>
        </label>
        {pendingCount != null ? (
          <p className="text-sm opacity-60">
            {new Intl.NumberFormat("fa-IR").format(pendingCount)} مورد در انتظار
          </p>
        ) : null}
      </div>

      <label className="block text-sm">
        <span className="mb-1 block opacity-60">یادداشت ادمین (اختیاری)</span>
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full max-w-xl rounded-md border border-psy-neutral-200 bg-transparent px-3 py-2 dark:border-white/15"
        />
      </label>

      {error ? <p className="text-sm text-psy-error">{error}</p> : null}
      {isLoading ? <p className="text-sm opacity-60">در حال بارگذاری…</p> : null}
      {isError ? <p className="text-sm text-psy-error">خطا در دریافت نظرات</p> : null}

      <ul className="space-y-3">
        {(data ?? []).map((row) => (
          <li
            key={row.id}
            className="rounded-3xl border border-psy-neutral-200 bg-psy-surface p-5 shadow-psy-sm dark:border-white/10 dark:bg-psy-surface-dark"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-medium">
                  {row.patient_first_name} → {row.therapist_name}
                  <span className="mr-2 rounded-md bg-psy-neutral-100 px-2 py-0.5 text-xs font-medium dark:bg-white/8">
                    {reviewTextStatusLabel(row.text_status)}
                  </span>
                </p>
                <p className="mt-1 text-psy-gold" dir="ltr">
                  {"★".repeat(row.rating)}
                  {"☆".repeat(5 - row.rating)}
                </p>
                <p className="mt-2 text-sm leading-7">{row.body || "بدون متن"}</p>
                <p className="mt-1 text-xs opacity-50">
                  {formatJalaliFriendlyDate(row.created_at)} · نوبت #{row.appointment}
                </p>
                {row.admin_note ? (
                  <p className="mt-1 text-xs opacity-50">یادداشت: {row.admin_note}</p>
                ) : null}
              </div>
              {row.text_status === "pending" ? (
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={approve.isPending}
                    className="rounded-full bg-psy-primary-700 px-3 py-1.5 text-sm text-white disabled:opacity-40"
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
          <li className="text-sm opacity-50">موردی نیست.</li>
        ) : null}
      </ul>
    </div>
  );
}
