"use client";

import { formatJalaliFriendlyDate, formatJalaliTime } from "@/lib/datetime/jalali";
import { useSharedNotes } from "@/app/(institutes)/(psy_institute)/_shared/use-psy";

export function NotesListClient() {
  const { data, isLoading } = useSharedNotes();

  if (isLoading) return <p className="text-foreground/50">در حال بارگذاری…</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="title gradient-text text-3xl font-extrabold">یادداشت‌ها</h1>
        <p className="mt-2 text-sm text-foreground/60">
          یادداشت‌هایی که درمانگر با شما به اشتراک گذاشته است.
        </p>
      </div>
      <div className="space-y-3">
        {(data ?? []).map((note) => (
          <article
            key={note.id}
            className="rounded-xl border border-foreground/10 bg-white/60 p-4 dark:bg-[#121212]/70"
          >
            <header className="border-b border-foreground/10 pb-3">
              <p className="text-sm font-medium">{note.therapist_name}</p>
              {note.appointment_starts_at ? (
                <p className="mt-1 text-sm text-foreground/55">
                  جلسه {formatJalaliFriendlyDate(note.appointment_starts_at)}
                  <span className="mx-2 text-foreground/25">·</span>
                  ساعت {formatJalaliTime(note.appointment_starts_at)}
                </p>
              ) : null}
            </header>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-7">{note.body}</p>
          </article>
        ))}
        {!data?.length ? (
          <p className="text-sm text-foreground/50">یادداشت اشتراکی وجود ندارد.</p>
        ) : null}
      </div>
    </div>
  );
}
