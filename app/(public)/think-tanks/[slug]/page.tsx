import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { IconType } from "react-icons";
import {
  FaArrowRight,
  FaBroadcastTower,
  FaComments,
  FaPaperPlane,
  FaPlay,
  FaWhatsapp,
} from "react-icons/fa";
import { FaPhone } from "react-icons/fa";
import { IoLocationOutline } from "react-icons/io5";
import Content from "@/app/(public)/_components/layout/Content";
import { socialLinks } from "@/app/_data/footer";
import {
  getThinkTankBySlug,
  listThinkTanks,
} from "@/features/think-tanks/api";

type ThinkTankPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const thinkTanks = await listThinkTanks();
  return thinkTanks.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({
  params,
}: ThinkTankPageProps): Promise<Metadata> {
  const { slug } = await params;
  const thinkTank = await getThinkTankBySlug(slug);

  if (!thinkTank) {
    return {};
  }

  return {
    title: thinkTank.title,
    description: thinkTank.description,
    alternates: {
      canonical: `/think-tanks/${thinkTank.slug}`,
    },
    openGraph: {
      title: thinkTank.title,
      description: thinkTank.description,
      images: [{ url: thinkTank.src }],
    },
  };
}

const SOCIAL_ICON_MAP: Record<string, IconType> = {
  "سروش پلاس": FaBroadcastTower,
  واتساپ: FaWhatsapp,
  "پیام رسان ایتا": FaPaperPlane,
  روبیکا: FaPlay,
  "آی گپ": FaComments,
};

export default async function ThinkTankPage({ params }: ThinkTankPageProps) {
  const { slug } = await params;
  const thinkTank = await getThinkTankBySlug(slug);

  if (!thinkTank) {
    notFound();
  }

  const others = (await listThinkTanks()).filter((item) => item.slug !== slug);

  return (
    <main className="pt-28 lg:pt-40">
      <Content>
        {/* Back button */}
        <div className="mb-6 lg:mb-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-foreground/70 transition-colors hover:text-primary lg:text-base"
          >
            بازگشت به صفحه اصلی
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground/10">
              <FaArrowRight className="h-3.5 w-3.5" aria-hidden />
            </span>
          </Link>
        </div>

        {/* Hero panel: image right, content left */}
        <div className="grid overflow-hidden rounded-3xl border border-primary/20 bg-white shadow-xl dark:border-primary/15 dark:bg-[#0d0d0d] dark:shadow-2xl lg:grid-cols-2">
          {/* Image column (renders on the right in RTL) */}
          <div className="relative flex min-h-[280px] items-center justify-center overflow-hidden bg-gradient-to-br from-primary/15 via-background to-primary/5 p-8 dark:from-black dark:via-[#111111] dark:to-black lg:min-h-[560px] lg:p-12">
            <div
              className="pointer-events-none absolute top-1/4 right-1/4 h-56 w-56 rounded-full bg-primary/15 blur-3xl"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute bottom-1/4 left-1/4 h-56 w-56 rounded-full bg-primary/10 blur-3xl"
              aria-hidden
            />
            {/* Neutral card so both light- and dark-background logo assets read cleanly */}
            <div className="relative z-10 aspect-square w-full max-w-[280px] overflow-hidden rounded-[2rem] border border-primary/10 bg-white shadow-2xl lg:max-w-[380px]">
              <Image
                className="object-contain p-8 lg:p-10"
                alt={thinkTank.alt}
                src={thinkTank.src}
                fill
                sizes="(min-width: 1024px) 380px, 280px"
                priority
              />
            </div>
          </div>

          {/* Content column (renders on the left in RTL) */}
          <div className="flex flex-col justify-center gap-5 p-8 lg:p-14">
            <h1 className="title gradient-text text-3xl font-extrabold leading-tight lg:text-5xl">
              {thinkTank.title}
            </h1>

            <p className="text-justify text-sm leading-8 text-foreground/70 lg:text-base lg:leading-9">
              {thinkTank.description}
            </p>

            {/* Social links */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {socialLinks.map((link) => {
                const SocialIcon = SOCIAL_ICON_MAP[link.label] ?? FaComments;
                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    title={link.label}
                    aria-label={link.label}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-foreground/5 text-primary transition hover:-translate-y-0.5 hover:bg-primary hover:text-black"
                  >
                    <SocialIcon className="h-4 w-4" aria-hidden />
                  </Link>
                );
              })}
            </div>

            {/* Contact meta */}
            <div className="flex flex-wrap items-center gap-4 border-t border-foreground/10 pt-4 text-xs text-foreground/50 lg:text-sm">
              <span className="inline-flex items-center gap-1.5">
                <IoLocationOutline className="h-4 w-4" aria-hidden />
                اصفهان، اتوبان شهید خرازی، ابتدای خیابان شهیدان غربی
              </span>
              <span className="inline-flex items-center gap-1.5 ltr">
                <FaPhone className="h-3.5 w-3.5" aria-hidden />
                03135856526
              </span>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}

      </Content>

      {/* Related think tanks */}
      {others.length > 0 && (
        <Content>
          <h2 className="title gradient-text py-2 text-center text-2xl font-bold lg:py-6 lg:text-4xl">
            «سایر اندیشکدگان»
          </h2>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">
            {others.map((logo) => (
              <Link
                key={logo.slug}
                href={`/think-tanks/${logo.slug}`}
                className="group flex flex-col items-center gap-3 rounded-2xl border border-transparent p-4 text-center transition hover:-translate-y-1 hover:border-primary/30 hover:bg-primary/5"
              >
                <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border border-primary/20 bg-white p-3 shadow-sm transition group-hover:scale-105 group-hover:border-primary/50 lg:h-24 lg:w-24">
                  <Image
                    className="h-full w-full object-contain"
                    alt={logo.alt}
                    src={logo.src}
                    width={100}
                    height={100}
                  />
                </div>
                <span className="line-clamp-2 text-xs font-medium text-foreground/80 transition-colors group-hover:text-primary lg:text-sm">
                  {logo.title}
                </span>
              </Link>
            ))}
          </div>
        </Content>
      )}
    </main>
  );
}
