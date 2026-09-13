# Frontend routes

Catalog of Next.js App Router pages under `frontend/app/`.  
Parentheses are **route groups** — they organize layouts and do **not** appear in the URL.

```
app/
  (public)/                         → university marketing
  (auth)/                           → login / register / forgot-password
  (institutes)/(psy_institute)/
    _shared/                        → institute kernel (api, types, hooks, CSS)
    (psy)/                          → psychology center public site
    (patient)/                      → patient portal (auth + psy_patient)
    (therapist)/                    → therapist portal (auth + psy_therapist)
    (admin)/                        → admin portal (auth + psy_admin)
```

UI for each portal lives in that portal’s `_components/` as fat files. `page.tsx` files are thin composers. Portals import `_shared/` only — not another portal’s `_components/`. See `ARCHITECTURE.md` §2.

Next also rewrites `/api/*` to Django (`next.config.ts`). `/authentication` redirects to `/login`.

---

## University (public)

Layout: `Header` + `Footer` — `app/(public)/layout.tsx`

| URL | File | Notes |
|---|---|---|
| `/` | `app/(public)/page.tsx` | University landing |
| `/think-tanks/[slug]` | `app/(public)/think-tanks/[slug]/page.tsx` | Think-tank detail |

---

## Auth

Layout: platform auth shell (no institute CSS) — `app/(auth)/layout.tsx`

| URL | File |
|---|---|
| `/login` | `app/(auth)/login/page.tsx` |
| `/register` | `app/(auth)/register/page.tsx` |
| `/forgot-password` | `app/(auth)/forgot-password/page.tsx` |

---

## Psychology center (public)

Layout: `PsyHeader` + `PsyFooter` — `app/(institutes)/(psy_institute)/(psy)/layout.tsx`

| URL | File | Notes |
|---|---|---|
| `/psy` | `.../(psy)/psy/page.tsx` | Center landing |
| `/psy/services` | `.../(psy)/psy/services/page.tsx` | All counseling services |
| `/psy/therapists` | `.../(psy)/psy/therapists/page.tsx` | Therapist directory |
| `/psy/therapists/[id]` | `.../(psy)/psy/therapists/[id]/page.tsx` | Therapist profile |
| `/psy/tests` | `.../(psy)/psy/tests/page.tsx` | Public psychometric catalog |
| `/psy/workshops` | `.../(psy)/psy/workshops/page.tsx` | Upcoming workshops |
| `/psy/workshops/[slug]` | `.../(psy)/psy/workshops/[slug]/page.tsx` | Workshop detail |
| `/psy/blog` | `.../(psy)/psy/blog/page.tsx` | Articles list |
| `/psy/blog/[slug]` | `.../(psy)/psy/blog/[slug]/page.tsx` | Article detail |

---

## Patient portal

Guard: `PatientGuard` · shell: `PatientShell`  
`app/(institutes)/(psy_institute)/(patient)/layout.tsx`

| URL | File | Notes |
|---|---|---|
| `/patient` | `.../patient/page.tsx` | Redirects → `/patient/overview` |
| `/patient/overview` | `.../patient/overview/page.tsx` | Dashboard |
| `/patient/wallet` | `.../patient/wallet/page.tsx` | Wallet |
| `/patient/wallet/payment/success` | `.../patient/wallet/payment/success/page.tsx` | Payment return |
| `/patient/wallet/payment/failure` | `.../patient/wallet/payment/failure/page.tsx` | Payment return |
| `/patient/appointments` | `.../patient/appointments/page.tsx` | My appointments |
| `/patient/appointments/book` | `.../patient/appointments/book/page.tsx` | Book a slot |
| `/patient/appointments/[id]` | `.../patient/appointments/[id]/page.tsx` | Appointment detail |
| `/patient/workshops` | `.../patient/workshops/page.tsx` | Enrolled workshops |
| `/patient/workshops/[slug]/certificate` | `.../patient/workshops/[slug]/certificate/page.tsx` | Certificate |
| `/patient/notes` | `.../patient/notes/page.tsx` | Shared session notes |
| `/patient/tests` | `.../patient/tests/page.tsx` | Take tests |
| `/patient/tests/history` | `.../patient/tests/history/page.tsx` | Submitted tests |
| `/patient/tests/[slug]` | `.../patient/tests/[slug]/page.tsx` | Test form |

---

## Therapist portal

Guard: `TherapistGuard` · shell: `TherapistShell`  
`app/(institutes)/(psy_institute)/(therapist)/layout.tsx`

| URL | File | Notes |
|---|---|---|
| `/therapist` | `.../therapist/page.tsx` | Redirects → `/therapist/overview` |
| `/therapist/overview` | `.../therapist/overview/page.tsx` | Dashboard |
| `/therapist/schedule` | `.../therapist/schedule/page.tsx` | Leave requests |
| `/therapist/appointments` | `.../therapist/appointments/page.tsx` | Appointments |
| `/therapist/appointments/[id]` | `.../therapist/appointments/[id]/page.tsx` | Appointment detail |
| `/therapist/finance` | `.../therapist/finance/page.tsx` | Own earnings (read-only) |
| `/therapist/clinical-reports` | `.../therapist/clinical-reports/page.tsx` | Mandatory clinical report inbox |
| `/therapist/reviews` | `.../therapist/reviews/page.tsx` | Approved patient comments |
| `/therapist/patients` | `.../therapist/patients/page.tsx` | Patients |
| `/therapist/patients/[id]` | `.../therapist/patients/[id]/page.tsx` | Patient summary |
| `/therapist/responses` | `.../therapist/responses/page.tsx` | Psychometric responses |
| `/therapist/responses/[id]` | `.../therapist/responses/[id]/page.tsx` | Response detail |
| `/therapist/workshops` | `.../therapist/workshops/page.tsx` | Workshops |
| `/therapist/workshops/[slug]` | `.../therapist/workshops/[slug]/page.tsx` | Workshop roster / LMS |

---

## Admin portal

Guard: `AdminGuard` · shell: `AdminShell`  
`app/(institutes)/(psy_institute)/(admin)/layout.tsx`

| URL | File | Notes |
|---|---|---|
| `/admin` | `.../admin/page.tsx` | Redirects → `/admin/overview` |
| `/admin/overview` | `.../admin/overview/page.tsx` | Dashboard |
| `/admin/appointments` | `.../admin/appointments/page.tsx` | Agenda |
| `/admin/appointments/[id]` | `.../admin/appointments/[id]/page.tsx` | Appointment detail |
| `/admin/schedule` | `.../admin/schedule/page.tsx` | Master calendar |
| `/admin/leave` | `.../admin/leave/page.tsx` | Leave request inbox |
| `/admin/file-access` | `.../admin/file-access/page.tsx` | Patient file access request inbox |
| `/admin/reviews` | `.../admin/reviews/page.tsx` | Review moderation inbox |
| `/admin/sms` | `.../admin/sms/page.tsx` | Manual SMS inbox |
| `/admin/finance` | `.../admin/finance/page.tsx` | Finance |
| `/admin/users/patients` | `.../admin/users/patients/page.tsx` | Patients directory |
| `/admin/users/patients/[id]` | `.../admin/users/patients/[id]/page.tsx` | Patient summary |
| `/admin/users/therapists` | `.../admin/users/therapists/page.tsx` | Therapists directory |
| `/admin/users/therapists/[id]` | `.../admin/users/therapists/[id]/page.tsx` | Therapist summary |
| `/admin/workshops` | `.../admin/workshops/page.tsx` | Workshops |
| `/admin/workshops/new` | `.../admin/workshops/new/page.tsx` | Create workshop |
| `/admin/workshops/[slug]` | `.../admin/workshops/[slug]/page.tsx` | Edit workshop |
| `/admin/workshops/[slug]/curriculum` | `.../admin/workshops/[slug]/curriculum/page.tsx` | Curriculum / LMS |
| `/admin/blog` | `.../admin/blog/page.tsx` | Posts |
| `/admin/blog/new` | `.../admin/blog/new/page.tsx` | New post |
| `/admin/blog/[slug]` | `.../admin/blog/[slug]/page.tsx` | Edit post |
| `/admin/news` | `.../admin/news/page.tsx` | Landing news slides |
| `/admin/news/new` | `.../admin/news/new/page.tsx` | New slide |
| `/admin/news/[id]` | `.../admin/news/[id]/page.tsx` | Edit slide |

---

## Linked from UI but no `page.tsx` yet

These hrefs exist in landing / header components. Visiting them 404s until pages are added.

| URL | Linked from |
|---|---|
| `/contact` | University `Header` |
| `/gallery` | Landing `Env` (فضای دانشگاه) |
| `/university/[slug]` | Landing `Intro` (بخش‌های دانشگاه) |
| `/activities/...` | Landing `Activity` (خدمات دانشجویی) |
| `/founders/...` | Landing `TrusteesBoard` (هیئت امنا) |

---

## How to regenerate this list

From `frontend/`:

```bash
find app -name 'page.tsx' | sort
```

Route group folders `(name)` are omitted from the public path; everything else in the folder chain is a URL segment.
