"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { formatIrr } from "@/features/finance/types";
import {
  formatJalaliDateTime,
  formatJalaliFriendlyDate,
  formatJalaliTime,
  formatJalaliTimeRange,
  toApiDate,
} from "@/lib/datetime/jalali";
import JalaliDatePicker from "@/app/(institutes)/(psy_institute)/_shared/jalali-date-picker";
import {
  useAdminAppointments,
  useAdminBookAppointment,
  useAdminCancelAppointment,
  useAdminPatients,
  useAdminSlots,
  useAdminTherapists,
  useAdminTherapistOffers,
  useAdminMoveAppointment,
  useAdminSetMeetingLink,
} from "@/app/(institutes)/(psy_institute)/_shared/use-psy-admin";
import { useParams, useRouter } from "next/navigation";
import { useAppointment, useCompleteAppointment, useTherapistSlots } from "@/app/(institutes)/(psy_institute)/_shared/use-psy";
import { appointmentStatusLabel as statusLabel, canCompleteAppointment, isOpenAppointmentStatus, refundPolicyLabel, sessionModalityLabel } from "@/app/(institutes)/(psy_institute)/_shared/helpers";
import type { AdminBookPayment } from "@/app/(institutes)/(psy_institute)/_shared/types";

const STATUS_FILTERS = [
  "",
  "confirmed",
  "pending_payment",
  "canceled_by_admin",
  "canceled_by_patient",
  "canceled_by_therapist",
  "completed",
  "no_show",
] as const;

export function AdminAgendaClient() {
  const [page, setPage] = useState(1);
  const [therapist, setTherapist] = useState<number | undefined>();
  const [status, setStatus] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const { data: therapists } = useAdminTherapists({ page: 1 });
  const filters = useMemo(
    () => ({
      page,
      page_size: 25,
      therapist,
      status: status || undefined,
      from: from || undefined,
      to: to || undefined,
    }),
    [page, therapist, status, from, to],
  );
  const { data, isLoading, isError } = useAdminAppointments(filters);
  const cancel = useAdminCancelAppointment();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="title text-2xl font-bold">نوبت‌های کلینیک</h1>
        <p className="mt-1 text-sm text-[#0f1a1c]/55 dark:text-white/50">
          مانیتورینگ تمام نوبت‌ها — ثبت نوبت برای مراجع و لغو ادمین
        </p>
      </div>

      <RegisterAppointmentForm />

      <div className="flex flex-wrap items-end gap-3 rounded-lg border border-[#0f1a1c]/10 bg-white p-4 dark:border-white/10 dark:bg-[#0f1618]">
        <label className="text-sm">
          <span className="mb-1 block text-[#0f1a1c]/55 dark:text-white/50">درمانگر</span>
          <select
            className="rounded-md border border-[#0f1a1c]/15 bg-transparent px-2 py-2 dark:border-white/15"
            value={therapist ?? ""}
            onChange={(e) => {
              setPage(1);
              setTherapist(e.target.value ? Number(e.target.value) : undefined);
            }}
          >
            <option value="">همه</option>
            {(therapists?.results ?? []).map((t) => (
              <option key={t.id} value={t.id}>
                {t.display_name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-[#0f1a1c]/55 dark:text-white/50">وضعیت</span>
          <select
            className="rounded-md border border-[#0f1a1c]/15 bg-transparent px-2 py-2 dark:border-white/15"
            value={status}
            onChange={(e) => {
              setPage(1);
              setStatus(e.target.value);
            }}
          >
            {STATUS_FILTERS.map((value) => (
              <option key={value || "all"} value={value}>
                {value ? statusLabel(value) : "همه وضعیت‌ها"}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-[#0f1a1c]/55 dark:text-white/50">از تاریخ</span>
          <JalaliDatePicker
            value={from}
            onChange={(v) => {
              setPage(1);
              setFrom(v);
            }}
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-[#0f1a1c]/55 dark:text-white/50">تا تاریخ</span>
          <JalaliDatePicker
            value={to}
            onChange={(v) => {
              setPage(1);
              setTo(v);
            }}
          />
        </label>
      </div>

      {isLoading ? <p className="text-sm opacity-60">در حال بارگذاری…</p> : null}
      {isError ? <p className="text-sm text-red-600">خطا در دریافت نوبت‌ها</p> : null}

      <ul className="space-y-2">
        {(data?.results ?? []).map((a) => (
          <li
            key={a.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#0f1a1c]/10 bg-white px-4 py-3 dark:border-white/10 dark:bg-[#0f1618]"
          >
            <Link
              href={`/admin/appointments/${a.id}`}
              className="min-w-0 flex-1 hover:underline"
            >
              <div className="font-medium">
                {a.patient_name ?? `مراجع #${a.patient}`}
                <span className="font-normal text-[#0f1a1c]/55 dark:text-white/50">
                  {" "}
                  · {a.therapist_name} · {a.session_type_name}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="text-xs text-[#0f1a1c]/55 dark:text-white/50">
                  {formatJalaliFriendlyDate(a.starts_at)}
                  <span className="mx-1.5 opacity-40">·</span>
                  ساعت {formatJalaliTime(a.starts_at)}
                </span>
                <span className="rounded-md bg-[#0f1a1c]/6 px-2 py-1 text-xs font-medium text-[#0f1a1c]/70 dark:bg-white/8 dark:text-white/70">
                  {statusLabel(a.status)}
                </span>
                <span className="rounded-md bg-[#0f1a1c]/6 px-2 py-1 text-xs font-medium text-[#0f1a1c]/70 dark:bg-white/8 dark:text-white/70">
                  {formatIrr(a.price_snapshot)}
                </span>
              </div>
            </Link>
            {isOpenAppointmentStatus(a.status) ? (
              <button
                type="button"
                className="text-sm text-red-600"
                disabled={cancel.isPending}
                onClick={() => {
                  const reason = window.prompt(
                    "دلیل لغو (بازپرداخت کامل برای نوبت تأییدشده):",
                    "لغو توسط ادمین",
                  );
                  if (reason == null) return;
                  cancel.mutate({ id: a.id, reason });
                }}
              >
                لغو ادمین
              </button>
            ) : null}
          </li>
        ))}
        {!isLoading && !(data?.results?.length) ? (
          <li className="text-sm opacity-50">نوبتی یافت نشد.</li>
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
            صفحه {data.page} از {Math.ceil(data.count / data.page_size)}
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

function RegisterAppointmentForm() {
  const { data: therapists } = useAdminTherapists({ page: 1 });
  const [patientQ, setPatientQ] = useState("");
  const { data: patients } = useAdminPatients(patientQ, 1);
  const [patientId, setPatientId] = useState<number | "">("");
  const [therapistId, setTherapistId] = useState<number | "">("");
  const [slotId, setSlotId] = useState<number | "">("");
  const [sessionTypeId, setSessionTypeId] = useState<number | "">("");
  const [payment, setPayment] = useState<AdminBookPayment>("pending");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const book = useAdminBookAppointment();
  const range = useMemo(() => {
    const from = toApiDate(new Date());
    const end = new Date();
    end.setDate(end.getDate() + 21);
    return { from, to: toApiDate(end) };
  }, []);
  const { data: slots } = useAdminSlots({
    therapist: typeof therapistId === "number" ? therapistId : undefined,
    from: range.from,
    to: range.to,
    status: "open",
    enabled: typeof therapistId === "number",
  });
  const { data: offers } = useAdminTherapistOffers(
    typeof therapistId === "number" ? therapistId : 0,
  );
  const offeredTypes = (offers ?? [])
    .filter((o) => o.is_active)
    .map((o) => o.session_type);

  return (
    <form
      className="space-y-3 rounded-lg border border-[#0f1a1c]/10 bg-white p-4 dark:border-white/10 dark:bg-[#0f1618]"
      onSubmit={async (e) => {
        e.preventDefault();
        setError(null);
        setMessage(null);
        if (!patientId || !slotId || !sessionTypeId) return;
        try {
          const appt = await book.mutateAsync({
            patient_id: Number(patientId),
            slot_id: Number(slotId),
            session_type_id: Number(sessionTypeId),
            payment,
          });
          setMessage(`نوبت #${appt.id} ثبت شد.`);
          setSlotId("");
        } catch (err) {
          setError(err instanceof Error ? err.message : "ثبت نوبت ناموفق بود.");
        }
      }}
    >
      <h2 className="font-bold">ثبت نوبت برای مراجع</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="text-sm sm:col-span-2">
          <span className="mb-1 block opacity-60">جستجوی مراجع</span>
          <input
            value={patientQ}
            onChange={(e) => setPatientQ(e.target.value)}
            placeholder="نام، نام کاربری یا تلفن"
            className="w-full rounded-md border border-[#0f1a1c]/15 bg-transparent px-2 py-2 dark:border-white/15"
          />
        </label>
        <label className="text-sm sm:col-span-2">
          <span className="mb-1 block opacity-60">مراجع</span>
          <select
            required
            className="w-full rounded-md border border-[#0f1a1c]/15 bg-transparent px-2 py-2 dark:border-white/15"
            value={patientId}
            onChange={(e) =>
              setPatientId(e.target.value ? Number(e.target.value) : "")
            }
          >
            <option value="">انتخاب…</option>
            {(patients?.results ?? []).map((p) => (
              <option key={p.id} value={p.id}>
                {p.display_name} {p.phone ? `· ${p.phone}` : ""}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-1 block opacity-60">درمانگر</span>
          <select
            required
            className="w-full rounded-md border border-[#0f1a1c]/15 bg-transparent px-2 py-2 dark:border-white/15"
            value={therapistId}
            onChange={(e) => {
              setTherapistId(e.target.value ? Number(e.target.value) : "");
              setSlotId("");
              setSessionTypeId("");
            }}
          >
            <option value="">انتخاب…</option>
            {(therapists?.results ?? []).map((t) => (
              <option key={t.id} value={t.id}>
                {t.display_name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-1 block opacity-60">زمان خالی</span>
          <select
            required
            className="w-full rounded-md border border-[#0f1a1c]/15 bg-transparent px-2 py-2 dark:border-white/15"
            value={slotId}
            onChange={(e) =>
              setSlotId(e.target.value ? Number(e.target.value) : "")
            }
            disabled={typeof therapistId !== "number"}
          >
            <option value="">انتخاب…</option>
            {(slots ?? []).map((s) => (
              <option key={s.id} value={s.id}>
                {formatJalaliDateTime(s.starts_at)}
                {s.ends_at ? ` تا ${formatJalaliTime(s.ends_at)}` : ""}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-1 block opacity-60">نوع جلسه</span>
          <select
            required
            className="w-full rounded-md border border-[#0f1a1c]/15 bg-transparent px-2 py-2 dark:border-white/15"
            value={sessionTypeId}
            onChange={(e) =>
              setSessionTypeId(e.target.value ? Number(e.target.value) : "")
            }
            disabled={typeof therapistId !== "number"}
          >
            <option value="">انتخاب…</option>
            {offeredTypes.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.duration_minutes} دقیقه)
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-1 block opacity-60">پرداخت</span>
          <select
            className="w-full rounded-md border border-[#0f1a1c]/15 bg-transparent px-2 py-2 dark:border-white/15"
            value={payment}
            onChange={(e) => setPayment(e.target.value as AdminBookPayment)}
          >
            <option value="pending">در انتظار کیف پول مراجع</option>
            <option value="wallet">برداشت از کیف پول</option>
            <option value="offline">پرداخت حضوری (بدون کیف پول)</option>
          </select>
        </label>
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {message ? <p className="text-sm text-teal-700 dark:text-teal-300">{message}</p> : null}
      <button
        type="submit"
        disabled={book.isPending}
        className="rounded-md bg-teal-800 px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
      >
        {book.isPending ? "در حال ثبت…" : "ثبت نوبت"}
      </button>
    </form>
  );
}


export function AdminAppointmentDetailClient() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);
  const { data: appt, isLoading } = useAppointment(id);
  const cancel = useAdminCancelAppointment();
  const move = useAdminMoveAppointment();
  const complete = useCompleteAppointment();
  const setLink = useAdminSetMeetingLink();
  const [slotId, setSlotId] = useState("");
  const [meetingLink, setMeetingLink] = useState<string | null>(null);
  const [linkSaved, setLinkSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const range = useMemo(() => {
    const from = toApiDate(new Date());
    const end = new Date();
    end.setDate(end.getDate() + 21);
    return { from, to: toApiDate(end) };
  }, []);

  const { data: slots } = useTherapistSlots(appt?.therapist ?? null, {
    from: range.from,
    to: range.to,
  });

  const openSlots = (slots ?? []).filter((s) => s.status === "open");

  if (isLoading || !appt) {
    return <p className="text-sm opacity-60">در حال بارگذاری…</p>;
  }

  const canAct = isOpenAppointmentStatus(appt.status);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link href="/admin/appointments" className="text-sm text-teal-700 dark:text-teal-300">
        ← بازگشت به فهرست
      </Link>
      <div>
        <h1 className="title text-2xl font-bold">نوبت #{appt.id}</h1>
        <p className="mt-1 text-sm opacity-60">
          {formatJalaliTimeRange(appt.starts_at, appt.ends_at)}
        </p>
      </div>

      <dl className="grid gap-3 rounded-lg border border-[#0f1a1c]/10 bg-white p-5 text-sm dark:border-white/10 dark:bg-[#0f1618] sm:grid-cols-2">
        <div>
          <dt className="opacity-50">مراجع</dt>
          <dd className="font-medium">
            <Link
              href={`/admin/users/patients/${appt.patient}`}
              className="hover:underline"
            >
              {appt.patient_name ?? `#${appt.patient}`}
            </Link>
          </dd>
        </div>
        <div>
          <dt className="opacity-50">درمانگر</dt>
          <dd className="font-medium">{appt.therapist_name}</dd>
        </div>
        <div>
          <dt className="opacity-50">نوع جلسه</dt>
          <dd>
            {appt.session_type_name} ({sessionModalityLabel(appt.session_type_modality)})
          </dd>
        </div>
        <div>
          <dt className="opacity-50">وضعیت</dt>
          <dd>{statusLabel(appt.status)}</dd>
        </div>
        <div>
          <dt className="opacity-50">مبلغ</dt>
          <dd>{formatIrr(appt.price_snapshot)}</dd>
        </div>
        <div>
          <dt className="opacity-50">لینک جلسه</dt>
          <dd className="break-all">{appt.meeting_link || "هنوز ثبت نشده"}</dd>
        </div>
        {appt.refund_policy_applied ? (
          <div>
            <dt className="opacity-50">سیاست بازپرداخت</dt>
            <dd>{refundPolicyLabel(appt.refund_policy_applied)}</dd>
          </div>
        ) : null}
        {appt.cancellation_reason ? (
          <div className="sm:col-span-2">
            <dt className="opacity-50">دلیل لغو</dt>
            <dd>{appt.cancellation_reason}</dd>
          </div>
        ) : null}
      </dl>

      {appt.session_type_modality === "online" || appt.meeting_link ? (
        <form
          className="space-y-3 rounded-lg border border-[#0f1a1c]/10 bg-white p-5 dark:border-white/10 dark:bg-[#0f1618]"
          onSubmit={async (e) => {
            e.preventDefault();
            setError(null);
            setLinkSaved(false);
            try {
              await setLink.mutateAsync({
                id: appt.id,
                meetingLink: (meetingLink ?? appt.meeting_link ?? "").trim(),
              });
              setLinkSaved(true);
            } catch (err) {
              setError(
                err instanceof Error ? err.message : "ذخیره لینک جلسه ناموفق بود.",
              );
            }
          }}
        >
          <h2 className="font-bold">لینک جلسه آنلاین</h2>
          <p className="text-sm opacity-60">
            لینک Google Meet یا سرویس مشابه را برای درمانگر و مراجع قرار دهید.
          </p>
          <input
            type="url"
            value={meetingLink ?? appt.meeting_link ?? ""}
            onChange={(e) => {
              setMeetingLink(e.target.value);
              setLinkSaved(false);
            }}
            placeholder="https://meet.google.com/..."
            className="w-full rounded-md border border-[#0f1a1c]/15 bg-transparent px-3 py-2 text-sm dark:border-white/15"
          />
          {linkSaved ? (
            <p className="text-sm text-teal-700 dark:text-teal-300">ذخیره شد.</p>
          ) : null}
          <button
            type="submit"
            disabled={setLink.isPending}
            className="rounded-md bg-[#0f1a1c] px-4 py-2 text-sm font-medium text-white disabled:opacity-40 dark:bg-teal-700"
          >
            {setLink.isPending ? "در حال ذخیره…" : "ذخیره لینک"}
          </button>
        </form>
      ) : null}

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      {canCompleteAppointment(appt.status, appt.ends_at) ? (
        <button
          type="button"
          disabled={complete.isPending}
          className="rounded-md bg-[#0f1a1c] px-4 py-2 text-sm text-white disabled:opacity-40 dark:bg-teal-700"
          onClick={async () => {
            setError(null);
            try {
              await complete.mutateAsync(appt.id);
            } catch (e) {
              setError(e instanceof Error ? e.message : "خطا در تکمیل نوبت");
            }
          }}
        >
          انجام شد
        </button>
      ) : null}

      {canAct ? (
        <div className="space-y-4 rounded-lg border border-red-500/20 bg-red-500/5 p-5">
          <h2 className="font-bold">عملیات ادمین</h2>
          <button
            type="button"
            disabled={cancel.isPending}
            className="rounded-md bg-red-700 px-4 py-2 text-sm text-white"
            onClick={async () => {
              setError(null);
              const reason = window.prompt(
                "دلیل لغو (نوبت تأییدشده → بازپرداخت کامل):",
                "لغو توسط ادمین",
              );
              if (reason == null) return;
              try {
                await cancel.mutateAsync({ id: appt.id, reason });
                router.refresh();
              } catch (e) {
                setError(e instanceof Error ? e.message : "خطا در لغو");
              }
            }}
          >
            لغو اجباری / بازپرداخت
          </button>

          <div className="space-y-2 border-t border-[#0f1a1c]/10 pt-4 dark:border-white/10">
            <h3 className="text-sm font-semibold">جابه‌جایی به زمان خالی</h3>
            <select
              className="w-full rounded-md border border-[#0f1a1c]/15 bg-transparent px-2 py-2 text-sm dark:border-white/15"
              value={slotId}
              onChange={(e) => setSlotId(e.target.value)}
            >
              <option value="">انتخاب زمان جدید…</option>
              {openSlots.map((s) => (
                <option key={s.id} value={s.id}>
                  {formatJalaliDateTime(s.starts_at)}
                </option>
              ))}
            </select>
            <button
              type="button"
              disabled={!slotId || move.isPending}
              className="rounded-md bg-[#0f1a1c] px-4 py-2 text-sm text-white disabled:opacity-40 dark:bg-teal-700"
              onClick={async () => {
                setError(null);
                try {
                  await move.mutateAsync({
                    id: appt.id,
                    newSlotId: Number(slotId),
                  });
                  setSlotId("");
                  router.refresh();
                } catch (e) {
                  setError(e instanceof Error ? e.message : "خطا در جابه‌جایی");
                }
              }}
            >
              جابه‌جایی نوبت
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
