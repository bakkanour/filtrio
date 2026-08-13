import type { ControlEvaluation, ControlStatus, GlobalStatus, TimeUsage, TriggerMode, VolumeUsage } from './types'

export const DEFAULT_WARNING_THRESHOLD_PERCENT = 90

function statusFromPercentage(
  percentage: number | null,
  warningThresholdPercent: number,
): ControlStatus {
  if (percentage === null) return 'normal'
  if (percentage >= 100) return 'expired'
  if (percentage >= warningThresholdPercent) return 'warning'
  return 'normal'
}

export function evaluateTimeStatus(
  timeUsage: TimeUsage,
  enabled: boolean,
  warningThresholdPercent: number = DEFAULT_WARNING_THRESHOLD_PERCENT,
): ControlEvaluation {
  return {
    kind: 'time',
    enabled,
    status: enabled ? statusFromPercentage(timeUsage.timePercentage, warningThresholdPercent) : 'normal',
    percentage: timeUsage.timePercentage,
    current: timeUsage.elapsedDays,
    limit: timeUsage.remainingDays === null ? null : timeUsage.elapsedDays + timeUsage.remainingDays,
  }
}

export function evaluateVolumeStatus(
  volumeUsage: VolumeUsage,
  enabled: boolean,
  warningThresholdPercent: number = DEFAULT_WARNING_THRESHOLD_PERCENT,
): ControlEvaluation {
  return {
    kind: 'volume',
    enabled,
    status: enabled
      ? statusFromPercentage(volumeUsage.volumePercentage, warningThresholdPercent)
      : 'normal',
    percentage: volumeUsage.volumePercentage,
    current: volumeUsage.consumedLiters,
    limit:
      volumeUsage.remainingLiters === null
        ? null
        : volumeUsage.consumedLiters + volumeUsage.remainingLiters,
  }
}

/** Combines the active controls into one global status, according to the trigger mode. */
export function evaluateGlobalStatus(controls: ControlEvaluation[], triggerMode: TriggerMode): GlobalStatus {
  const active = controls.filter((c) => c.enabled)

  const mostAdvancedControl =
    active
      .filter((c) => c.percentage !== null)
      .sort((a, b) => (b.percentage ?? 0) - (a.percentage ?? 0))[0]?.kind ?? null

  let status: ControlStatus = 'normal'

  if (active.length > 0 && triggerMode !== 'manual') {
    if (triggerMode === 'or') {
      if (active.some((c) => c.status === 'expired')) status = 'expired'
      else if (active.some((c) => c.status === 'warning')) status = 'warning'
    } else {
      // 'and': expired only once every active control is expired.
      if (active.every((c) => c.status === 'expired')) status = 'expired'
      else if (active.some((c) => c.status === 'warning' || c.status === 'expired')) status = 'warning'
    }
  } else if (active.length > 0 && triggerMode === 'manual') {
    // Manual mode never triggers "expired" automatically, but still surfaces a warning.
    if (active.some((c) => c.status === 'warning' || c.status === 'expired')) status = 'warning'
  }

  return { status, triggerMode, controls, mostAdvancedControl }
}
