"use client";

import Link from "next/link";
import { type FormEvent, useMemo, useState } from "react";
import { formatIrr } from "@/features/finance/types";
import {
  formatJalaliDateTime,
  formatJalaliFriendlyDate,
  formatJalaliTime,
  formatJalaliTimeRange,
} from "@/lib/datetime/jalali";
import {
  useAppointment,
  useCreateSessionNote,
  useDeleteSessionNote,
  useMyAppointments,
  useSessionNotes,
  useSetMeetingLink,
  useUpdateSessionNote,
} from "@/app/(institutes)/(psy_institute)/_shared/use-psy";
import type { Appointment, SessionNote } from "@/app/(institutes)/(psy_institute)/_shared/types";
import { appointmentStatusLabel as statusLabel, isOpenAppointmentStatus } from "@/app/(institutes)/(psy_institute)/_shared/helpers";

function AgendaList({
  title,
  items,
}: {
  title: string;
  items: Appointment[];
}) {
  return (
    <section className="space-y-3">
      <h2 className="font-bold">{title}</h2>
      <ul className="space-y-2">
        {items.map((a) => (
          <li
            key={a.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#1a2423]/10 bg-white px-4 py-3 dark:border-white/10 dark:bg-[#121818]"
          >
            <Link
              href={`/therapist/appointments/${a.id}`}
              className="min-w-0 flex-1 hover:underline"
            >
              <div className="font-medium">
                {a.session_type_name}
                <span className="font-normal text-[#1a2423]/55 dark:text-white/50">
                  {" "}
                  · {a.patient_name || `مراجع #${a.patient}`}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="text-xs text-[#1a2423]/55 dark:text-white/50">
                  {formatJalaliFriendlyDate(a.starts_at)}
                  <span className="mx-1.5 opacity-40">·</span>
                  ساعت {formatJalaliTime(a.starts_at)}
                  {a.ends_at ? ` تا ${formatJalaliTime(a.ends_at)}` : ""}
                </span>
                <span className="rounded-md bg-[#1a2423]/6 px-2 py-1 text-xs font-medium text-[#1a2423]/70 dark:bg-white/8 dark:text-white/70">
                  {statusLabel(a.status)}
                </span>
                <span className="rounded-md bg-[#1a2423]/6 px-2 py-1 text-xs font-medium text-[#1a2423]/70 dark:bg-white/8 dark:text-white/70">
                  {formatIrr(a.price_snapshot)}
                </span>
              </div>
            </Link>
          </li>
        ))}
        {!items.length ? (
          <li className="text-sm text-[#1a2423]/50">موردی نیست.</li>
        ) : null}
      </ul>
    </section>
  );
}

export function AppointmentsAgenda() {
  const { data, isLoading } = useMyAppointments();
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

  if (isLoading) return <p className="text-[#1a2423]/50">در حال بارگذاری…</p>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="title text-3xl font-extrabold">نوبت‌ها</h1>
        <p className="mt-2 text-sm text-[#1a2423]/55 dark:text-white/50">
          فهرست نوبت‌های ارجاع‌شده به شما. لغو نوبت فقط از پنل مدیریت انجام می‌شود.
        </p>
      </div>
      <AgendaList title="پیش‌رو" items={upcoming} />
      <AgendaList title="گذشته / لغوشده" items={past} />
    </div>
  );
}

function SessionNotesPanel({ appointmentId }: { appointmentId: number }) {
  const { data: notes } = useSessionNotes();
  const create = useCreateSessionNote();
  const update = useUpdateSessionNote();
  const remove = useDeleteSessionNote();
  const [body, setBody] = useState("");
  const [shared, setShared] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mine = useMemo(
    () => (notes ?? []).filter((n) => n.appointment === appointmentId),
    [notes, appointmentId],
  );

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!body.trim()) return;
    try {
      await create.mutateAsync({
        appointment: appointmentId,
        body: body.trim(),
        shared_with_patient: shared,
      });
      setBody("");
      setShared(false);
    } catch {
      setError("ثبت یادداشت ناموفق بود.");
    }
  }

  async function toggleShare(note: SessionNote) {
    await update.mutateAsync({
      id: note.id,
      data: { shared_with_patient: !note.shared_with_patient },
    });
  }

  return (
    <section className="space-y-4 rounded-lg border border-[#1a2423]/10 bg-white p-5 dark:border-white/10 dark:bg-[#121818]">
      <h2 className="font-bold">یادداشت جلسه</h2>
      <ul className="space-y-3">
        {mine.map((n) => (
          <li
            key={n.id}
            className="rounded-md border border-[#1a2423]/8 p-3 text-sm dark:border-white/10"
          >
            <p className="whitespace-pre-wrap leading-7">{n.body}</p>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-[#1a2423]/50 dark:text-white/40">
              <span>{formatJalaliDateTime(n.updated_at)}</span>
              <span>
                {n.shared_with_patient ? "اشتراک با مراجع" : "فقط درمانگر"}
              </span>
              <button
                type="button"
                className="text-[#1a2423] underline dark:text-primary"
                onClick={() => toggleShare(n)}
              >
                {n.shared_with_patient ? "لغو اشتراک" : "اشتراک با مراجع"}
              </button>
              <button
                type="button"
                className="text-red-600"
                onClick={() => {
                  if (confirm("حذف یادداشت؟")) remove.mutate(n.id);
                }}
              >
                حذف
              </button>
            </div>
          </li>
        ))}
        {!mine.length ? (
          <li className="text-sm text-[#1a2423]/50">یادداشتی نیست.</li>
        ) : null}
      </ul>

      <form onSubmit={onCreate} className="space-y-3 border-t border-[#1a2423]/8 pt-4 dark:border-white/10">
        <textarea
          required
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="متن یادداشت…"
          className="min-h-28 w-full rounded-md border border-[#1a2423]/15 bg-transparent px-3 py-2 text-sm dark:border-white/15"
        />
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={shared}
            onChange={(e) => setShared(e.target.checked)}
          />
          اشتراک با مراجع
        </label>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button
          type="submit"
          disabled={create.isPending}
          className="rounded-md bg-[#1a2423] px-4 py-2 text-sm font-medium text-white disabled:opacity-60 dark:bg-primary dark:text-[#332B1A]"
        >
          ثبت یادداشت
        </button>
      </form>
    </section>
  );
}

export function TherapistAppointmentDetail({ id }: { id: number }) {
  const { data: item, isLoading } = useAppointment(id);
  const setLink = useSetMeetingLink();
  const [meetingLink, setMeetingLink] = useState("");
  const [linkSaved, setLinkSaved] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);

  if (isLoading) return <p>در حال بارگذاری…</p>;
  if (!item) return <p>نوبت پیدا نشد.</p>;

  const linkValue = meetingLink || item.meeting_link || "";

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/therapist/appointments"
          className="text-sm text-[#1a2423]/55 underline dark:text-white/50"
        >
          بازگشت به فهرست
        </Link>
        <h1 className="title mt-3 text-3xl font-extrabold">جزئیات نوبت</h1>
      </div>

      <div className="rounded-lg border border-[#1a2423]/10 bg-white p-5 dark:border-white/10 dark:bg-[#121818]">
        <p className="font-bold">
          {item.session_type_name} · مراجع #{item.patient}
        </p>
        <p className="mt-2 text-sm">
          {formatJalaliTimeRange(item.starts_at, item.ends_at)}
        </p>
        <p className="mt-2 text-sm">{statusLabel(item.status)}</p>
        <p className="mt-2 text-sm">{formatIrr(item.price_snapshot)}</p>
      </div>

      {item.session_type_modality === "online" || item.meeting_link ? (
        <form
          className="space-y-3 rounded-lg border border-[#1a2423]/10 bg-white p-5 dark:border-white/10 dark:bg-[#121818]"
          onSubmit={async (e) => {
            e.preventDefault();
            setLinkError(null);
            setLinkSaved(false);
            try {
              await setLink.mutateAsync({
                id: item.id,
                meetingLink: linkValue.trim(),
              });
              setLinkSaved(true);
            } catch {
              setLinkError("ذخیره لینک جلسه ناموفق بود.");
            }
          }}
        >
          <h2 className="font-bold">لینک جلسه آنلاین</h2>
          <p className="text-sm text-[#1a2423]/55 dark:text-white/50">
            لینک Google Meet یا سرویس مشابه را برای مراجع قرار دهید.
          </p>
          <input
            type="url"
            value={linkValue}
            onChange={(e) => {
              setMeetingLink(e.target.value);
              setLinkSaved(false);
            }}
            placeholder="https://meet.google.com/..."
            className="w-full rounded-md border border-[#1a2423]/15 bg-transparent px-3 py-2 text-sm dark:border-white/15"
          />
          {linkError ? <p className="text-sm text-red-600">{linkError}</p> : null}
          {linkSaved ? (
            <p className="text-sm text-emerald-700 dark:text-emerald-400">ذخیره شد.</p>
          ) : null}
          <button
            type="submit"
            disabled={setLink.isPending}
            className="rounded-md bg-[#1a2423] px-4 py-2 text-sm font-medium text-white disabled:opacity-60 dark:bg-primary dark:text-[#332B1A]"
          >
            ذخیره لینک
          </button>
        </form>
      ) : null}

      <SessionNotesPanel appointmentId={item.id} />
    </div>
  );
}
