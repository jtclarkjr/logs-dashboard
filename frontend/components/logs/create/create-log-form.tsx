'use client'

import { SaveIcon } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SeverityBadge,
  Alert,
  AlertDescription,
  FormFieldWrapper
} from '@/components/ui'
import { SeverityLevel, type FormApi, type FieldApi } from '@/lib/types'
import { createLogValidator, type CreateLogFormData } from '@/lib/validators'
import { zodValidator } from '@tanstack/zod-form-adapter'

interface CreateLogFormProps {
  form: FormApi<CreateLogFormData>
  isSubmitting: boolean
  onCancel: () => void
}

export function CreateLogForm({
  form,
  isSubmitting,
  onCancel
}: CreateLogFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Log Details</CardTitle>
        <CardDescription>
          Fill in the details for the new log entry
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            form.handleSubmit()
          }}
          className="space-y-6"
        >
          {/* Severity */}
          <form.Field 
            name="severity"
            validatorAdapter={zodValidator()}
            validators={{
              onChange: createLogValidator.shape.severity,
            }}
          >
            {(field: FieldApi<SeverityLevel>) => (
              <FormFieldWrapper
                label="Severity Level"
                required
                errors={field.state.meta.errors}
              >
                <Select
                  value={field.state.value}
                  onValueChange={(value: SeverityLevel) => field.handleChange(value)}
                >
                  <SelectTrigger className={field.state.meta.errors.length > 0 ? 'border-destructive' : ''}>
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
            validatorAdapter={zodValidator()}
            validators={{
              onMount: createLogValidator.shape.source,
              onChange: createLogValidator.shape.source,
              onBlur: createLogValidator.shape.source,
            }}
          >
            {(field: FieldApi<string>) => (
              <FormFieldWrapper
                label="Source"
                required
                description="The system or component that generated this log"
                errors={field.state.meta.errors}
              >
                <Input
                  placeholder="e.g., api-server, database, auth-service"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  className={field.state.meta.errors.length > 0 ? 'border-destructive' : ''}
                />
              </FormFieldWrapper>
            )}
          </form.Field>

          {/* Timestamp */}
          <form.Field 
            name="timestamp"
            validatorAdapter={zodValidator()}
            validators={{
              onChange: createLogValidator.shape.timestamp,
            }}
          >
            {(field: FieldApi<string>) => (
              <FormFieldWrapper
                label="Timestamp"
                description="Leave blank to use current time"
                errors={field.state.meta.errors}
              >
                <Input
                  type="datetime-local"
                  value={field.state.value || ''}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  className={field.state.meta.errors.length > 0 ? 'border-destructive' : ''}
                />
              </FormFieldWrapper>
            )}
          </form.Field>

          {/* Message */}
          <form.Field 
            name="message"
            validatorAdapter={zodValidator()}
            validators={{
              onMount: createLogValidator.shape.message,
              onChange: createLogValidator.shape.message,
              onBlur: createLogValidator.shape.message,
            }}
          >
            {(field: FieldApi<string>) => (
              <FormFieldWrapper
                label="Message"
                required
                errors={field.state.meta.errors}
              >
                <Textarea
                  placeholder="Enter the log message..."
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  rows={4}
                  className={field.state.meta.errors.length > 0 ? 'border-destructive' : ''}
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
            {({ values }: { values: CreateLogFormData }) => (
              values.source && values.message && (
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
            )}
          </form.Subscribe>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <form.Subscribe>
              {({ canSubmit, isSubmitting: formSubmitting }: { canSubmit: boolean; isSubmitting: boolean }) => (
                <Button
                  type="submit"
                  disabled={!canSubmit || isSubmitting || formSubmitting}
                  className="flex items-center gap-2"
                >
                  <SaveIcon className="h-4 w-4" />
                  {isSubmitting || formSubmitting ? 'Creating...' : 'Create Log'}
                </Button>
              )}
            </form.Subscribe>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
