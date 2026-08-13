import { useTranslation } from 'react-i18next'
import { useStatistics } from '../hooks/useStatistics'
import { formatLiters } from '../lib/format'

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between border-b border-rule py-3">
      <span className="text-sm text-ink-muted">{label}</span>
      <span className="font-data text-lg font-semibold text-ink">{value}</span>
    </div>
  )
}

export function StatisticsPage() {
  const { t } = useTranslation()
  const { lifetime, thisMonth } = useStatistics()

  return (
    <div className="mx-auto max-w-lg space-y-10">
      <h1 className="text-xl font-semibold text-ink">{t('statistics.title')}</h1>

      <section>
        <h2 className="mb-1 text-xs font-semibold tracking-[0.08em] text-accent uppercase">{t('statistics.thisMonth')}</h2>
        <div>
          <StatRow label={t('statistics.volumeFiltered')} value={`${formatLiters(thisMonth.volumeLiters)} L`} />
          <StatRow label={t('statistics.fills')} value={String(thisMonth.fillCount)} />
          <StatRow label={t('statistics.filtersUsed')} value={String(thisMonth.cyclesUsedCount)} />
        </div>
      </section>

      <section>
        <h2 className="mb-1 text-xs font-semibold tracking-[0.08em] text-accent uppercase">{t('common.appName')}</h2>
        <div>
          <StatRow label={t('statistics.totalVolume')} value={`${formatLiters(lifetime.totalVolumeLiters)} L`} />
          <StatRow label={t('statistics.totalFills')} value={String(lifetime.totalFillCount)} />
          <StatRow label={t('statistics.filtersUsed')} value={String(lifetime.cyclesUsedCount)} />
          <StatRow
            label={t('statistics.avgDuration')}
            value={
              lifetime.averageCycleDurationDays !== null
                ? `${Math.round(lifetime.averageCycleDurationDays)} ${t('common.days')}`
                : '—'
            }
          />
          <StatRow
            label={t('statistics.avgVolume')}
            value={
              lifetime.averageVolumePerCycleLiters !== null
                ? `${formatLiters(lifetime.averageVolumePerCycleLiters)} L`
                : '—'
            }
          />
        </div>
      </section>
    </div>
  )
}
