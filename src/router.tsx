import { createBrowserRouter } from 'react-router-dom'
import { AppShell } from './ui/layout/AppShell'
import { Dashboard } from './ui/pages/dashboard/Dashboard'
import { ObjectFormPage } from './ui/pages/ObjectFormPage'
import { ObjectDetailPage } from './ui/pages/ObjectDetailPage'
import { InstallFilterPage } from './ui/pages/InstallFilterPage'
import { CycleHistoryPage } from './ui/pages/CycleHistoryPage'
import { StatisticsPage } from './ui/pages/StatisticsPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'objects/new', element: <ObjectFormPage /> },
      { path: 'objects/:id', element: <ObjectDetailPage /> },
      { path: 'objects/:id/install', element: <InstallFilterPage /> },
      { path: 'objects/:id/history', element: <CycleHistoryPage /> },
      { path: 'statistics', element: <StatisticsPage /> },
    ],
  },
])
