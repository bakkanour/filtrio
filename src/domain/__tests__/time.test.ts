import { describe, expect, it } from 'vitest'
import { calculateElapsedDays, calculateTimeUsage, isFutureDate } from '../time'

describe('calculateElapsedDays', () => {
  it('is 0 for a filter installed today', () => {
    expect(calculateElapsedDays('2026-08-13', '2026-08-13')).toBe(0)
  })

  it('is 1 after one day', () => {
    expect(calculateElapsedDays('2026-08-13', '2026-08-14')).toBe(1)
  })

  it('is 28 after 28 days', () => {
    expect(calculateElapsedDays('2026-08-01', '2026-08-29')).toBe(28)
  })

  it('is never negative even if now is somehow before installedAt', () => {
    expect(calculateElapsedDays('2026-08-20', '2026-08-13')).toBe(0)
  })

  it('handles the spring-forward DST transition without losing a day', () => {
    // Europe/Paris DST starts 2026-03-29
    expect(calculateElapsedDays('2026-03-25', '2026-04-02')).toBe(8)
  })

  it('handles the fall-back DST transition without gaining a day', () => {
    // Europe/Paris DST ends 2026-10-25
    expect(calculateElapsedDays('2026-10-20', '2026-10-28')).toBe(8)
  })
})

describe('calculateTimeUsage', () => {
  it('returns null percentage/remaining when no duration limit is set (volume-only control)', () => {
    const usage = calculateTimeUsage('2026-08-01', '2026-08-13', undefined)
    expect(usage.elapsedDays).toBe(12)
    expect(usage.remainingDays).toBeNull()
    expect(usage.timePercentage).toBeNull()
  })

  it('matches the spec worked example: 12 elapsed / 16 remaining / 42.86%', () => {
    const usage = calculateTimeUsage('2026-08-01', '2026-08-13', 28)
    expect(usage.elapsedDays).toBe(12)
    expect(usage.remainingDays).toBe(16)
    expect(usage.timePercentage).toBeCloseTo(42.857, 2)
  })

  it('caps percentage at 100 and remaining at 0 once expired', () => {
    const usage = calculateTimeUsage('2026-08-01', '2026-09-15', 28)
    expect(usage.remainingDays).toBe(0)
    expect(usage.timePercentage).toBe(100)
  })

  it('reaches exactly 100% at the duration limit', () => {
    const usage = calculateTimeUsage('2026-08-01', '2026-08-29', 28)
    expect(usage.elapsedDays).toBe(28)
    expect(usage.timePercentage).toBe(100)
    expect(usage.remainingDays).toBe(0)
  })
})

describe('isFutureDate', () => {
  it('rejects a date after now', () => {
    expect(isFutureDate('2026-08-20', '2026-08-13')).toBe(true)
  })

  it('accepts a date before now (retroactive installation)', () => {
    expect(isFutureDate('2026-08-10', '2026-08-13')).toBe(false)
  })

  it('accepts today', () => {
    expect(isFutureDate('2026-08-13', '2026-08-13')).toBe(false)
  })
})
