import type { FillEvent, Filter, FilterCycle, WaterObject } from '../domain/types'
import { LocalStorageRepository } from './localStorageRepository'
import type { Repositories } from './types'

export function createLocalStorageRepositories(): Repositories {
  return {
    waterObjects: new LocalStorageRepository<WaterObject>('waterObjects'),
    filters: new LocalStorageRepository<Filter>('filters'),
    filterCycles: new LocalStorageRepository<FilterCycle>('filterCycles'),
    fillEvents: new LocalStorageRepository<FillEvent>('fillEvents'),
  }
}

export type { Repositories } from './types'
