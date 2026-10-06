"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  useTherapistPublicReviews,
  useTherapists,
} from "@/app/(institutes)/(psy_institute)/_shared/use-psy";
import { formatStarAverage } from "@/app/(institutes)/(psy_institute)/_shared/helpers";
import type { Therapist } from "@/app/(institutes)/(psy_institute)/_shared/types";
import { formatJalaliFriendlyDate } from "@/lib/datetime/jalali";
import { useAuthStore } from "@/features/auth/store";
import { isPsyPatient } from "@/features/auth/types";

const SERVICE_FILTERS: Record<
  string,
  { title: string; keywords: string[] }
> = {
  academic: {
    title: "مشاوره تحصیلی",
    keywords: ["تحصیلی", "استعداد", "روان‌سنجی", "کنکور"],
  },
  career: {
    title: "مشاوره شغلی",
    keywords: ["شغلی", "حرفه‌ای", "بازار کار", "توسعه فردی"],
  },
  premarital: {
    title: "مشاوره پیش از ازدواج",
    keywords: ["پیش از ازدواج", "ازدواج", "زوج", "روابط"],
  },
  family: {
    title: "مشاوره خانواده",
    keywords: ["خانواده", "والد", "روابط", "زوج"],
  },
  psychotherapy: {
    title: "روان‌درمانی",
    keywords: [
      "روان‌درمانی",
      "بالینی",
      "اضطراب",
      "افسردگی",
      "وسواس",
      "تروما",
    ],
  },
  divorce: {
    title: "مشاوره طلاق",
    keywords: ["طلاق", "زوج", "خانواده", "روابط"],
  },
  individual: {
    title: "مشاوره فردی",
    keywords: ["فردی", "اضطراب", "افسردگی", "مهارت‌های مقابله‌ای", "خودشناسی"],
  },
  "child-adolescent": {
    title: "مشاوره کودک و نوجوان",
    keywords: ["کودک", "نوجوان", "فرزندپروری", "بازی‌درمانی"],
  },
  psychiatry: {
    title: "روان‌پزشکی و دارودرمانی",
    keywords: ["روان‌پزشکی", "اعصاب و روان", "دارودرمانی"],
  },
  nutrition: {
    title: "مشاوره تغذیه و رژیم‌درمانی",
    keywords: ["تغذیه", "رژیم", "وزن"],
  },
  sports: {
    title: "مشاوره ورزشی",
    keywords: ["ورزشی", "ورزش", "عملکرد ورزشی"],
  },
  cultural: {
    title: "مشاوره فرهنگی و اعتقادی",
    keywords: ["فرهنگی", "اعتقادی", "مذهبی", "معنوی"],
  },
  legal: {
    title: "مشاوره حقوقی",
    keywords: ["حقوقی", "حقوق", "قانونی"],
  },
};

function normalizeSearchText(value: string) {
  return value
    .replaceAll("ي", "ی")
    .replaceAll("ك", "ک")
    .replaceAll("\u200c", " ")
    .toLocaleLowerCase("fa-IR");
}

function therapistMatchesService(
  therapist: {
    bio: string;
    specialties: string[];
  },
  keywords: string[],
) {
  const searchable = normalizeSearchText(
    [therapist.bio, ...(therapist.specialties ?? [])].join(" "),
  );
  return keywords.some((keyword) =>
    searchable.includes(normalizeSearchText(keyword)),
  );
}

function getTherapistImageSrc(therapist: Therapist) {
  const raw =
    therapist.avatarUrl ??
    therapist.profileImage ??
    therapist.avatar_url ??
    therapist.profile_image;

  if (!raw) return null;

  try {
    const url = new URL(raw);
    if (url.pathname.startsWith("/media/")) {
      return `${url.pathname}${url.search}`;
    }
  } catch {
    return raw.startsWith("/") ? raw : null;
  }

  return null;
}

function initialsFor(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join("") || "آ"
  );
}

function TherapistAvatar({
  therapist,
  size = "md",
}: {
  therapist: Therapist;
  size?: "md" | "lg" | "xl";
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const imageSrc = imageFailed ? null : getTherapistImageSrc(therapist);
  const sizes = {
    md: "h-20 w-20 text-2xl",
    lg: "h-28 w-28 text-3xl",
    xl: "h-32 w-32 text-4xl sm:h-36 sm:w-36",
  };

  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-full border border-white/70 bg-[var(--psy-mist)] shadow-lg shadow-[var(--psy-persian-blue)]/10 ${sizes[size]}`}
      aria-label={`تصویر ${therapist.display_name}`}
    >
      {imageSrc ? (
        <Image
          src={imageSrc}
          alt={therapist.display_name}
          fill
          unoptimized
          sizes={
            size === "xl"
              ? "(max-width: 640px) 128px, 144px"
              : size === "lg"
                ? "112px"
                : "80px"
          }
          className="object-cover"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[var(--psy-persian-blue)] via-[var(--psy-turquoise)] to-[var(--psy-gold)] font-bold text-white">
          {initialsFor(therapist.display_name)}
        </div>
      )}
    </div>
  );
}

function LoadingTherapistGrid() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="rounded-[2rem] border border-[var(--psy-line)] bg-[var(--psy-surface)]/80 p-6 shadow-sm"
        >
          <div className="h-20 w-20 animate-pulse rounded-full bg-[var(--psy-mist)]" />
          <div className="mt-6 h-5 w-36 animate-pulse rounded-full bg-[var(--psy-mist)]" />
          <div className="mt-4 space-y-2">
            <div className="h-3 animate-pulse rounded-full bg-[var(--psy-mist)]" />
            <div className="h-3 w-4/5 animate-pulse rounded-full bg-[var(--psy-mist)]" />
            <div className="h-3 w-2/3 animate-pulse rounded-full bg-[var(--psy-mist)]" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function PsyTherapists({ service }: { service?: string }) {
  const { data, isLoading } = useTherapists();
  const serviceFilter = service ? SERVICE_FILTERS[service] : undefined;
  const activeTherapists = (data ?? []).filter(
    (t) => t.is_active && t.is_accepting_patients,
  );
  const therapists = serviceFilter
    ? activeTherapists.filter((therapist) =>
        therapistMatchesService(therapist, serviceFilter.keywords),
      )
    : activeTherapists;

  return (
    <section className="psy-root psy-section min-h-screen py-12 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <header className="overflow-hidden rounded-[2rem] border border-[var(--psy-line)] bg-[var(--psy-surface)]/80 p-6 shadow-sm backdrop-blur sm:p-8 lg:p-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold text-[var(--psy-persian-blue)]">
                درمانگران آیه
              </p>
              <h1 className="title mt-3 text-3xl font-bold tracking-tight text-[var(--psy-ink)] sm:text-5xl">
                {serviceFilter
                  ? `درمانگران ${serviceFilter.title}`
                  : "انتخاب درمانگر مناسب برای مسیر شما"}
              </h1>
              <p className="mt-5 text-sm leading-8 text-[var(--psy-muted)] sm:text-base">
                {serviceFilter
                  ? "این فهرست بر اساس حوزه‌های تخصصی ثبت‌شده در پروفایل درمانگران پیشنهاد شده است."
                  : "پروفایل درمانگران را با آرامش بررسی کنید، تخصص‌ها را ببینید و برای رزرو نوبت وارد پورتال شوید."}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-[var(--psy-mist)] px-4 py-2 text-sm font-semibold text-[var(--psy-ink)]">
                {new Intl.NumberFormat("fa-IR").format(therapists.length)} درمانگر فعال
              </span>
              {serviceFilter ? (
                <Link
                  href="/psy/therapists"
                  className="rounded-full border border-[var(--psy-persian-blue)]/20 bg-[var(--psy-surface)]/70 px-5 py-2.5 text-sm font-semibold text-[var(--psy-persian-blue)] transition hover:-translate-y-0.5 hover:border-[var(--psy-persian-blue)]/45"
                >
                  مشاهده همه درمانگران
                </Link>
              ) : null}
            </div>
          </div>
        </header>

        <div className="mt-10">
          {isLoading ? (
            <LoadingTherapistGrid />
          ) : (
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {therapists.map((therapist) => (
                <li key={therapist.id}>
                  <Link
                    href={`/psy/therapists/${therapist.id}`}
                    className="group flex h-full flex-col overflow-hidden rounded-[2rem] border border-[var(--psy-line)] bg-[var(--psy-surface)]/85 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[var(--psy-persian-blue)]/30 hover:shadow-lg hover:shadow-[var(--psy-persian-blue)]/10"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <TherapistAvatar therapist={therapist} />
                      <span className="rounded-full bg-[var(--psy-mist)] px-3 py-1 text-xs font-semibold text-[var(--psy-persian-blue)]">
                        پذیرش فعال
                      </span>
                    </div>
                    <div className="mt-6 flex-1">
                      <h2 className="title text-2xl font-bold text-[var(--psy-ink)]">
                        {therapist.display_name}
                      </h2>
                      <p className="mt-2 text-sm font-semibold text-[var(--psy-gold)]">
                        {formatStarAverage(
                          therapist.rating_avg,
                          therapist.rating_count ?? 0,
                        )}
                      </p>
                      <p className="mt-4 line-clamp-3 text-sm leading-7 text-[var(--psy-muted)]">
                        {therapist.bio || "شرح پروفایل این درمانگر به‌زودی تکمیل می‌شود."}
                      </p>
                      {therapist.specialties?.length ? (
                        <ul className="mt-5 flex flex-wrap gap-2">
                          {therapist.specialties.slice(0, 3).map((specialty) => (
                            <li
                              key={specialty}
                              className="rounded-full border border-[var(--psy-line)] bg-[var(--psy-surface)]/65 px-3 py-1 text-xs font-medium text-[var(--psy-muted)]"
                            >
                              {specialty}
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                    <div className="mt-6 flex items-center justify-between border-t border-[var(--psy-line)] pt-5 text-sm font-semibold text-[var(--psy-persian-blue)]">
                      مشاهده پروفایل و رزرو
                      <span
                        className="transition group-hover:-translate-x-1"
                        aria-hidden
                      >
                        ←
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {!isLoading && !therapists.length ? (
          <div className="mt-10 rounded-[2rem] border border-[var(--psy-line)] bg-[var(--psy-surface)]/85 p-8 text-center shadow-sm">
            <p className="title text-2xl font-bold text-[var(--psy-ink)]">
              فعلاً درمانگری با این تخصص ثبت نشده است.
            </p>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[var(--psy-muted)]">
              می‌توانید همه درمانگران فعال را ببینید یا برای انتخاب مناسب با مرکز تماس بگیرید.
            </p>
            <Link
              href="/psy/therapists"
              className="mt-6 inline-flex rounded-full bg-[var(--psy-persian-blue)] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[var(--psy-persian-blue)]/20 transition hover:-translate-y-0.5 hover:bg-[var(--psy-persian-blue-deep)]"
            >
              مشاهده همه درمانگران
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}


export function TherapistPublicProfile({ id }: { id: number }) {
  const { data: therapists, isLoading } = useTherapists();
  const { data: reviews } = useTherapistPublicReviews(id);
  const therapist = (therapists ?? []).find((t) => t.id === id);
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const bookHref =
    isAuthenticated && isPsyPatient(user)
      ? `/patient/appointments/book?therapist=${id}`
      : `/login?next=${encodeURIComponent(`/patient/appointments/book?therapist=${id}`)}`;

  if (isLoading) {
    return (
      <section className="psy-root min-h-screen px-4 py-20">
        <div className="mx-auto max-w-6xl rounded-[2rem] border border-[var(--psy-line)] bg-[var(--psy-surface)]/80 p-8 shadow-sm">
          <div className="h-6 w-40 animate-pulse rounded-full bg-[var(--psy-mist)]" />
          <div className="mt-8 flex flex-col gap-6 sm:flex-row">
            <div className="h-32 w-32 animate-pulse rounded-full bg-[var(--psy-mist)]" />
            <div className="flex-1 space-y-4">
              <div className="h-8 w-56 animate-pulse rounded-full bg-[var(--psy-mist)]" />
              <div className="h-4 animate-pulse rounded-full bg-[var(--psy-mist)]" />
              <div className="h-4 w-4/5 animate-pulse rounded-full bg-[var(--psy-mist)]" />
            </div>
          </div>
        </div>
      </section>
    );
  }
  if (!therapist) {
    return (
      <section className="psy-root min-h-screen px-4 py-20">
        <div className="mx-auto max-w-3xl rounded-[2rem] border border-[var(--psy-line)] bg-[var(--psy-surface)] p-8 text-center shadow-sm">
          <p className="title text-2xl font-bold text-[var(--psy-ink)]">
            درمانگر پیدا نشد.
          </p>
          <Link
            href="/psy/therapists"
            className="mt-6 inline-flex rounded-full bg-[var(--psy-persian-blue)] px-6 py-3 text-sm font-semibold text-white"
          >
            بازگشت به درمانگران
          </Link>
        </div>
      </section>
    );
  }

  const activeOffers = therapist.offers?.filter((offer) => offer.is_active) ?? [];

  return (
    <article className="psy-root psy-section min-h-screen py-12 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Link
          href="/psy/therapists"
          className="inline-flex items-center rounded-full border border-[var(--psy-line)] bg-[var(--psy-surface)]/70 px-4 py-2 text-sm font-semibold text-[var(--psy-muted)] transition hover:-translate-y-0.5 hover:text-[var(--psy-ink)]"
        >
          ← بازگشت به درمانگران
        </Link>

        <section className="relative mt-8 overflow-hidden rounded-[2.5rem] border border-[var(--psy-line)] bg-[var(--psy-surface)]/85 shadow-sm backdrop-blur">
          <div className="psy-hero-wash absolute inset-0 opacity-70" aria-hidden />
          <div className="relative grid gap-8 p-6 sm:p-8 lg:grid-cols-[1fr_18rem] lg:p-10">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
              <TherapistAvatar therapist={therapist} size="xl" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[var(--psy-persian-blue)]">
                  پروفایل درمانگر
                </p>
                <h1 className="title mt-3 text-4xl font-extrabold text-[var(--psy-ink)] sm:text-5xl">
                  {therapist.display_name}
                </h1>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <span
                    className={`rounded-full px-4 py-2 text-xs font-semibold ${
                      therapist.is_accepting_patients
                        ? "bg-[var(--psy-mist)] text-[var(--psy-persian-blue)]"
                        : "bg-[var(--psy-line)] text-[var(--psy-muted)]"
                    }`}
                  >
                    {therapist.is_accepting_patients
                      ? "در حال پذیرش مراجع"
                      : "فعلاً پذیرش ندارد"}
                  </span>
                  <span className="rounded-full bg-[var(--psy-surface)]/80 px-4 py-2 text-xs font-semibold text-[var(--psy-gold)] shadow-sm">
                    {formatStarAverage(
                      therapist.rating_avg,
                      therapist.rating_count ?? 0,
                    )}
                  </span>
                </div>
              </div>
            </div>

            <aside className="rounded-[2rem] border border-[var(--psy-line)] bg-[var(--psy-surface)]/85 p-5 shadow-sm">
              <p className="text-sm font-semibold text-[var(--psy-muted)]">
                اقدام بعدی
              </p>
              <p className="mt-3 text-sm leading-7 text-[var(--psy-muted)]">
                پس از ورود به پورتال می‌توانید زمان‌های آزاد این درمانگر را بررسی کنید.
              </p>
              {therapist.is_accepting_patients ? (
                <Link
                  href={bookHref}
                  className="mt-5 inline-flex w-full justify-center rounded-full bg-[var(--psy-persian-blue)] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[var(--psy-persian-blue)]/20 transition hover:-translate-y-0.5 hover:bg-[var(--psy-persian-blue-deep)]"
                >
                  رزرو نوبت
                </Link>
              ) : (
                <p className="mt-5 rounded-2xl bg-[var(--psy-mist)] p-4 text-sm font-semibold text-[var(--psy-muted)]">
                  امکان رزرو برای این درمانگر فعال نیست.
                </p>
              )}
            </aside>
          </div>
        </section>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_20rem] lg:items-start">
          <div className="space-y-6">
            <section className="rounded-[2rem] border border-[var(--psy-line)] bg-[var(--psy-surface)]/85 p-6 shadow-sm sm:p-8">
              <p className="text-sm font-semibold text-[var(--psy-persian-blue)]">
                درباره درمانگر
              </p>
              <h2 className="title mt-2 text-2xl font-bold text-[var(--psy-ink)]">
                شرح حال و رویکرد
              </h2>
              <p className="mt-5 text-base leading-9 text-[var(--psy-muted)]">
                {therapist.bio || "شرح پروفایل این درمانگر به‌زودی تکمیل می‌شود."}
              </p>
            </section>

            <section className="rounded-[2rem] border border-[var(--psy-line)] bg-[var(--psy-surface)]/85 p-6 shadow-sm sm:p-8">
              <p className="text-sm font-semibold text-[var(--psy-persian-blue)]">
                حوزه‌های تخصصی
              </p>
              <h2 className="title mt-2 text-2xl font-bold text-[var(--psy-ink)]">
                تخصص‌ها
              </h2>
              {therapist.specialties?.length ? (
                <ul className="mt-5 flex flex-wrap gap-2">
                  {therapist.specialties.map((specialty) => (
                    <li
                      key={specialty}
                      className="rounded-full border border-[var(--psy-line)] bg-[var(--psy-mist)]/60 px-4 py-2 text-sm font-semibold text-[var(--psy-ink)]"
                    >
                      {specialty}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-5 text-sm text-[var(--psy-muted)]">
                  تخصصی برای این درمانگر ثبت نشده است.
                </p>
              )}
            </section>

            <section className="rounded-[2rem] border border-[var(--psy-line)] bg-[var(--psy-surface)]/85 p-6 shadow-sm sm:p-8">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-[var(--psy-persian-blue)]">
                    تجربه مراجعان
                  </p>
                  <h2 className="title mt-2 text-2xl font-bold text-[var(--psy-ink)]">
                    نظرات تأییدشده
                  </h2>
                </div>
                <p className="text-sm font-semibold text-[var(--psy-gold)]">
                  {formatStarAverage(
                    therapist.rating_avg,
                    therapist.rating_count ?? 0,
                  )}
                </p>
              </div>

              <ul className="mt-6 space-y-3">
                {(reviews ?? []).map((row) => (
                  <li
                    key={row.id}
                    className="rounded-2xl border border-[var(--psy-line)] bg-[var(--psy-mist)]/35 p-5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-semibold text-[var(--psy-ink)]">
                        {row.patient_first_name || "مراجع"}
                      </p>
                      <p className="text-[var(--psy-gold)]" dir="ltr">
                        {"★".repeat(row.rating)}
                        {"☆".repeat(5 - row.rating)}
                      </p>
                    </div>
                    {row.body ? (
                      <p className="mt-3 text-sm leading-7 text-[var(--psy-muted)]">
                        {row.body}
                      </p>
                    ) : null}
                    <p className="mt-3 text-xs text-[var(--psy-muted)]">
                      {formatJalaliFriendlyDate(row.created_at)}
                    </p>
                  </li>
                ))}
                {!(reviews ?? []).length ? (
                  <li className="rounded-2xl border border-dashed border-[var(--psy-line)] p-5 text-sm text-[var(--psy-muted)]">
                    هنوز نظر تأییدشده‌ای برای این درمانگر منتشر نشده است.
                  </li>
                ) : null}
              </ul>
            </section>
          </div>

          <aside className="space-y-6 lg:sticky lg:top-24">
            <section className="rounded-[2rem] border border-[var(--psy-line)] bg-[var(--psy-surface)]/90 p-6 shadow-sm">
              <h2 className="title text-xl font-bold text-[var(--psy-ink)]">
                رزرو جلسه
              </h2>
              <p className="mt-3 text-sm leading-7 text-[var(--psy-muted)]">
                برای انتخاب زمان، نوع جلسه و پرداخت امن وارد پورتال مراجع شوید.
              </p>
              {therapist.is_accepting_patients ? (
                <Link
                  href={bookHref}
                  className="mt-5 inline-flex w-full justify-center rounded-full bg-[var(--psy-gold)] px-6 py-3 text-sm font-semibold text-[#2a220e] shadow-lg shadow-[var(--psy-gold)]/20 transition hover:-translate-y-0.5 hover:brightness-105"
                >
                  شروع رزرو
                </Link>
              ) : null}
            </section>

            <section className="rounded-[2rem] border border-[var(--psy-line)] bg-[var(--psy-surface)]/90 p-6 shadow-sm">
              <h2 className="title text-xl font-bold text-[var(--psy-ink)]">
                نوع جلسات
              </h2>
              {activeOffers.length ? (
                <ul className="mt-4 space-y-3">
                  {activeOffers.slice(0, 4).map((offer) => (
                    <li
                      key={offer.id}
                      className="rounded-2xl bg-[var(--psy-mist)]/60 p-4"
                    >
                      <p className="font-semibold text-[var(--psy-ink)]">
                        {offer.session_type.name}
                      </p>
                      <p className="mt-1 text-xs text-[var(--psy-muted)]">
                        {new Intl.NumberFormat("fa-IR").format(
                          offer.session_type.duration_minutes,
                        )}{" "}
                        دقیقه
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 text-sm leading-7 text-[var(--psy-muted)]">
                  نوع جلسه پس از ورود و هنگام رزرو مشخص می‌شود.
                </p>
              )}
            </section>
          </aside>
        </div>
      </div>
    </article>
  );
}
