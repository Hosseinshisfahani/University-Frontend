"use client";

import Link from "next/link";
import { formatIrr } from "@/features/finance/types";
import {
  formatJalaliFriendlyDate,
  formatJalaliTime,
  formatJalaliTimeRange,
} from "@/lib/datetime/jalali";
import { useWorkshops, useCancelWorkshopEnrollment, useCreateWorkshop, useDeleteWorkshop, useUpdateWorkshop, useWorkshop, useWorkshopRoster, useWorkshopResourcesAdmin, useWorkshopSessionsAdmin } from "@/app/(institutes)/(psy_institute)/_shared/use-psy";
import { useParams, useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useAdminTherapists } from "@/app/(institutes)/(psy_institute)/_shared/use-psy-admin";
import type { Workshop, WorkshopWrite, WorkshopResourceWrite, WorkshopSessionWrite } from "@/app/(institutes)/(psy_institute)/_shared/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { psyApi } from "@/app/(institutes)/(psy_institute)/_shared/api";

/** Admin sees all workshops (including drafts) via unauthenticated? No — admin cookie. */
export function WorkshopsAdminListClient() {
  const { data, isLoading } = useWorkshops(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="title text-2xl font-bold">کارگاه‌ها</h1>
          <p className="mt-1 text-sm opacity-55">ایجاد، انتشار و مدیریت ظرفیت</p>
        </div>
        <Link
          href="/admin/workshops/new"
          className="rounded-md bg-teal-800 px-4 py-2 text-sm text-white"
        >
          کارگاه جدید
        </Link>
      </div>

      {isLoading ? <p className="text-sm opacity-60">در حال بارگذاری…</p> : null}

      <ul className="space-y-2">
        {(data ?? []).map((w) => (
          <li key={w.id}>
            <Link
              href={`/admin/workshops/${w.slug}`}
              className="block rounded-lg border border-[#0f1a1c]/10 bg-white px-4 py-3 hover:border-teal-600/40 dark:border-white/10 dark:bg-[#0f1618]"
            >
              <span className="font-medium">{w.title}</span>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {w.starts_at ? (
                  <span className="text-xs opacity-55">
                    شروع کارگاه {formatJalaliFriendlyDate(w.starts_at)}
                    <span className="mx-1.5 opacity-40">·</span>
                    ساعت {formatJalaliTime(w.starts_at)}
                  </span>
                ) : null}
                <span className="rounded-md bg-[#0f1a1c]/6 px-2 py-1 text-xs font-medium opacity-80 dark:bg-white/8">
                  {w.seats_taken} از {w.capacity} نفر
                </span>
                <span className="rounded-md bg-[#0f1a1c]/6 px-2 py-1 text-xs font-medium opacity-80 dark:bg-white/8">
                  {Number(w.price) === 0 ? "رایگان" : formatIrr(w.price)}
                </span>
                <span className="rounded-md bg-[#0f1a1c]/6 px-2 py-1 text-xs font-medium opacity-80 dark:bg-white/8">
                  {w.is_published ? "منتشرشده" : "پیش‌نویس"}
                </span>
              </div>
            </Link>
          </li>
        ))}
        {!isLoading && !(data?.length) ? (
          <li className="text-sm opacity-50">کارگاهی نیست.</li>
        ) : null}
      </ul>
    </div>
  );
}


function slugify(input: string) {
  return (
    input
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/gi, "")
      .slice(0, 80) || `workshop-${Date.now()}`
  );
}

function emptyForm(): WorkshopWrite {
  return {
    title: "",
    slug: "",
    description: "",
    instructor_id: null,
    capacity: 20,
    price: "0",
    starts_at: "",
    ends_at: "",
    recording_url: "",
    is_published: false,
    certificate_enabled: false,
    body_md: "",
  };
}

function formFromWorkshop(existing: Workshop): WorkshopWrite {
  return {
    title: existing.title,
    slug: existing.slug,
    description: existing.description,
    body_md: existing.body_md ?? "",
    instructor_id: existing.instructor_id,
    capacity: existing.capacity,
    price: existing.price,
    starts_at: existing.starts_at ? existing.starts_at.slice(0, 16) : "",
    ends_at: existing.ends_at ? existing.ends_at.slice(0, 16) : "",
    banner_image: existing.banner_image || "",
    recording_url: existing.recording_url,
    is_published: existing.is_published,
    certificate_enabled: existing.certificate_enabled,
  };
}

function workshopPayloadToFormData(
  payload: WorkshopWrite,
  bannerFile: File | null,
): FormData {
  const fd = new FormData();
  fd.append("title", payload.title);
  fd.append("slug", payload.slug);
  fd.append("description", payload.description ?? "");
  fd.append("body_md", payload.body_md ?? "");
  if (payload.instructor_id != null) {
    fd.append("instructor_id", String(payload.instructor_id));
  }
  fd.append("capacity", String(payload.capacity));
  fd.append("price", String(payload.price));
  if (payload.starts_at) fd.append("starts_at", payload.starts_at);
  if (payload.ends_at) fd.append("ends_at", payload.ends_at);
  fd.append("recording_url", payload.recording_url ?? "");
  fd.append("is_published", payload.is_published ? "true" : "false");
  fd.append("certificate_enabled", payload.certificate_enabled ? "true" : "false");
  if (bannerFile) fd.append("banner_image", bannerFile);
  return fd;
}

function WorkshopFormFields({
  mode,
  initial,
  slugParam,
  therapists,
}: {
  mode: "new" | "edit";
  initial: WorkshopWrite;
  slugParam: string;
  therapists: { id: number; display_name: string }[];
}) {
  const router = useRouter();
  const create = useCreateWorkshop();
  const update = useUpdateWorkshop();
  const [form, setForm] = useState(initial);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const existingBanner =
    mode === "edit" && typeof initial.banner_image === "string"
      ? initial.banner_image
      : "";

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const payload: WorkshopWrite = {
      ...form,
      slug: form.slug || slugify(form.title),
      starts_at: form.starts_at ? new Date(form.starts_at).toISOString() : null,
      ends_at: form.ends_at ? new Date(form.ends_at).toISOString() : null,
      price: String(form.price),
    };
    // ImageField only accepts file uploads, not URL strings.
    const { banner_image: _banner, ...jsonPayload } = payload;
    void _banner;
    const data: WorkshopWrite | FormData = bannerFile
      ? workshopPayloadToFormData(payload, bannerFile)
      : jsonPayload;
    try {
      if (mode === "new") {
        const created = await create.mutateAsync(data);
        router.push(`/admin/workshops/${created.slug}`);
      } else {
        await update.mutateAsync({ slug: slugParam, data });
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "ذخیره ناموفق بود");
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4 rounded-lg border border-[#0f1a1c]/10 bg-white p-5 dark:border-white/10 dark:bg-[#0f1618]"
    >
      <label className="block text-sm">
        <span className="mb-1 block opacity-60">عنوان</span>
        <input
          required
          className="w-full rounded-md border px-3 py-2 dark:border-white/15 dark:bg-transparent"
          value={form.title}
          onChange={(e) => {
            const title = e.target.value;
            setForm((f) => ({
              ...f,
              title,
              slug: mode === "new" && !f.slug ? slugify(title) : f.slug,
            }));
          }}
        />
      </label>
      <label className="block text-sm">
        <span className="mb-1 block opacity-60">اسلاگ</span>
        <input
          required
          className="w-full rounded-md border px-3 py-2 font-mono text-sm dark:border-white/15 dark:bg-transparent"
          value={form.slug}
          onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
          disabled={mode === "edit"}
        />
      </label>
      <label className="block text-sm">
        <span className="mb-1 block opacity-60">توضیح کوتاه (کارت‌ها)</span>
        <textarea
          rows={2}
          className="w-full rounded-md border px-3 py-2 dark:border-white/15 dark:bg-transparent"
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
        />
      </label>
      <label className="block text-sm">
        <span className="mb-1 block opacity-60">مقدمه کامل (Markdown)</span>
        <textarea
          rows={8}
          className="w-full rounded-md border px-3 py-2 font-mono text-xs dark:border-white/15 dark:bg-transparent"
          value={form.body_md ?? ""}
          onChange={(e) => setForm((f) => ({ ...f, body_md: e.target.value }))}
        />
      </label>
      <label className="block text-sm">
        <span className="mb-1 block opacity-60">مدرس</span>
        <select
          className="w-full rounded-md border px-3 py-2 dark:border-white/15 dark:bg-transparent"
          value={form.instructor_id ?? ""}
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              instructor_id: e.target.value ? Number(e.target.value) : null,
            }))
          }
        >
          <option value="">—</option>
          {therapists.map((t) => (
            <option key={t.id} value={t.id}>
              {t.display_name}
            </option>
          ))}
        </select>
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="mb-1 block opacity-60">ظرفیت</span>
          <input
            type="number"
            min={1}
            required
            className="w-full rounded-md border px-3 py-2 dark:border-white/15 dark:bg-transparent"
            value={form.capacity}
            onChange={(e) =>
              setForm((f) => ({ ...f, capacity: Number(e.target.value) }))
            }
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block opacity-60">قیمت (ریال)</span>
          <input
            type="number"
            min={0}
            required
            className="w-full rounded-md border px-3 py-2 dark:border-white/15 dark:bg-transparent"
            value={form.price}
            onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block opacity-60">شروع</span>
          <input
            type="datetime-local"
            className="w-full rounded-md border px-3 py-2 dark:border-white/15 dark:bg-transparent"
            value={form.starts_at ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, starts_at: e.target.value }))}
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block opacity-60">پایان</span>
          <input
            type="datetime-local"
            className="w-full rounded-md border px-3 py-2 dark:border-white/15 dark:bg-transparent"
            value={form.ends_at ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, ends_at: e.target.value }))}
          />
        </label>
      </div>
      <label className="block text-sm">
        <span className="mb-1 block opacity-60">تصویر بنر</span>
        <input
          type="file"
          accept="image/*"
          className="w-full rounded-md border px-3 py-2 text-sm dark:border-white/15 dark:bg-transparent"
          onChange={(e) => setBannerFile(e.target.files?.[0] ?? null)}
        />
        {existingBanner && !bannerFile ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={existingBanner}
            alt=""
            className="mt-2 h-24 w-auto rounded-md object-cover"
          />
        ) : null}
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={Boolean(form.is_published)}
          onChange={(e) => setForm((f) => ({ ...f, is_published: e.target.checked }))}
        />
        منتشر شود
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={Boolean(form.certificate_enabled)}
          onChange={(e) =>
            setForm((f) => ({ ...f, certificate_enabled: e.target.checked }))
          }
        />
        گواهی پایان دوره فعال باشد
      </label>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button
        type="submit"
        disabled={create.isPending || update.isPending}
        className="rounded-md bg-teal-800 px-4 py-2 text-sm text-white disabled:opacity-50"
      >
        ذخیره
      </button>
    </form>
  );
}

export function WorkshopEditorClient({ mode }: { mode: "new" | "edit" }) {
  const params = useParams();
  const slugParam = mode === "edit" ? String(params.slug || "") : "";
  const router = useRouter();
  const { data: existing, isLoading } = useWorkshop(slugParam);
  const { data: therapists } = useAdminTherapists({ page: 1 });
  const { data: roster } = useWorkshopRoster(mode === "edit" ? slugParam : "");
  const remove = useDeleteWorkshop();
  const cancelEnrollment = useCancelWorkshopEnrollment();

  const therapistOpts = (therapists?.results ?? []).map((t) => ({
    id: t.id,
    display_name: t.display_name,
  }));

  if (mode === "edit" && isLoading) {
    return <p className="text-sm opacity-60">در حال بارگذاری…</p>;
  }

  const initial =
    mode === "edit" && existing ? formFromWorkshop(existing) : emptyForm();
  const formKey =
    mode === "edit" && existing ? `edit-${existing.id}` : "new";

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <Link href="/admin/workshops" className="text-sm text-teal-700 dark:text-teal-300">
        ← فهرست کارگاه‌ها
      </Link>
      <h1 className="title text-2xl font-bold">
        {mode === "new" ? "کارگاه جدید" : `ویرایش: ${existing?.title ?? slugParam}`}
      </h1>

      <WorkshopFormFields
        key={formKey}
        mode={mode}
        initial={initial}
        slugParam={slugParam}
        therapists={therapistOpts}
      />

      {mode === "edit" ? (
        <>
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/admin/workshops/${slugParam}/curriculum`}
              className="rounded-md border border-teal-700/40 px-4 py-2 text-sm text-teal-800 dark:text-teal-300"
            >
              مدیریت برنامه درسی
            </Link>
          </div>

          <section className="space-y-3">
            <h2 className="font-bold">فهرست شرکت‌کنندگان (فعال)</h2>
            <ul className="space-y-2 text-sm">
              {(roster ?? []).map((e) => (
                <li
                  key={e.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-[#0f1a1c]/10 px-3 py-2 dark:border-white/10"
                >
                  <span>
                    {e.patient_name} · {e.patient_phone || "بدون تلفن"}
                    <div className="mt-1 text-xs opacity-55">
                      ثبت‌نام {formatJalaliFriendlyDate(e.enrolled_at)} · ساعت{" "}
                      {formatJalaliTime(e.enrolled_at)}
                    </div>
                  </span>
                  <button
                    type="button"
                    className="text-red-600"
                    disabled={cancelEnrollment.isPending}
                    onClick={() => {
                      const reason =
                        window.prompt("دلیل لغو اجباری / بازپرداخت:", "لغو ادمین") ??
                        "";
                      cancelEnrollment.mutate({
                        slug: slugParam,
                        enrollmentId: e.id,
                        reason,
                      });
                    }}
                  >
                    لغو اجباری
                  </button>
                </li>
              ))}
              {!roster?.length ? (
                <li className="opacity-50">شرکت‌کننده‌ای نیست.</li>
              ) : null}
            </ul>
          </section>

          <button
            type="button"
            className="text-sm text-red-700"
            disabled={remove.isPending}
            onClick={async () => {
              if (!window.confirm("حذف کامل کارگاه؟")) return;
              await remove.mutateAsync(slugParam);
              router.push("/admin/workshops");
            }}
          >
            حذف کارگاه
          </button>
        </>
      ) : null}
    </div>
  );
}


export function WorkshopCurriculumAdminClient({ slug }: { slug: string }) {
  const qc = useQueryClient();
  const { data: sessions, isLoading: sLoading } = useWorkshopSessionsAdmin(slug);
  const { data: resources, isLoading: rLoading } = useWorkshopResourcesAdmin(slug);

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["psy", "workshops", slug, "sessions-admin"] });
    qc.invalidateQueries({ queryKey: ["psy", "workshops", slug, "resources-admin"] });
    qc.invalidateQueries({ queryKey: ["psy", "workshops", slug] });
  };

  const createSession = useMutation({
    mutationFn: (data: WorkshopSessionWrite) =>
      psyApi.createWorkshopSession(slug, data),
    onSuccess: invalidate,
  });
  const deleteSession = useMutation({
    mutationFn: (id: number) => psyApi.deleteWorkshopSession(slug, id),
    onSuccess: invalidate,
  });
  const createResource = useMutation({
    mutationFn: (data: WorkshopResourceWrite) =>
      psyApi.createWorkshopResource(slug, data),
    onSuccess: invalidate,
  });
  const deleteResource = useMutation({
    mutationFn: (id: number) => psyApi.deleteWorkshopResource(slug, id),
    onSuccess: invalidate,
  });

  const [sessionForm, setSessionForm] = useState<WorkshopSessionWrite>({
    sort_order: 1,
    title: "",
    summary: "",
    starts_at: "",
    ends_at: "",
    meeting_url: "",
    recording_url: "",
  });
  const [resourceForm, setResourceForm] = useState<WorkshopResourceWrite>({
    sort_order: 1,
    title: "",
    kind: "pdf",
    file_url: "",
    session: null,
  });

  async function onAddSession(e: FormEvent) {
    e.preventDefault();
    await createSession.mutateAsync({
      ...sessionForm,
      starts_at: sessionForm.starts_at
        ? new Date(sessionForm.starts_at).toISOString()
        : null,
      ends_at: sessionForm.ends_at
        ? new Date(sessionForm.ends_at).toISOString()
        : null,
    });
    setSessionForm({
      sort_order: (sessions?.length ?? 0) + 2,
      title: "",
      summary: "",
      starts_at: "",
      ends_at: "",
      meeting_url: "",
      recording_url: "",
    });
  }

  async function onAddResource(e: FormEvent) {
    e.preventDefault();
    await createResource.mutateAsync({
      ...resourceForm,
      session: resourceForm.session || null,
    });
    setResourceForm({
      sort_order: (resources?.length ?? 0) + 2,
      title: "",
      kind: "pdf",
      file_url: "",
      session: null,
    });
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="title text-xl font-bold">برنامه درسی</h2>
          <p className="text-sm opacity-55">جلسات زنده، ضبط‌ها و فایل‌ها</p>
        </div>
        <Link
          href={`/admin/workshops/${slug}`}
          className="text-sm text-teal-700 dark:text-teal-300"
        >
          ← تنظیمات کارگاه
        </Link>
      </div>

      <section className="space-y-3">
        <h3 className="font-semibold">جلسات</h3>
        {sLoading ? <p className="text-sm opacity-60">…</p> : null}
        <ul className="space-y-2 text-sm">
          {(sessions ?? []).map((s) => (
            <li
              key={s.id}
              className="rounded-md border border-[#0f1a1c]/10 px-3 py-2 dark:border-white/10"
            >
              <div className="flex flex-wrap justify-between gap-2">
                <span>
                  #{s.sort_order} {s.title}
                  <div className="mt-1 text-xs opacity-55">
                    {formatJalaliTimeRange(s.starts_at, s.ends_at)}
                  </div>
                </span>
                <button
                  type="button"
                  className="text-red-600"
                  onClick={() => s.id && deleteSession.mutate(s.id)}
                >
                  حذف
                </button>
              </div>
              <div className="mt-1 opacity-50">
                جلسه زنده: {s.meeting_url ? "دارد" : "—"} · ضبط:{" "}
                {s.recording_url ? "دارد" : "—"}
              </div>
            </li>
          ))}
        </ul>
        <form
          onSubmit={onAddSession}
          className="grid gap-2 rounded-lg border border-dashed border-[#0f1a1c]/15 p-4 dark:border-white/15 sm:grid-cols-2"
        >
          <input
            required
            placeholder="عنوان جلسه"
            className="rounded border px-2 py-1.5 dark:border-white/15 dark:bg-transparent"
            value={sessionForm.title}
            onChange={(e) =>
              setSessionForm((f) => ({ ...f, title: e.target.value }))
            }
          />
          <input
            type="number"
            placeholder="ترتیب"
            className="rounded border px-2 py-1.5 dark:border-white/15 dark:bg-transparent"
            value={sessionForm.sort_order}
            onChange={(e) =>
              setSessionForm((f) => ({
                ...f,
                sort_order: Number(e.target.value),
              }))
            }
          />
          <input
            type="datetime-local"
            className="rounded border px-2 py-1.5 dark:border-white/15 dark:bg-transparent"
            value={sessionForm.starts_at ?? ""}
            onChange={(e) =>
              setSessionForm((f) => ({ ...f, starts_at: e.target.value }))
            }
          />
          <input
            type="datetime-local"
            className="rounded border px-2 py-1.5 dark:border-white/15 dark:bg-transparent"
            value={sessionForm.ends_at ?? ""}
            onChange={(e) =>
              setSessionForm((f) => ({ ...f, ends_at: e.target.value }))
            }
          />
          <input
            placeholder="لینک Meet"
            className="rounded border px-2 py-1.5 dark:border-white/15 dark:bg-transparent sm:col-span-2"
            value={sessionForm.meeting_url}
            onChange={(e) =>
              setSessionForm((f) => ({ ...f, meeting_url: e.target.value }))
            }
          />
          <input
            placeholder="لینک ضبط"
            className="rounded border px-2 py-1.5 dark:border-white/15 dark:bg-transparent sm:col-span-2"
            value={sessionForm.recording_url}
            onChange={(e) =>
              setSessionForm((f) => ({ ...f, recording_url: e.target.value }))
            }
          />
          <textarea
            placeholder="خلاصه"
            className="rounded border px-2 py-1.5 dark:border-white/15 dark:bg-transparent sm:col-span-2"
            value={sessionForm.summary}
            onChange={(e) =>
              setSessionForm((f) => ({ ...f, summary: e.target.value }))
            }
          />
          <button
            type="submit"
            disabled={createSession.isPending}
            className="rounded-md bg-teal-800 px-3 py-2 text-white sm:col-span-2"
          >
            افزودن جلسه
          </button>
        </form>
      </section>

      <section className="space-y-3">
        <h3 className="font-semibold">منابع / فایل‌ها</h3>
        {rLoading ? <p className="text-sm opacity-60">…</p> : null}
        <ul className="space-y-2 text-sm">
          {(resources ?? []).map((r) => (
            <li
              key={r.id}
              className="flex flex-wrap justify-between gap-2 rounded-md border border-[#0f1a1c]/10 px-3 py-2 dark:border-white/10"
            >
              <span>
                #{r.sort_order} {r.title} ({r.kind})
                {r.session ? ` · جلسه ${r.session}` : " · سطح کارگاه"}
              </span>
              <button
                type="button"
                className="text-red-600"
                onClick={() => r.id && deleteResource.mutate(r.id)}
              >
                حذف
              </button>
            </li>
          ))}
        </ul>
        <form
          onSubmit={onAddResource}
          className="grid gap-2 rounded-lg border border-dashed border-[#0f1a1c]/15 p-4 dark:border-white/15 sm:grid-cols-2"
        >
          <input
            required
            placeholder="عنوان فایل"
            className="rounded border px-2 py-1.5 dark:border-white/15 dark:bg-transparent"
            value={resourceForm.title}
            onChange={(e) =>
              setResourceForm((f) => ({ ...f, title: e.target.value }))
            }
          />
          <select
            className="rounded border px-2 py-1.5 dark:border-white/15 dark:bg-transparent"
            value={resourceForm.kind}
            onChange={(e) =>
              setResourceForm((f) => ({ ...f, kind: e.target.value }))
            }
          >
            <option value="pdf">PDF</option>
            <option value="slides">اسلاید</option>
            <option value="other">سایر</option>
          </select>
          <select
            className="rounded border px-2 py-1.5 dark:border-white/15 dark:bg-transparent"
            value={resourceForm.session ?? ""}
            onChange={(e) =>
              setResourceForm((f) => ({
                ...f,
                session: e.target.value ? Number(e.target.value) : null,
              }))
            }
          >
            <option value="">سطح کارگاه</option>
            {(sessions ?? []).map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>
          <input
            type="number"
            className="rounded border px-2 py-1.5 dark:border-white/15 dark:bg-transparent"
            value={resourceForm.sort_order}
            onChange={(e) =>
              setResourceForm((f) => ({
                ...f,
                sort_order: Number(e.target.value),
              }))
            }
          />
          <input
            required
            placeholder="URL فایل"
            className="rounded border px-2 py-1.5 dark:border-white/15 dark:bg-transparent sm:col-span-2"
            value={resourceForm.file_url}
            onChange={(e) =>
              setResourceForm((f) => ({ ...f, file_url: e.target.value }))
            }
          />
          <button
            type="submit"
            disabled={createResource.isPending}
            className="rounded-md bg-teal-800 px-3 py-2 text-white sm:col-span-2"
          >
            افزودن منبع
          </button>
        </form>
      </section>
    </div>
  );
}
