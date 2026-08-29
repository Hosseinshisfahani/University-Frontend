import Image from "next/image";
import Link from "next/link";
import { FaPhone } from "react-icons/fa";
import { IoMdMail } from "react-icons/io";
import { IoLocationOutline } from "react-icons/io5";
import { certificates, socialLinks, usefulLinks } from "@/app/_data/footer";
import GoToTop from "./GoToTop";

export default function Footer() {
  return (
    <footer className="bg-black text-white w-full py-10 lg:py-15 px-6 lg:px-10 flex flex-wrap items-start content-center h-auto lg:h-[500px]">
      <div className="basis-full lg:basis-2/12 p-4 flex flex-col items-center lg:h-full justify-between gap-6">
        <Link href="/" aria-label="صفحه اصلی">
          <Image src="/static/logo.png" alt="LOGO" width={100} height={100} />
        </Link>
        <GoToTop />
      </div>
      <div className="basis-1/2 lg:basis-2/12 p-4">
        <h4 className="text-xl font-extrabold text-white tracking-[-0.02em] leading-none">فضای مجازی</h4>
        <ul className="py-4 select-none">
          {socialLinks.map((link, idx) => (
            <li key={idx} className="py-2">
              <Link href={link.href} className=" font-medium text-[#CCCCCC] tracking-[-0.02em] leading-none hover:text-primary transition-colors">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div className="basis-1/2 lg:basis-2/12 p-4">
        <h4 className="text-xl font-extrabold text-white tracking-[-0.02em] leading-none">لینک های کاربردی</h4>
        <ul className="py-4 select-none">
          {usefulLinks.map((link, idx) => (
            <li key={idx} className="py-2">
              <Link href={link.href} className=" font-medium text-[#CCCCCC] tracking-[-0.02em] leading-none hover:text-primary transition-colors">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div className="basis-full md:basis-1/2 lg:basis-2/12 p-4">
        <h4 className="text-xl font-extrabold text-white tracking-[-0.02em] leading-none">مجوز ها</h4>
        <div className="grid grid-cols-2 gap-3 py-6">
          {certificates.map((cert, idx) => {
            const Icon = cert.icon;
            return (
              <div
                key={idx}
                className="flex flex-col items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-3 text-center transition-colors hover:border-primary/40"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/15 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-xs leading-tight text-[#CCCCCC]">{cert.label}</span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="basis-full lg:basis-4/12 p-4">
        <h4 className="text-xl font-extrabold text-white tracking-[-0.02em] leading-none">ارتباط با ما</h4>
        <ul className="py-4">
          <li className="flex flex-nowrap justify-start gap-4 items-center py-2">
            <div className="rounded-full p-3 bg-slate-700 text-primary">
              <IoLocationOutline className="w-8 h-8" />
            </div>
            <h6 className="text-sm text-slate-100">
              اصفهان، اتوبان شهید خرازی، ابتدای خیابان شهیدان غربی
            </h6>
          </li>
          <li className="flex flex-nowrap justify-start gap-4 items-center py-2">
            <div className="rounded-full p-3 bg-slate-700 text-primary">
              <FaPhone className="w-8 h-8 p-1" />
            </div>
            <h6 className="text-sm text-slate-100 ltr">03135856526</h6>
          </li>
          <li className="flex flex-nowrap justify-start gap-4 items-center py-2">
            <div className="rounded-full p-3 bg-slate-700 text-primary">
              <IoMdMail className="w-8 h-8" />
            </div>
            <h6 className="text-sm text-slate-100 ltr">contact@khunamun-edu.com</h6>
          </li>
        </ul>
      </div>
    </footer>
  );
}
