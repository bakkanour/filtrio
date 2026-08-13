import { describe, expect, it } from 'vitest'
import { calculateFilterStatistics, calculatePeriodStatistics } from '../statistics'
import type { FillEvent, FilterCycle } from '../types'

function cycle(overrides: Partial<FilterCycle>): FilterCycle {
  return {
    id: 'cycle-1',
    objectId: 'object-1',
    filterId: 'filter-1',
    installedAt: '2026-07-01',
    createdAt: '2026-07-01T09:00:00.000Z',
    durationControlEnabled: true,
    volumeControlEnabled: true,
    triggerMode: 'or',
    warningThresholdPercent: 80,
    ...overrides,
  }
}

function event(overrides: Partial<FillEvent>): FillEvent {
  return {
    id: overrides.id ?? crypto.randomUUID(),
    objectId: 'object-1',
    filterCycleId: 'cycle-1',
    timestamp: '2026-08-05T10:00:00.000Z',
    fillRatio: 1,
    volumeLiters: 1.5,
    ...overrides,
  }
}

describe('calculateFilterStatistics', () => {
  it('aggregates volume, fill count, cycles used across multiple cycles', () => {
    const cycles = [
      cycle({ id: 'cycle-1', installedAt: '2026-06-15', removedAt: '2026-07-13' }),
      cycle({ id: 'cycle-2', installedAt: '2026-07-13' }),
    ]
    const events = [
      event({ filterCycleId: 'cycle-1', volumeLiters: 100 }),
      event({ filterCycleId: 'cycle-2', volumeLiters: 50 }),
      event({ filterCycleId: 'cycle-2', volumeLiters: 30 }),
    ]

    const stats = calculateFilterStatistics(cycles, events, '2026-08-13')
    expect(stats.totalVolumeLiters).toBe(180)
    expect(stats.totalFillCount).toBe(3)
    expect(stats.cyclesUsedCount).toBe(2)
    expect(stats.averageCycleDurationDays).toBe((28 + 31) / 2)
    expect(stats.averageVolumePerCycleLiters).toBe((100 + 80) / 2)
  })

  it('returns nulls when there are no cycles yet', () => {
    const stats = calculateFilterStatistics([], [], '2026-08-13')
    expect(stats.averageCycleDurationDays).toBeNull()
    expect(stats.averageVolumePerCycleLiters).toBeNull()
    expect(stats.totalVolumeLiters).toBe(0)
  })
})

describe('calculatePeriodStatistics', () => {
  it('only counts fill events inside the given window (spec: 47.5L / 32 fills this month)', () => {
    const thisMonth = Array.from({ length: 32 }, () =>
      event({ timestamp: '2026-08-05T10:00:00.000Z', volumeLiters: 47.5 / 32 }),
    )
    const lastMonth = [event({ timestamp: '2026-07-20T10:00:00.000Z', volumeLiters: 5 })]

    const stats = calculatePeriodStatistics([...thisMonth, ...lastMonth], {
      from: '2026-08-01T00:00:00.000Z',
      to: '2026-08-31T23:59:59.999Z',
    })

    expect(stats.fillCount).toBe(32)
    expect(stats.volumeLiters).toBeCloseTo(47.5, 5)
  })
})
