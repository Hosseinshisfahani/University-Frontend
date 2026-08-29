import type { Metadata } from "next";
import LoginForm from "@/features/auth/components/LoginForm";

export const metadata: Metadata = {
  title: "ورود",
  description: "ورود به حساب کاربری دانشگاه معارف قرآن و عترت",
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginPage() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center px-4 pt-28 pb-16 lg:pt-40">
      <LoginForm />
    </main>
  );
}
