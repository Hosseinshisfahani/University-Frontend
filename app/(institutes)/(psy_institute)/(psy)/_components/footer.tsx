import Link from "next/link";
import AuthNavButton, {
  AuthGuestOnly,
} from "@/features/auth/components/AuthNavButton";

export default function PsyFooter() {
  return (
    <footer className="border-t border-[var(--psy-line)] bg-[var(--psy-surface)]">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 sm:px-6 lg:flex-row lg:items-start lg:justify-between lg:px-8">
        <div className="max-w-sm space-y-3">
          <p className="title text-lg font-bold text-[var(--psy-ink)]">آیه</p>
          <p className="text-sm leading-7 text-[var(--psy-muted)]">
            آیه؛ نشانیِ یک حالِ خوب
          </p>
          <p className="text-sm leading-7 text-[var(--psy-muted)]">
            فضای امن و محرمانه برای مشاوره، ارزیابی و پیگیری درمان — وابسته به دانشگاه معارف قرآن و
            عترت.
          </p>
        </div>
        <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm text-[var(--psy-muted)]">
          <Link href="/psy" className="hover:text-[var(--psy-ink)]">
            صفحه مرکز
          </Link>
          <Link href="/psy/therapists" className="hover:text-[var(--psy-ink)]">
            درمانگران
          </Link>
          <Link href="/psy/tests" className="hover:text-[var(--psy-ink)]">
            آزمون‌ها
          </Link>
          <Link href="/psy/workshops" className="hover:text-[var(--psy-ink)]">
            کارگاه‌ها
          </Link>
          <Link href="/psy/blog" className="hover:text-[var(--psy-ink)]">
            مقالات
          </Link>
          <AuthNavButton
            guestLabel="ورود"
            className="hover:text-[var(--psy-ink)]"
          />
          <AuthGuestOnly>
            <Link href="/register" className="hover:text-[var(--psy-ink)]">
              ثبت نام
            </Link>
          </AuthGuestOnly>
          <Link href="/" className="hover:text-[var(--psy-ink)]">
            بازگشت به دانشگاه
          </Link>
        </div>
      </div>
      <div className="border-t border-[var(--psy-line)] py-4 text-center text-xs text-[var(--psy-muted)]">
        اطلاعات بالینی محرمانه است و تنها با رضایت شما به اشتراک گذاشته می‌شود.
      </div>
    </footer>
  );
}
