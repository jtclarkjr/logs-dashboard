'use client'

import { useState } from 'react'
import { SaveIcon } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Button,
  Input,
  Label,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SeverityBadge,
  Alert,
  AlertDescription
} from '@/components/ui'
import { SeverityLevel, LogCreate } from '@/lib/types'
import { useCreateLog } from '@/lib/hooks'
import { toast } from 'sonner'

interface CreateLogDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function CreateLogDialog({
  open,
  onOpenChange,
  onSuccess
}: CreateLogDialogProps) {
  const createLogMutation = useCreateLog()

  // Form state
  const [formData, setFormData] = useState<LogCreate>({
    severity: SeverityLevel.INFO,
    source: '',
    message: '',
    timestamp: new Date().toISOString().slice(0, -1) // Remove Z for datetime-local input
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleInputChange = (
    field: keyof LogCreate,
    value: string | SeverityLevel
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }))

    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.source.trim()) {
      newErrors.source = 'Source is required'
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required'
    }

    if (formData.message.length > 1000) {
      newErrors.message = 'Message must be less than 1000 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error('Please fix the form errors')
      return
    }

    // Convert datetime-local back to ISO string
    const submitData: LogCreate = {
      ...formData,
      timestamp: new Date(formData.timestamp || new Date()).toISOString()
    }

    createLogMutation.mutate(submitData, {
      onSuccess: () => {
        toast.success('Log created successfully!')
        handleClose()
        onSuccess?.()
      },
      onError: (error: Error) => {
        toast.error('Failed to create log')
        console.error('Create log error:', error)
      }
    })
  }

  const handleClose = () => {
    // Reset form data when closing
    setFormData({
      severity: SeverityLevel.INFO,
      source: '',
      message: '',
      timestamp: new Date().toISOString().slice(0, -1)
    })
    setErrors({})
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Log</DialogTitle>
          <DialogDescription>
            Fill in the details for the new log entry
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Severity */}
          <div className="space-y-2">
            <Label htmlFor="severity">Severity Level *</Label>
            <Select
              value={formData.severity}
              onValueChange={(value: SeverityLevel) =>
                handleInputChange('severity', value)
              }
            >
              <SelectTrigger>
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
          </div>

          {/* Source */}
          <div className="space-y-2">
            <Label htmlFor="source">Source *</Label>
            <Input
              id="source"
              placeholder="e.g., api-server, database, auth-service"
              value={formData.source}
              onChange={(e) => handleInputChange('source', e.target.value)}
              className={errors.source ? 'border-destructive' : ''}
            />
            {errors.source && (
              <p className="text-sm text-destructive">{errors.source}</p>
            )}
            <p className="text-sm text-muted-foreground">
              The system or component that generated this log
            </p>
          </div>

          {/* Timestamp */}
          <div className="space-y-2">
            <Label htmlFor="timestamp">Timestamp</Label>
            <Input
              id="timestamp"
              type="datetime-local"
              value={formData.timestamp}
              onChange={(e) => handleInputChange('timestamp', e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              Leave blank to use current time
            </p>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Message *</Label>
            <Textarea
              id="message"
              placeholder="Enter the log message..."
              value={formData.message}
              onChange={(e) => handleInputChange('message', e.target.value)}
              rows={4}
              className={errors.message ? 'border-destructive' : ''}
            />
            {errors.message && (
              <p className="text-sm text-destructive">{errors.message}</p>
            )}
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                The log message content
              </p>
              <p className="text-sm text-muted-foreground">
                {formData.message.length}/1000
              </p>
            </div>
          </div>

          {/* Preview */}
          {formData.source && formData.message && (
            <Alert>
              <AlertDescription>
                <strong>Preview:</strong> This log will be created with{' '}
                <SeverityBadge
                  severity={formData.severity}
                  className="inline-flex mx-1"
                />{' '}
                severity from source &ldquo;{formData.source}&rdquo;.
              </AlertDescription>
            </Alert>
          )}

          <DialogFooter className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={createLogMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createLogMutation.isPending}
              className="flex items-center gap-2"
            >
              <SaveIcon className="h-4 w-4" />
              {createLogMutation.isPending ? 'Creating...' : 'Create Log'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
