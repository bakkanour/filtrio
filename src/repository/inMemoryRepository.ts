import type { Entity, Repository } from './types'

/** In-memory implementation used by service-layer tests, avoiding a real localStorage dependency. */
export class InMemoryRepository<T extends Entity> implements Repository<T> {
  private items: T[] = []

  async findAll(): Promise<T[]> {
    return [...this.items]
  }

  async findById(id: string): Promise<T | undefined> {
    return this.items.find((item) => item.id === id)
  }

  async create(entity: T): Promise<T> {
    this.items.push(entity)
    return entity
  }

  async update(id: string, entity: T): Promise<T> {
    const index = this.items.findIndex((item) => item.id === id)
    if (index === -1) throw new Error(`Cannot update entity: id "${id}" not found`)
    this.items[index] = entity
    return entity
  }

  async delete(id: string): Promise<void> {
    this.items = this.items.filter((item) => item.id !== id)
  }
}
