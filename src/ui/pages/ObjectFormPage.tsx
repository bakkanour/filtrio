import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAppData } from '../context/AppDataContext'
import { Card } from '../components/Card'
import { Button } from '../components/Button'
import { inputClass, labelClass } from '../components/inputClass'
import { WATER_OBJECT_TYPES, type WaterObjectType } from '../../domain/types'
import { OBJECT_PRESETS } from '../../domain/presets'

const CUSTOM_PRESET = 'custom'

export function ObjectFormPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { objects, loading, createObject, updateObject } = useAppData()

  const isEditing = Boolean(id)
  const existingObject = isEditing ? objects.find((o) => o.id === id) : undefined

  const [presetId, setPresetId] = useState(CUSTOM_PRESET)
  const [name, setName] = useState('')
  const [type, setType] = useState<WaterObjectType>('pitcher')
  const [capacityLiters, setCapacityLiters] = useState('1.5')
  const [totalCapacityLiters, setTotalCapacityLiters] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (existingObject) {
      setName(existingObject.name)
      setType(existingObject.type)
      setCapacityLiters(String(existingObject.capacityLiters))
      setTotalCapacityLiters(
        existingObject.totalCapacityLiters !== undefined ? String(existingObject.totalCapacityLiters) : '',
      )
    }
  }, [existingObject])

  const consistency = useMemo(() => {
    const filtered = Number(capacityLiters)
    const total = Number(totalCapacityLiters)
    if (!totalCapacityLiters.trim() || !Number.isFinite(total)) return null
    if (Number.isFinite(filtered) && filtered > total) return 'error' as const
    return 'ok' as const
  }, [capacityLiters, totalCapacityLiters])

  function applyPreset(presetIdValue: string) {
    setPresetId(presetIdValue)
    const preset = OBJECT_PRESETS.find((p) => p.id === presetIdValue)
    if (!preset) return
    setType(preset.type)
    setCapacityLiters(String(preset.capacityLiters))
    setTotalCapacityLiters(preset.totalCapacityLiters !== undefined ? String(preset.totalCapacityLiters) : '')
  }

  if (loading) return null
  if (isEditing && !existingObject) return <Navigate to="/" replace />

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    const capacity = Number(capacityLiters)
    if (!name.trim() || !Number.isFinite(capacity) || capacity <= 0) {
      setError(t('objectForm.invalidInput'))
      return
    }
    if (consistency === 'error') {
      setError(t('objectForm.volumeConsistencyError'))
      return
    }

    const total = totalCapacityLiters.trim() ? Number(totalCapacityLiters) : undefined
    const input = { name: name.trim(), type, capacityLiters: capacity, totalCapacityLiters: total }

    if (isEditing && id) {
      await updateObject(id, input)
      navigate(`/objects/${id}`)
    } else {
      const object = await createObject(input)
      navigate(`/objects/${object.id}/install`)
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-xl font-semibold text-ink">
        {isEditing ? t('objectForm.editTitle') : t('objectForm.createTitle')}
      </h1>
      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isEditing && (
            <label className="block text-sm">
              <span className={labelClass}>{t('objectForm.preset')}</span>
              <select value={presetId} onChange={(e) => applyPreset(e.target.value)} className={inputClass}>
                <option value={CUSTOM_PRESET}>{t('objectForm.presetCustom')}</option>
                {OBJECT_PRESETS.map((preset) => (
                  <option key={preset.id} value={preset.id}>
                    {t(preset.nameKey)}
                  </option>
                ))}
              </select>
            </label>
          )}

          <label className="block text-sm">
            <span className={labelClass}>{t('objectForm.name')}</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('objectForm.namePlaceholder') ?? undefined}
              required
              className={inputClass}
            />
          </label>

          <label className="block text-sm">
            <span className={labelClass}>{t('objectForm.type')}</span>
            <select value={type} onChange={(e) => setType(e.target.value as WaterObjectType)} className={inputClass}>
              {WATER_OBJECT_TYPES.map((t2) => (
                <option key={t2} value={t2}>
                  {t(`objectTypes.${t2}`)}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm">
            <span className={labelClass}>{t('objectForm.capacityLiters')}</span>
            <input
              type="number"
              step="0.01"
              min="0"
              inputMode="decimal"
              value={capacityLiters}
              onChange={(e) => setCapacityLiters(e.target.value)}
              required
              className={`font-data ${inputClass}`}
            />
          </label>

          <div>
            <label className="block text-sm">
              <span className={labelClass}>{t('objectForm.totalCapacityLiters')}</span>
              <input
                type="number"
                step="0.01"
                min="0"
                inputMode="decimal"
                value={totalCapacityLiters}
                onChange={(e) => setTotalCapacityLiters(e.target.value)}
                className={`font-data ${inputClass}`}
              />
            </label>
            <p className="mt-1 text-xs text-ink-muted">{t('objectForm.totalCapacityLitersHint')}</p>
          </div>

          {consistency === 'ok' && (
            <p className="text-sm text-status-normal">✓ {t('objectForm.volumeConsistencyOk')}</p>
          )}
          {consistency === 'error' && (
            <p className="text-sm text-status-danger">⚠ {t('objectForm.volumeConsistencyError')}</p>
          )}

          {error && <p className="text-sm text-status-danger">{error}</p>}

          <Button type="submit" disabled={consistency === 'error'} className="w-full">
            {isEditing ? t('objectForm.saveButton') : t('objectForm.submit')}
          </Button>
        </form>
      </Card>
    </div>
  )
}
