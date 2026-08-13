import { beforeEach, describe, expect, it } from 'vitest'
import { createInMemoryRepositories } from '../../test/inMemoryRepositories'
import { createFilterCycleService } from '../filterCycleService'
import { createFilterService } from '../filterService'
import { createWaterObjectService } from '../waterObjectService'
import type { Repositories } from '../../repository/types'

describe('waterObjectService', () => {
  let repositories: Repositories
  let waterObjects: ReturnType<typeof createWaterObjectService>

  beforeEach(() => {
    repositories = createInMemoryRepositories()
    waterObjects = createWaterObjectService(repositories)
  })

  it('supports several independent objects (pitcher, bottle, filtration system)', async () => {
    await waterObjects.create({ name: 'Carafe cuisine', type: 'pitcher', capacityLiters: 1.5 })
    await waterObjects.create({ name: 'Gourde bureau', type: 'bottle', capacityLiters: 0.75 })
    await waterObjects.create({ name: 'Système filtration maison', type: 'filtration_system', capacityLiters: 5 })

    const all = await waterObjects.list()
    expect(all).toHaveLength(3)
    expect(all.map((o) => o.type).sort()).toEqual(['bottle', 'filtration_system', 'pitcher'])
  })

  it('cascades deletion to the object cycles and fill events', async () => {
    const filters = createFilterService(repositories)
    const filterCycles = createFilterCycleService(repositories)

    const object = await waterObjects.create({ name: 'Carafe', type: 'pitcher', capacityLiters: 1.5 })
    const filter = await filters.create({ name: 'Filtre', durationDays: 28 })
    const cycle = await filterCycles.installFilter({
      objectId: object.id,
      filterId: filter.id,
      installedAt: new Date().toISOString().slice(0, 10),
      durationControlEnabled: true,
      volumeControlEnabled: false,
      triggerMode: 'or',
      warningThresholdPercent: 80,
      durationLimitDays: 28,
    })
    await repositories.fillEvents.create({
      id: 'fill-1',
      objectId: object.id,
      filterCycleId: cycle.id,
      timestamp: new Date().toISOString(),
      fillRatio: 1,
      volumeLiters: 1.5,
    })

    await waterObjects.remove(object.id)

    expect(await waterObjects.get(object.id)).toBeUndefined()
    expect(await filterCycles.listForObject(object.id)).toHaveLength(0)
    expect((await repositories.fillEvents.findAll()).filter((e) => e.objectId === object.id)).toHaveLength(0)
  })

  it('accepts a filtered volume at or below the container total capacity', async () => {
    const object = await waterObjects.create({
      name: 'Grande carafe',
      type: 'pitcher',
      capacityLiters: 1.4,
      totalCapacityLiters: 2.4,
    })
    expect(object.totalCapacityLiters).toBe(2.4)
  })

  it('rejects a filtered volume greater than the container total capacity', async () => {
    await expect(
      waterObjects.create({ name: 'Petite carafe', type: 'pitcher', capacityLiters: 1.5, totalCapacityLiters: 1.0 }),
    ).rejects.toThrow()
  })
})
