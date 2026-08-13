import type { FillEvent, Filter, FilterCycle, WaterObject } from '../domain/types'
import { InMemoryRepository } from '../repository/inMemoryRepository'
import type { Repositories } from '../repository/types'

export function createInMemoryRepositories(): Repositories {
  return {
    waterObjects: new InMemoryRepository<WaterObject>(),
    filters: new InMemoryRepository<Filter>(),
    filterCycles: new InMemoryRepository<FilterCycle>(),
    fillEvents: new InMemoryRepository<FillEvent>(),
  }
}
