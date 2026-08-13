import type { Entity, Repository } from './types'

const STORAGE_PREFIX = 'filtrio:v1:'

export class LocalStorageRepository<T extends Entity> implements Repository<T> {
  private readonly key: string

  constructor(collectionName: string) {
    this.key = `${STORAGE_PREFIX}${collectionName}`
  }

  private readAll(): T[] {
    const raw = window.localStorage.getItem(this.key)
    if (!raw) return []
    try {
      return JSON.parse(raw) as T[]
    } catch {
      return []
    }
  }

  private writeAll(items: T[]): void {
    window.localStorage.setItem(this.key, JSON.stringify(items))
  }

  async findAll(): Promise<T[]> {
    return this.readAll()
  }

  async findById(id: string): Promise<T | undefined> {
    return this.readAll().find((item) => item.id === id)
  }

  async create(entity: T): Promise<T> {
    const items = this.readAll()
    items.push(entity)
    this.writeAll(items)
    return entity
  }

  async update(id: string, entity: T): Promise<T> {
    const items = this.readAll()
    const index = items.findIndex((item) => item.id === id)
    if (index === -1) throw new Error(`Cannot update "${this.key}" entity: id "${id}" not found`)
    items[index] = entity
    this.writeAll(items)
    return entity
  }

  async delete(id: string): Promise<void> {
    this.writeAll(this.readAll().filter((item) => item.id !== id))
  }
}
