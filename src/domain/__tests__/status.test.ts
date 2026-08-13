import { describe, expect, it } from 'vitest'
import { evaluateGlobalStatus, evaluateTimeStatus, evaluateVolumeStatus } from '../status'
import { calculateTimeUsage } from '../time'
import { calculateVolumeUsage } from '../volume'
import type { FillEvent } from '../types'

function fillEvent(volumeLiters: number): FillEvent {
  return {
    id: crypto.randomUUID(),
    objectId: 'object-1',
    filterCycleId: 'cycle-1',
    timestamp: '2026-08-13T10:00:00.000Z',
    fillRatio: 1,
    volumeLiters,
  }
}

describe('evaluateTimeStatus', () => {
  it('is normal for a freshly installed filter', () => {
    const usage = calculateTimeUsage('2026-08-13', '2026-08-13', 28)
    expect(evaluateTimeStatus(usage, true).status).toBe('normal')
  })

  it('is warning at/above the 90% default threshold', () => {
    const usage = calculateTimeUsage('2026-08-01', '2026-08-27', 28) // 26/28 = 92.9%
    expect(evaluateTimeStatus(usage, true).status).toBe('warning')
  })

  it('is expired once the duration limit is reached', () => {
    const usage = calculateTimeUsage('2026-08-01', '2026-08-29', 28)
    expect(evaluateTimeStatus(usage, true).status).toBe('expired')
  })

  it('stays normal when the time control is disabled, regardless of elapsed time', () => {
    const usage = calculateTimeUsage('2026-08-01', '2026-09-15', 28)
    expect(evaluateTimeStatus(usage, false).status).toBe('normal')
  })

  it('respects a custom warning threshold', () => {
    const usage = calculateTimeUsage('2026-08-01', '2026-08-11', 28) // 10/28 = 35.7%
    expect(evaluateTimeStatus(usage, true, 30).status).toBe('warning')
  })
})

describe('evaluateVolumeStatus', () => {
  it('is normal at 50% volume', () => {
    const usage = calculateVolumeUsage([fillEvent(75)], 'cycle-1', 150)
    expect(evaluateVolumeStatus(usage, true).status).toBe('normal')
  })

  it('is expired at 100% volume', () => {
    const usage = calculateVolumeUsage([fillEvent(150)], 'cycle-1', 150)
    expect(evaluateVolumeStatus(usage, true).status).toBe('expired')
  })

  it('is expired when volume is exceeded', () => {
    const usage = calculateVolumeUsage([fillEvent(180)], 'cycle-1', 150)
    expect(evaluateVolumeStatus(usage, true).status).toBe('expired')
  })
})

describe('evaluateGlobalStatus', () => {
  const timeExpired = evaluateTimeStatus(calculateTimeUsage('2026-08-01', '2026-08-29', 28), true)
  const timeNormal = evaluateTimeStatus(calculateTimeUsage('2026-08-01', '2026-08-05', 28), true)
  const volumeExpired = evaluateVolumeStatus(calculateVolumeUsage([fillEvent(150)], 'cycle-1', 150), true)
  const volumeNormal = evaluateVolumeStatus(calculateVolumeUsage([fillEvent(10)], 'cycle-1', 150), true)

  it('OR mode: expired as soon as one active control is expired', () => {
    expect(evaluateGlobalStatus([timeExpired, volumeNormal], 'or').status).toBe('expired')
    expect(evaluateGlobalStatus([timeNormal, volumeExpired], 'or').status).toBe('expired')
    expect(evaluateGlobalStatus([timeNormal, volumeNormal], 'or').status).toBe('normal')
  })

  it('AND mode: expired only once every active control is expired', () => {
    expect(evaluateGlobalStatus([timeExpired, volumeNormal], 'and').status).toBe('warning')
    expect(evaluateGlobalStatus([timeExpired, volumeExpired], 'and').status).toBe('expired')
  })

  it('MANUAL mode: never auto-expires, but still flags a warning', () => {
    expect(evaluateGlobalStatus([timeExpired, volumeExpired], 'manual').status).toBe('warning')
    expect(evaluateGlobalStatus([timeNormal, volumeNormal], 'manual').status).toBe('normal')
  })

  it('time-only control: volume is ignored entirely', () => {
    const volumeDisabled = evaluateVolumeStatus(
      calculateVolumeUsage([fillEvent(200)], 'cycle-1', 150),
      false,
    )
    expect(evaluateGlobalStatus([timeNormal, volumeDisabled], 'or').status).toBe('normal')
  })

  it('volume-only control: time is ignored entirely', () => {
    const timeDisabled = evaluateTimeStatus(calculateTimeUsage('2026-08-01', '2026-12-01', 28), false)
    expect(evaluateGlobalStatus([timeDisabled, volumeNormal], 'or').status).toBe('normal')
  })

  it('reports the most advanced control', () => {
    const result = evaluateGlobalStatus([timeNormal, volumeExpired], 'or')
    expect(result.mostAdvancedControl).toBe('volume')
  })
})
