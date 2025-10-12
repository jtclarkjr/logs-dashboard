'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import {
  CalendarIcon,
  ClockIcon,
  TagIcon,
  ServerIcon,
  SaveIcon
} from 'lucide-react'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerBody,
  DrawerFooter,
  Button,
  Separator,
  Input,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui'
import type { LogResponse } from '@/lib/types/log'
import { SeverityLevel } from '@/lib/enums/severity'
import { useUpdateLog } from '@/lib/hooks/query/use-logs'
import { updateLogValidator } from '@/lib/validators/log'
import { toast } from 'sonner'

interface LogDetailsDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  log: LogResponse | null
  onDelete?: (log: LogResponse) => void
}

export function LogDetailsDrawer({
  open,
  onOpenChange,
  log,
  onDelete
}: LogDetailsDrawerProps) {
  const [formData, setFormData] = useState({
    message: '',
    severity: SeverityLevel.INFO,
    source: '',
    timestamp: ''
  })

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const updateLogMutation = useUpdateLog()

  // Validate individual field
  const validateField = (fieldName: string, value: unknown) => {
    const fieldValidator =
      updateLogValidator.shape[
        fieldName as keyof typeof updateLogValidator.shape
      ]
    if (fieldValidator) {
      const result = fieldValidator.safeParse(value)
      if (!result.success) {
        setFieldErrors((prev) => ({
          ...prev,
          [fieldName]: result.error.issues[0]?.message || 'Invalid value'
        }))
      } else {
        setFieldErrors((prev) => {
          const newErrors = { ...prev }
          delete newErrors[fieldName]
          return newErrors
        })
      }
    }
  }

  // Reset form when log changes or when drawer opens
  useEffect(() => {
    if (log && open) {
      setFormData({
        message: log.message,
        severity: log.severity,
        source: log.source,
        timestamp: log.timestamp
      })
      setFieldErrors({}) // Clear any previous errors
    }
  }, [log, open])

  if (!log) return null

  const handleSave = async () => {
    // Validate the form data first
    const validationResult = updateLogValidator.safeParse(formData)

    if (!validationResult.success) {
      // Set field-level errors
      const newFieldErrors: Record<string, string> = {}
      validationResult.error.issues.forEach((issue) => {
        if (issue.path.length > 0) {
          newFieldErrors[issue.path[0] as string] = issue.message
        }
      })
      setFieldErrors(newFieldErrors)

      // Show validation errors
      const errors = validationResult.error.issues
        .map((issue) => issue.message)
        .join(', ')
      toast.error(`Please fix the following errors: ${errors}`)
      return
    } else {
      // Clear errors if validation passes
      setFieldErrors({})
    }

    try {
      await updateLogMutation.mutateAsync({
        id: log.id,
        data: {
          message:
            formData.message !== log.message ? formData.message : undefined,
          severity:
            formData.severity !== log.severity ? formData.severity : undefined,
          source: formData.source !== log.source ? formData.source : undefined,
          timestamp:
            formData.timestamp !== log.timestamp
              ? formData.timestamp
              : undefined
        }
      })
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to update log:', error)
    }
  }

  const handleDelete = () => {
    onDelete?.(log)
    onOpenChange(false)
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Log Details</DrawerTitle>
        </DrawerHeader>

        <DrawerBody className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
              Basic Information
            </h3>

            {/* ID */}
            <div className="flex items-center space-x-3">
              <div className="w-5 h-5 rounded bg-muted flex items-center justify-center">
                <span className="text-xs font-mono">#</span>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Log ID</div>
                <div className="font-mono text-sm">{log.id}</div>
              </div>
            </div>

            {/* Severity */}
            <div className="flex items-start space-x-3">
              <div className="w-5 h-5 rounded bg-muted flex items-center justify-center mt-6">
                <TagIcon className="h-3 w-3" />
              </div>
              <div className="flex-1 space-y-2">
                <div className="text-xs text-muted-foreground">
                  Severity Level
                </div>
                <Select
                  value={formData.severity}
                  onValueChange={(value) => {
                    setFormData((prev) => ({
                      ...prev,
                      severity: value as SeverityLevel
                    }))
                    validateField('severity', value)
                  }}
                >
                  <SelectTrigger
                    className={`w-40 ${fieldErrors.severity ? 'border-destructive' : ''}`}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(SeverityLevel).map((severity) => (
                      <SelectItem key={severity} value={severity}>
                        {severity}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldErrors.severity && (
                  <div className="text-sm text-destructive">
                    {fieldErrors.severity}
                  </div>
                )}
              </div>
            </div>

            {/* Source */}
            <div className="flex items-start space-x-3">
              <div className="w-5 h-5 rounded bg-muted flex items-center justify-center mt-6">
                <ServerIcon className="h-3 w-3" />
              </div>
              <div className="flex-1 space-y-2">
                <div className="text-xs text-muted-foreground">Source</div>
                <Input
                  value={formData.source}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      source: e.target.value
                    }))
                    validateField('source', e.target.value)
                  }}
                  onBlur={() => validateField('source', formData.source)}
                  placeholder="e.g., api-server, database, auth-service"
                  className={`max-w-xs ${fieldErrors.source ? 'border-destructive' : ''}`}
                />
                {fieldErrors.source && (
                  <div className="text-sm text-destructive">
                    {fieldErrors.source}
                  </div>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Timestamps */}
          <div className="space-y-4">
            <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
              Timestamps
            </h3>

            {/* Log Timestamp */}
            <div className="flex items-start space-x-3">
              <div className="w-5 h-5 rounded bg-muted flex items-center justify-center mt-6">
                <ClockIcon className="h-3 w-3" />
              </div>
              <div className="flex-1 space-y-2">
                <div className="text-xs text-muted-foreground">
                  Occurrence time
                </div>
                <Input
                  type="datetime-local"
                  value={
                    formData.timestamp
                      ? (() => {
                          const date = new Date(formData.timestamp)
                          return isNaN(date.getTime())
                            ? ''
                            : date.toISOString().slice(0, 16)
                        })()
                      : ''
                  }
                  onChange={(e) => {
                    const date = new Date(e.target.value)
                    const newTimestamp = isNaN(date.getTime())
                      ? ''
                      : date.toISOString()
                    setFormData((prev) => ({
                      ...prev,
                      timestamp: newTimestamp
                    }))
                    validateField('timestamp', newTimestamp)
                  }}
                  onBlur={() => validateField('timestamp', formData.timestamp)}
                  className={`max-w-xs ${fieldErrors.timestamp ? 'border-destructive' : ''}`}
                />
                {fieldErrors.timestamp && (
                  <div className="text-sm text-destructive">
                    {fieldErrors.timestamp}
                  </div>
                )}
              </div>
            </div>

            {/* Created At */}
            <div className="flex items-center space-x-3">
              <div className="w-5 h-5 rounded bg-muted flex items-center justify-center">
                <CalendarIcon className="h-3 w-3" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Created At</div>
                <div className="font-mono text-sm">
                  {format(
                    new Date(log.created_at),
                    "MMM dd, yyyy 'at' HH:mm:ss"
                  )}
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Message */}
          <div className="space-y-4">
            <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
              Message
            </h3>
            <div className="space-y-2">
              <Textarea
                value={formData.message}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, message: e.target.value }))
                  validateField('message', e.target.value)
                }}
                onBlur={() => validateField('message', formData.message)}
                className={`min-h-24 font-mono text-sm ${fieldErrors.message ? 'border-destructive' : ''}`}
                placeholder="Enter log message..."
              />
              <div className="flex justify-between items-center">
                <div>
                  {fieldErrors.message && (
                    <div className="text-sm text-destructive">
                      {fieldErrors.message}
                    </div>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  {formData.message.length}/1000
                </div>
              </div>
            </div>
          </div>
        </DrawerBody>

        <DrawerFooter className="flex-row justify-end">
          <div className="flex space-x-2">
            <Button
              onClick={onOpenChange.bind(null, false)}
              variant="outline"
              size="sm"
            >
              Close
            </Button>
            <Button
              onClick={handleSave}
              variant="default"
              size="sm"
              disabled={updateLogMutation.isPending}
            >
              <SaveIcon className="mr-2 h-4 w-4" />
              {updateLogMutation.isPending ? 'Saving...' : 'Save'}
            </Button>
            {onDelete && (
              <Button onClick={handleDelete} variant="destructive" size="sm">
                Delete
              </Button>
            )}
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
