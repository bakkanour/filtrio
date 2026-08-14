import { calculateTimeUsage, isFutureDate } from '../domain/time'
import { calculateVolumeUsage } from '../domain/volume'
import { evaluateGlobalStatus, evaluateTimeStatus, evaluateVolumeStatus } from '../domain/status'
import type { FillEvent, FilterCycle, GlobalStatus, TimeUsage, VolumeUsage } from '../domain/types'
import type { Repositories } from '../repository/types'
import {
  editFilterCycleInputSchema,
  installFilterInputSchema,
  replacementReasonSchema,
  type EditFilterCycleInput,
  type InstallFilterInput,
} from './validation'
import type { z } from 'zod'

export type CycleUsage = {
  cycle: FilterCycle
  timeUsage: TimeUsage
  volumeUsage: VolumeUsage
  globalStatus: GlobalStatus
}

export function createFilterCycleService(repositories: Repositories) {
  async function listForObject(objectId: string): Promise<FilterCycle[]> {
    const all = await repositories.filterCycles.findAll()
    return all
      .filter((c) => c.objectId === objectId)
      .sort((a, b) => new Date(b.installedAt).getTime() - new Date(a.installedAt).getTime())
  }

  async function getActiveCycle(objectId: string): Promise<FilterCycle | undefined> {
    const cycles = await listForObject(objectId)
    return cycles.find((c) => c.removedAt === undefined)
  }

  function buildCycle(input: InstallFilterInput): FilterCycle {
    const now = new Date().toISOString()
    if (isFutureDate(input.installedAt, now)) {
      throw new Error('Installation date cannot be in the future')
    }
    return {
      id: crypto.randomUUID(),
      objectId: input.objectId,
      filterId: input.filterId,
      installedAt: input.installedAt,
      createdAt: now,
      durationLimitDays: input.durationControlEnabled ? input.durationLimitDays : undefined,
      volumeLimitLiters: input.volumeControlEnabled ? input.volumeLimitLiters : undefined,
      durationControlEnabled: input.durationControlEnabled,
      volumeControlEnabled: input.volumeControlEnabled,
      triggerMode: input.triggerMode,
      warningThresholdPercent: input.warningThresholdPercent,
    }
  }

  return {
    listForObject,
    getActiveCycle,

    /** Installs the first filter cycle for an object that has none yet. */
    async installFilter(rawInput: InstallFilterInput): Promise<FilterCycle> {
      const input = installFilterInputSchema.parse(rawInput)
      const existingActive = await getActiveCycle(input.objectId)
      if (existingActive) {
        throw new Error('This object already has an active filter cycle; use replaceFilter instead')
      }
      return repositories.filterCycles.create(buildCycle(input))
    },

    /** Closes the current cycle and starts a new one, preserving history. */
    async replaceFilter(
      rawInput: InstallFilterInput,
      reason: z.infer<typeof replacementReasonSchema>,
    ): Promise<{ closed: FilterCycle; created: FilterCycle }> {
      const input = installFilterInputSchema.parse(rawInput)
      replacementReasonSchema.parse(reason)

      const active = await getActiveCycle(input.objectId)
      if (!active) {
        throw new Error('No active filter cycle to replace; use installFilter instead')
      }
      if (isFutureDate(input.installedAt, new Date().toISOString())) {
        throw new Error('Installation date cannot be in the future')
      }
      if (input.installedAt < active.installedAt) {
        throw new Error('Replacement date cannot be before the current filter was installed')
      }

      const closed = await repositories.filterCycles.update(active.id, {
        ...active,
        removedAt: input.installedAt,
        replacementReason: reason,
      })
      const created = await repositories.filterCycles.create(buildCycle(input))
      return { closed, created }
    },

    /** Edits an existing cycle's dates/limits in place (e.g. to fix a wrong installation date), without touching history. */
    async updateCycle(cycleId: string, rawInput: EditFilterCycleInput): Promise<FilterCycle> {
      const input = editFilterCycleInputSchema.parse(rawInput)
      const existing = await repositories.filterCycles.findById(cycleId)
      if (!existing) {
        throw new Error(`Cannot update filter cycle: id "${cycleId}" not found`)
      }
      if (isFutureDate(input.installedAt, new Date().toISOString())) {
        throw new Error('Installation date cannot be in the future')
      }

      return repositories.filterCycles.update(cycleId, {
        ...existing,
        installedAt: input.installedAt,
        durationLimitDays: input.durationControlEnabled ? input.durationLimitDays : undefined,
        volumeLimitLiters: input.volumeControlEnabled ? input.volumeLimitLiters : undefined,
        durationControlEnabled: input.durationControlEnabled,
        volumeControlEnabled: input.volumeControlEnabled,
        triggerMode: input.triggerMode,
        warningThresholdPercent: input.warningThresholdPercent,
      })
    },

    /** Derives time/volume/status metrics for a cycle from its raw fill events. Pure delegation to domain. */
    getCycleUsage(cycle: FilterCycle, fillEvents: FillEvent[], now: string = new Date().toISOString()): CycleUsage {
      const timeUsage = calculateTimeUsage(cycle.installedAt, now, cycle.durationLimitDays)
      const volumeUsage = calculateVolumeUsage(fillEvents, cycle.id, cycle.volumeLimitLiters)

      const timeControl = evaluateTimeStatus(
        timeUsage,
        cycle.durationControlEnabled,
        cycle.warningThresholdPercent,
      )
      const volumeControl = evaluateVolumeStatus(
        volumeUsage,
        cycle.volumeControlEnabled,
        cycle.warningThresholdPercent,
      )
      const globalStatus = evaluateGlobalStatus([timeControl, volumeControl], cycle.triggerMode)

      return { cycle, timeUsage, volumeUsage, globalStatus }
    },
  }
}

export type FilterCycleService = ReturnType<typeof createFilterCycleService>
