"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { formatJalaliDateTime } from "@/lib/datetime/jalali";
import {
  useAdminFileAccessRequests,
  useApproveFileAccessRequest,
  useRejectFileAccessRequest,
} from "@/app/(institutes)/(psy_institute)/_shared/use-psy-admin";
import { fileAccessStatusLabel } from "@/app/(institutes)/(psy_institute)/_shared/helpers";
import type { FileAccessRequest } from "@/app/(institutes)/(psy_institute)/_shared/types";

const FILTERS = ["", "pending", "approved", "rejected", "expired"] as const;

export function AccessRequestsInboxClient() {
  const [status, setStatus] = useState("pending");
  const { data, isLoading, isError } = useAdminFileAccessRequests(
    status || undefined,
  );
  const approve = useApproveFileAccessRequest();
  const reject = useRejectFileAccessRequest();
  const [note, setNote] = useState("");
  const [accessDays, setAccessDays] = useState(7);
  const [error, setError] = useState<string | null>(null);

  const pendingCount = useMemo(
    () => (status === "pending" ? (data ?? []).length : null),
    [data, status],
  );

  async function onApprove(row: FileAccessRequest) {
    setError(null);
    try {
      await approve.mutateAsync({ id: row.id, accessDays });
      setNote("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "تأیید درخواست ناموفق بود.");
    }
  }

  async function onReject(row: FileAccessRequest) {
    setError(null);
    if (!confirm(`رد درخواست دسترسی ${row.therapist_name}؟`)) return;
    try {
      await reject.mutateAsync({ id: row.id, decisionNote: note });
      setNote("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "رد درخواست ناموفق بود.");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="title text-2xl font-bold">درخواست‌های دسترسی پرونده</h1>
        <p className="mt-1 text-sm text-[#0f1a1c]/55 dark:text-white/50">
          تأیید موقت دسترسی درمانگر به پرونده بالینی کامل مراجع.
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
                {value ? fileAccessStatusLabel(value) : "همه"}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-1 block opacity-60">مدت دسترسی (روز)</span>
          <input
            type="number"
            min={1}
            value={accessDays}
            onChange={(e) => setAccessDays(Number(e.target.value) || 7)}
            className="w-24 rounded-md border border-[#0f1a1c]/15 bg-transparent px-2 py-2 dark:border-white/15"
          />
        </label>
        {pendingCount != null ? (
          <p className="text-sm opacity-55">
            {new Intl.NumberFormat("fa-IR").format(pendingCount)} درخواست در انتظار
          </p>
        ) : null}
      </div>

      <label className="block text-sm">
        <span className="mb-1 block opacity-60">یادداشت رد (اختیاری)</span>
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full max-w-xl rounded-md border border-[#0f1a1c]/15 bg-white px-3 py-2 dark:border-white/15 dark:bg-[#0f1618]"
        />
      </label>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {isLoading ? <p className="text-sm opacity-60">در حال بارگذاری…</p> : null}
      {isError ? (
        <p className="text-sm text-red-600">خطا در دریافت درخواست‌ها</p>
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
                    {fileAccessStatusLabel(row.status)}
                  </span>
                </p>
                <p className="mt-1 text-sm opacity-60">
                  مراجع:{" "}
                  <Link
                    href={`/admin/users/patients/${row.patient}`}
                    className="underline"
                  >
                    {row.patient_name}
                  </Link>
                </p>
                <p className="mt-2 text-sm leading-7">{row.reason || "بدون توضیح"}</p>
                {row.expires_at ? (
                  <p className="mt-1 text-xs opacity-50">
                    انقضا: {formatJalaliDateTime(row.expires_at)}
                  </p>
                ) : null}
                {row.decision_note ? (
                  <p className="mt-1 text-xs opacity-50">
                    یادداشت: {row.decision_note}
                  </p>
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
