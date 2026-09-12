"use client";

import Link from "next/link";
import {
  useTherapistPublicReviews,
  useTherapists,
} from "@/app/(institutes)/(psy_institute)/_shared/use-psy";
import { formatStarAverage } from "@/app/(institutes)/(psy_institute)/_shared/helpers";
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

function TherapistAvatar({
  name,
  id,
  size = "md",
}: {
  name: string;
  id: number;
  size?: "md" | "lg";
}) {
  const hue = (id * 47) % 360;
  const initials = name.trim().slice(0, 1) || "د";
  const box = size === "lg" ? "h-28 w-28 text-4xl" : "h-20 w-20 text-2xl";
  return (
    <div
      className={`flex items-center justify-center rounded-full font-bold text-white ${box}`}
      style={{ background: `hsl(${hue} 28% 42%)` }}
      aria-hidden
    >
      {initials}
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
    <div className="psy-root mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-10 max-w-2xl">
        <p className="text-sm font-medium text-[var(--psy-accent)]">درمانگران</p>
        <h1 className="title mt-2 text-3xl font-bold tracking-tight text-[var(--psy-ink)] sm:text-4xl">
          {serviceFilter
            ? `درمانگران مرتبط با ${serviceFilter.title}`
            : "درمانگران ما"}
        </h1>
        <p className="mt-3 text-[var(--psy-muted)]">
          {serviceFilter
            ? "این درمانگران بر اساس تخصص‌های ثبت‌شده در پروفایلشان پیشنهاد شده‌اند."
            : "با تیم مرکز آشنا شوید و مستقیم نوبت رزرو کنید."}
        </p>
        {serviceFilter ? (
          <Link
            href="/psy/therapists"
            className="mt-4 inline-flex rounded-full border border-[var(--psy-line)] px-4 py-2 text-sm font-medium text-[var(--psy-persian-blue)] hover:border-[var(--psy-persian-blue)]/40"
          >
            مشاهده همه درمانگران
          </Link>
        ) : null}
      </header>

      {isLoading ? (
        <p className="text-[var(--psy-muted)]">در حال بارگذاری…</p>
      ) : (
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {therapists.map((t) => (
            <li key={t.id}>
              <Link
                href={`/psy/therapists/${t.id}`}
                className="flex h-full flex-col gap-4 rounded-2xl border border-[var(--psy-line)] bg-[var(--psy-surface)] p-6 transition hover:border-[var(--psy-sage)]/50"
              >
                <TherapistAvatar name={t.display_name} id={t.id} />
                <div>
                  <h2 className="text-lg font-semibold text-[var(--psy-ink)]">
                    {t.display_name}
                  </h2>
                  <p className="mt-2 line-clamp-3 text-sm leading-7 text-[var(--psy-muted)]">
                    {t.bio || "بدون توضیح"}
                  </p>
                  <p className="mt-2 text-sm text-[var(--psy-sage)]">
                    {formatStarAverage(t.rating_avg, t.rating_count ?? 0)}
                  </p>
                </div>
                <span className="mt-auto text-sm font-medium text-[var(--psy-sage)]">
                  مشاهده پروفایل ←
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      {!isLoading && !therapists.length ? (
        <div className="rounded-2xl border border-[var(--psy-line)] bg-[var(--psy-surface)] p-6">
          <p className="font-semibold text-[var(--psy-ink)]">
            فعلاً درمانگری با این تخصص ثبت نشده است.
          </p>
          <p className="mt-2 text-sm leading-7 text-[var(--psy-muted)]">
            می‌توانید همه درمانگران فعال را ببینید یا برای انتخاب مناسب با مرکز
            تماس بگیرید.
          </p>
          <Link
            href="/psy/therapists"
            className="mt-4 inline-flex text-sm font-semibold text-[var(--psy-persian-blue)]"
          >
            مشاهده همه درمانگران ←
          </Link>
        </div>
      ) : null}
    </div>
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
    return <p className="px-4 py-20 text-[var(--psy-muted)]">در حال بارگذاری…</p>;
  }
  if (!therapist) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20">
        <p>درمانگر پیدا نشد.</p>
        <Link href="/psy/therapists" className="mt-4 inline-block text-[var(--psy-sage)]">
          بازگشت
        </Link>
      </div>
    );
  }

  return (
    <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <Link
        href="/psy/therapists"
        className="text-sm text-[var(--psy-muted)] hover:text-[var(--psy-ink)]"
      >
        ← درمانگران
      </Link>
      <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-start">
        <TherapistAvatar name={therapist.display_name} id={therapist.id} size="lg" />
        <div className="min-w-0 flex-1">
          <h1 className="title text-3xl font-extrabold text-[var(--psy-ink)] sm:text-4xl">
            {therapist.display_name}
          </h1>
          {therapist.is_accepting_patients ? (
            <p className="mt-2 text-sm text-[var(--psy-sage)]">در حال پذیرش مراجع</p>
          ) : (
            <p className="mt-2 text-sm text-[var(--psy-muted)]">فعلاً پذیرش ندارد</p>
          )}
          <p className="mt-2 text-sm text-[var(--psy-sage)]">
            {formatStarAverage(therapist.rating_avg, therapist.rating_count ?? 0)}
          </p>
          <p className="mt-6 text-base leading-8 text-[var(--psy-muted)]">
            {therapist.bio || "بدون شرح حال منتشرشده."}
          </p>
          {therapist.specialties?.length ? (
            <ul className="mt-4 flex flex-wrap gap-2">
              {therapist.specialties.map((s) => (
                <li
                  key={s}
                  className="rounded-md border border-[var(--psy-line)] px-3 py-1 text-xs text-[var(--psy-muted)]"
                >
                  {s}
                </li>
              ))}
            </ul>
          ) : null}
          {therapist.is_accepting_patients ? (
            <Link
              href={bookHref}
              className="mt-8 inline-flex rounded-lg bg-primary px-7 py-3.5 text-sm font-medium text-[#332B1A] transition hover:opacity-90"
            >
              رزرو نوبت
            </Link>
          ) : null}
        </div>
      </div>

      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-[var(--psy-ink)]">نظرات تأییدشده</h2>
        <ul className="space-y-3">
          {(reviews ?? []).map((row) => (
            <li
              key={row.id}
              className="rounded-2xl border border-[var(--psy-line)] bg-[var(--psy-surface)] p-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium">{row.patient_first_name || "مراجع"}</p>
                <p className="text-amber-600" dir="ltr">
                  {"★".repeat(row.rating)}
                  {"☆".repeat(5 - row.rating)}
                </p>
              </div>
              {row.body ? (
                <p className="mt-3 text-sm leading-7 text-[var(--psy-muted)]">
                  {row.body}
                </p>
              ) : null}
              <p className="mt-2 text-xs text-[var(--psy-muted)]">
                {formatJalaliFriendlyDate(row.created_at)}
              </p>
            </li>
          ))}
          {!(reviews ?? []).length ? (
            <li className="text-sm text-[var(--psy-muted)]">نظر تأییدشده‌ای نیست.</li>
          ) : null}
        </ul>
      </section>
    </article>
  );
}
