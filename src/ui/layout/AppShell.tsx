import { NavLink, Outlet } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../context/ThemeContext'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `border-b-2 px-1 py-1 text-sm font-medium transition-colors ${
    isActive ? 'border-accent text-ink' : 'border-transparent text-ink-muted hover:text-ink'
  }`

/** Three graduation ticks of decreasing width — the mark, not a droplet. */
function Mark() {
  return (
    <svg viewBox="0 0 20 20" className="h-5 w-5" aria-hidden>
      <rect width="20" height="20" rx="4" className="fill-paper-sunken stroke-rule-strong" strokeWidth="1" />
      <line x1="5" y1="6" x2="15" y2="6" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="5" y1="10" x2="12" y2="10" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
      <line x1="5" y1="14" x2="9" y2="14" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" opacity="0.45" />
    </svg>
  )
}

export function AppShell() {
  const { t, i18n } = useTranslation()
  const { theme, toggleTheme } = useTheme()

  function toggleLanguage() {
    i18n.changeLanguage(i18n.language.startsWith('fr') ? 'en' : 'fr')
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-rule bg-paper/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <NavLink to="/" className="flex items-center gap-2 text-[15px] font-semibold tracking-tight text-ink">
            <Mark />
            {t('common.appName')}
          </NavLink>

          <nav className="flex items-center gap-5">
            <NavLink to="/" end className={navLinkClass}>
              {t('nav.dashboard')}
            </NavLink>
            <NavLink to="/statistics" className={navLinkClass}>
              {t('nav.statistics')}
            </NavLink>
            <span className="h-4 w-px bg-rule" aria-hidden />
            <button
              type="button"
              onClick={toggleLanguage}
              className="font-data text-xs font-medium tracking-wide text-ink-muted transition-colors hover:text-ink"
              aria-label="Toggle language"
            >
              {i18n.language.startsWith('fr') ? 'FR' : 'EN'}
            </button>
            <button
              type="button"
              onClick={toggleTheme}
              className="text-ink-muted transition-colors hover:text-ink"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="10" cy="10" r="4" />
                  <path strokeLinecap="round" d="M10 2v2M10 16v2M18 10h-2M4 10H2M15.5 4.5l-1.4 1.4M5.9 14.1l-1.4 1.4M15.5 15.5l-1.4-1.4M5.9 5.9 4.5 4.5" />
                </svg>
              ) : (
                <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor">
                  <path d="M17 11.5A7 7 0 0 1 8.5 3a7 7 0 1 0 8.5 8.5Z" />
                </svg>
              )}
            </button>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
        <Outlet />
      </main>
    </div>
  )
}
