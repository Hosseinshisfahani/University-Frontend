"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import ThemeToggle from "@/components/theme-toggle";
import MobileNav from "./MobileNav";

const PSY_ORIGIN = process.env.NEXT_PUBLIC_PSY_ORIGIN?.replace(/\/$/, "") ?? "";
const centersHref = PSY_ORIGIN || "/psy";
const loginHref = PSY_ORIGIN ? `${PSY_ORIGIN}/login` : "/login";

const navItems = [
  { href: centersHref, label: "مراکز" },
  { href: "/#think-tanks", label: "اندیشکدگان" },
  { href: "/#student", label: "دانشجویی" },
  { href: "/#intro", label: "دانشگاه" },
  { href: "/contact", label: "درباره ما" },
];

/** University marketing header — login is routed through /psy. */
export default function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="pointer-events-none absolute inset-x-0 top-0 z-50">
      <div className="pointer-events-auto mx-auto max-w-7xl px-4 pt-4 sm:px-6 lg:px-10">
        <nav
          className={`grid grid-cols-[1fr_auto] items-center gap-3 rounded-2xl border px-4 py-2.5 transition-all duration-300 select-none lg:grid-cols-[1fr_auto_1fr] lg:px-5 lg:py-3 ${
            scrolled
              ? "border-white/15 bg-black/55 shadow-[0_12px_40px_rgba(0,0,0,0.28)] backdrop-blur-xl"
              : "border-white/10 bg-black/35 shadow-[0_8px_30px_rgba(0,0,0,0.18)] backdrop-blur-md"
          }`}
        >
          <Link
            href="/"
            className="justify-self-start shrink-0"
            aria-label="صفحه اصلی"
          >
            <Image
              src="/static/logo.png"
              alt="Logo"
              width={48}
              height={48}
              priority
              className="h-10 w-10 object-contain drop-shadow-[0_2px_10px_rgba(0,0,0,0.55)] lg:h-12 lg:w-12"
            />
          </Link>

          <ul className="col-start-2 row-start-1 hidden items-center justify-center gap-7 lg:flex">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="relative text-[15px] font-medium tracking-wide text-white/80 transition-colors duration-200 hover:text-primary after:absolute after:right-0 after:-bottom-1 after:h-px after:w-0 after:bg-primary after:transition-all after:duration-300 hover:after:w-full"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="col-start-3 row-start-1 hidden shrink-0 items-center justify-self-end gap-3 lg:flex">
            <ThemeToggle className="border-white/20 text-white hover:bg-white/10" />
            <Link
              href={loginHref}
              title="ورود از طریق مراکز"
              className="whitespace-nowrap rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-[#332B1A] shadow-[0_0_24px_rgba(229,194,115,0.4)] transition duration-200 hover:brightness-110 hover:shadow-[0_0_32px_rgba(229,194,115,0.55)]"
            >
              ورود و ثبت نام
            </Link>
          </div>

          <div className="col-start-2 justify-self-end lg:hidden">
            <MobileNav />
          </div>
        </nav>
      </div>
    </header>
  );
}
