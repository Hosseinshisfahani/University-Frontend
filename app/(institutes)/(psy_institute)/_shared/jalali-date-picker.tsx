"use client";

import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import type { Value } from "react-multi-date-picker";
import { parseApiDate, toApiDate } from "@/lib/datetime/jalali";

type Props = {
  value: string;
  onChange: (apiDate: string) => void;
  required?: boolean;
  className?: string;
  inputClass?: string;
};

/** Shamsi date picker; value/onChange use Gregorian YYYY-MM-DD for the API. */
export default function JalaliDatePicker({
  value,
  onChange,
  required,
  className,
  inputClass,
}: Props) {
  const selected = parseApiDate(value);

  return (
    <div className={className}>
      <DatePicker
        value={selected as Value}
        onChange={(date) => {
          if (!date) {
            onChange("");
            return;
          }
          const jsDate = Array.isArray(date)
            ? null
            : date.toDate?.() ?? null;
          onChange(jsDate ? toApiDate(jsDate) : "");
        }}
        calendar={persian}
        locale={persian_fa}
        calendarPosition="bottom-right"
        containerClassName="w-full"
        inputClass={
          inputClass ??
          "w-full rounded-md border border-[#1a2423]/15 bg-transparent px-2 py-2 text-sm dark:border-white/15"
        }
        required={required}
        format="YYYY/MM/DD"
      />
    </div>
  );
}
