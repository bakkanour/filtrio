import { Link, Navigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAppData } from '../context/AppDataContext'
import { useObjectCycle } from '../hooks/useObjectCycle'
import { Card } from '../components/Card'
import { buttonClass } from '../components/Button'
import { ProgressBar } from '../components/ProgressBar'
import { StatusBadge } from '../components/StatusBadge'
import { FillQuickActions } from '../components/FillQuickActions'
import { FillHistoryList } from '../components/FillHistoryList'
import { AlertBox } from '../components/AlertBox'
import { formatLiters, formatPercentage } from '../lib/format'

const HERO_COLOR = {
  normal: 'text-status-normal',
  warning: 'text-status-warning',
  expired: 'text-status-danger',
} as const

export function ObjectDetailPage() {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const { objects, filters, fillEvents, loading } = useAppData()
  const usage = useObjectCycle(id ?? '')

  const object = objects.find((o) => o.id === id)
  if (loading) return null
  if (!object || !id) return <Navigate to="/" replace />

  const filter = usage ? filters.find((f) => f.id === usage.cycle.filterId) : undefined
  const cycleFillEvents = usage ? fillEvents.filter((e) => e.filterCycleId === usage.cycle.id) : []

  const timeControl = usage?.globalStatus.controls.find((c) => c.kind === 'time')
  const volumeControl = usage?.globalStatus.controls.find((c) => c.kind === 'volume')
  const mostAdvanced = usage?.globalStatus.mostAdvancedControl
  const heroControl = usage?.globalStatus.controls.find((c) => c.kind === mostAdvanced)
  const heroPercentage = heroControl?.percentage ?? null

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-ink">{object.name}</h1>
        <p className="text-sm text-ink-muted">
          {t(`objectTypes.${object.type}`)} · {formatLiters(object.capacityLiters)} L
        </p>
      </div>

      {!usage && (
        <Card>
          <p className="mb-3 text-sm text-ink-muted">{t('dashboard.noActiveFilter')}</p>
          <Link to={`/objects/${id}/install`} className={buttonClass('primary')}>
            {t('dashboard.installFilterButton')}
          </Link>
        </Card>
      )}

      {usage && (
        <>
          <AlertBox globalStatus={usage.globalStatus} />

          <Card className="space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium tracking-[0.06em] text-ink-muted uppercase">
                  {t('objectDetail.currentFilter')}
                </p>
                <p className="text-lg font-semibold text-ink">{filter?.name ?? '—'}</p>
              </div>
              <StatusBadge status={usage.globalStatus.status} />
            </div>

            <div>
              <p className="text-xs font-medium tracking-[0.06em] text-ink-muted uppercase">{t('dashboard.activeFilter')}</p>
              <div className="flex items-baseline gap-2">
                <span className={`font-data text-6xl font-semibold tabular-nums ${HERO_COLOR[usage.globalStatus.status]}`}>
                  {heroPercentage !== null ? formatPercentage(heroPercentage) : '—'}
                  <span className="text-3xl">%</span>
                </span>
                <span className="text-sm text-ink-muted">{t('dashboard.cycleUsed')}</span>
              </div>
            </div>

            <div className="space-y-3">
              {timeControl?.enabled && (
                <ProgressBar
                  label={t('objectDetail.time')}
                  valueLabel={`${usage.timeUsage.elapsedDays} / ${timeControl.limit ?? '—'} ${t('common.days')}`}
                  percentage={timeControl.percentage}
                  status={timeControl.status}
                />
              )}
              {volumeControl?.enabled && (
                <ProgressBar
                  label={t('objectDetail.volume')}
                  valueLabel={`${formatLiters(usage.volumeUsage.consumedLiters)} / ${volumeControl.limit ?? '—'} ${t('common.liters')}`}
                  percentage={volumeControl.percentage}
                  status={volumeControl.status}
                />
              )}
            </div>

            {mostAdvanced && (
              <p className="text-sm text-ink-muted">
                {t('objectDetail.mostAdvancedControl', {
                  control: t(`objectDetail.control${mostAdvanced[0].toUpperCase()}${mostAdvanced.slice(1)}`),
                })}
              </p>
            )}

            <p className="text-xs text-ink-muted italic">{t('objectDetail.estimatedVolumeNotice')}</p>

            <Link to={`/objects/${id}/history`} className="inline-block text-sm font-medium text-accent hover:underline">
              {t('objectDetail.viewHistory')} →
            </Link>
          </Card>

          <div className="space-y-3">
            <h2 className="text-xs font-semibold tracking-[0.08em] text-ink-muted uppercase">{t('dashboard.quickFill')}</h2>
            <FillQuickActions objectId={id} filterCycleId={usage.cycle.id} objectCapacityLiters={object.capacityLiters} />
          </div>

          <div className="space-y-3">
            <h2 className="text-xs font-semibold tracking-[0.08em] text-ink-muted uppercase">{t('fillHistory.title')}</h2>
            <FillHistoryList fillEvents={cycleFillEvents} objectCapacityLiters={object.capacityLiters} />
          </div>

          <Link to={`/objects/${id}/install`} className={`${buttonClass('danger')} block text-center`}>
            {t('dashboard.replaceFilterButton')}
          </Link>
        </>
      )}
    </div>
  )
}
