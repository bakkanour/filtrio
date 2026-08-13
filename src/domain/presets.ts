// Curated starting points for the object/filter forms. Pure data, kept separate from
// business logic — picking a preset only prefills form fields, it never mutates this
// data and never becomes a persisted reference on the created object/filter.
import type { WaterObjectType } from './types'

export type ObjectPreset = {
  id: string
  nameKey: string
  type: WaterObjectType
  capacityLiters: number
  totalCapacityLiters?: number
}

export type FilterPreset = {
  id: string
  nameKey: string
  durationDays?: number
  capacityLiters?: number
}

// Pitcher specs are real BRITA model figures (brita.fr product pages), since
// picking a preset by a recognizable model name is the point — presets stay
// user-editable starting points, never treated as authoritative facts.
export const OBJECT_PRESETS: ObjectPreset[] = [
  { id: 'style-essential', nameKey: 'presets.objects.styleEssential', type: 'pitcher', capacityLiters: 1.4, totalCapacityLiters: 2.4 },
  { id: 'marella', nameKey: 'presets.objects.marella', type: 'pitcher', capacityLiters: 1.4, totalCapacityLiters: 2.4 },
  { id: 'marella-xl', nameKey: 'presets.objects.marellaXl', type: 'pitcher', capacityLiters: 2.0, totalCapacityLiters: 3.5 },
  { id: 'aluna', nameKey: 'presets.objects.aluna', type: 'pitcher', capacityLiters: 1.4, totalCapacityLiters: 2.4 },
  { id: 'bottle-standard', nameKey: 'presets.objects.bottleStandard', type: 'bottle', capacityLiters: 0.75, totalCapacityLiters: 0.8 },
  { id: 'flask-standard', nameKey: 'presets.objects.flaskStandard', type: 'flask', capacityLiters: 0.5 },
  { id: 'filtration-system', nameKey: 'presets.objects.filtrationSystem', type: 'filtration_system', capacityLiters: 5, totalCapacityLiters: 5.5 },
]

export const FILTER_PRESETS: FilterPreset[] = [
  { id: 'filter-compact', nameKey: 'presets.filters.filterCompact', durationDays: 14, capacityLiters: 75 },
  { id: 'filter-standard', nameKey: 'presets.filters.filterStandard', durationDays: 28, capacityLiters: 150 },
  { id: 'filter-long-life', nameKey: 'presets.filters.filterLongLife', durationDays: 60, capacityLiters: 300 },
]
