import { describe, expect, it } from 'vitest'
import { calculateConsumedLiters, calculateVolumeUsage, resolveFillVolume } from '../volume'
import type { FillEvent } from '../types'

function fillEvent(overrides: Partial<FillEvent>): FillEvent {
  return {
    id: overrides.id ?? crypto.randomUUID(),
    objectId: 'object-1',
    filterCycleId: 'cycle-1',
    timestamp: '2026-08-13T10:00:00.000Z',
    fillRatio: 1,
    volumeLiters: 1.5,
    ...overrides,
  }
}

describe('resolveFillVolume', () => {
  it('resolves a full fill (1.0 ratio) for a 1.5L pitcher to 1.5L', () => {
    expect(resolveFillVolume(1.5, { fillRatio: 1 })).toEqual({ fillRatio: 1, volumeLiters: 1.5 })
  })

  it('resolves a half fill (0.5 ratio) to 0.75L', () => {
    expect(resolveFillVolume(1.5, { fillRatio: 0.5 })).toEqual({ fillRatio: 0.5, volumeLiters: 0.75 })
  })

  it('resolves a custom volume back to a ratio', () => {
    const result = resolveFillVolume(1.5, { volumeLiters: 0.75 })
    expect(result.volumeLiters).toBe(0.75)
    expect(result.fillRatio).toBeCloseTo(0.5, 5)
  })
})

describe('calculateConsumedLiters', () => {
  it('sums 100 full 1.5L fills to 150L (spec example)', () => {
    const events = Array.from({ length: 100 }, (_, i) => fillEvent({ id: `e${i}`, volumeLiters: 1.5 }))
    expect(calculateConsumedLiters(events, 'cycle-1')).toBe(150)
  })

  it('only counts events belonging to the given cycle', () => {
    const events = [
      fillEvent({ id: 'a', filterCycleId: 'cycle-1', volumeLiters: 1.5 }),
      fillEvent({ id: 'b', filterCycleId: 'cycle-2', volumeLiters: 1.5 }),
    ]
    expect(calculateConsumedLiters(events, 'cycle-1')).toBe(1.5)
  })
})

describe('calculateVolumeUsage', () => {
  it('matches the spec worked example: 120/150L consumed = 80%, 30L remaining', () => {
    const events = [fillEvent({ volumeLiters: 120 })]
    const usage = calculateVolumeUsage(events, 'cycle-1', 150)
    expect(usage.consumedLiters).toBe(120)
    expect(usage.remainingLiters).toBe(30)
    expect(usage.volumePercentage).toBe(80)
  })

  it('reaches exactly 100% at capacity', () => {
    const events = [fillEvent({ volumeLiters: 150 })]
    const usage = calculateVolumeUsage(events, 'cycle-1', 150)
    expect(usage.volumePercentage).toBe(100)
    expect(usage.remainingLiters).toBe(0)
  })

  it('caps at 100% and 0L remaining when volume exceeds capacity', () => {
    const events = [fillEvent({ volumeLiters: 170 })]
    const usage = calculateVolumeUsage(events, 'cycle-1', 150)
    expect(usage.volumePercentage).toBe(100)
    expect(usage.remainingLiters).toBe(0)
  })

  it('returns null percentage/remaining when no capacity limit is set (time-only control)', () => {
    const events = [fillEvent({ volumeLiters: 10 })]
    const usage = calculateVolumeUsage(events, 'cycle-1', undefined)
    expect(usage.consumedLiters).toBe(10)
    expect(usage.remainingLiters).toBeNull()
    expect(usage.volumePercentage).toBeNull()
  })
})
