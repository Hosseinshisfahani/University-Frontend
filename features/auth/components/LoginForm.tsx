"use client";

import { type FormEvent, useState } from "react";
import Link from "next/link";
import { ApiError } from "@/lib/api/client";
import { useLogin, useRedirectIfAuthenticated } from "../hooks";

export default function LoginForm() {
  const login = useLogin();
  const { isHolding } = useRedirectIfAuthenticated();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    try {
      await login.mutateAsync({ username, password });
    } catch (err) {
      if (err instanceof ApiError && (err.status === 400 || err.status === 401)) {
        setError("نام کاربری یا رمز عبور نادرست است.");
      } else if (err instanceof ApiError) {
        setError("ورود ناموفق بود. دوباره تلاش کنید.");
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
        <h1 className="title text-3xl font-extrabold text-foreground">ورود</h1>
        <p className="mt-2 text-sm text-foreground/60">
          ورود به پورتال مرکز روان‌شناسی
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
        <span className="font-medium text-foreground/80">رمز عبور</span>
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={fieldClass}
        />
      </label>

      <p className="text-start text-sm">
        <Link href="/forgot-password" className="font-medium text-foreground hover:text-primary">
          فراموشی رمز عبور
        </Link>
      </p>

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
        disabled={login.isPending}
        className="rounded-lg bg-primary px-6 py-3.5 text-base font-medium text-[#332B1A]/90 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {login.isPending ? "در حال ورود…" : "ورود"}
      </button>

      <p className="text-center text-sm text-foreground/60">
        حساب ندارید؟{" "}
        <Link href="/register" className="font-medium text-foreground hover:text-primary">
          ثبت نام
        </Link>
      </p>
    </form>
  );
}
