import { beforeEach, describe, expect, it } from 'vitest'
import { createInMemoryRepositories } from '../../test/inMemoryRepositories'
import { createFillEventService } from '../fillEventService'
import type { Repositories } from '../../repository/types'

const OBJECT_CAPACITY = 1.5

describe('fillEventService', () => {
  let repositories: Repositories
  let fillEvents: ReturnType<typeof createFillEventService>

  beforeEach(() => {
    repositories = createInMemoryRepositories()
    fillEvents = createFillEventService(repositories)
  })

  it('a full fill (ratio 1) on a 1.5L pitcher records +1.5L', async () => {
    const event = await fillEvents.addFill(
      { objectId: 'obj-1', filterCycleId: 'cycle-1', fillRatio: 1 },
      OBJECT_CAPACITY,
    )
    expect(event.volumeLiters).toBe(1.5)
  })

  it('a half fill (ratio 0.5) records +0.75L', async () => {
    const event = await fillEvents.addFill(
      { objectId: 'obj-1', filterCycleId: 'cycle-1', fillRatio: 0.5 },
      OBJECT_CAPACITY,
    )
    expect(event.volumeLiters).toBe(0.75)
  })

  it('a custom volume is recorded as-is', async () => {
    const event = await fillEvents.addFill(
      { objectId: 'obj-1', filterCycleId: 'cycle-1', volumeLiters: 0.2 },
      OBJECT_CAPACITY,
    )
    expect(event.volumeLiters).toBe(0.2)
  })

  it('editing a fill event updates its volume', async () => {
    const event = await fillEvents.addFill(
      { objectId: 'obj-1', filterCycleId: 'cycle-1', fillRatio: 1 },
      OBJECT_CAPACITY,
    )
    const updated = await fillEvents.updateFill(event.id, { volumeLiters: 0.5 }, OBJECT_CAPACITY)
    expect(updated.volumeLiters).toBe(0.5)

    const list = await fillEvents.listForCycle('cycle-1')
    expect(list).toHaveLength(1)
    expect(list[0].volumeLiters).toBe(0.5)
  })

  it('deleting a fill event removes it from the cycle history', async () => {
    const event = await fillEvents.addFill(
      { objectId: 'obj-1', filterCycleId: 'cycle-1', fillRatio: 1 },
      OBJECT_CAPACITY,
    )
    await fillEvents.deleteFill(event.id)
    expect(await fillEvents.listForCycle('cycle-1')).toHaveLength(0)
  })
})
