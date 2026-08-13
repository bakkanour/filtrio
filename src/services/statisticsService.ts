import { calculateFilterStatistics, calculatePeriodStatistics } from '../domain/statistics'
import type { FilterStatistics, PeriodStatistics } from '../domain/statistics'
import type { Repositories } from '../repository/types'

export function createStatisticsService(repositories: Repositories) {
  return {
    async getLifetimeStatistics(now: string = new Date().toISOString()): Promise<FilterStatistics> {
      const [cycles, fillEvents] = await Promise.all([
        repositories.filterCycles.findAll(),
        repositories.fillEvents.findAll(),
      ])
      return calculateFilterStatistics(cycles, fillEvents, now)
    },

    async getPeriodStatistics(period: { from: string; to: string }): Promise<PeriodStatistics> {
      const fillEvents = await repositories.fillEvents.findAll()
      return calculatePeriodStatistics(fillEvents, period)
    },
  }
}

export type StatisticsService = ReturnType<typeof createStatisticsService>
