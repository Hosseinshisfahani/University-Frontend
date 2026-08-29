"use client";
import { useState } from "react";
import Link from "next/link";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
} from "@headlessui/react";
import { HiBars3, HiXMark } from "react-icons/hi2";
import ThemeToggle from "@/components/theme-toggle";

const links = [
  { href: "/psy", label: "مراکز" },
  { href: "/#think-tanks", label: "اندیشکدگان" },
  { href: "/#student", label: "دانشجویی" },
  { href: "/#intro", label: "دانشگاه" },
  { href: "/contact", label: "درباره ما" },
];

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex items-center gap-2 lg:hidden">
      <ThemeToggle className="border-white/25 text-white hover:bg-white/10" />
      <button
        type="button"
        aria-label="باز کردن منو"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="cursor-pointer rounded-full border border-white/25 p-2 text-white transition-colors hover:bg-white/10 select-none"
      >
        <HiBars3 size={22} />
      </button>

      <Dialog open={open} onClose={() => setOpen(false)} className="relative z-50">
        <DialogBackdrop className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" />
        <DialogPanel className="fixed top-0 right-0 z-50 h-full w-72 max-w-[80%] bg-background text-foreground shadow-2xl p-6 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold">منو</span>
            <button
              type="button"
              aria-label="بستن منو"
              onClick={() => setOpen(false)}
              className="p-2 rounded-full border border-foreground/20 cursor-pointer select-none"
            >
              <HiXMark size={22} />
            </button>
          </div>
          <ul className="flex flex-col gap-2">
            {links.map((link) => (
              <li key={link.href + link.label}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block px-4 py-3 rounded-xl text-gray-600 hover:bg-foreground/5 hover:text-foreground dark:text-gray-300 dark:hover:text-white"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href="/psy"
            title="ورود از طریق مراکز"
            onClick={() => setOpen(false)}
            className="mt-auto rounded-full bg-primary px-5 py-3 text-center text-sm font-semibold text-[#332B1A] shadow-[0_0_24px_rgba(229,194,115,0.35)] select-none"
          >
            ورود و ثبت نام
          </Link>
        </DialogPanel>
      </Dialog>
    </div>
  );
}
