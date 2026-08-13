import { differenceInCalendarDays, parseISO, startOfDay } from 'date-fns'
import type { TimeUsage } from './types'

/**
 * `new Date('2026-08-01')` parses a date-only ISO string as UTC midnight, which can
 * shift to the previous/next local calendar day depending on the viewer's timezone.
 * `parseISO` interprets date-only strings in local time instead, so calendar-day
 * diffing stays correct across timezones and DST transitions.
 */
function toLocalDate(dateIso: string): Date {
  return startOfDay(parseISO(dateIso))
}

/**
 * Days elapsed since installation, using calendar-day diffing (DST-safe,
 * timezone-safe). Never negative.
 */
export function calculateElapsedDays(installedAt: string, now: string): number {
  const elapsed = differenceInCalendarDays(toLocalDate(now), toLocalDate(installedAt))
  return Math.max(0, elapsed)
}

/** Days left before the duration limit is reached. Never negative, null if no limit set. */
export function calculateRemainingTime(
  elapsedDays: number,
  durationLimitDays: number | undefined,
): number | null {
  if (durationLimitDays === undefined) return null
  return Math.max(0, durationLimitDays - elapsedDays)
}

/** Full time-usage bundle for a filter cycle. */
export function calculateTimeUsage(
  installedAt: string,
  now: string,
  durationLimitDays: number | undefined,
): TimeUsage {
  const elapsedDays = calculateElapsedDays(installedAt, now)
  const remainingDays = calculateRemainingTime(elapsedDays, durationLimitDays)

  let timePercentage: number | null = null
  if (durationLimitDays !== undefined) {
    timePercentage = durationLimitDays <= 0 ? 100 : Math.min(100, (elapsedDays / durationLimitDays) * 100)
  }

  return { elapsedDays, remainingDays, timePercentage }
}

/** An installation/replacement date can be in the past, but never in the future. */
export function isFutureDate(dateIso: string, now: string): boolean {
  return toLocalDate(dateIso).getTime() > toLocalDate(now).getTime()
}
