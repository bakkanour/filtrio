import { useMemo } from 'react'
import { useAppData } from '../context/AppDataContext'
import type { CycleUsage } from '../../services/filterCycleService'

/** Active filter cycle for an object, plus its live time/volume/status usage. */
export function useObjectCycle(objectId: string): CycleUsage | undefined {
  const { cycles, fillEvents, services } = useAppData()

  return useMemo(() => {
    const cycle = cycles.find((c) => c.objectId === objectId && c.removedAt === undefined)
    if (!cycle) return undefined
    const eventsForCycle = fillEvents.filter((e) => e.filterCycleId === cycle.id)
    return services.filterCycles.getCycleUsage(cycle, eventsForCycle)
  }, [cycles, fillEvents, objectId, services])
}

/** All past (closed) cycles for an object, most recent first. */
export function useObjectCycleHistory(objectId: string) {
  const { cycles, fillEvents } = useAppData()

  return useMemo(() => {
    return cycles
      .filter((c) => c.objectId === objectId)
      .sort((a, b) => new Date(b.installedAt).getTime() - new Date(a.installedAt).getTime())
      .map((cycle) => ({
        cycle,
        fillEvents: fillEvents.filter((e) => e.filterCycleId === cycle.id),
      }))
  }, [cycles, fillEvents, objectId])
}
