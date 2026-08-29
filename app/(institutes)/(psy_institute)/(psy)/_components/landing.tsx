import Link from "next/link";
import AuthNavButton, {
  AuthGuestOnly,
} from "@/features/auth/components/AuthNavButton";

export function PsyHero() {
  return (
    <section className="psy-hero relative isolate min-h-[100svh] overflow-hidden">
      <div className="psy-hero-wash pointer-events-none absolute inset-0" aria-hidden />
      <div className="relative mx-auto flex min-h-[100svh] max-w-6xl flex-col justify-center px-4 py-28 sm:px-6 lg:px-8">
        <p className="psy-fade-up title text-4xl font-extrabold tracking-tight text-[var(--psy-ink)] sm:text-5xl lg:text-6xl">
          مرکز مشاوره آیه
        </p>
        <h1 className="psy-fade-up mt-6 max-w-2xl text-2xl font-medium leading-relaxed text-[var(--psy-ink)]/90 sm:text-3xl [animation-delay:80ms]">
          آیه؛ نشانیِ یک حالِ خوب
        </h1>
        <p className="psy-fade-up mt-5 max-w-xl text-base leading-8 text-[var(--psy-muted)] sm:text-lg [animation-delay:140ms]">
          از رزرو جلسه تا آزمون‌های روان‌سنجی و پیگیری درمان — همه در یک پورتال امن برای مراجعان.
        </p>
        <div className="psy-fade-up mt-10 flex flex-wrap gap-3 [animation-delay:200ms]">
          <AuthNavButton
            guestLabel="ورود به پورتال"
            className="rounded-lg bg-primary px-7 py-3.5 text-sm font-medium text-[#332B1A] transition hover:opacity-90 sm:text-base"
          />
          <AuthGuestOnly>
            <Link
              href="/register"
              className="rounded-lg border border-[var(--psy-ink)]/20 bg-[var(--psy-surface)]/70 px-7 py-3.5 text-sm font-medium text-[var(--psy-ink)] transition hover:border-[var(--psy-ink)]/40 sm:text-base"
            >
              ثبت نام
            </Link>
          </AuthGuestOnly>
        </div>
      </div>
    </section>
  );
}

export function PsyApproach() {
  return (
    <section id="approach" className="scroll-mt-24 border-t border-[var(--psy-line)] py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className="title text-3xl font-bold text-[var(--psy-ink)] sm:text-4xl">رویکرد ما</h2>
        <div className="mx-auto mt-6 h-px w-16 bg-[var(--psy-sage)]/50" />
        <p className="mt-8 text-base leading-9 text-[var(--psy-muted)] sm:text-lg">
          احترام، محرمانگی و وضوح مسیر درمان. جلسات با درمانگران مجرب، ارزیابی‌های استاندارد، و
          فضای دیجیتال که فقط آنچه لازم است را نشان می‌دهد — بدون شلوغی، بدون فشار.
        </p>
      </div>
    </section>
  );
}

const SERVICES = [
  {
    title: "مشاوره و نوبت‌دهی",
    href: "/psy/therapists",
    body: "انتخاب درمانگر، مشاهده زمان‌های آزاد، و پرداخت امن از کیف پول.",
  },
  {
    title: "آزمون‌های روان‌سنجی",
    href: "/psy/tests",
    body: "پرسشنامه‌های منتشرشده با رندر پویا و سابقه پاسخ‌های شما.",
  },
  {
    title: "کارگاه‌ها و پیگیری",
    href: "/psy/workshops",
    body: "یادداشت‌های اشتراک‌گذاری‌شده درمانگر و مسیر پیگیری در پورتال.",
  },
];

export function PsyServices() {
  return (
    <section id="services" className="scroll-mt-24 border-t border-[var(--psy-line)] bg-[var(--psy-mist)]/60 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <h2 className="title text-3xl font-bold text-[var(--psy-ink)] sm:text-4xl">خدمات</h2>
        <p className="mt-3 max-w-xl text-[var(--psy-muted)]">
          آنچه پس از ورود به پورتال بیمار در دسترس شماست.
        </p>
        <ul className="mt-12 divide-y divide-[var(--psy-line)] border-y border-[var(--psy-line)]">
          {SERVICES.map((item) => (
            <li
              key={item.title}
              className="flex flex-col gap-2 py-8 sm:flex-row sm:items-baseline sm:justify-between sm:gap-10"
            >
              <h3 className="shrink-0 text-lg font-semibold">
                <Link
                  href={item.href}
                  className="text-[var(--psy-ink)] transition hover:text-[var(--psy-sage)]"
                >
                  {item.title}
                </Link>
              </h3>
              <p className="max-w-xl text-sm leading-7 text-[var(--psy-muted)] sm:text-base">
                {item.body}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

const STEPS = [
  { n: "۱", title: "ثبت نام", body: "حساب مراجع بسازید و به پورتال بیمار وارد شوید." },
  { n: "۲", title: "رزرو یا آزمون", body: "نوبت بگیرید یا پرسشنامه را تکمیل کنید." },
  { n: "۳", title: "پیگیری", body: "نوبت‌ها، یادداشت‌ها و سوابق را در یک جا ببینید." },
];

export function PsyHow() {
  return (
    <section id="how" className="scroll-mt-24 border-t border-[var(--psy-line)] py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <h2 className="title text-3xl font-bold text-[var(--psy-ink)] sm:text-4xl">مراحل شروع</h2>
        <p className="mt-3 text-[var(--psy-muted)]">سه گام ساده تا مراقبت منظم.</p>
        <ol className="mt-14 grid gap-10 sm:grid-cols-3 sm:gap-8">
          {STEPS.map((step, i) => (
            <li
              key={step.title}
              className="psy-fade-up space-y-3"
              style={{ animationDelay: `${i * 90}ms` }}
            >
              <span className="title text-4xl font-bold text-[var(--psy-sage)]">{step.n}</span>
              <h3 className="text-lg font-semibold text-[var(--psy-ink)]">{step.title}</h3>
              <p className="text-sm leading-7 text-[var(--psy-muted)]">{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function PsyClosingCta() {
  return (
    <section className="border-t border-[var(--psy-line)] bg-[var(--psy-ink)] py-16 text-[var(--psy-surface)] sm:py-20">
      <div className="mx-auto flex max-w-6xl flex-col items-start gap-8 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div>
          <h2 className="title text-3xl font-bold sm:text-4xl">آماده‌اید شروع کنید؟</h2>
          <p className="mt-3 max-w-md text-sm leading-7 text-[var(--psy-surface)]/70">
            ثبت نام رایگان است؛ پس از ورود می‌توانید نوبت بگیرید و آزمون‌ها را تکمیل کنید.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <AuthGuestOnly>
            <Link
              href="/register"
              className="rounded-lg bg-primary px-7 py-3.5 text-sm font-medium text-[#332B1A] transition hover:opacity-90"
            >
              ثبت نام
            </Link>
          </AuthGuestOnly>
          <AuthNavButton
            guestLabel="ورود"
            className="rounded-lg border border-[var(--psy-surface)]/30 px-7 py-3.5 text-sm font-medium text-[var(--psy-surface)] transition hover:bg-[var(--psy-surface)]/10"
          />
        </div>
      </div>
    </section>
  );
}
