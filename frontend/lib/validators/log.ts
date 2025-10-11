import { z } from 'zod'
import { SeverityLevel } from '@/lib/types'

export const createLogValidator = z.object({
  severity: z.enum(Object.values(SeverityLevel) as [SeverityLevel, ...SeverityLevel[]], {
    message: 'Severity level is required',
  }),
  source: z
    .string({ message: 'Source is required' })
    .min(1, 'Source is required')
    .max(100, 'Source must be less than 100 characters')
    .trim(),
  message: z
    .string({ message: 'Message is required' })
    .min(1, 'Message is required')
    .max(1000, 'Message must be less than 1000 characters')
    .trim(),
  timestamp: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val) return true // Optional field
        const date = new Date(val)
        return !isNaN(date.getTime())
      },
      {
        message: 'Please provide a valid timestamp',
      }
    ),
})

export const updateLogValidator = createLogValidator

export type CreateLogFormData = z.infer<typeof createLogValidator>
export type UpdateLogFormData = CreateLogFormData // Same shape
