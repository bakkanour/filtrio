import { resolveFillVolume } from '../domain/volume'
import type { FillEvent } from '../domain/types'
import type { Repositories } from '../repository/types'
import { fillInputSchema, type FillInput } from './validation'

export function createFillEventService(repositories: Repositories) {
  return {
    async listForCycle(filterCycleId: string): Promise<FillEvent[]> {
      const all = await repositories.fillEvents.findAll()
      return all
        .filter((e) => e.filterCycleId === filterCycleId)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    },

    async listForObject(objectId: string): Promise<FillEvent[]> {
      const all = await repositories.fillEvents.findAll()
      return all.filter((e) => e.objectId === objectId)
    },

    /** Adds a fill from either a ratio (1 = full, 0.5 = half, ...) or a directly entered volume. */
    async addFill(rawInput: FillInput, objectCapacityLiters: number): Promise<FillEvent> {
      const input = fillInputSchema.parse(rawInput)
      const resolved = resolveFillVolume(
        objectCapacityLiters,
        input.volumeLiters !== undefined
          ? { volumeLiters: input.volumeLiters }
          : { fillRatio: input.fillRatio! },
      )
      const event: FillEvent = {
        id: crypto.randomUUID(),
        objectId: input.objectId,
        filterCycleId: input.filterCycleId,
        timestamp: input.timestamp ?? new Date().toISOString(),
        ...resolved,
      }
      return repositories.fillEvents.create(event)
    },

    /** Manual correction of a mis-recorded fill; stats are recalculated on read, not stored. */
    async updateFill(
      id: string,
      changes: { volumeLiters?: number; timestamp?: string },
      objectCapacityLiters: number,
    ): Promise<FillEvent> {
      const existing = await repositories.fillEvents.findById(id)
      if (!existing) throw new Error(`Fill event "${id}" not found`)

      const resolved =
        changes.volumeLiters !== undefined
          ? resolveFillVolume(objectCapacityLiters, { volumeLiters: changes.volumeLiters })
          : { fillRatio: existing.fillRatio, volumeLiters: existing.volumeLiters }

      const updated: FillEvent = {
        ...existing,
        ...resolved,
        timestamp: changes.timestamp ?? existing.timestamp,
      }
      return repositories.fillEvents.update(id, updated)
    },

    async deleteFill(id: string): Promise<void> {
      await repositories.fillEvents.delete(id)
    },
  }
}

export type FillEventService = ReturnType<typeof createFillEventService>
