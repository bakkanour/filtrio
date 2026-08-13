import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createInMemoryRepositories } from '../../test/inMemoryRepositories'
import { createFilterCycleService } from '../filterCycleService'
import { createFilterService } from '../filterService'
import { createWaterObjectService } from '../waterObjectService'
import type { Repositories } from '../../repository/types'

const NOW = '2026-08-13T12:00:00.000Z'

describe('filterCycleService', () => {
  let repositories: Repositories
  let filterCycles: ReturnType<typeof createFilterCycleService>
  let objectId: string
  let filterId: string

  beforeEach(async () => {
    vi.setSystemTime(new Date(NOW))
    repositories = createInMemoryRepositories()
    filterCycles = createFilterCycleService(repositories)
    const waterObjects = createWaterObjectService(repositories)
    const filters = createFilterService(repositories)

    const object = await waterObjects.create({ name: 'Carafe cuisine', type: 'pitcher', capacityLiters: 1.5 })
    const filter = await filters.create({ name: 'Mon filtre', durationDays: 28, capacityLiters: 150 })
    objectId = object.id
    filterId = filter.id
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('installs a first cycle defaulting to today, with both controls active', async () => {
    const cycle = await filterCycles.installFilter({
      objectId,
      filterId,
      installedAt: '2026-08-13',
      durationLimitDays: 28,
      volumeLimitLiters: 150,
      durationControlEnabled: true,
      volumeControlEnabled: true,
      triggerMode: 'or',
      warningThresholdPercent: 80,
    })
    expect(cycle.removedAt).toBeUndefined()
    expect(await filterCycles.getActiveCycle(objectId)).toEqual(cycle)
  })

  it('accepts a retroactive installation date in the past', async () => {
    const cycle = await filterCycles.installFilter({
      objectId,
      filterId,
      installedAt: '2026-08-10',
      durationControlEnabled: true,
      volumeControlEnabled: false,
      triggerMode: 'or',
      warningThresholdPercent: 80,
      durationLimitDays: 28,
    })
    expect(cycle.installedAt).toBe('2026-08-10')
    expect(new Date(cycle.createdAt).toISOString()).toBe(NOW)
  })

  it('rejects a future installation date', async () => {
    await expect(
      filterCycles.installFilter({
        objectId,
        filterId,
        installedAt: '2026-08-20',
        durationControlEnabled: true,
        volumeControlEnabled: false,
        triggerMode: 'or',
        warningThresholdPercent: 80,
        durationLimitDays: 28,
      }),
    ).rejects.toThrow(/future/)
  })

  it('refuses to install a second active cycle on the same object', async () => {
    await filterCycles.installFilter({
      objectId,
      filterId,
      installedAt: '2026-08-13',
      durationControlEnabled: true,
      volumeControlEnabled: false,
      triggerMode: 'or',
      warningThresholdPercent: 80,
      durationLimitDays: 28,
    })
    await expect(
      filterCycles.installFilter({
        objectId,
        filterId,
        installedAt: '2026-08-13',
        durationControlEnabled: true,
        volumeControlEnabled: false,
        triggerMode: 'or',
        warningThresholdPercent: 80,
        durationLimitDays: 28,
      }),
    ).rejects.toThrow(/already has an active/)
  })

  it('replaces a filter: closes old cycle, records reason, starts a new one at zero', async () => {
    const first = await filterCycles.installFilter({
      objectId,
      filterId,
      installedAt: '2026-07-01',
      durationControlEnabled: true,
      volumeControlEnabled: true,
      triggerMode: 'or',
      warningThresholdPercent: 80,
      durationLimitDays: 28,
      volumeLimitLiters: 150,
    })

    const { closed, created } = await filterCycles.replaceFilter(
      {
        objectId,
        filterId,
        installedAt: '2026-08-13',
        durationControlEnabled: true,
        volumeControlEnabled: true,
        triggerMode: 'or',
        warningThresholdPercent: 80,
        durationLimitDays: 28,
        volumeLimitLiters: 150,
      },
      'time_limit',
    )

    expect(closed.id).toBe(first.id)
    expect(closed.removedAt).toBe('2026-08-13')
    expect(closed.replacementReason).toBe('time_limit')
    expect(created.id).not.toBe(first.id)
    expect(created.removedAt).toBeUndefined()
    expect(await filterCycles.getActiveCycle(objectId)).toEqual(created)

    const usage = filterCycles.getCycleUsage(created, [], NOW)
    expect(usage.volumeUsage.consumedLiters).toBe(0)
  })

  it('supports a retroactive replacement date (filter changed days ago, recorded late)', async () => {
    await filterCycles.installFilter({
      objectId,
      filterId,
      installedAt: '2026-07-01',
      durationControlEnabled: true,
      volumeControlEnabled: false,
      triggerMode: 'or',
      warningThresholdPercent: 80,
      durationLimitDays: 28,
    })

    const { created } = await filterCycles.replaceFilter(
      {
        objectId,
        filterId,
        installedAt: '2026-08-10',
        durationControlEnabled: true,
        volumeControlEnabled: false,
        triggerMode: 'or',
        warningThresholdPercent: 80,
        durationLimitDays: 28,
      },
      'preventive',
    )

    expect(created.installedAt).toBe('2026-08-10')
    const usage = filterCycles.getCycleUsage(created, [], NOW)
    expect(usage.timeUsage.elapsedDays).toBe(3) // 10 -> 13 Aug
  })

  it('rejects a replacement dated before the current cycle was installed', async () => {
    await filterCycles.installFilter({
      objectId,
      filterId,
      installedAt: '2026-08-13',
      durationControlEnabled: true,
      volumeControlEnabled: false,
      triggerMode: 'or',
      warningThresholdPercent: 80,
      durationLimitDays: 28,
    })

    await expect(
      filterCycles.replaceFilter(
        {
          objectId,
          filterId,
          installedAt: '2026-08-10',
          durationControlEnabled: true,
          volumeControlEnabled: false,
          triggerMode: 'or',
          warningThresholdPercent: 80,
          durationLimitDays: 28,
        },
        'preventive',
      ),
    ).rejects.toThrow(/before the current filter was installed/)
  })

  it('computes global status via the domain layer for a cycle (worked example)', async () => {
    const cycle = await filterCycles.installFilter({
      objectId,
      filterId,
      installedAt: '2026-08-01',
      durationControlEnabled: true,
      volumeControlEnabled: true,
      triggerMode: 'manual',
      warningThresholdPercent: 80,
      durationLimitDays: 28,
      volumeLimitLiters: 150,
    })
    const fillEvents = [
      {
        id: '1',
        objectId,
        filterCycleId: cycle.id,
        timestamp: NOW,
        fillRatio: 80,
        volumeLiters: 120,
      },
    ]
    const usage = filterCycles.getCycleUsage(cycle, fillEvents, NOW)
    expect(usage.volumeUsage.volumePercentage).toBe(80)
    expect(usage.globalStatus.status).toBe('warning')
    expect(usage.globalStatus.mostAdvancedControl).toBe('volume')
  })
})
