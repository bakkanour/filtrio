# Design

<!-- impeccable:design-schema 1 -->

## World

**Graduated** — lab glassware + logbook. Chosen via Impeccable's `new-work` direction roll for this surface (Operate mode; seed key `f053d784`, assigned index 7 of 7 grounded candidates authored for this product — see the session's direction round for the full candidate list and the runner-up, "precision oscilloscope," weighed and rejected for reading colder/more technical than a kitchen-glance utility warrants).

Every measured quantity looks like an etched instrument reading, not a decorative widget: volume/time progress is a graduated fill (tick marks at each quarter, a translucent tinted "liquid" level, a solid meniscus line at the current value) instead of a rounded loading bar; fill history reads like a ruled notebook page (left rule per entry, monospace timestamps); filter cycle history reads like a logbook of entries with a live dot marking the current one; presets are named like recipe cards. Numbers get the visual weight — the "% of cycle used" hero figure is the largest thing on both the dashboard card and the object detail page, because that single number answers the product's core question ("do I need to replace a filter?") before anything else is read.

No droplets, no waves — the etched-tick/ruled-notebook material carries the "precision, not decoration" positioning (see PRODUCT.md) rather than literal water iconography.

## Color

**Strategy: Restrained**, deliberately re-pinned by the user mid-session to a **BRITA-family blue + white** palette (explicit brief change — the original constraint was "must not resemble BRITA"; the user reversed that constraint directly and asked to align with it instead, referencing brita.com/wirDesign's BRITA case study). Values were sampled from `brita.com`'s own computed styles rather than invented: navy `#002A53`-family text, blue `#2575D6` accent, sky-tint backgrounds `#EAFAFF`/`#F1F6F8`. The "Graduated" world's structure (ticks, ruled logbook, monospace data) is unchanged — only the color layer moved.

Light mode is white + sky-blue tints with navy ink. Dark mode uses BRITA's own brand navy as the page ground (not an inverted light palette) with a brighter sky-blue accent for legibility on the dark surface — the brand's darkest brand color becomes the dark-mode ground, which is why it still reads as "the same brand" in both themes.

| Token | Light | Dark | Use |
|---|---|---|---|
| `--paper` | `#f6fafd` | `#06192e` | page background |
| `--paper-raised` | `#ffffff` | `#0d2c4d` | cards, inputs |
| `--paper-sunken` | `#e9f3fa` | `#041220` | recessed wells, empty states |
| `--rule` / `--rule-strong` | `#cfe1ee` / `#a9c8de` | `#1e4870` / `#2c5d8f` | hairlines, dividers, ticks |
| `--ink` / `--ink-muted` | `#0a2a4a` / `#4d6a85` | `#eef6fc` / `#8fb3d1` | text |
| `--accent` / `--accent-strong` | `#2575d6` / `#113993` | `#5cc3ff` / `#93e1ff` | links, primary actions, focus |
| `--status-normal` | `#1a8a5e` | `#4ecb92` | on-track |
| `--status-warning` | `#b5790f` | `#eab54a` | replace soon |
| `--status-danger` | `#c23a3a` | `#ec7468` | replacement recommended |

All tokens live in `src/index.css` as CSS custom properties, redefined once under `.dark`, and mapped into Tailwind's `@theme` (`--color-paper`, `--color-ink`, etc.) so components never hardcode a hex value or reach for a `dark:` variant — `bg-paper`, `text-ink`, `border-rule` already resolve correctly in both themes.

## Typography

- **UI text:** IBM Plex Sans — a workhorse Operate-mode face, wide French/English glyph coverage, holds up at small sizes; swapped in for Inter (Impeccable's design hook flagged Inter as an overused default) so the whole type system sits in one family with the data face below instead of pairing two unrelated grotesks.
- **Data:** IBM Plex Mono (`.font-data` / `font-data` utility, tabular figures) for every measured quantity — days, liters, percentages, dates. This is what gives numbers their instrument-reading presence (`150 L` reads like a calibrated gauge, not a label).
- **Labels:** small, semibold, `tracking-[0.06em]` to `[0.08em]`, uppercase — etched-unit-marking register (`TIME`, `VOLUME`, `ACTIVE FILTER`).
- Fonts loaded via a single Google Fonts `<link>` in `index.html` (no extra npm dependency).

## Components (`src/ui/components/`)

- **`Card`** — `rounded-lg`, `border-rule`, `bg-paper-raised`, no shadow. One card per distinct object/entity, never decomposed into sub-cards for organization.
- **`ProgressBar`** (the graduated bar) — tick-marked track (`.tick-scale` utility), translucent status-tinted fill, solid meniscus edge at the current value.
- **`StatusBadge`** — small dot + tracked-uppercase text label; status is never color-only.
- **`AlertBox`** — a left-rule "margin note" (not a filled rounded banner): status-tinted background wash, `border-l-2` in the status color, monospace numbers for every control's current/limit so the reasoning is always visible, never just a bare "expired."
- **`Button`** / `buttonClass`— `primary` (solid accent), `secondary` (outline), `ghost`, `danger` variants; `rounded-md`, never a full pill.
- **`FillHistoryList`** — logbook entries, left rule, monospace volume + timestamp.
- Shared **`inputClass`/`labelClass`** (`src/ui/components/inputClass.ts`) — every form field in the app uses the same border/radius/focus treatment.

## Motion

Deliberately small and confirmatory, never decorative: graduated-bar fills animate their width/position over 500ms ease-out (visible "liquid rising" on a new reading); a quick-fill action shows a fading ✓ for ~900ms as the only extra feedback; theme and page-background color transition over 200ms so the light/dark switch doesn't hard-cut.

## Layout

Mobile-first single column; the dashboard grid opens to 2/3 columns only at `sm`/`lg`. Primary actions (`+1 fill`, `+0.5 fill`) sit directly on the dashboard card, reachable one-handed, no drill-down required to log a fill. Nav uses an underline-tab pattern, not pill buttons.

## Accessibility

Status is always dual-coded (colored dot + text label, never color alone). Focus states use `border-accent` on inputs. All interactive elements are real `<button>`/`<a>` (via `Link`), never a button nested inside a link. Contrast was checked visually in both themes at the warning/danger states, which are the ones most likely to fail (amber/ochre on paper, amber on slate).

## Notes on process

Built by following the Impeccable `new-work` reference directly (`.claude/skills/impeccable/reference/`) rather than through the `Skill` tool, which didn't have this project's skill registered by name this session. The direction round used the real `concept-seed.mjs` script; the decision to build "Graduated" was made by the user via a structured question, not assumed. No image generation was available in this environment, so the direction was presented and reviewed as text/palette rather than rendered sketches — per the skill's own guidance, that page is "complete, not a lesser version." The finish review and this document were produced in-thread rather than by the shipped `impeccable-finish-reviewer`/`impeccable-documenter` subagents, which aren't registered as callable agent types in this harness; that substitution is disclosed here as instructed.
