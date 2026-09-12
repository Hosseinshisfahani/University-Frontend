"use client";

import Image from "next/image";
import Link from "next/link";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import AuthNavButton, {
  AuthGuestOnly,
} from "@/features/auth/components/AuthNavButton";
import { useNewsSlides } from "@/app/(institutes)/(psy_institute)/_shared/use-psy";
import type { NewsSlide } from "@/app/(institutes)/(psy_institute)/_shared/types";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

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

function slideHref(slide: NewsSlide) {
  const href = slide.link_url?.trim();
  return href || null;
}

function isExternalHref(href: string) {
  return /^https?:\/\//i.test(href);
}

export function PsyNewsSlider() {
  const { data, isLoading } = useNewsSlides();
  const slides = (data ?? []).filter((slide) => slide.is_published);

  if (isLoading || !slides.length) return null;

  return (
    <section
      id="news"
      className="scroll-mt-24 border-b border-[var(--psy-line)] bg-[var(--psy-mist)]/40 py-10 sm:py-14"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-[var(--psy-persian-blue)]">
              اخبار و اطلاع‌رسانی
            </p>
            <h2 className="title mt-2 text-2xl font-bold text-[var(--psy-ink)] sm:text-3xl">
              تازه‌های مرکز
            </h2>
          </div>
        </div>
        <Swiper
          modules={[Autoplay, Pagination, Navigation]}
          dir="rtl"
          loop={slides.length > 1}
          speed={650}
          grabCursor
          autoplay={{
            delay: 5200,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          pagination={{ clickable: true }}
          navigation={slides.length > 1}
          className="psy-news-swiper overflow-hidden rounded-[2rem]"
        >
          {slides.map((slide) => {
            const href = slideHref(slide);
            const cta = slide.link_label?.trim() || "بیشتر بخوانید";
            return (
              <SwiperSlide key={slide.id}>
                <article className="relative isolate min-h-[22rem] overflow-hidden sm:min-h-[26rem]">
                  {slide.image ? (
                    <div
                      className="absolute inset-0 bg-cover bg-center"
                      style={{ backgroundImage: `url(${slide.image})` }}
                      aria-hidden
                    />
                  ) : (
                    <div className="psy-hero-wash absolute inset-0" aria-hidden />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#061c35]/90 via-[#061c35]/45 to-transparent" />
                  <div className="relative flex min-h-[22rem] flex-col justify-end p-6 sm:min-h-[26rem] sm:p-10">
                    <h3 className="title max-w-2xl text-2xl font-bold text-white sm:text-4xl">
                      {slide.title}
                    </h3>
                    {slide.body ? (
                      <p className="mt-3 max-w-xl text-sm leading-7 text-white/80 sm:text-base">
                        {slide.body}
                      </p>
                    ) : null}
                    {href ? (
                      isExternalHref(href) ? (
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-6 inline-flex w-fit rounded-full bg-[var(--psy-gold)] px-6 py-2.5 text-sm font-semibold text-[#2a220e] transition hover:-translate-y-0.5"
                        >
                          {cta}
                        </a>
                      ) : (
                        <Link
                          href={href}
                          className="mt-6 inline-flex w-fit rounded-full bg-[var(--psy-gold)] px-6 py-2.5 text-sm font-semibold text-[#2a220e] transition hover:-translate-y-0.5"
                        >
                          {cta}
                        </Link>
                      )
                    ) : null}
                  </div>
                </article>
              </SwiperSlide>
            );
          })}
        </Swiper>
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
    slug: "academic",
    title: "مشاوره تحصیلی",
    summary:
      "شناخت استعدادها، غلبه بر افت نمرات و اضطراب امتحان و طراحی یک برنامه دقیق برای آینده تحصیلی.",
    process:
      "در این مسیر، تکنیک‌های علمی مطالعه، مدیریت زمان و برنامه‌ریزی هدفمند آموزش داده می‌شود تا مراجع با انگیزه و بازدهی بیشتر مسیر آموزشی خود را طی کند.",
    audience:
      "دانش‌آموزان، دانشجویان، داوطلبان کنکور و افرادی که درگیر انتخاب رشته یا تغییر مسیر تحصیلی هستند.",
  },
  {
    slug: "career",
    title: "مشاوره شغلی",
    summary:
      "کشف توانمندی‌ها، علایق، ارزش‌ها و ویژگی‌های شخصیتی برای انتخاب رضایت‌بخش‌ترین مسیر حرفه‌ای.",
    process:
      "روان‌شناس با ارزیابی‌های علمی و آزمون‌های شخصیت به رفع سردرگمی شغلی، فرسودگی و استرس محیط کار کمک می‌کند و مهارت‌های هدف‌گذاری، توسعه فردی و ورود به بازار کار را تقویت می‌کند.",
    audience:
      "دانشجویان، فارغ‌التحصیلان، شاغلان ناراضی یا دچار رکود و افرادی که به دنبال تغییر یا ارتقای مسیر حرفه‌ای خود هستند.",
  },
  {
    slug: "premarital",
    title: "مشاوره پیش از ازدواج",
    summary:
      "فرصتی علمی برای شناخت عمیق‌تر زوجین و بررسی تناسب‌های شخصیتی، ارزشی، فرهنگی و خانوادگی.",
    process:
      "با مصاحبه بالینی و آزمون‌های معتبر، انتظارات از ازدواج شفاف می‌شود و مهارت‌های گفت‌وگوی مؤثر، حل تعارض و مدیریت هیجان پیش از شروع زندگی مشترک آموزش داده می‌شود.",
    audience:
      "افراد در مرحله آشنایی یا خواستگاری، نامزدهای در آستانه عقد و کسانی که در انتخاب شریک زندگی یا تصمیم نهایی تردید دارند.",
  },
  {
    slug: "family",
    title: "مشاوره خانواده",
    summary:
      "رویکردی سیستمی برای بهبود روابط، رفع سوءتفاهم‌ها و ساختن محیطی امن و حمایتگر در خانواده.",
    process:
      "اعضای خانواده الگوهای ارتباطی مخرب را می‌شناسند و شنیدن فعال، همدلی و حل مسئله را جایگزین آن می‌کنند؛ همچنین برای تعارض والد و فرزند، شکاف نسلی، سوگ، طلاق و تغییرات مهم زندگی همراهی می‌شوند.",
    audience:
      "والدین و فرزندان درگیر چالش ارتباطی، خانواده‌های دارای تنش، پرخاشگری یا سردی عاطفی و کسانی که به دنبال بازسازی آرامش و مرزبندی سالم هستند.",
  },
  {
    slug: "psychotherapy",
    title: "روان‌درمانی",
    summary:
      "فرآیندی عمیق برای ریشه‌یابی تعارض‌های درونی و الگوهای آسیب‌زای فکری و رفتاری و ایجاد تغییر پایدار.",
    process:
      "در فضایی امن، محرمانه و بدون قضاوت، احساسات پردازش‌نشده، تروماها و باورهای محدودکننده بررسی می‌شوند تا افسردگی، اضطراب مزمن، وسواس، فوبیا، پانیک و بحران‌های هویتی درمان شوند.",
    audience:
      "افراد درگیر اختلالات خلقی و بالینی، تروماهای حل‌نشده، الگوهای مخرب تکرارشونده، احساس پوچی یا دردهای عاطفی عمیق.",
  },
  {
    slug: "divorce",
    title: "مشاوره طلاق",
    summary:
      "فضایی بی‌طرفانه و حمایتی برای تصمیم‌گیری آگاهانه در یکی از بحرانی‌ترین مراحل زندگی مشترک.",
    process:
      "ابتدا امکان ترمیم رابطه بررسی می‌شود؛ در صورت تصمیم قطعی به جدایی، جلسات بر مدیریت سوگ، خشم، ترس و احساس گناه، توافق مسالمت‌آمیز و والدگری مشترک سالم تمرکز می‌کنند.",
    audience:
      "زوج‌های مردد میان ماندن یا رفتن، افراد در مسیر طلاق، والدین نگران فرزندان و کسانی که پس از جدایی به حمایت روانی نیاز دارند.",
  },
  {
    slug: "individual",
    title: "مشاوره فردی",
    summary:
      "فضایی امن و محرمانه برای خودشناسی، رشد شخصی و حل چالش‌های فردی.",
    process:
      "با همراهی روان‌شناس، مهارت‌های مقابله با استرس و بحران، مدیریت احساسات، تقویت اعتمادبه‌نفس، بهبود روابط و تصمیم‌گیری بهتر تمرین می‌شود.",
    audience:
      "هر فردی که به دنبال رشد شخصی، مدیریت بهتر احساسات یا عبور سالم از یک مقطع دشوار زندگی است.",
  },
  {
    slug: "child-adolescent",
    title: "مشاوره کودک و نوجوان",
    summary:
      "فضایی تخصصی متناسب با دنیای ذهنی فرزندان برای بیان و درمان دغدغه‌هایی که گفتن آن‌ها دشوار است.",
    process:
      "روان‌شناس با بازی‌درمانی، هنر و گفت‌وگوی همدلانه به اضطراب، پرخاشگری، افت تحصیلی و بحران‌های بلوغ می‌پردازد و هم‌زمان مهارت‌های فرزندپروری را به والدین آموزش می‌دهد.",
    audience:
      "والدین نگران تغییر رفتار فرزند، کودکان دارای اضطراب جدایی یا مشکلات مدرسه، نوجوانان درگیر بحران هویت و خانواده‌های مواجه با سوگ، طلاق یا تغییرات بزرگ.",
  },
  {
    slug: "psychiatry",
    title: "روان‌پزشکی و دارودرمانی",
    summary:
      "ارزیابی پزشکی توسط متخصص اعصاب و روان با تمرکز بر عوامل زیستی و عملکرد مغز.",
    process:
      "روان‌پزشک پس از ارزیابی دقیق، در صورت نیاز دارو تجویز می‌کند تا علائم آزاردهنده کنترل و مسیر روان‌درمانی تسهیل شود.",
    audience:
      "افراد دارای افسردگی حاد، پانیک یا بی‌خوابی مزمن، مبتلایان به اختلالات نیازمند کنترل دارویی و مراجعان ارجاع‌شده از سوی روان‌شناس.",
  },
  {
    slug: "nutrition",
    title: "مشاوره تغذیه و رژیم‌درمانی",
    summary:
      "اصلاح علمی الگوهای غذایی و ارتقای سلامت یکپارچه جسم و روان با برنامه‌ای شخصی‌سازی‌شده.",
    process:
      "متخصص تغذیه شرایط جسمانی و سبک زندگی را ارزیابی و برای مدیریت وزن، پیشگیری یا کنترل بیماری‌ها برنامه عملی ارائه می‌کند.",
    audience:
      "افراد متقاضی کاهش یا افزایش وزن پایدار، مبتلایان به دیابت، چربی خون یا مشکلات گوارشی، ورزشکاران و زنان باردار.",
  },
  {
    slug: "sports",
    title: "مشاوره ورزشی",
    summary:
      "بهبود ابعاد ذهنی، روانی و جسمانی فعالیت ورزشی برای عملکرد بهتر و سبک زندگی فعال‌تر.",
    process:
      "با برنامه‌ریزی اصولی و تکنیک‌هایی مانند تمرکز، تصویرسازی ذهنی و هدف‌گذاری، انگیزه و عملکرد تقویت و موانع ذهنی ورزش برطرف می‌شوند.",
    audience:
      "ورزشکاران حرفه‌ای و آماتور، افراد نیازمند انگیزه برای شروع ورزش و ورزشکاران آسیب‌دیده در مسیر بازگشت به تمرین.",
  },
  {
    slug: "cultural",
    title: "مشاوره فرهنگی و اعتقادی",
    summary:
      "فضایی امن و بدون قضاوت برای بررسی دغدغه‌های فکری، معنوی، ارزشی و هویتی.",
    process:
      "این جلسات به حل تعارضات ارزشی، پاسخ اصولی به پرسش‌های دینی و ایجاد انسجام میان سبک زندگی و باورهای فرهنگی و اعتقادی کمک می‌کنند.",
    audience:
      "دانشجویان و جوانان دارای پرسش یا بحران هویت، افراد درگیر تعارض فرهنگی و کسانی که به دنبال معنا و رشد معنوی هستند.",
  },
  {
    slug: "legal",
    title: "مشاوره حقوقی",
    summary:
      "راهنمایی تخصصی برای شناخت حقوق و تکالیف، پیشگیری از مشکلات قانونی و انتخاب مسیر امن‌تر.",
    process:
      "مشاور ابعاد حقوقی قراردادها، مسائل خانواده، جرایم سایبری، دعاوی مدنی، توافق‌ها و تصمیمات مهم زندگی را روشن می‌کند.",
    audience:
      "دانشجویان و دانشگاهیان نیازمند راهنمایی قراردادی، افراد درگیر مهریه، نفقه یا حضانت و کسانی که پیش از توافق یا شراکت به آگاهی حقوقی نیاز دارند.",
  },
];

function ServiceCard({
  item,
  index,
  detailsAlwaysVisible = false,
}: {
  item: (typeof SERVICES)[number];
  index: number;
  detailsAlwaysVisible?: boolean;
}) {
  const detailsContent = (
    <div className="mt-4 space-y-4 text-sm leading-7 text-[var(--psy-muted)]">
      <p>{item.process}</p>
      <div className="rounded-2xl bg-[var(--psy-mist)]/70 p-4">
        <p className="mb-1 font-semibold text-[var(--psy-ink)]">مناسب برای</p>
        <p>{item.audience}</p>
      </div>
    </div>
  );

  return (
    <article className="psy-tile-card group flex h-full flex-col overflow-hidden rounded-[2rem] border border-[var(--psy-line)] bg-[var(--psy-surface)] shadow-sm transition hover:-translate-y-1 hover:border-[var(--psy-persian-blue)]/30 hover:shadow-xl">
      <div className="p-6">
        <div className="flex items-center gap-3">
          <span className="title inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--psy-persian-blue)] text-sm font-bold text-white shadow-lg shadow-[var(--psy-persian-blue)]/20">
            {new Intl.NumberFormat("fa-IR").format(index + 1)}
          </span>
          <h3 className="text-xl font-bold text-[var(--psy-ink)]">
            {item.title}
          </h3>
        </div>
        <p className="mt-5 text-sm leading-7 text-[var(--psy-muted)] sm:text-base">
          {item.summary}
        </p>
        {detailsAlwaysVisible ? (
          <div className="mt-5 border-t border-[var(--psy-line)] pt-4">
            <p className="text-sm font-semibold text-[var(--psy-persian-blue)]">
              جزئیات و مخاطبان
            </p>
            {detailsContent}
          </div>
        ) : (
          <details className="group/details mt-5 border-t border-[var(--psy-line)] pt-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-[var(--psy-persian-blue)] [&::-webkit-details-marker]:hidden">
              جزئیات و مخاطبان
              <span
                className="text-lg transition group-open/details:rotate-45"
                aria-hidden
              >
                +
              </span>
            </summary>
            {detailsContent}
          </details>
        )}
      </div>
      <div className="mt-auto border-t border-[var(--psy-line)] px-6 py-4">
        <Link
          href={`/psy/therapists?service=${item.slug}`}
          className="flex items-center justify-between text-sm font-semibold text-[var(--psy-persian-blue)]"
        >
          درمانگران مرتبط
          <span
            className="transition group-hover:-translate-x-1"
            aria-hidden
          >
            ←
          </span>
        </Link>
      </div>
    </article>
  );
}

export function PsyServices() {
  return (
    <section
      id="services"
      className="scroll-mt-24 border-t border-[var(--psy-line)] bg-[var(--psy-mist)]/65 py-20 sm:py-28"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-[var(--psy-persian-blue)]">
              حوزه‌های تخصصی مرکز
            </p>
            <h2 className="title mt-3 text-3xl font-bold text-[var(--psy-ink)] sm:text-4xl">
              خدمات مشاوره
            </h2>
          </div>
          <div className="max-w-xl">
            <p className="text-[var(--psy-muted)]">
              حوزه مورد نیازتان را انتخاب کنید، جزئیات آن را بخوانید و درمانگران مرتبط را ببینید.
            </p>
            <Link
              href="/psy/services"
              className="mt-5 inline-flex rounded-full bg-[var(--psy-persian-blue)] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[var(--psy-persian-blue)]/20 transition hover:-translate-y-0.5 hover:bg-[var(--psy-persian-blue-deep)]"
            >
              مشاهده همه خدمات
            </Link>
          </div>
        </div>
        <Swiper
          modules={[Autoplay]}
          dir="rtl"
          slidesPerView="auto"
          slidesPerGroup={1}
          spaceBetween={0}
          loop={SERVICES.length > 3}
          speed={500}
          grabCursor
          autoplay={{
            delay: 2500,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          className="psy-services-swiper mt-12 w-full select-none"
        >
          {SERVICES.map((item, index) => (
            <SwiperSlide
              key={item.slug}
              className="!h-auto !w-full p-2 sm:!w-1/2 md:!w-1/3"
            >
              <ServiceCard
                item={item}
                index={index}
                detailsAlwaysVisible
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}

export function PsyAllServices() {
  return (
    <section className="psy-section py-14 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <header className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold text-[var(--psy-persian-blue)]">
            حوزه‌های تخصصی مرکز
          </p>
          <h1 className="title mt-3 text-3xl font-bold text-[var(--psy-ink)] sm:text-5xl">
            همه خدمات مشاوره
          </h1>
          <p className="mt-5 leading-8 text-[var(--psy-muted)]">
            جزئیات هر حوزه را بررسی کنید و برای مشاهده پروفایل و رزرو نوبت به
            درمانگران مرتبط بروید.
          </p>
        </header>

        <div className="mt-12 grid items-start gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((item, index) => (
            <ServiceCard key={item.slug} item={item} index={index} />
          ))}
        </div>
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
