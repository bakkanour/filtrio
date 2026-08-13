import { RouterProvider } from 'react-router-dom'
import { AppDataProvider } from './ui/context/AppDataContext'
import { ThemeProvider } from './ui/context/ThemeContext'
import { router } from './router'

export default function App() {
  return (
    <ThemeProvider>
      <AppDataProvider>
        <RouterProvider router={router} />
      </AppDataProvider>
    </ThemeProvider>
  )
}
