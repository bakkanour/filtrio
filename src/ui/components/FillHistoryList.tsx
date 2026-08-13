import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { FillEvent } from '../../domain/types'
import { useAppData } from '../context/AppDataContext'
import { formatDateTime } from '../lib/format'

type FillHistoryListProps = {
  fillEvents: FillEvent[]
  objectCapacityLiters: number
}

export function FillHistoryList({ fillEvents, objectCapacityLiters }: FillHistoryListProps) {
  const { t, i18n } = useTranslation()
  const { updateFill, deleteFill } = useAppData()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editVolume, setEditVolume] = useState('')

  const sorted = [...fillEvents].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  if (sorted.length === 0) {
    return <p className="text-sm text-ink-muted">{t('fillHistory.empty')}</p>
  }

  function startEdit(event: FillEvent) {
    setEditingId(event.id)
    setEditVolume(String(event.volumeLiters))
  }

  async function saveEdit(id: string) {
    const volumeLiters = Number(editVolume)
    if (Number.isFinite(volumeLiters) && volumeLiters > 0) {
      await updateFill(id, { volumeLiters }, objectCapacityLiters)
    }
    setEditingId(null)
  }

  async function handleDelete(id: string) {
    if (window.confirm(t('common.confirmDelete'))) {
      await deleteFill(id)
    }
  }

  return (
    <ul className="divide-y divide-rule">
      {sorted.map((event) => (
        <li key={event.id} className="flex items-center justify-between gap-3 py-2.5 pl-3 text-sm" style={{ borderLeft: '2px solid var(--rule)' }}>
          {editingId === event.id ? (
            <>
              <input
                type="number"
                step="0.01"
                min="0"
                autoFocus
                value={editVolume}
                onChange={(e) => setEditVolume(e.target.value)}
                className="font-data w-24 rounded-md border border-rule bg-paper px-2 py-1 text-ink outline-none focus:border-accent"
              />
              <div className="flex gap-3">
                <button type="button" onClick={() => saveEdit(event.id)} className="font-medium text-accent hover:underline">
                  {t('common.save')}
                </button>
                <button type="button" onClick={() => setEditingId(null)} className="text-ink-muted hover:underline">
                  {t('common.cancel')}
                </button>
              </div>
            </>
          ) : (
            <>
              <div>
                <p className="font-data font-medium text-ink">{event.volumeLiters} L</p>
                <p className="font-data text-xs text-ink-muted">{formatDateTime(event.timestamp, i18n.language)}</p>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => startEdit(event)} className="text-ink-muted hover:text-ink">
                  {t('common.edit')}
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(event.id)}
                  className="text-status-danger/80 hover:text-status-danger"
                >
                  {t('common.delete')}
                </button>
              </div>
            </>
          )}
        </li>
      ))}
    </ul>
  )
}
