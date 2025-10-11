import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useForm } from '@tanstack/react-form'
import { SeverityLevel, LogCreate } from '@/lib/types'
import { useCreateLog } from '@/lib/hooks/query/use-logs'
import { createLogValidator, type CreateLogFormData } from '@/lib/validators'

export function useCreateLogForm() {
  const router = useRouter()
  const createLogMutation = useCreateLog()

  const form = useForm({
    defaultValues: {
      severity: SeverityLevel.INFO,
      source: '',
      message: '',
      timestamp: new Date().toISOString().slice(0, -1), // Remove Z for datetime-local input
    } as CreateLogFormData,
    validators: {
      onSubmit: createLogValidator,
    },
    onSubmit: async ({ value: formData }) => {
      // Validate the form first
      const validationResult = createLogValidator.safeParse(formData)
      
      if (!validationResult.success) {
        // Show validation errors
        const errors = validationResult.error.issues.map(issue => issue.message).join(', ')
        toast.error(`Please fix the following errors: ${errors}`)
        return
      }

      // Convert datetime-local back to ISO string
      const submitData: LogCreate = {
        ...formData,
        timestamp: formData.timestamp
          ? new Date(formData.timestamp).toISOString()
          : new Date().toISOString(),
      }

      try {
        await new Promise<void>((resolve, reject) => {
          createLogMutation.mutate(submitData, {
            onSuccess: () => {
              toast.success('Log created successfully!')
              router.push('/logs')
              resolve()
            },
            onError: (error: Error) => {
              toast.error('Failed to create log')
              console.error('Create log error:', error)
              reject(error)
            },
          })
        })
      } catch {
        // Error already handled in mutation callbacks
      }
    },
  })

  const handleCancel = () => {
    router.back()
  }

  return {
    form,
    isSubmitting: createLogMutation.isPending,
    handleCancel,
    handleBack: () => router.back(),
  }
}
