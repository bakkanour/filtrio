// Storage abstraction. Nothing above this layer should know how/where data is persisted,
// so swapping localStorage for a Postgres-backed API later only means writing a new
// implementation of this interface.

import type { FillEvent, Filter, FilterCycle, WaterObject } from '../domain/types'

export type Entity = { id: string }

export interface Repository<T extends Entity> {
  findAll(): Promise<T[]>
  findById(id: string): Promise<T | undefined>
  create(entity: T): Promise<T>
  update(id: string, entity: T): Promise<T>
  delete(id: string): Promise<void>
}

export type Repositories = {
  waterObjects: Repository<WaterObject>
  filters: Repository<Filter>
  filterCycles: Repository<FilterCycle>
  fillEvents: Repository<FillEvent>
}
