import type { FillEvent, VolumeUsage } from './types'

/** Sum of all fill-event volumes for a given cycle. Never negative. */
export function calculateConsumedLiters(fillEvents: FillEvent[], filterCycleId: string): number {
  const total = fillEvents
    .filter((event) => event.filterCycleId === filterCycleId)
    .reduce((sum, event) => sum + event.volumeLiters, 0)
  return Math.max(0, total)
}

/** Liters left before the capacity limit is reached. Never negative, null if no limit set. */
export function calculateRemainingVolume(
  consumedLiters: number,
  capacityLimitLiters: number | undefined,
): number | null {
  if (capacityLimitLiters === undefined) return null
  return Math.max(0, capacityLimitLiters - consumedLiters)
}

/** Full volume-usage bundle for a filter cycle. */
export function calculateVolumeUsage(
  fillEvents: FillEvent[],
  filterCycleId: string,
  capacityLimitLiters: number | undefined,
): VolumeUsage {
  const consumedLiters = calculateConsumedLiters(fillEvents, filterCycleId)
  const remainingLiters = calculateRemainingVolume(consumedLiters, capacityLimitLiters)

  let volumePercentage: number | null = null
  if (capacityLimitLiters !== undefined) {
    volumePercentage =
      capacityLimitLiters <= 0 ? 100 : Math.min(100, (consumedLiters / capacityLimitLiters) * 100)
  }

  return { consumedLiters, remainingLiters, volumePercentage }
}

/** Volume in liters represented by a fill event, from either a ratio or a direct volume. */
export function resolveFillVolume(
  objectCapacityLiters: number,
  input: { fillRatio: number } | { volumeLiters: number },
): { fillRatio: number; volumeLiters: number } {
  if ('volumeLiters' in input) {
    const volumeLiters = Math.max(0, input.volumeLiters)
    const fillRatio = objectCapacityLiters > 0 ? volumeLiters / objectCapacityLiters : 0
    return { fillRatio, volumeLiters }
  }
  const fillRatio = Math.max(0, input.fillRatio)
  return { fillRatio, volumeLiters: fillRatio * objectCapacityLiters }
}
