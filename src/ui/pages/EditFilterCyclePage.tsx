import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAppData } from '../context/AppDataContext'
import { useObjectCycle } from '../hooks/useObjectCycle'
import { Card } from '../components/Card'
import { Button } from '../components/Button'
import { inputClass, labelClass } from '../components/inputClass'
import { toDateInputValue } from '../lib/format'

export function EditFilterCyclePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { objects, loading, updateCycle } = useAppData()
  const activeCycle = useObjectCycle(id ?? '')

  const object = objects.find((o) => o.id === id)
  const today = useMemo(() => toDateInputValue(new Date().toISOString()), [])

  const [installedAt, setInstalledAt] = useState(today)
  const [durationControlEnabled, setDurationControlEnabled] = useState(false)
  const [volumeControlEnabled, setVolumeControlEnabled] = useState(false)
  const [durationLimitDays, setDurationLimitDays] = useState('28')
  const [volumeLimitLiters, setVolumeLimitLiters] = useState('150')
  const [warningThresholdPercent, setWarningThresholdPercent] = useState('90')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!activeCycle) return
    const cycle = activeCycle.cycle
    setInstalledAt(toDateInputValue(cycle.installedAt))
    setDurationControlEnabled(cycle.durationControlEnabled)
    setVolumeControlEnabled(cycle.volumeControlEnabled)
    setDurationLimitDays(String(cycle.durationLimitDays ?? '28'))
    setVolumeLimitLiters(String(cycle.volumeLimitLiters ?? '150'))
    setWarningThresholdPercent(String(cycle.warningThresholdPercent))
    // Sync form fields once the active cycle for this object loads; user edits afterwards are local.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCycle?.cycle.id])

  if (loading) return null
  if (!object || !id || !activeCycle) return <Navigate to={`/objects/${id ?? ''}`} replace />

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (!durationControlEnabled && !volumeControlEnabled) {
      setError(t('filterForm.atLeastOneControl'))
      return
    }
    if (installedAt > today) {
      setError(t('filterForm.futureDateError'))
      return
    }

    setSubmitting(true)
    try {
      await updateCycle(activeCycle!.cycle.id, {
        installedAt,
        durationControlEnabled,
        volumeControlEnabled,
        durationLimitDays: durationControlEnabled ? Number(durationLimitDays) : undefined,
        volumeLimitLiters: volumeControlEnabled ? Number(volumeLimitLiters) : undefined,
        triggerMode: 'or' as const,
        warningThresholdPercent: Number(warningThresholdPercent),
      })
      navigate(`/objects/${id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-xl font-semibold text-ink">{t('filterForm.editTitle')}</h1>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-5">
          <label className="block text-sm">
            <span className={labelClass}>{t('filterForm.installedAt')}</span>
            <input
              type="date"
              value={installedAt}
              max={today}
              onChange={(e) => setInstalledAt(e.target.value)}
              required
              className={`font-data ${inputClass}`}
            />
            <span className="mt-1 block text-xs text-ink-muted">{t('filterForm.installedAtHint')}</span>
          </label>

          <fieldset className="space-y-3">
            <legend className={labelClass}>{t('filterForm.strategy')}</legend>

            <div className="space-y-2 rounded-md border border-rule p-3">
              <label className="flex items-center gap-2 text-sm font-medium text-ink">
                <input
                  type="checkbox"
                  checked={durationControlEnabled}
                  onChange={(e) => setDurationControlEnabled(e.target.checked)}
                  className="h-4 w-4 accent-accent"
                />
                {t('filterForm.timeControl')}
              </label>
              {durationControlEnabled && (
                <input
                  type="number"
                  min="1"
                  value={durationLimitDays}
                  onChange={(e) => setDurationLimitDays(e.target.value)}
                  placeholder={t('filterForm.durationDays') ?? undefined}
                  required
                  className={`font-data ${inputClass}`}
                />
              )}
            </div>

            <div className="space-y-2 rounded-md border border-rule p-3">
              <label className="flex items-center gap-2 text-sm font-medium text-ink">
                <input
                  type="checkbox"
                  checked={volumeControlEnabled}
                  onChange={(e) => setVolumeControlEnabled(e.target.checked)}
                  className="h-4 w-4 accent-accent"
                />
                {t('filterForm.volumeControl')}
              </label>
              {volumeControlEnabled && (
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={volumeLimitLiters}
                  onChange={(e) => setVolumeLimitLiters(e.target.value)}
                  placeholder={t('filterForm.capacityLiters') ?? undefined}
                  required
                  className={`font-data ${inputClass}`}
                />
              )}
            </div>
          </fieldset>

          <label className="block text-sm">
            <span className={labelClass}>{t('filterForm.warningThreshold')}</span>
            <input
              type="number"
              min="1"
              max="99"
              value={warningThresholdPercent}
              onChange={(e) => setWarningThresholdPercent(e.target.value)}
              className={`font-data w-32 ${inputClass}`}
            />
          </label>

          {error && <p className="text-sm text-status-danger">{error}</p>}

          <Button type="submit" disabled={submitting} className="w-full">
            {t('common.save')}
          </Button>
        </form>
      </Card>
    </div>
  )
}
