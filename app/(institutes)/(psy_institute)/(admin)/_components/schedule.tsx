"use client";

import Link from "next/link";
import { type FormEvent, useMemo, useState } from "react";
import JalaliDatePicker from "@/app/(institutes)/(psy_institute)/_shared/jalali-date-picker";
import { ApiError } from "@/lib/api/client";
import {
  formatJalaliDate,
  formatJalaliFriendlyDate,
  formatJalaliTime,
  toApiDate,
} from "@/lib/datetime/jalali";
import {
  useCreateSessionType,
  useSessionTypes,
} from "@/app/(institutes)/(psy_institute)/_shared/use-psy";
import {
  useAdminTherapistAvailability,
  useAdminTherapistExceptions,
  useAdminTherapistOffers,
  useAdminSlots,
  useAdminTherapists,
  useCreateAdminAvailability,
  useCreateAdminException,
  useCreateAdminOffer,
  useCreateAdminSlot,
  useDeleteAdminAvailability,
  useDeleteAdminException,
  useDeleteAdminOffer,
  useDeleteAdminSlot,
  useRegenerateSlots,
  useUpdateAdminOffer,
} from "@/app/(institutes)/(psy_institute)/_shared/use-psy-admin";
import { slotStatusLabel } from "@/app/(institutes)/(psy_institute)/_shared/helpers";
import type { AdminAppointmentSlot } from "@/app/(institutes)/(psy_institute)/_shared/types";

const WEEKDAYS = [
  { value: 5, label: "شنبه" },
  { value: 6, label: "یکشنبه" },
  { value: 0, label: "دوشنبه" },
  { value: 1, label: "سه‌شنبه" },
  { value: 2, label: "چهارشنبه" },
  { value: 3, label: "پنجشنبه" },
  { value: 4, label: "جمعه" },
];

function weekdayLabel(n: number) {
  return WEEKDAYS.find((w) => w.value === n)?.label ?? String(n);
}

function persianWeekdayRank(n: number) {
  const i = WEEKDAYS.findIndex((d) => d.value === n);
  return i < 0 ? 99 : i;
}

function firstApiError(err: unknown, fallback: string): string {
  if (!(err instanceof ApiError) || !err.body || typeof err.body !== "object") {
    return fallback;
  }
  const body = err.body as Record<string, unknown>;
  for (const key of ["weekday", "detail", "non_field_errors"]) {
    const value = body[key];
    if (typeof value === "string" && value) return value;
    if (Array.isArray(value) && value[0]) return String(value[0]);
  }
  return fallback;
}

function startOfPersianWeek(d: Date): Date {
  const diff = (d.getDay() + 1) % 7;
  const start = new Date(d);
  start.setDate(d.getDate() - diff);
  start.setHours(12, 0, 0, 0);
  return start;
}

function addDays(d: Date, n: number): Date {
  const next = new Date(d);
  next.setDate(d.getDate() + n);
  return next;
}

function localDateTimeToIso(apiDate: string, time: string): string {
  return new Date(`${apiDate}T${time}:00`).toISOString();
}

function addMinutesToLocal(apiDate: string, time: string, minutes: number): string {
  const d = new Date(`${apiDate}T${time}:00`);
  d.setMinutes(d.getMinutes() + minutes);
  return d.toISOString();
}

function slotTone(status: string): string {
  if (status === "open") return "border-teal-600/30 bg-teal-50 text-teal-900 dark:bg-teal-950/40 dark:text-teal-100";
  if (status === "held") return "border-amber-500/30 bg-amber-50 text-amber-950 dark:bg-amber-950/40 dark:text-amber-100";
  if (status === "booked") return "border-[#0f1a1c]/20 bg-[#0f1a1c]/5 dark:border-white/15 dark:bg-white/5";
  return "border-[#0f1a1c]/10 bg-[#0f1a1c]/4 text-[#0f1a1c]/55 dark:border-white/10 dark:text-white/45";
}

export default function ScheduleOpsClient() {
  const { data: therapists, isLoading: therapistsLoading } = useAdminTherapists({
    page: 1,
  });
  const [therapistId, setTherapistId] = useState<number | "">("");
  const [weekStart, setWeekStart] = useState(() => startOfPersianWeek(new Date()));
  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart],
  );
  const from = toApiDate(weekDays[0]);
  const to = toApiDate(weekDays[6]);
  const selectedId = typeof therapistId === "number" ? therapistId : 0;
  const { data: slots, isLoading: slotsLoading } = useAdminSlots({
    therapist: selectedId || undefined,
    from,
    to,
    enabled: selectedId > 0,
  });
  const selectedTherapist = (therapists?.results ?? []).find(
    (t) => t.id === therapistId,
  );

  const slotsByDay = useMemo(() => {
    const map = new Map<string, AdminAppointmentSlot[]>();
    for (const day of weekDays) map.set(toApiDate(day), []);
    for (const slot of slots ?? []) {
      const key = toApiDate(new Date(slot.starts_at));
      const list = map.get(key);
      if (list) list.push(slot);
    }
    return map;
  }, [slots, weekDays]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="title text-2xl font-bold">تقویم کلینیک</h1>
        <p className="mt-1 text-sm text-[#0f1a1c]/55 dark:text-white/50">
          انواع جلسه، قالب هفتگی، مسدودی‌ها، زمان خالی تکی، و ثبت تغییرات روی تقویم
        </p>
      </div>

      <div className="flex flex-wrap items-end gap-3 rounded-lg border border-[#0f1a1c]/10 bg-white p-4 dark:border-white/10 dark:bg-[#0f1618]">
        <label className="text-sm">
          <span className="mb-1 block opacity-60">درمانگر</span>
          <select
            className="rounded-md border border-[#0f1a1c]/15 bg-transparent px-2 py-2 dark:border-white/15"
            value={therapistId}
            onChange={(e) =>
              setTherapistId(e.target.value ? Number(e.target.value) : "")
            }
            disabled={therapistsLoading}
          >
            <option value="">انتخاب کنید…</option>
            {(therapists?.results ?? []).map((t) => (
              <option key={t.id} value={t.id}>
                {t.display_name}
                {t.is_active ? "" : " (غیرفعال)"}
              </option>
            ))}
          </select>
        </label>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-md border border-[#0f1a1c]/15 px-3 py-2 text-sm dark:border-white/15"
            onClick={() => setWeekStart((d) => addDays(d, -7))}
          >
            هفته قبل
          </button>
          <button
            type="button"
            className="rounded-md border border-[#0f1a1c]/15 px-3 py-2 text-sm dark:border-white/15"
            onClick={() => setWeekStart(startOfPersianWeek(new Date()))}
          >
            این هفته
          </button>
          <button
            type="button"
            className="rounded-md border border-[#0f1a1c]/15 px-3 py-2 text-sm dark:border-white/15"
            onClick={() => setWeekStart((d) => addDays(d, 7))}
          >
            هفته بعد
          </button>
        </div>
        <p className="text-sm opacity-60">
          {formatJalaliDate(weekDays[0])} تا {formatJalaliDate(weekDays[6])}
        </p>
      </div>

      {!selectedId ? (
        <p className="text-sm opacity-55">برای دیدن تقویم یک درمانگر انتخاب کنید.</p>
      ) : slotsLoading ? (
        <p className="text-sm opacity-60">در حال بارگذاری تقویم…</p>
      ) : (
        <div className="grid gap-3 md:grid-cols-7">
          {weekDays.map((day) => {
            const key = toApiDate(day);
            const daySlots = slotsByDay.get(key) ?? [];
            return (
              <section
                key={key}
                className="rounded-lg border border-[#0f1a1c]/10 bg-white p-3 dark:border-white/10 dark:bg-[#0f1618]"
              >
                <h2 className="text-sm font-bold">
                  {formatJalaliFriendlyDate(day)}
                </h2>
                <ul className="mt-2 space-y-1.5">
                  {daySlots.map((slot) => (
                    <SlotChip key={slot.id} slot={slot} />
                  ))}
                  {!daySlots.length ? (
                    <li className="text-xs opacity-45">زمانی نیست</li>
                  ) : null}
                </ul>
              </section>
            );
          })}
        </div>
      )}

      {selectedId ? (
        <>
          <OffersPanel therapistId={selectedId} />
          <AvailabilityPanel therapistId={selectedId} />
          <ExceptionsPanel therapistId={selectedId} />
          <CreateSlotPanel
            therapistId={selectedId}
            therapistName={selectedTherapist?.display_name ?? ""}
          />
          <RegeneratePanel
            therapistId={selectedId}
            therapistName={selectedTherapist?.display_name ?? ""}
            defaultFrom={from}
            defaultTo={to}
            openSlots14d={selectedTherapist?.open_slots_14d}
          />
        </>
      ) : null}
    </div>
  );
}

function SlotChip({ slot }: { slot: AdminAppointmentSlot }) {
  const remove = useDeleteAdminSlot();
  const boundType = slot.status === "open" ? null : slot.session_type;
  const label = boundType
    ? `${formatJalaliTime(slot.starts_at)} ${boundType.name}`
    : formatJalaliTime(slot.starts_at);
  const bookedHref =
    slot.appointment_id != null
      ? `/admin/appointments/${slot.appointment_id}`
      : null;

  if (bookedHref) {
    return (
      <li>
        <Link
          href={bookedHref}
          className={`block rounded-md border px-2 py-1.5 text-xs leading-5 ${slotTone(slot.status)}`}
        >
          {label}
          <span className="mt-0.5 block opacity-70">
            {slotStatusLabel(slot.status)}
            {slot.patient_name ? ` · ${slot.patient_name}` : ""}
          </span>
        </Link>
      </li>
    );
  }

  return (
    <li>
      <div
        className={`rounded-md border px-2 py-1.5 text-xs leading-5 ${slotTone(slot.status)}`}
      >
        <div className="flex items-start justify-between gap-1">
          <span>{label}</span>
          {slot.status === "open" ? (
            <button
              type="button"
              className="text-[11px] text-red-600"
              disabled={remove.isPending}
              onClick={() => {
                if (!confirm("حذف این زمان خالی؟")) return;
                remove.mutate(slot.id);
              }}
            >
              حذف
            </button>
          ) : null}
        </div>
        <span className="mt-0.5 block opacity-70">
          {slotStatusLabel(slot.status)}
        </span>
      </div>
    </li>
  );
}

function CreateSlotPanel({
  therapistId,
  therapistName,
}: {
  therapistId: number;
  therapistName: string;
}) {
  const create = useCreateAdminSlot();
  const [startDate, setStartDate] = useState(toApiDate(new Date()));
  const [startTime, setStartTime] = useState("09:00");
  const [duration, setDuration] = useState("45");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    const minutes = Number(duration);
    if (!startDate || !startTime || !minutes) return;
    try {
      await create.mutateAsync({
        therapist_id: therapistId,
        starts_at: localDateTimeToIso(startDate, startTime),
        ends_at: addMinutesToLocal(startDate, startTime, minutes),
      });
      setMessage("زمان خالی ایجاد شد.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "ایجاد زمان ناموفق بود.");
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-3 rounded-lg border border-[#0f1a1c]/10 bg-white p-5 dark:border-white/10 dark:bg-[#0f1618]"
    >
      <h2 className="font-bold">زمان خالی تکی</h2>
      <p className="text-sm opacity-55">
        یک بلوک زمانی عمومی برای {therapistName || "درمانگر"} بسازید. نوع جلسه هنگام رزرو انتخاب می‌شود.
      </p>
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="text-sm">
          <span className="mb-1 block opacity-60">تاریخ شروع</span>
          <JalaliDatePicker value={startDate} onChange={setStartDate} required />
        </label>
        <label className="text-sm">
          <span className="mb-1 block opacity-60">ساعت شروع</span>
          <input
            required
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full rounded-md border border-[#0f1a1c]/15 bg-transparent px-2 py-2 dark:border-white/15"
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block opacity-60">مدت (دقیقه)</span>
          <input
            required
            type="number"
            min={1}
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="w-full rounded-md border border-[#0f1a1c]/15 bg-transparent px-2 py-2 dark:border-white/15"
          />
        </label>
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {message ? <p className="text-sm text-teal-700 dark:text-teal-300">{message}</p> : null}
      <button
        type="submit"
        disabled={create.isPending}
        className="rounded-md bg-teal-800 px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
      >
        {create.isPending ? "در حال ایجاد…" : "ایجاد زمان خالی"}
      </button>
    </form>
  );
}

function RegeneratePanel({
  therapistId,
  therapistName,
  defaultFrom,
  defaultTo,
  openSlots14d,
}: {
  therapistId: number;
  therapistName: string;
  defaultFrom: string;
  defaultTo: string;
  openSlots14d?: number;
}) {
  const regen = useRegenerateSlots();
  const [from, setFrom] = useState(defaultFrom);
  const [to, setTo] = useState(defaultTo);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="space-y-3 rounded-lg border border-[#0f1a1c]/10 bg-white p-5 dark:border-white/10 dark:bg-[#0f1618]">
      <h2 className="font-bold">ثبت تغییرات هفتگی</h2>
      <p className="text-sm opacity-55">
        قالب ساعات، انواع جلسه و مسدودی‌ها را روی تقویم این بازه اعمال کنید.
      </p>
      {typeof openSlots14d === "number" ? (
        <p className="text-xs opacity-50">
          {new Intl.NumberFormat("fa-IR").format(openSlots14d)} زمان خالی در ۱۴ روز آینده
        </p>
      ) : null}
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm">
          <span className="mb-1 block opacity-60">از تاریخ</span>
          <JalaliDatePicker value={from} onChange={setFrom} required />
        </label>
        <label className="text-sm">
          <span className="mb-1 block opacity-60">تا تاریخ</span>
          <JalaliDatePicker value={to} onChange={setTo} required />
        </label>
      </div>
      <button
        type="button"
        disabled={!from || !to || regen.isPending}
        className="rounded-md bg-[#0f1a1c] px-4 py-2 text-sm font-medium text-white disabled:opacity-40 dark:bg-teal-700"
        onClick={async () => {
          setMessage(null);
          setError(null);
          if (
            !window.confirm(
              `تغییرات هفتگی «${therapistName}» از ${from} تا ${to} روی تقویم ثبت شود؟`,
            )
          ) {
            return;
          }
          try {
            const res = await regen.mutateAsync({
              therapist_id: therapistId,
              range_start: from,
              range_end: to,
            });
            setMessage(`${res.created} زمان خالی ایجاد/همگام شد.`);
          } catch (e) {
            setError(e instanceof Error ? e.message : "ثبت تغییرات ناموفق بود.");
          }
        }}
      >
        {regen.isPending ? "در حال ثبت…" : "ثبت تغییرات هفتگی"}
      </button>
      {message ? <p className="text-sm text-teal-700 dark:text-teal-300">{message}</p> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}

function OffersPanel({ therapistId }: { therapistId: number }) {
  const { data: types } = useSessionTypes();
  const { data: offers, isLoading } = useAdminTherapistOffers(therapistId);
  const createOffer = useCreateAdminOffer(therapistId);
  const update = useUpdateAdminOffer(therapistId);
  const remove = useDeleteAdminOffer(therapistId);
  const createType = useCreateSessionType();
  const [error, setError] = useState<string | null>(null);
  const [existingId, setExistingId] = useState<number | "">("");
  const [name, setName] = useState("");
  const [duration, setDuration] = useState("45");
  const [modality, setModality] = useState("in_person");
  const [price, setPrice] = useState("");
  const [buffer, setBuffer] = useState("0");

  const offeredIds = new Set((offers ?? []).map((o) => o.session_type.id));
  const unusedTypes = (types ?? []).filter(
    (t) => t.is_active && !offeredIds.has(t.id),
  );

  async function addExisting(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!existingId) return;
    try {
      await createOffer.mutateAsync({
        session_type_id: Number(existingId),
        is_active: true,
      });
      setExistingId("");
    } catch {
      setError("افزودن نوع جلسه ناموفق بود.");
    }
  }

  async function addNewType(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const durationMinutes = Number(duration);
    const bufferMinutes = Number(buffer || 0);
    if (!name.trim() || !durationMinutes || !price.trim()) return;
    try {
      const created = await createType.mutateAsync({
        name: name.trim(),
        modality,
        duration_minutes: durationMinutes,
        price: price.trim(),
        buffer_minutes: Number.isFinite(bufferMinutes) ? bufferMinutes : 0,
      });
      await createOffer.mutateAsync({
        session_type_id: created.id,
        is_active: true,
      });
      setName("");
      setDuration("45");
      setModality("in_person");
      setPrice("");
      setBuffer("0");
    } catch {
      setError("ثبت نوع جلسه جدید ناموفق بود.");
    }
  }

  return (
    <section className="space-y-4 rounded-lg border border-[#0f1a1c]/10 bg-white p-5 dark:border-white/10 dark:bg-[#0f1618]">
      <div>
        <h2 className="font-bold">انواع جلسه درمانگر</h2>
        <p className="mt-1 text-sm opacity-55">
          نوع‌های قابل رزرو این درمانگر؛ نوع جدید به فهرست کلینیک هم اضافه می‌شود
        </p>
      </div>
      {isLoading ? <p className="text-sm opacity-50">در حال بارگذاری…</p> : null}
      <ul className="space-y-2">
        {(offers ?? []).map((offer) => (
          <li
            key={offer.id}
            className="flex items-center justify-between gap-3 text-sm"
          >
            <span>
              {offer.session_type.name}
              <span className="opacity-50">
                {" "}
                · {offer.session_type.duration_minutes} دقیقه
                {!offer.is_active ? " · غیرفعال" : ""}
              </span>
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="rounded-md border border-[#0f1a1c]/15 px-3 py-1 text-xs dark:border-white/15"
                onClick={() =>
                  update.mutate({ id: offer.id, is_active: !offer.is_active })
                }
              >
                {offer.is_active ? "فعال" : "غیرفعال"}
              </button>
              <button
                type="button"
                className="text-xs text-red-600"
                onClick={() => remove.mutate(offer.id)}
              >
                حذف
              </button>
            </div>
          </li>
        ))}
        {!offers?.length && !isLoading ? (
          <li className="text-sm opacity-50">نوع جلسه‌ای ثبت نشده.</li>
        ) : null}
      </ul>

      <form onSubmit={addExisting} className="grid gap-3 sm:grid-cols-[1fr_auto]">
        <label className="text-sm">
          <span className="mb-1 block opacity-60">افزودن از انواع موجود</span>
          <select
            className="w-full rounded-md border border-[#0f1a1c]/15 bg-transparent px-2 py-2 dark:border-white/15"
            value={existingId}
            onChange={(e) =>
              setExistingId(e.target.value ? Number(e.target.value) : "")
            }
          >
            <option value="">انتخاب…</option>
            {unusedTypes.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.duration_minutes} دقیقه)
              </option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          disabled={!existingId || createOffer.isPending}
          className="self-end rounded-md border border-[#0f1a1c]/15 px-4 py-2 text-sm disabled:opacity-40 dark:border-white/15"
        >
          افزودن
        </button>
      </form>

      <form onSubmit={addNewType} className="grid gap-3 sm:grid-cols-2">
        <p className="sm:col-span-2 text-sm font-medium">نوع جلسه جدید</p>
        <label className="text-sm sm:col-span-2">
          <span className="mb-1 block opacity-60">نام</span>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-md border border-[#0f1a1c]/15 bg-transparent px-2 py-2 dark:border-white/15"
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block opacity-60">مدت (دقیقه)</span>
          <input
            required
            type="number"
            min={1}
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="w-full rounded-md border border-[#0f1a1c]/15 bg-transparent px-2 py-2 dark:border-white/15"
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block opacity-60">شیوه</span>
          <select
            className="w-full rounded-md border border-[#0f1a1c]/15 bg-transparent px-2 py-2 dark:border-white/15"
            value={modality}
            onChange={(e) => setModality(e.target.value)}
          >
            <option value="in_person">حضوری</option>
            <option value="online">آنلاین</option>
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-1 block opacity-60">قیمت (ریال)</span>
          <input
            required
            inputMode="numeric"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full rounded-md border border-[#0f1a1c]/15 bg-transparent px-2 py-2 dark:border-white/15"
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block opacity-60">فاصله بین جلسات (دقیقه)</span>
          <input
            type="number"
            min={0}
            value={buffer}
            onChange={(e) => setBuffer(e.target.value)}
            className="w-full rounded-md border border-[#0f1a1c]/15 bg-transparent px-2 py-2 dark:border-white/15"
          />
        </label>
        <button
          type="submit"
          disabled={createType.isPending || createOffer.isPending}
          className="rounded-md bg-[#0f1a1c] px-4 py-2 text-sm font-medium text-white disabled:opacity-40 dark:bg-teal-700"
        >
          {createType.isPending || createOffer.isPending
            ? "در حال ثبت…"
            : "ثبت نوع جدید"}
        </button>
      </form>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </section>
  );
}

function AvailabilityPanel({ therapistId }: { therapistId: number }) {
  const { data, isLoading } = useAdminTherapistAvailability(therapistId);
  const create = useCreateAdminAvailability(therapistId);
  const remove = useDeleteAdminAvailability(therapistId);
  const usedWeekdays = new Set((data ?? []).map((row) => row.weekday));
  const freeDays = WEEKDAYS.filter((d) => !usedWeekdays.has(d.value));
  const [weekday, setWeekday] = useState(5);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("14:00");
  const [validFrom, setValidFrom] = useState(toApiDate(new Date()));
  const [error, setError] = useState<string | null>(null);
  const selectedWeekday = freeDays.some((d) => d.value === weekday)
    ? weekday
    : (freeDays[0]?.value ?? 5);
  const rows = [...(data ?? [])].sort(
    (a, b) =>
      persianWeekdayRank(a.weekday) - persianWeekdayRank(b.weekday) ||
      a.start_time.localeCompare(b.start_time),
  );

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!freeDays.length) {
      setError("برای هر روز فقط یک بازه مجاز است.");
      return;
    }
    try {
      await create.mutateAsync({
        weekday: selectedWeekday,
        start_time: startTime,
        end_time: endTime,
        valid_from: validFrom,
        timezone: "Asia/Tehran",
        is_active: true,
      });
      setWeekday(freeDays.find((d) => d.value !== selectedWeekday)?.value ?? 5);
    } catch (err) {
      setError(firstApiError(err, "ثبت ساعات هفتگی ناموفق بود."));
    }
  }

  return (
    <section className="space-y-4 rounded-lg border border-[#0f1a1c]/10 bg-white p-5 dark:border-white/10 dark:bg-[#0f1618]">
      <div>
        <h2 className="font-bold">قالب ساعات هفتگی</h2>
        <p className="mt-1 text-sm opacity-55">
          برای هر روز هفته فقط یک بازه؛ با «ثبت تغییرات هفتگی» به زمان خالی تبدیل می‌شود
        </p>
      </div>
      {isLoading ? <p className="text-sm opacity-50">در حال بارگذاری…</p> : null}
      <ul className="space-y-2 text-sm">
        {rows.map((row) => (
          <li
            key={row.id}
            className="flex items-center justify-between gap-3 rounded-md border border-[#0f1a1c]/8 px-3 py-2 dark:border-white/10"
          >
            <span>
              {weekdayLabel(row.weekday)} {row.start_time.slice(0, 5)}–{row.end_time.slice(0, 5)}
              {!row.is_active ? " (غیرفعال)" : ""}
            </span>
            <button
              type="button"
              className="text-xs text-red-600"
              onClick={() => remove.mutate(row.id)}
            >
              حذف
            </button>
          </li>
        ))}
        {!data?.length && !isLoading ? (
          <li className="opacity-50">قالبی ثبت نشده.</li>
        ) : null}
      </ul>
      {freeDays.length ? (
      <form onSubmit={onSubmit} className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm">
          <span className="mb-1 block opacity-60">روز</span>
          <select
            className="w-full rounded-md border border-[#0f1a1c]/15 bg-transparent px-2 py-2 dark:border-white/15"
            value={selectedWeekday}
            onChange={(e) => setWeekday(Number(e.target.value))}
          >
            {freeDays.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-1 block opacity-60">از تاریخ اعتبار</span>
          <JalaliDatePicker value={validFrom} onChange={setValidFrom} required />
        </label>
        <label className="text-sm">
          <span className="mb-1 block opacity-60">شروع</span>
          <input
            type="time"
            required
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full rounded-md border border-[#0f1a1c]/15 bg-transparent px-2 py-2 dark:border-white/15"
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block opacity-60">پایان</span>
          <input
            type="time"
            required
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-full rounded-md border border-[#0f1a1c]/15 bg-transparent px-2 py-2 dark:border-white/15"
          />
        </label>
        {error ? <p className="sm:col-span-2 text-sm text-red-600">{error}</p> : null}
        <button
          type="submit"
          disabled={create.isPending}
          className="rounded-md bg-[#0f1a1c] px-4 py-2 text-sm font-medium text-white disabled:opacity-40 dark:bg-teal-700"
        >
          افزودن بازه
        </button>
      </form>
      ) : (
        <p className="text-sm opacity-55">هر هفت روز یک بازه دارد. برای تغییر، بازه قبلی را حذف کنید.</p>
      )}
    </section>
  );
}

function ExceptionsPanel({ therapistId }: { therapistId: number }) {
  const { data, isLoading } = useAdminTherapistExceptions(therapistId);
  const create = useCreateAdminException(therapistId);
  const remove = useDeleteAdminException(therapistId);
  const [date, setDate] = useState(toApiDate(new Date()));
  const [allDay, setAllDay] = useState(true);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("12:00");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await create.mutateAsync({
        date,
        is_day_off: allDay,
        start_time: allDay ? null : startTime,
        end_time: allDay ? null : endTime,
        reason,
      });
      setReason("");
    } catch {
      setError("ثبت مسدودی ناموفق بود.");
    }
  }

  return (
    <section className="space-y-4 rounded-lg border border-[#0f1a1c]/10 bg-white p-5 dark:border-white/10 dark:bg-[#0f1618]">
      <div>
        <h2 className="font-bold">مسدودی‌های تقویم</h2>
        <p className="mt-1 text-sm opacity-55">
          بستن یک روز یا بازه، جدا از درخواست مرخصی درمانگر
        </p>
      </div>
      {isLoading ? <p className="text-sm opacity-50">در حال بارگذاری…</p> : null}
      <ul className="space-y-2 text-sm">
        {(data ?? []).map((row) => (
          <li
            key={row.id}
            className="flex items-center justify-between gap-3 rounded-md border border-[#0f1a1c]/8 px-3 py-2 dark:border-white/10"
          >
            <span>
              {formatJalaliDate(row.date)}
              {row.is_day_off
                ? " · تمام‌روز"
                : ` · ${row.start_time ?? ""}–${row.end_time ?? ""}`}
              {row.reason ? ` · ${row.reason}` : ""}
            </span>
            <button
              type="button"
              className="text-xs text-red-600"
              onClick={() => remove.mutate(row.id)}
            >
              حذف
            </button>
          </li>
        ))}
        {!data?.length && !isLoading ? (
          <li className="opacity-50">مسدودی ثبت نشده.</li>
        ) : null}
      </ul>
      <form onSubmit={onSubmit} className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm sm:col-span-2">
          <span className="mb-1 block opacity-60">تاریخ</span>
          <JalaliDatePicker value={date} onChange={setDate} required />
        </label>
        <label className="flex items-center gap-2 text-sm sm:col-span-2">
          <input
            type="checkbox"
            checked={allDay}
            onChange={(e) => setAllDay(e.target.checked)}
          />
          تمام‌روز
        </label>
        {!allDay ? (
          <>
            <label className="text-sm">
              <span className="mb-1 block opacity-60">از ساعت</span>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full rounded-md border border-[#0f1a1c]/15 bg-transparent px-2 py-2 dark:border-white/15"
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block opacity-60">تا ساعت</span>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full rounded-md border border-[#0f1a1c]/15 bg-transparent px-2 py-2 dark:border-white/15"
              />
            </label>
          </>
        ) : null}
        <label className="text-sm sm:col-span-2">
          <span className="mb-1 block opacity-60">دلیل (اختیاری)</span>
          <input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full rounded-md border border-[#0f1a1c]/15 bg-transparent px-2 py-2 dark:border-white/15"
          />
        </label>
        {error ? <p className="sm:col-span-2 text-sm text-red-600">{error}</p> : null}
        <button
          type="submit"
          disabled={create.isPending}
          className="rounded-md bg-[#0f1a1c] px-4 py-2 text-sm font-medium text-white disabled:opacity-40 dark:bg-teal-700"
        >
          افزودن مسدودی
        </button>
      </form>
    </section>
  );
}
