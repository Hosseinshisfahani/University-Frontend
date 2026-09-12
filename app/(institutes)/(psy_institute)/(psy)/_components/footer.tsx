import Link from "next/link";
import {
  HiOutlineClock,
  HiOutlineDevicePhoneMobile,
  HiOutlineMapPin,
  HiOutlinePhone,
} from "react-icons/hi2";
import AuthNavButton, {
  AuthGuestOnly,
} from "@/features/auth/components/AuthNavButton";

const MAP_URL =
  "https://maps.google.com/maps?q=32.672228,51.641079&ll=32.672228,51.641079&z=16";
const MAP_EMBED =
  "https://maps.google.com/maps?q=32.672228,51.641079&z=16&hl=fa&output=embed";

const LINKS = [
  { href: "/psy", label: "صفحه مرکز" },
  { href: "/psy/therapists", label: "درمانگران" },
  { href: "/psy/tests", label: "آزمون‌ها" },
  { href: "/psy/workshops", label: "کارگاه‌ها" },
  { href: "/psy/blog", label: "مقالات" },
];

const SERVICES = [
  { href: "/psy/therapists", label: "درمان اضطراب، افسردگی و وسواس" },
  { href: "/psy/tests", label: "آزمون هوش، استعداد و شخصیت" },
  { href: "/psy/therapists", label: "مشاوره ازدواج و خانواده" },
  { href: "/psy/therapists", label: "مشاوره کودک، نوجوان و فرزندپروری" },
  { href: "/psy/therapists", label: "مشاوره تحصیلی و شغلی" },
  { href: "/psy/therapists", label: "مشاوره فرهنگی و اعتقادی" },
  { href: "/psy/therapists", label: "مشاوره حقوقی توسط اساتید حقوق" },
  { href: "/psy/workshops", label: "کارگاه، همایش و سخنرانی" },
];

export default function PsyFooter() {
  return (
    <footer className="border-t border-[var(--psy-line)] bg-[var(--psy-surface)]">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-12 lg:gap-8 lg:px-8">
        <div className="space-y-4 lg:col-span-4">
          <p className="title text-lg font-bold text-[var(--psy-ink)]">
            مرکز مشاوره آیه
          </p>
          <p className="text-sm font-medium text-[var(--psy-persian-blue)]">
            مرکز مشاوره دانشگاه معارف قرآن و عترت
          </p>
          <p className="text-sm leading-7 text-[var(--psy-muted)]">
            روانشناسان و مشاوران حرفه‌ای و مجرب با رویکردی متناسب با فرهنگ ایرانی
            اسلامی.
          </p>
          <p className="rounded-2xl border border-[var(--psy-line)] bg-[var(--psy-mist)]/70 px-4 py-3 text-xs leading-6 text-[var(--psy-muted)]">
            دارای مجوز رسمی از نظام روانشناسی و مشاوره
            <span className="mt-1 block font-semibold text-[var(--psy-ink)]">
              شماره پروانه ۱۳۲۹-م
            </span>
          </p>
        </div>

        <div className="lg:col-span-2">
          <h2 className="text-sm font-bold text-[var(--psy-ink)]">دسترسی سریع</h2>
          <ul className="mt-4 space-y-2.5 text-sm text-[var(--psy-muted)]">
            {LINKS.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-[var(--psy-ink)]">
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <AuthNavButton
                guestLabel="ورود"
                className="hover:text-[var(--psy-ink)]"
              />
            </li>
            <li>
              <AuthGuestOnly>
                <Link href="/register" className="hover:text-[var(--psy-ink)]">
                  ثبت نام
                </Link>
              </AuthGuestOnly>
            </li>
            <li>
              <Link href="/" className="hover:text-[var(--psy-ink)]">
                بازگشت به دانشگاه
              </Link>
            </li>
          </ul>
        </div>

        <div className="lg:col-span-3">
          <h2 className="text-sm font-bold text-[var(--psy-ink)]">خدمات مرکز</h2>
          <ul className="mt-4 space-y-2.5 text-sm text-[var(--psy-muted)]">
            {SERVICES.map((item) => (
              <li key={item.label}>
                <Link href={item.href} className="hover:text-[var(--psy-ink)]">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-5 lg:col-span-3">
          <h2 className="text-sm font-bold text-[var(--psy-ink)]">ارتباط با ما</h2>
          <ul className="space-y-3 text-sm text-[var(--psy-muted)]">
            <li className="flex items-start gap-3">
              <HiOutlineClock
                className="mt-0.5 size-5 shrink-0 text-[var(--psy-persian-blue)]"
                aria-hidden
              />
              <span>شنبه تا پنج‌شنبه، ۸ تا ۱۹</span>
            </li>
            <li className="flex items-start gap-3">
              <HiOutlinePhone
                className="mt-0.5 size-5 shrink-0 text-[var(--psy-persian-blue)]"
                aria-hidden
              />
              <a
                href="tel:+983133376058"
                className="hover:text-[var(--psy-ink)]"
                dir="ltr"
              >
                ۰۳۱-۳۳۳۷۶۰۵۸
              </a>
            </li>
            <li className="flex items-start gap-3">
              <HiOutlineDevicePhoneMobile
                className="mt-0.5 size-5 shrink-0 text-[var(--psy-persian-blue)]"
                aria-hidden
              />
              <a
                href="tel:+989130430530"
                className="hover:text-[var(--psy-ink)]"
                dir="ltr"
              >
                ۰۹۱۳۰۴۳۰۵۳۰
              </a>
            </li>
            <li className="flex items-start gap-3">
              <HiOutlineMapPin
                className="mt-0.5 size-5 shrink-0 text-[var(--psy-persian-blue)]"
                aria-hidden
              />
              <a
                href={MAP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="leading-7 hover:text-[var(--psy-ink)]"
              >
                بزرگراه شهید خرازی، خیابان شهیدان غربی، دانشگاه معارف قرآن و عترت
              </a>
            </li>
          </ul>
          <div className="overflow-hidden rounded-2xl border border-[var(--psy-line)] shadow-sm">
            <iframe
              title="موقعیت مرکز مشاوره آیه روی نقشه"
              src={MAP_EMBED}
              className="h-44 w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          <a
            href={MAP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-sm font-semibold text-[var(--psy-persian-blue)] hover:text-[var(--psy-ink)]"
          >
            مشاهده در نقشه گوگل
          </a>
        </div>
      </div>
      <div className="border-t border-[var(--psy-line)] py-4 text-center text-xs text-[var(--psy-muted)]">
        اطلاعات بالینی محرمانه است و تنها با رضایت شما به اشتراک گذاشته می‌شود.
      </div>
    </footer>
  );
}
