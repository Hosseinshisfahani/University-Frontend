import type { IconType } from "react-icons";
import { FaAward, FaCertificate, FaMedal, FaShieldAlt } from "react-icons/fa";

export type FooterLink = { label: string; href: string };
export type FooterCert = { icon: IconType; label: string };

export const socialLinks: FooterLink[] = [
  { label: "سروش پلاس", href: "/" },
  { label: "واتساپ", href: "/" },
  { label: "پیام رسان ایتا", href: "/" },
  { label: "روبیکا", href: "/" },
  { label: "آی گپ", href: "/" },
];

export const usefulLinks: FooterLink[] = [
  { label: "معاونت ها", href: "/" },
  { label: "چارت سازمانی", href: "/" },
  { label: "اندیشکدگان", href: "/" },
  { label: "دانشکده ها", href: "/" },
  { label: "دوره های آموزشی", href: "/" },
  { label: "اخبار و اطلاعات", href: "/" },
];

export const certificates: FooterCert[] = [
  { icon: FaCertificate, label: "مجوز رسمی" },
  { icon: FaShieldAlt, label: "نماد اعتماد" },
  { icon: FaAward, label: "تاییدیه کیفیت" },
  { icon: FaMedal, label: "استاندارد ملی" },
];
