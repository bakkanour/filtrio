import type { Repositories } from '../repository/types'
import { createFillEventService } from './fillEventService'
import { createFilterCycleService } from './filterCycleService'
import { createFilterService } from './filterService'
import { createStatisticsService } from './statisticsService'
import { createWaterObjectService } from './waterObjectService'

export function createServices(repositories: Repositories) {
  return {
    waterObjects: createWaterObjectService(repositories),
    filters: createFilterService(repositories),
    filterCycles: createFilterCycleService(repositories),
    fillEvents: createFillEventService(repositories),
    statistics: createStatisticsService(repositories),
  }
}

export type Services = ReturnType<typeof createServices>
