import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { FillEvent, Filter, FilterCycle, ReplacementReason, WaterObject } from '../../domain/types'
import { createLocalStorageRepositories } from '../../repository'
import { createServices, type Services } from '../../services'
import type { FillInput, FilterInput, InstallFilterInput, WaterObjectInput } from '../../services/validation'

type AppDataState = {
  objects: WaterObject[]
  filters: Filter[]
  cycles: FilterCycle[]
  fillEvents: FillEvent[]
  loading: boolean
}

type AppDataValue = AppDataState & {
  services: Services
  createObject: (input: WaterObjectInput) => Promise<WaterObject>
  updateObject: (id: string, input: WaterObjectInput) => Promise<WaterObject>
  removeObject: (id: string) => Promise<void>
  createFilter: (input: FilterInput) => Promise<Filter>
  installFilter: (input: InstallFilterInput) => Promise<FilterCycle>
  replaceFilter: (input: InstallFilterInput, reason: ReplacementReason) => Promise<FilterCycle>
  addFill: (input: FillInput, objectCapacityLiters: number) => Promise<FillEvent>
  updateFill: (
    id: string,
    changes: { volumeLiters?: number; timestamp?: string },
    objectCapacityLiters: number,
  ) => Promise<FillEvent>
  deleteFill: (id: string) => Promise<void>
}

const AppDataContext = createContext<AppDataValue | undefined>(undefined)

const repositories = createLocalStorageRepositories()
const services = createServices(repositories)

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppDataState>({
    objects: [],
    filters: [],
    cycles: [],
    fillEvents: [],
    loading: true,
  })

  const reloadAll = useCallback(async () => {
    const [objects, filters, cycles, fillEvents] = await Promise.all([
      services.waterObjects.list(),
      services.filters.list(),
      repositories.filterCycles.findAll(),
      repositories.fillEvents.findAll(),
    ])
    setState({ objects, filters, cycles, fillEvents, loading: false })
  }, [])

  useEffect(() => {
    reloadAll()
  }, [reloadAll])

  const value = useMemo<AppDataValue>(
    () => ({
      ...state,
      services,
      async createObject(input) {
        const object = await services.waterObjects.create(input)
        setState((s) => ({ ...s, objects: [...s.objects, object] }))
        return object
      },
      async updateObject(id, input) {
        const object = await services.waterObjects.update(id, input)
        setState((s) => ({ ...s, objects: s.objects.map((o) => (o.id === id ? object : o)) }))
        return object
      },
      async removeObject(id) {
        await services.waterObjects.remove(id)
        setState((s) => ({
          ...s,
          objects: s.objects.filter((o) => o.id !== id),
          cycles: s.cycles.filter((c) => c.objectId !== id),
          fillEvents: s.fillEvents.filter((e) => e.objectId !== id),
        }))
      },
      async createFilter(input) {
        const filter = await services.filters.create(input)
        setState((s) => ({ ...s, filters: [...s.filters, filter] }))
        return filter
      },
      async installFilter(input) {
        const cycle = await services.filterCycles.installFilter(input)
        setState((s) => ({ ...s, cycles: [...s.cycles, cycle] }))
        return cycle
      },
      async replaceFilter(input, reason) {
        const { closed, created } = await services.filterCycles.replaceFilter(input, reason)
        setState((s) => ({
          ...s,
          cycles: [...s.cycles.map((c) => (c.id === closed.id ? closed : c)), created],
        }))
        return created
      },
      async addFill(input, objectCapacityLiters) {
        const event = await services.fillEvents.addFill(input, objectCapacityLiters)
        setState((s) => ({ ...s, fillEvents: [...s.fillEvents, event] }))
        return event
      },
      async updateFill(id, changes, objectCapacityLiters) {
        const event = await services.fillEvents.updateFill(id, changes, objectCapacityLiters)
        setState((s) => ({ ...s, fillEvents: s.fillEvents.map((e) => (e.id === id ? event : e)) }))
        return event
      },
      async deleteFill(id) {
        await services.fillEvents.deleteFill(id)
        setState((s) => ({ ...s, fillEvents: s.fillEvents.filter((e) => e.id !== id) }))
      },
    }),
    [state],
  )

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
}

export function useAppData(): AppDataValue {
  const ctx = useContext(AppDataContext)
  if (!ctx) throw new Error('useAppData must be used within an AppDataProvider')
  return ctx
}
