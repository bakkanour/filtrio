import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAppData } from '../../context/AppDataContext'
import { buttonClass } from '../../components/Button'
import { ObjectCard } from './ObjectCard'

export function Dashboard() {
  const { t } = useTranslation()
  const { objects, loading } = useAppData()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-ink">{t('dashboard.title')}</h1>
        <Link to="/objects/new" className={buttonClass('primary')}>
          {t('dashboard.addObject')}
        </Link>
      </div>

      {!loading && objects.length === 0 && (
        <p className="rounded-lg border border-dashed border-rule-strong p-8 text-center text-sm text-ink-muted">
          {t('dashboard.noObjects')}
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {objects.map((object) => (
          <ObjectCard key={object.id} object={object} />
        ))}
      </div>
    </div>
  )
}
