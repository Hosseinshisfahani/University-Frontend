"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { formatIrr } from "@/features/finance/types";
import {
  formatJalaliDate,
  formatJalaliFriendly,
  formatJalaliFriendlyDate,
  formatJalaliParts,
  formatJalaliTime,
} from "@/lib/datetime/jalali";
import { useWallet } from "@/features/finance/hooks";
import {
  useAppointment,
  useBookAppointment,
  useCancelAppointment,
  useConfirmAppointmentPayment,
  useMyAppointments,
  useSubmitAppointmentReview,
  useTherapistSlots,
  useTherapists,
} from "@/app/(institutes)/(psy_institute)/_shared/use-psy";
import type { Appointment, AppointmentSlot, Therapist } from "@/app/(institutes)/(psy_institute)/_shared/types";
import {
  appointmentStatusLabel as statusLabel,
  isOpenAppointmentStatus,
  reviewTextStatusLabel,
} from "@/app/(institutes)/(psy_institute)/_shared/helpers";

function dayRange(daysAhead: number) {
  const now = Date.now();
  return {
    from: new Date(now).toISOString().slice(0, 10),
    to: new Date(now + daysAhead * 86400000).toISOString().slice(0, 10),
  };
}

function slotDurationMinutes(slot: AppointmentSlot) {
  return Math.round(
    (new Date(slot.ends_at).getTime() - new Date(slot.starts_at).getTime()) /
      60_000,
  );
}

export function AppointmentsListClient() {
  const { data, isLoading } = useMyAppointments();
  const cancel = useCancelAppointment();
  const [now] = useState(() => Date.now());

  const upcoming = useMemo(
    () =>
      (data ?? []).filter(
        (a) =>
          new Date(a.starts_at).getTime() >= now &&
          isOpenAppointmentStatus(a.status),
      ),
    [data, now],
  );
  const past = useMemo(
    () =>
      (data ?? []).filter(
        (a) =>
          new Date(a.starts_at).getTime() < now ||
          !isOpenAppointmentStatus(a.status),
      ),
    [data, now],
  );

  async function onCancel(appt: Appointment) {
    if (!confirm("آیا از لغو این نوبت مطمئن هستید؟")) return;
    await cancel.mutateAsync({ id: appt.id });
  }

  if (isLoading) return <p className="text-foreground/50">در حال بارگذاری…</p>;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="title gradient-text text-3xl font-extrabold">نوبت‌های من</h1>
          <p className="mt-2 text-sm text-foreground/60">نوبت‌های آینده و گذشته</p>
        </div>
        <Link
          href="/patient/appointments/book"
          className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-[#332B1A]"
        >
          رزرو نوبت جدید
        </Link>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-bold">آینده</h2>
        {!upcoming.length ? (
          <p className="text-sm text-foreground/50">نوبت آینده‌ای ندارید.</p>
        ) : (
          upcoming.map((a) => (
            <AppointmentCard key={a.id} appt={a} onCancel={() => onCancel(a)} />
          ))
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold">گذشته / سایر</h2>
        {!past.length ? (
          <p className="text-sm text-foreground/50">سابقه‌ای نیست.</p>
        ) : (
          past.map((a) => <AppointmentCard key={a.id} appt={a} />)
        )}
      </section>
    </div>
  );
}

function AppointmentWhen({
  startsAt,
  endsAt,
}: {
  startsAt: string;
  endsAt?: string;
}) {
  const parts = formatJalaliParts(startsAt);
  if (!parts) return <p className="text-sm text-foreground/50">—</p>;
  const endTime = endsAt ? formatJalaliTime(endsAt) : null;

  return (
    <div className="flex min-w-[6.5rem] shrink-0 flex-col items-center rounded-xl border border-primary/25 bg-primary/10 px-3 py-2 text-center">
      <span className="text-xs font-medium text-foreground/60">{parts.weekday}</span>
      <span className="mt-0.5 text-2xl font-extrabold leading-none">{parts.day}</span>
      <span className="mt-1 text-xs font-medium">{parts.month}</span>
      <span className="text-[11px] text-foreground/50">{parts.year}</span>
      <span className="mt-2 whitespace-nowrap rounded-full bg-background/80 px-2 py-0.5 text-[11px] font-semibold tabular-nums">
        {endTime && endTime !== "—" ? `${parts.time}–${endTime}` : parts.time}
      </span>
    </div>
  );
}

function AppointmentCard({
  appt,
  onCancel,
}: {
  appt: Appointment;
  onCancel?: () => void;
}) {
  return (
    <div className="rounded-xl border border-foreground/10 bg-white/60 p-4 dark:bg-[#121212]/70">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-4">
          <AppointmentWhen startsAt={appt.starts_at} endsAt={appt.ends_at} />
          <div className="min-w-0 pt-0.5">
            <Link
              href={`/patient/appointments/${appt.id}`}
              className="font-bold hover:text-primary"
            >
              {appt.therapist_name} — {appt.session_type_name}
            </Link>
            <p className="mt-1 text-sm">
              {statusLabel(appt.status)} · {formatIrr(appt.price_snapshot)}
            </p>
            {appt.refund_policy_applied ? (
              <p className="mt-1 text-xs text-foreground/50">
                سیاست بازپرداخت: {appt.refund_policy_applied}
              </p>
            ) : null}
          </div>
        </div>
        {onCancel && isOpenAppointmentStatus(appt.status) ? (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-red-500/40 px-3 py-1.5 text-sm text-red-700 dark:text-red-300"
          >
            لغو
          </button>
        ) : null}
      </div>
    </div>
  );
}

export function BookAppointmentClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectId = Number(searchParams.get("therapist") || 0);
  const { data: therapists } = useTherapists();
  const { data: wallet } = useWallet();
  const [manualTherapist, setManualTherapist] = useState<Therapist | null>(null);
  const [sessionTypeId, setSessionTypeId] = useState<number | "">("");
  const [selectedSlot, setSelectedSlot] = useState<AppointmentSlot | null>(null);
  const [pendingAppt, setPendingAppt] = useState<Appointment | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [{ from, to }] = useState(() => dayRange(14));

  const preselected = useMemo(
    () => (therapists ?? []).find((t) => t.id === preselectId) ?? null,
    [therapists, preselectId],
  );
  const therapist = manualTherapist ?? preselected;
  const offers = (therapist?.offers ?? []).filter((o) => o.is_active);
  const selectedType = offers.find((o) => o.session_type.id === sessionTypeId)?.session_type;

  const { data: slots, isLoading: slotsLoading } = useTherapistSlots(
    therapist?.id ?? null,
    { from, to },
  );

  const groupedSlots = useMemo(() => {
    const groups: { dateKey: string; label: string; items: AppointmentSlot[] }[] =
      [];
    const index = new Map<string, number>();
    for (const slot of slots ?? []) {
      const dateKey = formatJalaliDate(slot.starts_at);
      let i = index.get(dateKey);
      if (i === undefined) {
        i = groups.length;
        index.set(dateKey, i);
        groups.push({
          dateKey,
          label: formatJalaliFriendlyDate(slot.starts_at),
          items: [],
        });
      }
      groups[i].items.push(slot);
    }
    return groups;
  }, [slots]);

  const book = useBookAppointment();
  const confirm = useConfirmAppointmentPayment();

  async function holdSlot(slot: AppointmentSlot) {
    if (!sessionTypeId) {
      setError("نوع جلسه را انتخاب کنید.");
      return;
    }
    setError(null);
    setSelectedSlot(slot);
    try {
      const appt = await book.mutateAsync({
        slotId: slot.id,
        sessionTypeId: Number(sessionTypeId),
      });
      setPendingAppt(appt);
    } catch {
      setError("رزرو موقت نوبت ناموفق بود. ممکن است این زمان خالی گرفته شده باشد.");
    }
  }

  async function confirmPay() {
    if (!pendingAppt) return;
    setError(null);
    const price = Number(pendingAppt.price_snapshot);
    const balance = Number(wallet?.balance ?? 0);
    if (balance < price) {
      setError("موجودی کیف پول کافی نیست. ابتدا شارژ کنید.");
      return;
    }
    try {
      const key =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `appt-${pendingAppt.id}-${Date.now()}`;
      await confirm.mutateAsync({
        id: pendingAppt.id,
        paymentRef: "wallet",
        idempotencyKey: key,
      });
      // Soft navigate — keep the in-memory auth session (hard reload was
      // bouncing patients to /login via PatientGuard before bootstrap finished).
      router.replace("/patient/appointments");
    } catch {
      setError("تأیید پرداخت از کیف پول ناموفق بود.");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="title gradient-text text-3xl font-extrabold">رزرو نوبت</h1>
        <p className="mt-2 text-sm text-foreground/60">
          درمانگر و زمان را انتخاب کنید، نوع جلسه را مشخص کنید، سپس از کیف پول پرداخت کنید.
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="font-bold">۱. درمانگر</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {(therapists ?? []).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                setManualTherapist(t);
                setSelectedSlot(null);
                setSessionTypeId("");
                setPendingAppt(null);
              }}
              className={`rounded-xl border p-4 text-right transition ${
                therapist?.id === t.id
                  ? "border-primary bg-primary/10"
                  : "border-foreground/10 hover:border-primary/40"
              }`}
            >
              <div className="font-bold">{t.display_name}</div>
              <p className="mt-1 line-clamp-2 text-sm text-foreground/60">{t.bio}</p>
            </button>
          ))}
        </div>
      </section>

      {therapist ? (
        <section className="space-y-3">
          <h2 className="font-bold">۲. زمان‌های آزاد</h2>
          {slotsLoading ? (
            <p className="text-sm text-foreground/50">در حال بارگذاری زمان‌های خالی…</p>
          ) : !groupedSlots.length ? (
            <p className="text-sm text-foreground/50">زمان خالی در دو هفته آینده نیست.</p>
          ) : (
            <div className="space-y-5">
              {groupedSlots.map((group) => (
                <div key={group.dateKey} className="space-y-2">
                  <h3 className="text-sm font-bold text-foreground/80">
                    {group.label}
                  </h3>
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {group.items.map((slot) => {
                      const start = formatJalaliTime(slot.starts_at);
                      const end = formatJalaliTime(slot.ends_at);
                      return (
                        <button
                          key={slot.id}
                          type="button"
                          onClick={() => {
                            setPendingAppt(null);
                            setSelectedSlot(slot);
                            const minutes = slotDurationMinutes(slot);
                            if (
                              sessionTypeId &&
                              !offers.some(
                                (o) =>
                                  o.session_type.id === sessionTypeId &&
                                  o.session_type.duration_minutes <= minutes,
                              )
                            ) {
                              setSessionTypeId("");
                            }
                          }}
                          className={`rounded-xl border px-3 py-3 text-right ${
                            selectedSlot?.id === slot.id
                              ? "border-primary bg-primary/15"
                              : "border-foreground/10 hover:border-primary/40"
                          }`}
                        >
                          <div className="text-base font-bold tabular-nums">
                            {end !== "—" ? `${start} تا ${end}` : start}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      ) : null}

      {therapist && selectedSlot && !pendingAppt ? (
        <section className="space-y-3">
          <h2 className="font-bold">۳. نوع جلسه</h2>
          {!offers.length ? (
            <p className="text-sm text-foreground/50">
              این درمانگر نوع جلسه‌ای برای رزرو تعریف نکرده است.
            </p>
          ) : (
            <>
              <select
                className="rounded-lg border border-foreground/15 bg-background px-3 py-2 text-sm"
                value={sessionTypeId}
                onChange={(e) =>
                  setSessionTypeId(e.target.value ? Number(e.target.value) : "")
                }
              >
                <option value="">انتخاب نوع جلسه…</option>
                {offers.map((o) => {
                  const type = o.session_type;
                  const fits =
                    type.duration_minutes <= slotDurationMinutes(selectedSlot);
                  return (
                    <option key={type.id} value={type.id} disabled={!fits}>
                      {type.name} — {formatIrr(type.price)}
                      {fits ? "" : " (در این بازه جا نمی‌شود)"}
                    </option>
                  );
                })}
              </select>
              {selectedType ? (
                <p className="text-sm text-foreground/60">
                  مبلغ این جلسه: {formatIrr(selectedType.price)} ·{" "}
                  {selectedType.duration_minutes} دقیقه
                </p>
              ) : null}
              <button
                type="button"
                onClick={() => holdSlot(selectedSlot)}
                disabled={!sessionTypeId || book.isPending}
                className="rounded-lg bg-primary px-5 py-3 text-sm font-medium text-[#332B1A] disabled:opacity-60"
              >
                {book.isPending ? "در حال رزرو موقت…" : "رزرو موقت این زمان"}
              </button>
            </>
          )}
        </section>
      ) : null}

      {pendingAppt ? (
        <section className="space-y-3 rounded-2xl border border-primary/30 p-5">
          <h2 className="font-bold">۴. تأیید و پرداخت از کیف پول</h2>
          <p className="text-sm text-foreground/70">
            {formatJalaliFriendly(pendingAppt.starts_at)} · {pendingAppt.session_type_name}
          </p>
          <p className="text-sm">
            مبلغ: <strong>{formatIrr(pendingAppt.price_snapshot)}</strong>
          </p>
          <p className="text-sm">
            موجودی کیف پول: <strong>{formatIrr(wallet?.balance ?? 0)}</strong>
          </p>
          {Number(wallet?.balance ?? 0) < Number(pendingAppt.price_snapshot) ? (
            <Link
              href="/patient/wallet"
              className="inline-block text-sm font-medium text-primary underline"
            >
              موجودی کافی نیست — شارژ کیف پول
            </Link>
          ) : (
            <button
              type="button"
              onClick={confirmPay}
              disabled={confirm.isPending}
              className="rounded-lg bg-primary px-5 py-3 text-sm font-medium text-[#332B1A] disabled:opacity-60"
            >
              {confirm.isPending ? "در حال تأیید…" : "تأیید و کسر از کیف پول"}
            </button>
          )}
        </section>
      ) : null}

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}

export function AppointmentDetailClient({ id }: { id: number }) {
  const { data: item, isLoading } = useAppointment(id);
  const cancel = useCancelAppointment();

  if (isLoading) return <p>در حال بارگذاری…</p>;
  if (!item) return <p>نوبت پیدا نشد.</p>;

  const canJoin =
    item.session_type_modality === "online" && Boolean(item.meeting_link);

  return (
    <div className="space-y-4">
      <h1 className="title gradient-text text-3xl font-extrabold">جزئیات نوبت</h1>
      <div className="rounded-2xl border border-foreground/10 p-5">
        <p className="font-bold">
          {item.therapist_name} — {item.session_type_name}
        </p>
        <p className="mt-2 text-sm text-foreground/70">
          {formatJalaliFriendly(item.starts_at)}
          {item.ends_at ? ` تا ${formatJalaliTime(item.ends_at)}` : ""}
        </p>
        <p className="mt-2 text-sm">{statusLabel(item.status)}</p>
        <p className="mt-2 text-sm">{formatIrr(item.price_snapshot)}</p>
        {item.session_type_modality === "online" || item.meeting_link ? (
          <div className="mt-4 space-y-2">
            <p className="text-sm font-medium">لینک جلسه آنلاین</p>
            {canJoin ? (
              <>
                <p className="break-all text-sm text-foreground/70">{item.meeting_link}</p>
                <a
                  href={item.meeting_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex rounded-lg bg-primary px-5 py-3 text-sm font-medium text-[#332B1A]"
                >
                  ورود به جلسه آنلاین
                </a>
              </>
            ) : (
              <p className="text-sm text-foreground/55">
                لینک جلسه هنوز توسط مدیریت ثبت نشده است.
              </p>
            )}
          </div>
        ) : null}
        {isOpenAppointmentStatus(item.status) ? (
          <button
            type="button"
            className="mt-4 block rounded-lg border border-red-500/40 px-4 py-2 text-sm text-red-700"
            onClick={() => {
              if (confirm("لغو نوبت؟")) cancel.mutate({ id: item.id });
            }}
          >
            لغو نوبت
          </button>
        ) : null}
      </div>
      {item.status === "completed" ? <PatientReviewPanel appointment={item} /> : null}
      <Link href="/patient/appointments" className="text-sm text-primary underline">
        بازگشت به لیست
      </Link>
    </div>
  );
}

function PatientReviewPanel({ appointment }: { appointment: Appointment }) {
  const submit = useSubmitAppointmentReview();
  const [rating, setRating] = useState(appointment.review?.rating ?? 0);
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const review = appointment.review;

  async function onSubmit() {
    if (rating < 1) {
      setError("امتیاز را انتخاب کنید.");
      return;
    }
    setError(null);
    try {
      await submit.mutateAsync({
        id: appointment.id,
        rating,
        body: body.trim() || undefined,
      });
    } catch {
      setError("ثبت نظر ناموفق بود.");
    }
  }

  if (review) {
    return (
      <section className="rounded-2xl border border-foreground/10 p-5">
        <h2 className="font-bold">نظر شما</h2>
        <p className="mt-2 text-lg text-amber-600" dir="ltr">
          {"★".repeat(review.rating)}
          {"☆".repeat(5 - review.rating)}
        </p>
        {review.body ? (
          <p className="mt-3 text-sm leading-7">{review.body}</p>
        ) : null}
        {review.text_status === "pending" ? (
          <p className="mt-2 text-sm text-foreground/60">
            نظر شما در انتظار تأیید است
          </p>
        ) : review.text_status === "rejected" ? (
          <p className="mt-2 text-sm text-foreground/60">
            متن نظر تأیید نشد. امتیاز شما ثبت شده است.
          </p>
        ) : review.text_status === "approved" ? (
          <p className="mt-2 text-sm text-foreground/60">
            {reviewTextStatusLabel(review.text_status)}
          </p>
        ) : null}
      </section>
    );
  }

  return (
    <section className="space-y-3 rounded-2xl border border-foreground/10 p-5">
      <h2 className="font-bold">امتیاز به درمانگر</h2>
      <p className="text-sm text-foreground/60">
        امتیاز بلافاصله ثبت می‌شود. متن نظر پس از تأیید مدیریت منتشر می‌شود.
      </p>
      <div className="flex gap-1" dir="ltr">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            className={`text-2xl ${star <= rating ? "text-amber-500" : "text-foreground/25"}`}
            aria-label={`${star} ستاره`}
          >
            ★
          </button>
        ))}
      </div>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="نظر اختیاری…"
        className="min-h-24 w-full rounded-lg border border-foreground/15 bg-background px-3 py-2 text-sm"
      />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button
        type="button"
        disabled={submit.isPending}
        onClick={onSubmit}
        className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-[#332B1A] disabled:opacity-60"
      >
        {submit.isPending ? "در حال ثبت…" : "ثبت امتیاز"}
      </button>
    </section>
  );
}
