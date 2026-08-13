import type { WaterObject } from '../domain/types'
import type { Repositories } from '../repository/types'
import { waterObjectInputSchema, type WaterObjectInput } from './validation'

export function createWaterObjectService(repositories: Repositories) {
  return {
    async list(): Promise<WaterObject[]> {
      return repositories.waterObjects.findAll()
    },

    async get(id: string): Promise<WaterObject | undefined> {
      return repositories.waterObjects.findById(id)
    },

    async create(input: WaterObjectInput): Promise<WaterObject> {
      const data = waterObjectInputSchema.parse(input)
      const now = new Date().toISOString()
      const object: WaterObject = {
        id: crypto.randomUUID(),
        ...data,
        createdAt: now,
        updatedAt: now,
      }
      return repositories.waterObjects.create(object)
    },

    async update(id: string, input: WaterObjectInput): Promise<WaterObject> {
      const data = waterObjectInputSchema.parse(input)
      const existing = await repositories.waterObjects.findById(id)
      if (!existing) throw new Error(`Water object "${id}" not found`)
      const updated: WaterObject = { ...existing, ...data, updatedAt: new Date().toISOString() }
      return repositories.waterObjects.update(id, updated)
    },

    /** Deletes the object and cascades to its filter cycles and fill events. */
    async remove(id: string): Promise<void> {
      const [cycles, fillEvents] = await Promise.all([
        repositories.filterCycles.findAll(),
        repositories.fillEvents.findAll(),
      ])
      await Promise.all([
        ...cycles.filter((c) => c.objectId === id).map((c) => repositories.filterCycles.delete(c.id)),
        ...fillEvents.filter((e) => e.objectId === id).map((e) => repositories.fillEvents.delete(e.id)),
      ])
      await repositories.waterObjects.delete(id)
    },
  }
}

export type WaterObjectService = ReturnType<typeof createWaterObjectService>
