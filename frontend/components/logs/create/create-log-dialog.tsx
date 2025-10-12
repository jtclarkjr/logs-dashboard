'use client'

import { SaveIcon } from 'lucide-react'
import { useForm } from '@tanstack/react-form'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { SeverityBadge } from '@/components/ui/severity-badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { FormFieldWrapper } from '@/components/ui/form-field'
import { SeverityLevel } from '@/lib/enums/severity'
import type { LogCreate } from '@/lib/types/log'
import { useCreateLog } from '@/lib/hooks/query/use-logs'
import { createLogValidator } from '@/lib/validators/log'
import { toast } from 'sonner'
import { z } from 'zod'

type CreateLogFormData = z.infer<typeof createLogValidator>

interface CreateLogDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateLogDialog({ open, onOpenChange }: CreateLogDialogProps) {
  const createLogMutation = useCreateLog()

  const form = useForm({
    defaultValues: {
      severity: SeverityLevel.INFO,
      source: '',
      message: ''
    } as CreateLogFormData,
    validators: {
      onSubmit: createLogValidator
    },
    onSubmit: async ({ value: formData }) => {
      // Use current time (no buffer to prevent "future timestamp" error)
      const now = new Date()

      const submitData: LogCreate = {
        ...formData,
        timestamp: now.toISOString()
      }

      await new Promise<void>((resolve, reject) => {
        createLogMutation.mutate(submitData, {
          onSuccess: () => {
            toast.success('Log created successfully!')
            handleClose()
            resolve()
          },
          onError: (error: Error) => {
            reject(error)
          }
        })
      })
    }
  })

  const handleClose = () => {
    // Reset form
    form.reset()
    onOpenChange(false)
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // Reset form when dialog closes
      form.reset()
    }
    onOpenChange(open)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Log</DialogTitle>
          <DialogDescription>
            Fill in the details for the new log entry
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            form.handleSubmit()
          }}
          className="space-y-6"
        >
          {/* Severity */}
          <form.Field name="severity">
            {(field) => (
              <FormFieldWrapper
                label="Severity Level"
                required
                errors={(field.state.meta.errors || [])
                  .filter(Boolean)
                  .map(String)}
              >
                <Select
                  value={field.state.value}
                  onValueChange={(value: SeverityLevel) =>
                    field.handleChange(value)
                  }
                >
                  <SelectTrigger
                    className={
                      field.state.meta.errors.length > 0
                        ? 'border-destructive'
                        : ''
                    }
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(SeverityLevel).map((level) => (
                      <SelectItem key={level} value={level}>
                        <div className="flex items-center gap-2">
                          <SeverityBadge severity={level} />
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormFieldWrapper>
            )}
          </form.Field>

          {/* Source */}
          <form.Field
            name="source"
            validators={{
              onBlur: ({ value }) => {
                // Only validate if the user has entered something or tried to leave empty
                if (!value || value.trim() === '') {
                  return 'Source is required'
                }
                const result = createLogValidator.shape.source.safeParse(value)
                return !result.success
                  ? result.error.issues[0]?.message
                  : undefined
              }
            }}
          >
            {(field) => (
              <FormFieldWrapper
                label="Source"
                required
                description="The system or component that generated this log"
                errors={(field.state.meta.errors || [])
                  .filter(Boolean)
                  .map(String)}
              >
                <Input
                  placeholder="e.g., api-server, database, auth-service"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  className={
                    field.state.meta.errors.length > 0
                      ? 'border-destructive'
                      : ''
                  }
                />
              </FormFieldWrapper>
            )}
          </form.Field>

          {/* Message */}
          <form.Field
            name="message"
            validators={{
              onBlur: ({ value }) => {
                // Only validate if the user has entered something or tried to leave empty
                if (!value || value.trim() === '') {
                  return 'Message is required'
                }
                const result = createLogValidator.shape.message.safeParse(value)
                return !result.success
                  ? result.error.issues[0]?.message
                  : undefined
              }
            }}
          >
            {(field) => (
              <FormFieldWrapper
                label="Message"
                required
                errors={(field.state.meta.errors || [])
                  .filter(Boolean)
                  .map(String)}
              >
                <Textarea
                  placeholder="Enter the log message..."
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  rows={4}
                  className={
                    field.state.meta.errors.length > 0
                      ? 'border-destructive'
                      : ''
                  }
                />
                <div className="flex justify-between items-center mt-1">
                  <p className="text-sm text-muted-foreground">
                    The log message content
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {field.state.value.length}/1000
                  </p>
                </div>
              </FormFieldWrapper>
            )}
          </form.Field>

          {/* Preview */}
          <form.Subscribe>
            {({ values }: { values: CreateLogFormData }) =>
              values.source &&
              values.message && (
                <Alert>
                  <AlertDescription>
                    <strong>Preview:</strong> This log will be created with{' '}
                    <SeverityBadge
                      severity={values.severity}
                      className="inline-flex mx-1"
                    />{' '}
                    severity from source &ldquo;{values.source}&rdquo;.
                  </AlertDescription>
                </Alert>
              )
            }
          </form.Subscribe>

          <DialogFooter className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={createLogMutation.isPending}
            >
              Cancel
            </Button>
            <form.Subscribe>
              {({
                canSubmit,
                isSubmitting
              }: {
                canSubmit: boolean
                isSubmitting: boolean
              }) => (
                <Button
                  type="submit"
                  disabled={
                    !canSubmit || createLogMutation.isPending || isSubmitting
                  }
                  className="flex items-center gap-2"
                >
                  <SaveIcon className="h-4 w-4" />
                  {createLogMutation.isPending || isSubmitting
                    ? 'Creating...'
                    : 'Create Log'}
                </Button>
              )}
            </form.Subscribe>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
