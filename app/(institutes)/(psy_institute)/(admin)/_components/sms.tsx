"use client";

import { type FormEvent, useMemo, useState } from "react";
import { formatJalaliDateTime } from "@/lib/datetime/jalali";
import {
  useAdminSmsMessages,
  useAdminSmsRecipients,
  useAdminSmsSend,
} from "@/app/(institutes)/(psy_institute)/_shared/use-psy-admin";
import type { SmsRecipient } from "@/app/(institutes)/(psy_institute)/_shared/admin-types";

const ROLE_FILTERS = [
  { value: "", label: "همه" },
  { value: "patient", label: "مراجعان" },
  { value: "therapist", label: "درمانگران" },
] as const;

const PURPOSE_LABEL: Record<string, string> = {
  otp_register: "OTP ثبت‌نام",
  otp_password_reset: "OTP بازیابی رمز",
  appointment: "نوبت",
  admin_manual: "ارسال دستی",
};

const STATUS_LABEL: Record<string, string> = {
  queued: "در صف",
  sent: "ارسال شده",
  failed: "ناموفق",
  skipped_no_phone: "بدون شماره",
};

function snippet(body: string, max = 72): string {
  const text = body.replace(/\s+/g, " ").trim();
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

export default function SmsAdminClient() {
  const [role, setRole] = useState("");
  const [q, setQ] = useState("");
  const [submitted, setSubmitted] = useState("");
  const [selected, setSelected] = useState<number[]>([]);
  const [message, setMessage] = useState("");
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const recipientsQuery = useAdminSmsRecipients(role, submitted);
  const historyQuery = useAdminSmsMessages(page);
  const send = useAdminSmsSend();
  const recipients = recipientsQuery.data?.results ?? [];

  const selectedSet = useMemo(() => new Set(selected), [selected]);
  const allVisibleSelected =
    recipients.length > 0 && recipients.every((row) => selectedSet.has(row.id));

  function toggle(id: number) {
    setSelected((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  }

  function toggleAllVisible() {
    if (allVisibleSelected) {
      const visible = new Set(recipients.map((row) => row.id));
      setSelected((current) => current.filter((id) => !visible.has(id)));
      return;
    }
    setSelected((current) => {
      const next = new Set(current);
      for (const row of recipients) next.add(row.id);
      return [...next];
    });
  }

  function roleLabel(row: SmsRecipient) {
    if (row.role === "therapist") return "درمانگر";
    if (row.role === "patient") return "مراجع";
    return "";
  }

  async function onSend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setNotice(null);
    if (!selected.length || !message.trim()) {
      setError("گیرنده و متن پیام الزامی است.");
      return;
    }
    try {
      const result = await send.mutateAsync({
        user_ids: selected,
        message: message.trim(),
      });
      setNotice(`${result.sent} پیامک ارسال شد${result.skipped ? ` · ${result.skipped} رد شد` : ""}.`);
      setMessage("");
      setSelected([]);
      setPage(1);
    } catch {
      setError("ارسال پیامک ناموفق بود.");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="title text-2xl font-bold tracking-tight">پیامک</h1>
        <p className="mt-1 text-sm text-[var(--psy-muted)] dark:text-white/50">
          ارسال دستی به مراجعان و درمانگرانی که شماره هسته‌ای دارند
        </p>
      </div>

      <form
        className="flex flex-wrap items-end gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitted(q.trim());
        }}
      >
        <label className="text-sm">
          <span className="mb-1 block opacity-60">نقش</span>
          <select
            className="rounded-md border border-[#0f1a1c]/15 bg-white px-2 py-2 dark:border-white/15 dark:bg-[#0f1618]"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            {ROLE_FILTERS.map((item) => (
              <option key={item.value || "all"} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <label className="min-w-[220px] flex-1 text-sm">
          <span className="mb-1 block opacity-60">جستجو</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="نام، نام کاربری، تلفن…"
            className="w-full rounded-md border border-[#0f1a1c]/15 bg-white px-3 py-2 dark:border-white/15 dark:bg-[#0f1618]"
          />
        </label>
        <button
          type="submit"
          className="rounded-md bg-[#0f1a1c] px-4 py-2 text-sm text-white dark:bg-teal-700"
        >
          جستجو
        </button>
      </form>

      <section className="rounded-3xl border border-[#0f1a1c]/10 bg-white p-5 dark:border-white/10 dark:bg-[#0f1618]">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-medium">گیرندگان</h2>
          <button
            type="button"
            onClick={toggleAllVisible}
            className="text-sm text-teal-800 dark:text-teal-300"
          >
            انتخاب همه نتایج
          </button>
        </div>
        {recipientsQuery.isLoading ? (
          <p className="text-sm opacity-60">در حال بارگذاری…</p>
        ) : null}
        {recipientsQuery.isError ? (
          <p className="text-sm text-psy-error">خطا در دریافت گیرندگان</p>
        ) : null}
        <ul className="max-h-72 space-y-2 overflow-auto">
          {recipients.map((row) => (
            <li key={row.id}>
              <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-[#0f1a1c]/10 px-3 py-2 dark:border-white/10">
                <input
                  type="checkbox"
                  checked={selectedSet.has(row.id)}
                  onChange={() => toggle(row.id)}
                />
                <span className="min-w-0 flex-1">
                  <span className="font-medium">{row.display_name}</span>
                  <span className="mr-2 text-xs opacity-50">@{row.username}</span>
                  {roleLabel(row) ? (
                    <span className="mr-2 rounded-md bg-[#0f1a1c]/6 px-2 py-0.5 text-xs dark:bg-white/8">
                      {roleLabel(row)}
                    </span>
                  ) : null}
                  <span className="mr-2 text-sm opacity-70" dir="ltr">
                    {row.phone}
                  </span>
                </span>
              </label>
            </li>
          ))}
          {!recipientsQuery.isLoading && !recipients.length ? (
            <li className="text-sm opacity-50">موردی یافت نشد.</li>
          ) : null}
        </ul>
        <p className="mt-3 text-xs opacity-50">{selected.length} نفر انتخاب شده</p>
      </section>

      <form
        onSubmit={onSend}
        className="space-y-3 rounded-3xl border border-[#0f1a1c]/10 bg-white p-5 dark:border-white/10 dark:bg-[#0f1618]"
      >
        <label className="block text-sm">
          <span className="mb-1 block opacity-60">متن پیامک</span>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            className="w-full rounded-md border border-[#0f1a1c]/15 bg-transparent px-3 py-2 dark:border-white/15"
          />
        </label>
        {error ? <p className="text-sm text-psy-error">{error}</p> : null}
        {notice ? <p className="text-sm text-teal-800 dark:text-teal-300">{notice}</p> : null}
        <button
          type="submit"
          disabled={send.isPending}
          className="rounded-md bg-[#0f1a1c] px-4 py-2 text-sm text-white disabled:opacity-60 dark:bg-teal-700"
        >
          {send.isPending ? "در حال ارسال…" : "ارسال"}
        </button>
      </form>

      <section className="space-y-3">
        <h2 className="font-medium">تاریخچه</h2>
        {historyQuery.isLoading ? (
          <p className="text-sm opacity-60">در حال بارگذاری…</p>
        ) : null}
        {historyQuery.isError ? (
          <p className="text-sm text-psy-error">خطا در دریافت تاریخچه</p>
        ) : null}
        <div className="overflow-x-auto rounded-3xl border border-[#0f1a1c]/10 bg-white dark:border-white/10 dark:bg-[#0f1618]">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="border-b border-[#0f1a1c]/10 text-right opacity-60 dark:border-white/10">
              <tr>
                <th className="px-4 py-3 font-medium">زمان</th>
                <th className="px-4 py-3 font-medium">شماره</th>
                <th className="px-4 py-3 font-medium">هدف</th>
                <th className="px-4 py-3 font-medium">وضعیت</th>
                <th className="px-4 py-3 font-medium">متن</th>
              </tr>
            </thead>
            <tbody>
              {(historyQuery.data?.results ?? []).map((row) => (
                <tr key={row.id} className="border-t border-[#0f1a1c]/8 dark:border-white/8">
                  <td className="px-4 py-3 whitespace-nowrap">
                    {formatJalaliDateTime(row.created_at)}
                  </td>
                  <td className="px-4 py-3" dir="ltr">
                    {row.phone}
                  </td>
                  <td className="px-4 py-3">{PURPOSE_LABEL[row.purpose] ?? row.purpose}</td>
                  <td className="px-4 py-3">{STATUS_LABEL[row.status] ?? row.status}</td>
                  <td className="px-4 py-3 opacity-75">{snippet(row.body)}</td>
                </tr>
              ))}
              {!historyQuery.isLoading && !(historyQuery.data?.results.length) ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center opacity-50">
                    هنوز پیامکی ثبت نشده است.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
        {historyQuery.data && historyQuery.data.count > historyQuery.data.page_size ? (
          <div className="flex items-center gap-3 text-sm">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-md border border-[#0f1a1c]/15 px-3 py-1 disabled:opacity-40 dark:border-white/15"
            >
              قبلی
            </button>
            <span className="opacity-60">صفحه {page}</span>
            <button
              type="button"
              disabled={
                page * historyQuery.data.page_size >= historyQuery.data.count
              }
              onClick={() => setPage((p) => p + 1)}
              className="rounded-md border border-[#0f1a1c]/15 px-3 py-1 disabled:opacity-40 dark:border-white/15"
            >
              بعدی
            </button>
          </div>
        ) : null}
      </section>
    </div>
  );
}
