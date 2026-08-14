import { z } from 'zod'
import { WATER_OBJECT_TYPES, type WaterObjectType } from '../domain/types'

export const waterObjectInputSchema = z
  .object({
    name: z.string().trim().min(1),
    type: z.enum(WATER_OBJECT_TYPES as [WaterObjectType, ...WaterObjectType[]]),
    capacityLiters: z.number().positive(),
    totalCapacityLiters: z.number().positive().optional(),
  })
  .refine(
    (data) => data.totalCapacityLiters === undefined || data.capacityLiters <= data.totalCapacityLiters,
    {
      message: 'Filtered volume cannot exceed the container total capacity',
      path: ['capacityLiters'],
    },
  )
export type WaterObjectInput = z.infer<typeof waterObjectInputSchema>

export const filterInputSchema = z.object({
  name: z.string().trim().min(1),
  durationDays: z.number().positive().optional(),
  capacityLiters: z.number().positive().optional(),
})
export type FilterInput = z.infer<typeof filterInputSchema>

export const installFilterInputSchema = z
  .object({
    objectId: z.string().min(1),
    filterId: z.string().min(1),
    installedAt: z.string().min(1),
    durationLimitDays: z.number().positive().optional(),
    volumeLimitLiters: z.number().positive().optional(),
    durationControlEnabled: z.boolean(),
    volumeControlEnabled: z.boolean(),
    triggerMode: z.enum(['or', 'and', 'manual']),
    warningThresholdPercent: z.number().min(1).max(99).default(80),
  })
  .refine((data) => data.durationControlEnabled || data.volumeControlEnabled, {
    message: 'At least one control (time or volume) must be enabled',
  })
export type InstallFilterInput = z.infer<typeof installFilterInputSchema>

export const editFilterCycleInputSchema = z
  .object({
    installedAt: z.string().min(1),
    durationLimitDays: z.number().positive().optional(),
    volumeLimitLiters: z.number().positive().optional(),
    durationControlEnabled: z.boolean(),
    volumeControlEnabled: z.boolean(),
    triggerMode: z.enum(['or', 'and', 'manual']),
    warningThresholdPercent: z.number().min(1).max(99).default(80),
  })
  .refine((data) => data.durationControlEnabled || data.volumeControlEnabled, {
    message: 'At least one control (time or volume) must be enabled',
  })
export type EditFilterCycleInput = z.infer<typeof editFilterCycleInputSchema>

export const replacementReasonSchema = z.enum(['time_limit', 'volume_limit', 'both', 'preventive', 'other'])

export const fillInputSchema = z
  .object({
    objectId: z.string().min(1),
    filterCycleId: z.string().min(1),
    timestamp: z.string().min(1).optional(),
    fillRatio: z.number().positive().optional(),
    volumeLiters: z.number().positive().optional(),
  })
  .refine((data) => data.fillRatio !== undefined || data.volumeLiters !== undefined, {
    message: 'Either fillRatio or volumeLiters must be provided',
  })
export type FillInput = z.infer<typeof fillInputSchema>
