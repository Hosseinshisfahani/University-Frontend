"use client";

import DatePicker from "react-multi-date-picker";
import TimePicker from "react-multi-date-picker/plugins/time_picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import type { Value } from "react-multi-date-picker";

type Props = {
  /** Local wall time, `YYYY-MM-DDTHH:mm`, same shape as datetime-local. */
  value: string;
  onChange: (localDateTime: string) => void;
  required?: boolean;
  inputClass?: string;
};

function parseLocalDateTime(value: string): Date | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function toLocalDateTime(value: Date): string {
  const y = value.getFullYear();
  const m = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  const h = String(value.getHours()).padStart(2, "0");
  const min = String(value.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${day}T${h}:${min}`;
}

/** Shamsi date and time. The stored value stays a local Gregorian datetime for the API. */
export default function JalaliDateTimePicker({
  value,
  onChange,
  required,
  inputClass,
}: Props) {
  return (
    <DatePicker
      value={parseLocalDateTime(value) as Value}
      onChange={(date) => {
        if (!date || Array.isArray(date)) {
          onChange("");
          return;
        }
        const jsDate = date.toDate?.() ?? null;
        onChange(jsDate ? toLocalDateTime(jsDate) : "");
      }}
      calendar={persian}
      locale={persian_fa}
      format="YYYY/MM/DD HH:mm"
      calendarPosition="bottom-right"
      containerClassName="w-full"
      inputClass={
        inputClass ??
        "w-full rounded-md border border-[#1a2423]/15 bg-transparent px-2 py-2 text-sm dark:border-white/15"
      }
      required={required}
      plugins={[<TimePicker key="time" position="bottom" hideSeconds />]}
    />
  );
}
