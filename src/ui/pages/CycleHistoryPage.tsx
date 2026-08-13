import { Navigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { differenceInCalendarDays, parseISO } from 'date-fns'
import { useAppData } from '../context/AppDataContext'
import { useObjectCycleHistory } from '../hooks/useObjectCycle'
import { formatDate, formatLiters } from '../lib/format'

export function CycleHistoryPage() {
  const { t, i18n } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const { objects, loading } = useAppData()
  const history = useObjectCycleHistory(id ?? '')

  const object = objects.find((o) => o.id === id)
  if (loading) return null
  if (!object || !id) return <Navigate to="/" replace />

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-xl font-semibold text-ink">
        {t('cycleHistory.title')} · {object.name}
      </h1>

      {history.length === 0 && <p className="text-sm text-ink-muted">{t('statistics.noData')}</p>}

      <div>
        {history.map(({ cycle, fillEvents }) => {
          const isActive = cycle.removedAt === undefined
          const volumeConsumed = fillEvents.reduce((sum, e) => sum + e.volumeLiters, 0)
          const durationDays = differenceInCalendarDays(
            parseISO(cycle.removedAt ?? new Date().toISOString()),
            parseISO(cycle.installedAt),
          )

          return (
            <div key={cycle.id} className="border-b border-rule py-4 first:pt-0">
              <div className="mb-1 flex items-center gap-2">
                {isActive && <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden />}
                <p className="text-xs font-semibold tracking-[0.06em] text-ink-muted uppercase">
                  {isActive ? t('cycleHistory.current') : t('cycleHistory.previous')}
                </p>
              </div>
              <p className="font-data mb-3 text-base font-medium text-ink">
                {formatDate(cycle.installedAt, i18n.language)} →{' '}
                {isActive ? t('cycleHistory.active') : formatDate(cycle.removedAt!, i18n.language)}
              </p>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-4">
                <div>
                  <dt className="text-xs text-ink-muted">{t('cycleHistory.actualDuration')}</dt>
                  <dd className="font-data font-medium text-ink">
                    {durationDays} {t('common.days')}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-ink-muted">{t('cycleHistory.volumeConsumed')}</dt>
                  <dd className="font-data font-medium text-ink">{formatLiters(volumeConsumed)} L</dd>
                </div>
                <div>
                  <dt className="text-xs text-ink-muted">{t('cycleHistory.fillCount')}</dt>
                  <dd className="font-data font-medium text-ink">{fillEvents.length}</dd>
                </div>
                <div>
                  <dt className="text-xs text-ink-muted">{t('cycleHistory.reason')}</dt>
                  <dd className="font-medium text-ink">
                    {cycle.replacementReason ? t(`filterForm.reasons.${cycle.replacementReason}`) : t('cycleHistory.noReason')}
                  </dd>
                </div>
              </dl>
            </div>
          )
        })}
      </div>
    </div>
  )
}
