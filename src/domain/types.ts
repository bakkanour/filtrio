// Core domain model. Framework-agnostic, no I/O.

export type WaterObjectType = 'pitcher' | 'bottle' | 'flask' | 'filtration_system' | 'other'

export const WATER_OBJECT_TYPES: WaterObjectType[] = [
  'pitcher',
  'bottle',
  'flask',
  'filtration_system',
  'other',
]

export type WaterObject = {
  id: string
  name: string
  type: WaterObjectType
  /** Filtered water volume produced by one full fill (what the consumption counter uses). */
  capacityLiters: number
  /** Physical total capacity of the container, if known. Informational only, never used in consumption math. */
  totalCapacityLiters?: number
  createdAt: string
  updatedAt: string
}

export type Filter = {
  id: string
  name: string
  durationDays?: number
  capacityLiters?: number
  createdAt: string
  updatedAt: string
}

export type TriggerMode = 'or' | 'and' | 'manual'

export type ReplacementReason = 'time_limit' | 'volume_limit' | 'both' | 'preventive' | 'other'

export type FilterCycle = {
  id: string
  objectId: string
  filterId: string

  installedAt: string
  createdAt: string

  removedAt?: string
  replacementReason?: ReplacementReason

  durationLimitDays?: number
  volumeLimitLiters?: number

  durationControlEnabled: boolean
  volumeControlEnabled: boolean

  triggerMode: TriggerMode

  warningThresholdPercent: number
}

export type FillEvent = {
  id: string
  objectId: string
  filterCycleId: string
  timestamp: string
  fillRatio: number
  volumeLiters: number
}

export type ControlStatus = 'normal' | 'warning' | 'expired'

export type ControlKind = 'time' | 'volume'

export type TimeUsage = {
  elapsedDays: number
  remainingDays: number | null
  timePercentage: number | null
}

export type VolumeUsage = {
  consumedLiters: number
  remainingLiters: number | null
  volumePercentage: number | null
}

export type ControlEvaluation = {
  kind: ControlKind
  enabled: boolean
  status: ControlStatus
  percentage: number | null
  current: number
  limit: number | null
}

export type GlobalStatus = {
  status: ControlStatus
  triggerMode: TriggerMode
  controls: ControlEvaluation[]
  mostAdvancedControl: ControlKind | null
}
