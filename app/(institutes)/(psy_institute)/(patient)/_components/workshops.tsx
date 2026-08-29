"use client";

import Link from "next/link";
import { formatIrr } from "@/features/finance/types";
import { formatJalaliFriendlyDate, formatJalaliTime } from "@/lib/datetime/jalali";
import { useCancelWorkshopEnrollment, useMyWorkshopEnrollments, useWorkshop } from "@/app/(institutes)/(psy_institute)/_shared/use-psy";
import { workshopEnrollmentStatusLabel as statusLabel } from "@/app/(institutes)/(psy_institute)/_shared/helpers";
import { useParams } from "next/navigation";

export function PatientWorkshopsClient() {
  const { data, isLoading } = useMyWorkshopEnrollments();
  const cancel = useCancelWorkshopEnrollment();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="title text-2xl font-bold">کارگاه‌های من</h1>
          <p className="mt-1 text-sm opacity-55">ثبت‌نام‌ها و زمان‌بندی</p>
        </div>
        <Link
          href="/psy/workshops"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-[#332B1A]"
        >
          مشاهده کارگاه‌ها
        </Link>
      </div>

      {isLoading ? <p className="text-sm opacity-60">در حال بارگذاری…</p> : null}

      <ul className="space-y-3">
        {(data ?? []).map((e) => (
          <li
            key={e.id}
            className="rounded-xl border border-foreground/10 bg-white/70 p-4 dark:bg-[#121212]/80"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <Link
                  href={`/psy/workshops/${e.workshop_slug}`}
                  className="font-bold hover:underline"
                >
                  {e.workshop_title}
                </Link>
                <p className="mt-1 text-sm opacity-55">
                  {e.instructor_name ?? "—"} · {statusLabel(e.status)} ·{" "}
                  {Number(e.price_snapshot) === 0
                    ? "رایگان"
                    : formatIrr(e.price_snapshot)}
                </p>
                {e.workshop_starts_at ? (
                  <div className="mt-3 inline-flex flex-wrap items-center gap-x-3 gap-y-1 rounded-full border border-foreground/10 bg-foreground/[0.04] px-3 py-1.5 text-sm">
                    <span className="text-[11px] font-medium tracking-wide text-foreground/45">
                      شروع کارگاه
                    </span>
                    <span className="font-semibold">
                      {formatJalaliFriendlyDate(e.workshop_starts_at)}
                    </span>
                    <span className="tabular-nums text-foreground/65">
                      ساعت {formatJalaliTime(e.workshop_starts_at)}
                    </span>
                  </div>
                ) : null}
              </div>
              {["active", "pending_payment"].includes(e.status) ? (
                <button
                  type="button"
                  className="text-sm text-red-600"
                  disabled={cancel.isPending}
                  onClick={() => {
                    const reason = window.prompt("دلیل لغو (اختیاری):", "") ?? "";
                    cancel.mutate({
                      slug: e.workshop_slug,
                      enrollmentId: e.id,
                      reason,
                    });
                  }}
                >
                  لغو ثبت‌نام
                </button>
              ) : null}
            </div>
          </li>
        ))}
        {!isLoading && !(data?.length) ? (
          <li className="text-sm opacity-50">هنوز در کارگاهی ثبت‌نام نکرده‌اید.</li>
        ) : null}
      </ul>
    </div>
  );
}


export function WorkshopCertificateClient() {
  const params = useParams();
  const slug = String(params.slug || "");
  const { data: w, isLoading, isError } = useWorkshop(slug);

  if (isLoading) return <p className="p-8 text-sm opacity-60">در حال بارگذاری…</p>;
  if (isError || !w?.certificate) {
    return (
      <div className="space-y-3 p-8">
        <p className="text-red-600">گواهی یافت نشد. ابتدا همه جلسات را تکمیل و گواهی را صادر کنید.</p>
        <Link href={`/psy/workshops/${slug}`} className="text-teal-700 underline">
          بازگشت به کارگاه
        </Link>
      </div>
    );
  }

  const cert = w.certificate;

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-8 print:p-0">
      <div className="flex justify-between print:hidden">
        <Link href={`/psy/workshops/${slug}`} className="text-sm text-teal-700">
          ← کارگاه
        </Link>
        <button
          type="button"
          className="rounded-md bg-[#0f1a1c] px-4 py-2 text-sm text-white"
          onClick={() => window.print()}
        >
          چاپ
        </button>
      </div>
      <div className="rounded-2xl border-2 border-[#0f1a1c]/20 bg-white p-10 text-center shadow-sm">
        <p className="text-sm tracking-widest text-[#0f1a1c]/50">گواهی پایان دوره</p>
        <h1 className="title mt-4 text-3xl font-bold">{w.title}</h1>
        <p className="mt-6 text-lg">
          این گواهی تأیید می‌کند که شرکت‌کننده دوره را با موفقیت به پایان رسانده است.
        </p>
        <p className="mt-8 font-mono text-sm">کد: {cert.certificate_code}</p>
        <p className="mt-2 text-sm opacity-60">
          تاریخ صدور: {formatJalaliFriendlyDate(cert.issued_at)}
        </p>
        {w.instructor_name ? (
          <p className="mt-6 text-sm">مدرس: {w.instructor_name}</p>
        ) : null}
      </div>
    </div>
  );
}
