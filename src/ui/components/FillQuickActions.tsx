import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAppData } from '../context/AppDataContext'
import { Button } from './Button'
import { inputClass } from './inputClass'

type FillQuickActionsProps = {
  objectId: string
  filterCycleId: string
  objectCapacityLiters: number
  compact?: boolean
}

export function FillQuickActions({
  objectId,
  filterCycleId,
  objectCapacityLiters,
  compact = false,
}: FillQuickActionsProps) {
  const { t } = useTranslation()
  const { addFill } = useAppData()
  const [customVolume, setCustomVolume] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [confirmed, setConfirmed] = useState(false)

  function flashConfirmed() {
    setConfirmed(true)
    window.setTimeout(() => setConfirmed(false), 900)
  }

  async function addRatioFill(fillRatio: number) {
    setSubmitting(true)
    try {
      await addFill({ objectId, filterCycleId, fillRatio }, objectCapacityLiters)
      flashConfirmed()
    } finally {
      setSubmitting(false)
    }
  }

  async function addCustomFill(e: React.FormEvent) {
    e.preventDefault()
    const volumeLiters = Number(customVolume)
    if (!Number.isFinite(volumeLiters) || volumeLiters <= 0) return
    setSubmitting(true)
    try {
      await addFill({ objectId, filterCycleId, volumeLiters }, objectCapacityLiters)
      setCustomVolume('')
      flashConfirmed()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={compact ? 'flex flex-wrap items-center gap-2' : 'space-y-3'}>
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" disabled={submitting} onClick={() => addRatioFill(1)}>
          {t('objectDetail.addFillFull')}
        </Button>
        <Button type="button" variant="secondary" disabled={submitting} onClick={() => addRatioFill(0.5)}>
          {t('objectDetail.addFillHalf')}
        </Button>
        <span
          className={`text-sm font-medium text-status-normal transition-opacity duration-300 ${confirmed ? 'opacity-100' : 'opacity-0'}`}
          aria-hidden={!confirmed}
        >
          ✓
        </span>
      </div>
      {!compact && (
        <form onSubmit={addCustomFill} className="flex items-end gap-2">
          <label className="flex-1 text-sm">
            <span className="mb-1 block text-ink-muted">{t('objectDetail.customVolumeLabel')}</span>
            <input
              type="number"
              step="0.01"
              min="0"
              inputMode="decimal"
              placeholder={t('objectDetail.customVolumePlaceholder') ?? undefined}
              value={customVolume}
              onChange={(e) => setCustomVolume(e.target.value)}
              className={inputClass}
            />
          </label>
          <Button type="submit" variant="secondary" disabled={submitting}>
            {t('common.add')}
          </Button>
        </form>
      )}
    </div>
  )
}
