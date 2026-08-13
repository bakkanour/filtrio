# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

People who own a water filter device — pitcher, bottle, flask, or built-in filtration system — of any brand, and want to know exactly when to replace the cartridge. Not power users of a specific manufacturer's app: they may own several different objects/filters at once (kitchen pitcher, gym bottle, whole-home system), often not all the same brand.

## Product Purpose

Filtrio tracks filter usage across time and volume so the user always knows whether a filter is still good, and exactly why when it isn't. It replaces mental math and forgetting-when-you-installed-it with a precise, transparent counter: elapsed days, filtered liters, and a clear recommendation.

## Positioning

Local-first and brand-agnostic: every other filter-tracking experience is either bundled into one manufacturer's app (tied to their cartridges, their account, their cloud) or a spreadsheet. Filtrio works with any physical object and any filter, stores everything on-device with no account and no data leaving the device, and never hides the reasoning behind a recommendation — the user always sees which control (time, volume, or both) triggered it and how close the other one is.

## Operating Context

The primary moment of use is a 5-second glance, standing in the kitchen next to the pitcher or sink, phone in hand — not a seated session. A secondary, more deliberate mode exists for setup (creating an object, installing/replacing a filter) and for reviewing history/statistics, which can happen seated. Both must work well on a phone one-handed; desktop is a secondary surface.

## Capabilities and Constraints

- Multiple independent objects (pitcher, bottle, flask, filtration system, other), each with its own filter cycle, fill history, and statistics.
- Time control, volume control, or both, combined via OR / AND / MANUAL trigger strategies chosen per filter cycle.
- Manual fill logging (full, half, or custom volume), editable/deletable after the fact.
- Retroactive filter installation/replacement dates (user installed it days ago, is recording it late).
- Filtered-volume-vs-total-container-capacity consistency check on object creation/edit.
- Curated, editable presets for common object/filter shapes — never brand-specific hardcoded values (a manufacturer's stated duration/capacity is always a user-entered parameter, not baked in).
- Data persists in `localStorage` only (MVP); the storage layer is already abstracted behind a repository interface for a future backend swap.
- No accounts, no network calls, no analytics.
- i18n: French and English, browser-language default.

## Brand Commitments

- Product name: **Filtrio**.
- Must not visually resemble BRITA (or any single manufacturer) — the brief that started this project was explicit about this.

## Evidence on Hand

None — no real user content, testimonials, or brand assets exist yet. This is a personal/greenfield utility, not a marketing surface.

## Product Principles

1. Never show a bare status without the reasoning — every alert names which limit is/isn't reached and by how much.
2. Precision over decoration — the numbers (days, liters, percentages) are the content; nothing should compete with them for attention.
3. Brand-agnostic by design — no manufacturer's values are ever presented as fact, only as an editable starting point.
4. The 5-second glance always wins — the dashboard's first read must answer "do I need to replace a filter?" without a tap.
5. Local-first, always — no feature may require an account or a network call.

## Accessibility & Inclusion

No project-specific requirement established beyond standard web accessibility (contrast, keyboard, focus states, labels) — carried over from the original build.
