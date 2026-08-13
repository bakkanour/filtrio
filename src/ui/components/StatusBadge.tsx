import { useTranslation } from 'react-i18next'
import type { ControlStatus } from '../../domain/types'

const DOT_COLOR: Record<ControlStatus, string> = {
  normal: 'bg-status-normal',
  warning: 'bg-status-warning',
  expired: 'bg-status-danger',
}

const TEXT_COLOR: Record<ControlStatus, string> = {
  normal: 'text-status-normal',
  warning: 'text-status-warning',
  expired: 'text-status-danger',
}

export function StatusBadge({ status }: { status: ControlStatus }) {
  const { t } = useTranslation()
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold tracking-[0.08em] uppercase ${TEXT_COLOR[status]}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${DOT_COLOR[status]}`} aria-hidden />
      {t(`status.${status}`)}
    </span>
  )
}
