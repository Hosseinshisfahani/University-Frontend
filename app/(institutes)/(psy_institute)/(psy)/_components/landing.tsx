import Image from "next/image";
import Link from "next/link";
import AuthNavButton, {
  AuthGuestOnly,
} from "@/features/auth/components/AuthNavButton";

export function PsyHero() {
  return (
    <section className="psy-hero relative isolate min-h-[100svh] overflow-hidden border-b border-[var(--psy-line)]">
      <div className="psy-hero-wash pointer-events-none absolute inset-0" aria-hidden />
      <div className="psy-tile-pattern pointer-events-none absolute inset-x-0 top-0 h-48 opacity-60" aria-hidden />
      <div className="relative mx-auto grid min-h-[100svh] max-w-6xl items-center gap-12 px-4 py-28 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
        <div className="min-w-0">
          <p className="psy-fade-up title mt-7 max-w-2xl text-4xl font-extrabold tracking-tight text-[var(--psy-ink)] sm:text-5xl lg:text-6xl [animation-delay:60ms]">
            مرکز مشاوره آیه
          </p>
          <h1 className="psy-fade-up mt-6 max-w-2xl text-2xl font-medium leading-relaxed text-[var(--psy-ink)]/90 sm:text-3xl [animation-delay:120ms]">
            آیه؛ نشانیِ یک حالِ خوب
          </h1>
          <p className="psy-fade-up mt-5 max-w-xl text-base leading-8 text-[var(--psy-muted)] sm:text-lg [animation-delay:180ms]">
            از رزرو جلسه تا آزمون‌های روان‌سنجی و پیگیری درمان، همه چیز در پورتالی محرمانه و یکپارچه
          </p>
          <div className="psy-fade-up mt-10 flex flex-wrap gap-3 [animation-delay:240ms]">
            <AuthNavButton
              guestLabel="ورود به پورتال"
              className="rounded-full bg-[var(--psy-persian-blue)] px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[var(--psy-persian-blue)]/20 transition hover:-translate-y-0.5 hover:bg-[var(--psy-persian-blue-deep)] sm:text-base"
            />
            <AuthGuestOnly>
              <Link
                href="/register"
                className="rounded-full border border-[var(--psy-persian-blue)]/20 bg-[var(--psy-surface)]/80 px-7 py-3.5 text-sm font-semibold text-[var(--psy-ink)] shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:border-[var(--psy-persian-blue)]/45 sm:text-base"
              >
                ثبت نام
              </Link>
            </AuthGuestOnly>
          </div>
          <dl className="psy-fade-up mt-12 grid max-w-xl grid-cols-3 gap-3 [animation-delay:300ms]">
            {[
              ["امن", "پرونده محرمانه"],
              ["آرام", "مسیر روشن درمان"],
              ["دقیق", "آزمون استاندارد"],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-2xl border border-[var(--psy-line)] bg-[var(--psy-surface)]/60 p-4 shadow-sm backdrop-blur"
              >
                <dt className="title text-xl font-bold text-[var(--psy-persian-blue)]">{label}</dt>
                <dd className="mt-1 text-xs leading-5 text-[var(--psy-muted)]">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="psy-fade-up relative hidden min-h-[520px] items-center justify-center lg:flex [animation-delay:180ms]">
          <div className="psy-mosque-dome absolute inset-x-10 top-2 h-64" aria-hidden />
          <div className="psy-arch-card relative w-full max-w-sm overflow-hidden p-7 text-center">
            <div className="psy-tile-piece mx-auto">
              <Image
                src="/psy/isfahan-tile-piece.png"
                alt="قطعه کاشی واقعی از مسجدهای اصفهان"
                width={160}
                height={122}
                className="h-full w-full object-cover"
              />
            </div>
            <p className="title mt-8 text-3xl font-bold text-white">آرامش، بر اساس هندسه یک درمان موفق</p>
            <div className="mt-8 grid grid-cols-2 gap-3 text-right">
              {["رزرو جلسه", "آزمون‌ها", "یادداشت درمانگر", "کیف پول"].map((item) => (
                <span
                  key={item}
                  className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white/90 backdrop-blur"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function PsyApproach() {
  return (
    <section id="approach" className="psy-section scroll-mt-24 py-20 sm:py-28">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:px-8">
        <div>
          <p className="text-sm font-semibold text-[var(--psy-persian-blue)]">رویکرد ما</p>
          <h2 className="title mt-3 text-3xl font-bold text-[var(--psy-ink)] sm:text-4xl">
            مراقبت روان با وقار، محرمانگی و ریتمی انسانی
          </h2>
          <div className="mt-6 h-px w-20 bg-[var(--psy-gold)]/70" />
        </div>
        <div className="rounded-[2rem] border border-[var(--psy-line)] bg-[var(--psy-surface)]/70 p-6 shadow-sm sm:p-8">
          <p className="text-base leading-9 text-[var(--psy-muted)] sm:text-lg">
            احترام، محرمانگی و وضوح مسیر درمان. جلسات با درمانگران مجرب، ارزیابی‌های استاندارد، و
            فضای دیجیتال که فقط آنچه لازم است را نشان می‌دهد؛ بدون شلوغی، بدون فشار.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {["محرمانگی کامل", "انتخاب آگاهانه", "پیگیری منظم"].map((item) => (
              <span
                key={item}
                className="rounded-2xl bg-[var(--psy-mist)] px-4 py-3 text-center text-sm font-semibold text-[var(--psy-ink)]"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
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
    <section id="services" className="scroll-mt-24 border-t border-[var(--psy-line)] bg-[var(--psy-mist)]/65 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-[var(--psy-persian-blue)]">خدمات پورتال</p>
            <h2 className="title mt-3 text-3xl font-bold text-[var(--psy-ink)] sm:text-4xl">خدمات</h2>
          </div>
          <p className="max-w-xl text-[var(--psy-muted)]">
            آنچه پس از ورود به پورتال بیمار در دسترس شماست.
          </p>
        </div>
        <ul className="mt-12 grid gap-5 md:grid-cols-3">
          {SERVICES.map((item) => (
            <li
              key={item.title}
              className="psy-tile-card group flex min-h-64 flex-col justify-between rounded-[2rem] border border-[var(--psy-line)] bg-[var(--psy-surface)] p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div>
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--psy-persian-blue)] text-sm font-bold text-white shadow-lg shadow-[var(--psy-persian-blue)]/20">
                  آیه
                </span>
                <h3 className="mt-7 text-xl font-bold">
                  <Link
                    href={item.href}
                    className="text-[var(--psy-ink)] transition group-hover:text-[var(--psy-persian-blue)]"
                  >
                    {item.title}
                  </Link>
                </h3>
                <p className="mt-4 text-sm leading-7 text-[var(--psy-muted)] sm:text-base">
                  {item.body}
                </p>
              </div>
              <Link
                href={item.href}
                className="mt-8 text-sm font-semibold text-[var(--psy-persian-blue)] transition group-hover:translate-x-[-4px]"
              >
                مشاهده مسیر
              </Link>
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
    <section id="how" className="psy-section scroll-mt-24 border-t border-[var(--psy-line)] py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold text-[var(--psy-persian-blue)]">از آستانه تا آرامش</p>
          <h2 className="title mt-3 text-3xl font-bold text-[var(--psy-ink)] sm:text-4xl">
            مراحل شروع
          </h2>
          <p className="mt-3 text-[var(--psy-muted)]">سه گام ساده تا مراقبت منظم.</p>
        </div>
        <ol className="mt-14 grid gap-5 sm:grid-cols-3">
          {STEPS.map((step, i) => (
            <li
              key={step.title}
              className="psy-fade-up rounded-t-[4rem] rounded-b-[2rem] border border-[var(--psy-line)] bg-[var(--psy-surface)]/80 p-6 text-center shadow-sm"
              style={{ animationDelay: `${i * 90}ms` }}
            >
              <span className="title mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--psy-persian-blue)] text-3xl font-bold text-white shadow-lg shadow-[var(--psy-persian-blue)]/20">
                {step.n}
              </span>
              <h3 className="mt-6 text-lg font-semibold text-[var(--psy-ink)]">{step.title}</h3>
              <p className="mt-3 text-sm leading-7 text-[var(--psy-muted)]">{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function PsyClosingCta() {
  return (
    <section className="psy-cta-ornament border-t border-[var(--psy-line)] bg-[var(--psy-persian-blue-deep)] py-16 text-white sm:py-20">
      <div className="mx-auto flex max-w-6xl flex-col items-start gap-8 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div className="relative">
          <p className="mb-3 text-sm font-semibold text-[var(--psy-gold)]">در آستانه یک شروع آرام</p>
          <h2 className="title text-3xl font-bold sm:text-4xl">آماده‌اید شروع کنید؟</h2>
          <p className="mt-3 max-w-md text-sm leading-7 text-white/72">
            ثبت نام رایگان است؛ پس از ورود می‌توانید نوبت بگیرید و آزمون‌ها را تکمیل کنید.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <AuthGuestOnly>
            <Link
              href="/register"
              className="rounded-full bg-[var(--psy-gold)] px-7 py-3.5 text-sm font-semibold text-[#2a220e] transition hover:-translate-y-0.5 hover:brightness-105"
            >
              ثبت نام
            </Link>
          </AuthGuestOnly>
          <AuthNavButton
            guestLabel="ورود"
            className="rounded-full border border-white/30 px-7 py-3.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/10"
          />
        </div>
      </div>
    </section>
  );
}
