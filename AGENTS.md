# Frontend agent rules

Institute modular monolith. Follow [`ARCHITECTURE.md`](../ARCHITECTURE.md) §2.

## Zero-Crossing

- `(public)` and university `_components` must never import `(institutes)` or `features/institutes`.
- Institute A must never import institute B.
- Portals inside one institute import `_shared/` only — not sibling portal `_components/`.
- Allowed kernel: `@/lib/*`, `@/components/*`, `@/features/auth`, `@/features/finance`.
- Linking to `/psy` by URL is fine. Importing psy CSS/components from university or auth is not.

## Fat files

- Prefer 400–900 LOC cohesive `[feature].tsx` files in each portal `_components/`.
- Do not add `hooks/`, `ui/`, `views/`, or `lib/` folders inside an institute.
- `page.tsx` stays a thin composer.

## New institute

Copy `(psy_institute)`: `_shared/` + portals. In the same PR add `instituteZones("<slug>", [...portals])` in `eslint.config.mjs`. Update `ROUTES.md`. No shared institute component library.
