import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { I18nextProvider } from 'react-i18next'
import i18n from '../../../i18n'
import { AppDataProvider } from '../../context/AppDataContext'
import { FillQuickActions } from '../FillQuickActions'

function renderWithProviders(ui: React.ReactElement) {
  return render(
    <I18nextProvider i18n={i18n}>
      <AppDataProvider>{ui}</AppDataProvider>
    </I18nextProvider>,
  )
}

describe('FillQuickActions', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('records a +1.5L fill event when clicking the full-fill button', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <FillQuickActions objectId="obj-1" filterCycleId="cycle-1" objectCapacityLiters={1.5} />,
    )

    await user.click(screen.getByText(i18n.t('objectDetail.addFillFull')))

    await waitFor(() => {
      const stored = JSON.parse(window.localStorage.getItem('filtrio:v1:fillEvents') ?? '[]')
      expect(stored).toHaveLength(1)
      expect(stored[0].volumeLiters).toBe(1.5)
    })
  })

  it('records a custom volume fill through the manual input', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <FillQuickActions objectId="obj-1" filterCycleId="cycle-1" objectCapacityLiters={1.5} />,
    )

    await user.type(screen.getByPlaceholderText(i18n.t('objectDetail.customVolumePlaceholder')), '0.75')
    await user.click(screen.getByText(i18n.t('common.add')))

    await waitFor(() => {
      const stored = JSON.parse(window.localStorage.getItem('filtrio:v1:fillEvents') ?? '[]')
      expect(stored).toHaveLength(1)
      expect(stored[0].volumeLiters).toBe(0.75)
    })
  })
})
