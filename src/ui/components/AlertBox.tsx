import { useTranslation } from 'react-i18next'
import type { ControlEvaluation, GlobalStatus } from '../../domain/types'
import { formatLiters } from '../lib/format'

function controlLine(t: (key: string, opts?: Record<string, unknown>) => string, control: ControlEvaluation) {
  if (!control.enabled || control.limit === null) return null
  const reached = control.status === 'expired'
  const current = control.kind === 'volume' ? formatLiters(control.current) : control.current
  const limit = control.kind === 'volume' ? formatLiters(control.limit) : control.limit
  const key =
    control.kind === 'volume'
      ? reached
        ? 'alerts.volumeLimitReached'
        : 'alerts.volumeLimitNotReached'
      : reached
        ? 'alerts.timeLimitReached'
        : 'alerts.timeLimitNotReached'
  return t(key, { current, limit })
}

export function AlertBox({ globalStatus }: { globalStatus: GlobalStatus }) {
  const { t } = useTranslation()
  if (globalStatus.status === 'normal') return null

  const lines = globalStatus.controls.map((c) => controlLine(t, c)).filter((l): l is string => Boolean(l))
  if (lines.length === 0) return null

  const isExpired = globalStatus.status === 'expired'
  const tintClass = isExpired ? 'bg-status-danger-tint border-status-danger' : 'bg-status-warning-tint border-status-warning'
  const textClass = isExpired ? 'text-status-danger' : 'text-status-warning'

  return (
    <div role="alert" className={`border-l-2 py-3 pl-4 ${tintClass}`}>
      <p className={`mb-1.5 text-sm font-semibold tracking-[0.02em] ${textClass}`}>
        {isExpired ? t('alerts.title') : t('status.warning')}
      </p>
      <ul className="font-data space-y-1 text-sm text-ink-muted">
        {lines.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
    </div>
  )
}
