import type { ControlStatus } from '../../domain/types'

// Reads like a graduated cylinder, not a generic loading bar: etched tick marks
// at each quarter, and the filled portion is a translucent "liquid" tint rather
// than a solid block, so the fluid level is legible instead of decorative.
const FILL_COLOR: Record<ControlStatus, string> = {
  normal: 'bg-status-normal/25',
  warning: 'bg-status-warning/25',
  expired: 'bg-status-danger/25',
}

const EDGE_COLOR: Record<ControlStatus, string> = {
  normal: 'bg-status-normal',
  warning: 'bg-status-warning',
  expired: 'bg-status-danger',
}

type ProgressBarProps = {
  label: string
  valueLabel: string
  percentage: number | null
  status: ControlStatus
}

export function ProgressBar({ label, valueLabel, percentage, status }: ProgressBarProps) {
  const width = Math.max(0, Math.min(100, percentage ?? 0))

  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between">
        <span className="text-xs font-semibold tracking-[0.06em] text-ink-muted uppercase">{label}</span>
        <span className="font-data text-sm font-medium text-ink">{valueLabel}</span>
      </div>
      <div
        className="tick-scale relative h-3 w-full overflow-hidden rounded-[3px] border border-rule bg-paper-sunken"
        role="progressbar"
        aria-valuenow={Math.round(width)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <div
          className={`h-full transition-[width] duration-500 ease-out ${FILL_COLOR[status]}`}
          style={{ width: `${width}%` }}
        />
        <div
          className={`absolute inset-y-0 w-px transition-[left] duration-500 ease-out ${EDGE_COLOR[status]}`}
          style={{ left: `${width}%` }}
          aria-hidden
        />
      </div>
    </div>
  )
}
