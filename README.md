# Frontend — Next.js

Feature-based App Router client for the university platform.

Institute UI is colocated with routes (modular monolith). See `ARCHITECTURE.md` §2 and `AGENTS.md`.

## Structure

```
frontend/
  app/
    (public)/                      # university marketing (/, /think-tanks/[slug])
      _components/                 # university chrome + landing sections
    (auth)/                        # cookie-based JWT login/register
    (institutes)/(psy_institute)/  # psychology institute (template for others)
      _shared/                     # api, types, hooks, tokens
      (psy|patient|therapist|admin)/_components/
  components/                      # generic primitives (ThemeToggle, ThemeProvider)
  features/
    auth/                          # session store, login/logout hooks
    finance/                       # platform wallet/ledger helpers
    think-tanks/
    news/
  lib/
    api/client.ts                  # credentials: 'include', CSRF, silent refresh
    providers/                     # React Query provider
```

## Auth security

- Tokens are never stored in Zustand, LocalStorage, or SessionStorage.
- The browser attaches HttpOnly cookies via `credentials: 'include'`.
- `/api/*` is rewritten to Django so cookies stay same-origin in development.
- Zustand holds only `isAuthenticated`, profile fields from `/auth/me/`, and UI state.

## Scripts

```bash
npm run dev
npm run build
npm run lint
```
