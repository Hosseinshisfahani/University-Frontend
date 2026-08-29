"use client";

import { type FormEvent, useState } from "react";
import Link from "next/link";
import { ApiError } from "@/lib/api/client";
import { useRegister, useRedirectIfAuthenticated } from "../hooks";

export default function RegisterForm() {
  const register = useRegister();
  const { isHolding } = useRedirectIfAuthenticated();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (password !== passwordConfirm) {
      setError("رمز عبور و تکرار آن یکسان نیستند.");
      return;
    }

    try {
      await register.mutateAsync({
        username,
        password,
        password_confirm: passwordConfirm,
        email: email || undefined,
        phone: phone || undefined,
      });
    } catch (err) {
      if (err instanceof ApiError && err.status === 400) {
        const body = err.body as Record<string, unknown> | null;
        const detail =
          (typeof body?.username === "object" &&
            Array.isArray(body.username) &&
            String(body.username[0])) ||
          (typeof body?.password === "object" &&
            Array.isArray(body.password) &&
            String(body.password[0])) ||
          (typeof body?.password_confirm === "object" &&
            Array.isArray(body.password_confirm) &&
            String(body.password_confirm[0])) ||
          (typeof body?.detail === "string" && body.detail) ||
          "اطلاعات ثبت نام نامعتبر است.";
        setError(detail);
      } else if (err instanceof ApiError) {
        setError("ثبت نام ناموفق بود. دوباره تلاش کنید.");
      } else {
        setError("ارتباط با سرور برقرار نشد. دوباره تلاش کنید.");
      }
    }
  }

  const fieldClass =
    "rounded-lg border border-foreground/10 bg-background px-4 py-3 outline-none transition focus:border-primary";

  if (isHolding) {
    return (
      <p className="text-center text-sm text-foreground/60">در حال انتقال…</p>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mx-auto flex w-full max-w-md flex-col gap-5 rounded-2xl border border-foreground/10 bg-background p-8 shadow-[0_12px_40px_rgba(28,43,42,0.06)]"
    >
      <div className="text-center">
        <h1 className="title text-3xl font-extrabold text-foreground">ثبت نام</h1>
        <p className="mt-2 text-sm text-foreground/60">
          ایجاد حساب مراجع در مرکز روان‌شناسی
        </p>
      </div>

      <label className="flex flex-col gap-2 text-sm">
        <span className="font-medium text-foreground/80">نام کاربری</span>
        <input
          name="username"
          autoComplete="username"
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className={fieldClass}
        />
      </label>

      <label className="flex flex-col gap-2 text-sm">
        <span className="font-medium text-foreground/80">ایمیل (اختیاری)</span>
        <input
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={fieldClass}
        />
      </label>

      <label className="flex flex-col gap-2 text-sm">
        <span className="font-medium text-foreground/80">تلفن (اختیاری)</span>
        <input
          name="phone"
          type="tel"
          autoComplete="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className={fieldClass}
        />
      </label>

      <label className="flex flex-col gap-2 text-sm">
        <span className="font-medium text-foreground/80">رمز عبور</span>
        <input
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={fieldClass}
        />
      </label>

      <label className="flex flex-col gap-2 text-sm">
        <span className="font-medium text-foreground/80">تکرار رمز عبور</span>
        <input
          name="password_confirm"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={passwordConfirm}
          onChange={(e) => setPasswordConfirm(e.target.value)}
          className={fieldClass}
        />
      </label>

      {error ? (
        <p
          className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-300"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={register.isPending}
        className="rounded-lg bg-primary px-6 py-3.5 text-base font-medium text-[#332B1A]/90 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {register.isPending ? "در حال ثبت نام…" : "ثبت نام"}
      </button>

      <p className="text-center text-sm text-foreground/60">
        حساب دارید؟{" "}
        <Link href="/login" className="font-medium text-foreground hover:text-primary">
          ورود
        </Link>
      </p>
    </form>
  );
}
