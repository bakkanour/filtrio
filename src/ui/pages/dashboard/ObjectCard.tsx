import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { WaterObject } from '../../../domain/types'
import { useObjectCycle } from '../../hooks/useObjectCycle'
import { Card } from '../../components/Card'
import { ProgressBar } from '../../components/ProgressBar'
import { StatusBadge } from '../../components/StatusBadge'
import { FillQuickActions } from '../../components/FillQuickActions'
import { formatLiters, formatPercentage } from '../../lib/format'

const HERO_COLOR = {
  normal: 'text-status-normal',
  warning: 'text-status-warning',
  expired: 'text-status-danger',
} as const

export function ObjectCard({ object }: { object: WaterObject }) {
  const { t } = useTranslation()
  const usage = useObjectCycle(object.id)

  const timeControl = usage?.globalStatus.controls.find((c) => c.kind === 'time')
  const volumeControl = usage?.globalStatus.controls.find((c) => c.kind === 'volume')
  const heroControl = usage?.globalStatus.controls.find((c) => c.kind === usage.globalStatus.mostAdvancedControl)
  const heroPercentage = heroControl?.percentage ?? null

  return (
    <Card className="flex flex-col gap-5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <Link to={`/objects/${object.id}`} className="text-base font-semibold text-ink hover:text-accent">
            {object.name}
          </Link>
          <p className="text-xs tracking-[0.06em] text-ink-muted uppercase">{t(`objectTypes.${object.type}`)}</p>
        </div>
        {usage && <StatusBadge status={usage.globalStatus.status} />}
      </div>

      {!usage && (
        <div className="rounded-lg border border-dashed border-rule-strong bg-paper-sunken px-4 py-3 text-sm text-ink-muted">
          {t('dashboard.noActiveFilter')}
          <Link to={`/objects/${object.id}/install`} className="ml-2 font-semibold text-accent hover:underline">
            {t('dashboard.installFilterButton')}
          </Link>
        </div>
      )}

      {usage && (
        <>
          <div>
            <p className="text-xs font-medium tracking-[0.06em] text-ink-muted uppercase">{t('dashboard.activeFilter')}</p>
            <div className="flex items-baseline gap-2">
              <span className={`font-data text-5xl font-semibold tabular-nums ${HERO_COLOR[usage.globalStatus.status]}`}>
                {heroPercentage !== null ? formatPercentage(heroPercentage) : '—'}
                <span className="text-2xl">%</span>
              </span>
              <span className="text-sm text-ink-muted">{t('dashboard.cycleUsed')}</span>
            </div>
          </div>

          <div className="space-y-3">
            {timeControl?.enabled && (
              <ProgressBar
                label={t('dashboard.time')}
                valueLabel={`${usage.timeUsage.elapsedDays} / ${timeControl.limit ?? '—'} ${t('common.days')}`}
                percentage={timeControl.percentage}
                status={timeControl.status}
              />
            )}
            {volumeControl?.enabled && (
              <ProgressBar
                label={t('dashboard.volume')}
                valueLabel={`${formatLiters(usage.volumeUsage.consumedLiters)} / ${volumeControl.limit ?? '—'} ${t('common.liters')}`}
                percentage={volumeControl.percentage}
                status={volumeControl.status}
              />
            )}
          </div>

          <FillQuickActions
            objectId={object.id}
            filterCycleId={usage.cycle.id}
            objectCapacityLiters={object.capacityLiters}
            compact
          />

          <Link
            to={`/objects/${object.id}/install`}
            className="text-center text-sm font-medium text-ink-muted hover:text-status-danger"
          >
            {t('dashboard.replaceFilterButton')}
          </Link>
        </>
      )}
    </Card>
  )
}
