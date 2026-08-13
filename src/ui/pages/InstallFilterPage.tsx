import { useMemo, useState, type FormEvent } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAppData } from '../context/AppDataContext'
import { useObjectCycle } from '../hooks/useObjectCycle'
import { Card } from '../components/Card'
import { Button } from '../components/Button'
import { inputClass, labelClass } from '../components/inputClass'
import { toDateInputValue } from '../lib/format'
import type { ReplacementReason, TriggerMode } from '../../domain/types'
import { FILTER_PRESETS } from '../../domain/presets'

const REPLACEMENT_REASONS: ReplacementReason[] = ['time_limit', 'volume_limit', 'both', 'preventive', 'other']
const CUSTOM_PRESET = 'custom'

export function InstallFilterPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { objects, filters, loading, createFilter, installFilter, replaceFilter } = useAppData()
  const activeCycle = useObjectCycle(id ?? '')

  const object = objects.find((o) => o.id === id)
  const isReplacing = activeCycle !== undefined

  const today = useMemo(() => toDateInputValue(new Date().toISOString()), [])

  const [presetId, setPresetId] = useState(CUSTOM_PRESET)
  const [filterName, setFilterName] = useState('')
  const [installedAt, setInstalledAt] = useState(today)
  const [durationControlEnabled, setDurationControlEnabled] = useState(true)
  const [volumeControlEnabled, setVolumeControlEnabled] = useState(true)
  const [durationLimitDays, setDurationLimitDays] = useState('28')
  const [volumeLimitLiters, setVolumeLimitLiters] = useState('150')
  const [triggerMode, setTriggerMode] = useState<TriggerMode>('or')
  const [warningThresholdPercent, setWarningThresholdPercent] = useState('80')
  const [reason, setReason] = useState<ReplacementReason>('preventive')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  function applyPreset(id: string) {
    setPresetId(id)
    const preset = FILTER_PRESETS.find((p) => p.id === id)
    if (!preset) return
    setFilterName(t(preset.nameKey))
    if (preset.durationDays !== undefined) {
      setDurationControlEnabled(true)
      setDurationLimitDays(String(preset.durationDays))
    }
    if (preset.capacityLiters !== undefined) {
      setVolumeControlEnabled(true)
      setVolumeLimitLiters(String(preset.capacityLiters))
    }
  }

  if (loading) return null
  if (!object || !id) return <Navigate to="/" replace />

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
    if (isReplacing && activeCycle && installedAt < activeCycle.cycle.installedAt) {
      setError(t('filterForm.replacementBeforeInstallError'))
      return
    }

    setSubmitting(true)
    try {
      const trimmedName = filterName.trim()
      const existing = filters.find((f) => f.name.trim().toLowerCase() === trimmedName.toLowerCase())
      const filter = existing ?? (await createFilter({
        name: trimmedName,
        durationDays: durationControlEnabled ? Number(durationLimitDays) : undefined,
        capacityLiters: volumeControlEnabled ? Number(volumeLimitLiters) : undefined,
      }))

      const input = {
        objectId: id!,
        filterId: filter.id,
        installedAt,
        durationControlEnabled,
        volumeControlEnabled,
        durationLimitDays: durationControlEnabled ? Number(durationLimitDays) : undefined,
        volumeLimitLiters: volumeControlEnabled ? Number(volumeLimitLiters) : undefined,
        triggerMode,
        warningThresholdPercent: Number(warningThresholdPercent),
      }

      if (isReplacing) {
        await replaceFilter(input, reason)
      } else {
        await installFilter(input)
      }
      navigate(`/objects/${id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-xl font-semibold text-ink">
        {isReplacing ? t('filterForm.replaceTitle') : t('filterForm.installTitle')}
      </h1>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-5">
          <label className="block text-sm">
            <span className={labelClass}>{t('filterForm.preset')}</span>
            <select value={presetId} onChange={(e) => applyPreset(e.target.value)} className={inputClass}>
              <option value={CUSTOM_PRESET}>{t('filterForm.presetCustom')}</option>
              {FILTER_PRESETS.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {t(preset.nameKey)}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm">
            <span className={labelClass}>{t('filterForm.filterName')}</span>
            <input
              list="filter-names"
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              placeholder={t('filterForm.filterNamePlaceholder') ?? undefined}
              required
              className={inputClass}
            />
            <datalist id="filter-names">
              {filters.map((f) => (
                <option key={f.id} value={f.name} />
              ))}
            </datalist>
          </label>

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

          {durationControlEnabled && volumeControlEnabled && (
            <fieldset className="space-y-2">
              <legend className={labelClass}>{t('filterForm.strategy')}</legend>
              {(['or', 'and', 'manual'] as TriggerMode[]).map((mode) => (
                <label key={mode} className="flex items-center gap-2 text-sm text-ink">
                  <input
                    type="radio"
                    name="triggerMode"
                    checked={triggerMode === mode}
                    onChange={() => setTriggerMode(mode)}
                    className="h-4 w-4 accent-accent"
                  />
                  {t(`filterForm.strategy${mode[0].toUpperCase()}${mode.slice(1)}`)}
                </label>
              ))}
            </fieldset>
          )}

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

          {isReplacing && (
            <fieldset className="space-y-2">
              <legend className={labelClass}>{t('filterForm.replacementReason')}</legend>
              {REPLACEMENT_REASONS.map((r) => (
                <label key={r} className="flex items-center gap-2 text-sm text-ink">
                  <input
                    type="radio"
                    name="reason"
                    checked={reason === r}
                    onChange={() => setReason(r)}
                    className="h-4 w-4 accent-accent"
                  />
                  {t(`filterForm.reasons.${r}`)}
                </label>
              ))}
            </fieldset>
          )}

          {error && <p className="text-sm text-status-danger">{error}</p>}

          <Button type="submit" disabled={submitting} className="w-full">
            {isReplacing ? t('filterForm.replaceButton') : t('filterForm.installButton')}
          </Button>
        </form>
      </Card>
    </div>
  )
}
