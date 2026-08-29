import { format as formatJalali } from "date-fns-jalali";
import { faIR } from "date-fns-jalali/locale";

/** Format an ISO/Date value as Jalali date+time for UI display. */
export function formatJalaliDateTime(
  value: string | Date | null | undefined,
): string {
  const d = toDate(value);
  if (!d) return "—";
  return formatJalali(d, "EEEE d MMMM yyyy، ساعت HH:mm", { locale: faIR });
}

/** Format an ISO/Date value as Jalali date only. */
export function formatJalaliDate(
  value: string | Date | null | undefined,
): string {
  if (!value) return "—";
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "—";
  return formatJalali(d, "yyyy/MM/dd", { locale: faIR });
}

function toDate(value: string | Date | null | undefined): Date | null {
  if (!value) return null;
  const d = typeof value === "string" ? new Date(value) : value;
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Clock time only, e.g. 11:00 */
export function formatJalaliTime(
  value: string | Date | null | undefined,
): string {
  const d = toDate(value);
  if (!d) return "—";
  return formatJalali(d, "HH:mm", { locale: faIR });
}

/** Parts for calendar-style appointment chips. */
export function formatJalaliParts(
  value: string | Date | null | undefined,
): {
  weekday: string;
  day: string;
  month: string;
  year: string;
  time: string;
} | null {
  const d = toDate(value);
  if (!d) return null;
  return {
    weekday: formatJalali(d, "EEEE", { locale: faIR }),
    day: formatJalali(d, "d", { locale: faIR }),
    month: formatJalali(d, "MMMM", { locale: faIR }),
    year: formatJalali(d, "yyyy", { locale: faIR }),
    time: formatJalali(d, "HH:mm", { locale: faIR }),
  };
}

/** Long readable date without time, e.g. سه‌شنبه ۳ شهریور ۱۴۰۵ */
export function formatJalaliFriendlyDate(
  value: string | Date | null | undefined,
): string {
  const d = toDate(value);
  if (!d) return "—";
  return formatJalali(d, "EEEE d MMMM yyyy", { locale: faIR });
}

/** Long readable datetime, e.g. سه‌شنبه ۳ شهریور ۱۴۰۵، ساعت ۱۱:۰۰ */
export function formatJalaliFriendly(
  value: string | Date | null | undefined,
): string {
  return formatJalaliDateTime(value);
}

/** Same-day range, e.g. سه‌شنبه ۳ شهریور ۱۴۰۵، ساعت ۱۱:۰۰ تا ۱۱:۴۵ */
export function formatJalaliTimeRange(
  start: string | Date | null | undefined,
  end?: string | Date | null,
): string {
  const startLabel = formatJalaliDateTime(start);
  if (startLabel === "—") return "—";
  const startDate = toDate(start);
  const endDate = toDate(end);
  if (!startDate || !endDate) return startLabel;
  const sameDay =
    formatJalali(startDate, "yyyyMMdd") === formatJalali(endDate, "yyyyMMdd");
  if (sameDay) {
    return `${startLabel} تا ${formatJalaliTime(endDate)}`;
  }
  return `${startLabel} تا ${formatJalaliDateTime(endDate)}`;
}

/** Convert picker Date to Django date string (Gregorian YYYY-MM-DD). */
export function toApiDate(value: Date | null | undefined): string {
  if (!value || Number.isNaN(value.getTime())) return "";
  const y = value.getFullYear();
  const m = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Parse API YYYY-MM-DD into a local Date at noon (avoids TZ edge cases). */
export function parseApiDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const d = new Date(`${value}T12:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}
