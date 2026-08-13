# Filtrio

Brand-agnostic water filter tracker — time + volume usage, transparent replacement alerts, local-first (no account, no cloud).

Track any water filter object (pitcher, bottle, flask, filtration system) against any filter, combining a time limit, a volume limit, or both — with a clear OR / AND / MANUAL strategy for when to trigger a replacement recommendation. Every alert shows exactly which limit is or isn't reached; nothing is ever a black box.

## Stack

- Vite + React 19 + TypeScript (strict)
- Tailwind CSS v4
- react-router-dom
- i18next (French / English)
- zod (validation)
- Vitest + Testing Library

## Architecture

```
UI (pages/components/hooks)
  -> services (validation, orchestration)
    -> domain (pure business logic)
      -> repository (storage abstraction)
        -> localStorage (MVP; swappable for a real backend later)
```

All data stays on-device (`localStorage`) — no account, no network calls, no analytics.

See [PRODUCT.md](./PRODUCT.md) for product context and [DESIGN.md](./DESIGN.md) for the visual design system.

## Getting started

```bash
npm install
npm run dev
```

Other commands:

```bash
npm run build   # production build
npm run lint    # oxlint
npx vitest run  # test suite
```
