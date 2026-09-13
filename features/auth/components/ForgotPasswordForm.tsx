"use client";

import { type FormEvent, useState } from "react";
import Link from "next/link";
import { ApiError } from "@/lib/api/client";
import { toAsciiDigits } from "@/lib/phone";
import { useConfirmPasswordReset, useRequestPasswordReset } from "../hooks";

function fieldMessage(body: Record<string, unknown> | null, key: string): string {
  const value = body?.[key];
  if (typeof value === "string" && value) return value;
  if (Array.isArray(value) && value[0]) return String(value[0]);
  return "";
}

export default function ForgotPasswordForm() {
  const requestReset = useRequestPasswordReset();
  const confirmReset = useConfirmPasswordReset();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function parseResetError(err: unknown, fallback: string) {
    if (err instanceof ApiError && err.status === 400) {
      const body = err.body as Record<string, unknown> | null;
      setError(
        fieldMessage(body, "otp") ||
          fieldMessage(body, "phone") ||
          fieldMessage(body, "password") ||
          fieldMessage(body, "password_confirm") ||
          fieldMessage(body, "detail") ||
          fallback,
      );
    } else if (err instanceof ApiError) {
      setError("بازیابی رمز ناموفق بود. دوباره تلاش کنید.");
    } else {
      setError("ارتباط با سرور برقرار نشد. دوباره تلاش کنید.");
    }
  }

  async function sendOtp() {
    setError(null);
    try {
      await requestReset.mutateAsync(phone);
      setOtpSent(true);
    } catch (err) {
      parseResetError(err, "ارسال کد ناموفق بود.");
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!otpSent) {
      await sendOtp();
      return;
    }

    if (password !== passwordConfirm) {
      setError("رمز عبور و تکرار آن یکسان نیستند.");
      return;
    }

    try {
      await confirmReset.mutateAsync({
        phone,
        otp,
        password,
        password_confirm: passwordConfirm,
      });
    } catch (err) {
      parseResetError(err, "اطلاعات بازیابی نامعتبر است.");
    }
  }

  const fieldClass =
    "rounded-lg border border-foreground/10 bg-background px-4 py-3 outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:opacity-60";

  return (
    <form
      onSubmit={onSubmit}
      className="mx-auto flex w-full max-w-md flex-col gap-5 rounded-2xl border border-foreground/10 bg-background p-8 shadow-[0_12px_40px_rgba(28,43,42,0.06)]"
    >
      <div className="text-center">
        <h1 className="title text-3xl font-extrabold text-foreground">بازیابی رمز عبور</h1>
        <p className="mt-2 text-sm text-foreground/60">
          کد تایید به شماره تلفن حساب شما ارسال می‌شود
        </p>
      </div>

      <label className="flex flex-col gap-2 text-sm">
        <span className="font-medium text-foreground/80">تلفن</span>
        <input
          name="phone"
          type="tel"
          autoComplete="tel"
          required
          disabled={otpSent}
          value={phone}
          onChange={(e) => setPhone(toAsciiDigits(e.target.value))}
          className={fieldClass}
        />
      </label>

      {otpSent ? (
        <>
          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium text-foreground/80">کد تایید</span>
            <input
              name="otp"
              inputMode="numeric"
              autoComplete="one-time-code"
              required
              minLength={6}
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(toAsciiDigits(e.target.value))}
              className={fieldClass}
            />
          </label>

          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium text-foreground/80">رمز عبور جدید</span>
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
        </>
      ) : null}

      {error ? (
        <p
          className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-300"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      {otpSent ? (
        <button
          type="submit"
          disabled={confirmReset.isPending}
          className="rounded-lg bg-primary px-6 py-3.5 text-base font-medium text-[#332B1A]/90 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {confirmReset.isPending ? "در حال به‌روزرسانی…" : "به‌روزرسانی رمز عبور"}
        </button>
      ) : (
        <button
          type="submit"
          disabled={requestReset.isPending}
          className="rounded-lg bg-primary px-6 py-3.5 text-base font-medium text-[#332B1A]/90 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {requestReset.isPending ? "در حال ارسال…" : "ارسال کد تایید"}
        </button>
      )}

      <p className="text-center text-sm text-foreground/60">
        <Link href="/login" className="font-medium text-foreground hover:text-primary">
          بازگشت به ورود
        </Link>
      </p>
    </form>
  );
}
