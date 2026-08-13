import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { I18nextProvider } from 'react-i18next'
import i18n from '../../../i18n'
import { StatusBadge } from '../StatusBadge'

function renderWithI18n(ui: React.ReactElement) {
  return render(<I18nextProvider i18n={i18n}>{ui}</I18nextProvider>)
}

describe('StatusBadge', () => {
  it('renders the EXPIRED label for an expired status', () => {
    renderWithI18n(<StatusBadge status="expired" />)
    expect(screen.getByText(i18n.t('status.expired'))).toBeInTheDocument()
  })

  it('renders the NORMAL label for a normal status', () => {
    renderWithI18n(<StatusBadge status="normal" />)
    expect(screen.getByText(i18n.t('status.normal'))).toBeInTheDocument()
  })
})
