import '@testing-library/jest-dom/vitest'

// On recent Node versions, jsdom defers `window.localStorage` to Node's own
// experimental Web Storage implementation, which needs a `--localstorage-file`
// flag and otherwise silently resolves to `undefined`. Tests only need a simple
// in-memory Storage, so replace the accessor with one instead of shelling out
// to Node's file-backed implementation.
class MemoryStorage implements Storage {
  private store = new Map<string, string>()

  get length(): number {
    return this.store.size
  }

  clear(): void {
    this.store.clear()
  }

  getItem(key: string): string | null {
    return this.store.has(key) ? this.store.get(key)! : null
  }

  key(index: number): string | null {
    return Array.from(this.store.keys())[index] ?? null
  }

  removeItem(key: string): void {
    this.store.delete(key)
  }

  setItem(key: string, value: string): void {
    this.store.set(key, String(value))
  }
}

for (const key of ['localStorage', 'sessionStorage'] as const) {
  Object.defineProperty(window, key, {
    configurable: true,
    value: new MemoryStorage(),
  })
}
