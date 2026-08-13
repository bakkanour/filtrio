import { differenceInCalendarDays, parseISO } from 'date-fns'
import type { FillEvent, FilterCycle } from './types'

export type FilterStatistics = {
  totalVolumeLiters: number
  totalFillCount: number
  averageCycleDurationDays: number | null
  averageVolumePerCycleLiters: number | null
  cyclesUsedCount: number
}

export type PeriodStatistics = {
  volumeLiters: number
  fillCount: number
  cyclesUsedCount: number
}

/** Lifetime statistics across every cycle and fill event, regardless of object. */
export function calculateFilterStatistics(
  cycles: FilterCycle[],
  fillEvents: FillEvent[],
  now: string,
): FilterStatistics {
  const totalVolumeLiters = fillEvents.reduce((sum, e) => sum + e.volumeLiters, 0)
  const totalFillCount = fillEvents.length
  const cyclesUsedCount = cycles.length

  const durations = cycles.map((cycle) =>
    differenceInCalendarDays(parseISO(cycle.removedAt ?? now), parseISO(cycle.installedAt)),
  )
  const averageCycleDurationDays =
    durations.length > 0 ? durations.reduce((sum, d) => sum + d, 0) / durations.length : null

  const volumePerCycle = cycles.map((cycle) =>
    fillEvents
      .filter((e) => e.filterCycleId === cycle.id)
      .reduce((sum, e) => sum + e.volumeLiters, 0),
  )
  const averageVolumePerCycleLiters =
    volumePerCycle.length > 0
      ? volumePerCycle.reduce((sum, v) => sum + v, 0) / volumePerCycle.length
      : null

  return {
    totalVolumeLiters,
    totalFillCount,
    averageCycleDurationDays,
    averageVolumePerCycleLiters,
    cyclesUsedCount,
  }
}

/** Statistics restricted to a time window (e.g. "this month"), based on fill-event timestamps. */
export function calculatePeriodStatistics(
  fillEvents: FillEvent[],
  period: { from: string; to: string },
): PeriodStatistics {
  const from = new Date(period.from).getTime()
  const to = new Date(period.to).getTime()

  const eventsInPeriod = fillEvents.filter((e) => {
    const t = new Date(e.timestamp).getTime()
    return t >= from && t <= to
  })

  const volumeLiters = eventsInPeriod.reduce((sum, e) => sum + e.volumeLiters, 0)
  const fillCount = eventsInPeriod.length
  const cyclesUsedCount = new Set(eventsInPeriod.map((e) => e.filterCycleId)).size

  return { volumeLiters, fillCount, cyclesUsedCount }
}
