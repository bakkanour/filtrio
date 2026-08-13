import type { Filter } from '../domain/types'
import type { Repositories } from '../repository/types'
import { filterInputSchema, type FilterInput } from './validation'

export function createFilterService(repositories: Repositories) {
  return {
    async list(): Promise<Filter[]> {
      return repositories.filters.findAll()
    },

    async get(id: string): Promise<Filter | undefined> {
      return repositories.filters.findById(id)
    },

    async create(input: FilterInput): Promise<Filter> {
      const data = filterInputSchema.parse(input)
      const now = new Date().toISOString()
      const filter: Filter = { id: crypto.randomUUID(), ...data, createdAt: now, updatedAt: now }
      return repositories.filters.create(filter)
    },

    async update(id: string, input: FilterInput): Promise<Filter> {
      const data = filterInputSchema.parse(input)
      const existing = await repositories.filters.findById(id)
      if (!existing) throw new Error(`Filter "${id}" not found`)
      const updated: Filter = { ...existing, ...data, updatedAt: new Date().toISOString() }
      return repositories.filters.update(id, updated)
    },

    async remove(id: string): Promise<void> {
      await repositories.filters.delete(id)
    },
  }
}

export type FilterService = ReturnType<typeof createFilterService>
