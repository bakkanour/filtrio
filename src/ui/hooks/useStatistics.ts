import { useMemo } from 'react'
import { useAppData } from '../context/AppDataContext'
import { calculateFilterStatistics, calculatePeriodStatistics } from '../../domain/statistics'

export function useStatistics() {
  const { cycles, fillEvents } = useAppData()

  return useMemo(() => {
    const now = new Date().toISOString()
    const lifetime = calculateFilterStatistics(cycles, fillEvents, now)

    const monthStart = new Date(now)
    monthStart.setDate(1)
    monthStart.setHours(0, 0, 0, 0)
    const thisMonth = calculatePeriodStatistics(fillEvents, { from: monthStart.toISOString(), to: now })

    return { lifetime, thisMonth }
  }, [cycles, fillEvents])
}
