import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { logsService } from '@/lib/services/logs'
import { healthService } from '@/lib/services/health'
import { ApiError } from '@/lib/clients/errors'
import type {
  LogFilters,
  LogAggregationFilters,
  ChartFilters,
  ExportFilters,
  GroupBy
} from '@/lib/types/filters'
import type { LogCreate, LogUpdate } from '@/lib/types/log'

// Helper function to get user-friendly error messages
const getUserErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof ApiError) {
    return error.getDetailedMessage()
  }
  if (error instanceof Error) {
    return error.message
  }
  return fallback
}

// Query Keys
export const QUERY_KEYS = {
  logs: (filters?: LogFilters) => ['logs', filters] as const,
  logAggregation: (filters?: LogAggregationFilters) =>
    ['log-aggregation', filters] as const,
  chartData: (filters?: ChartFilters) => ['chart-data', filters] as const,
  metadata: () => ['metadata'] as const,
  log: (id: number) => ['log', id] as const
} as const

// Logs List Hook
export function useLogs(filters?: LogFilters) {
  return useQuery({
    queryKey: QUERY_KEYS.logs(filters),
    queryFn: () => logsService.getLogs(filters),
    enabled: true,
    placeholderData: (previousData) => previousData
  })
}

// Log Aggregation Hook
export function useLogAggregation(filters?: LogAggregationFilters) {
  return useQuery({
    queryKey: QUERY_KEYS.logAggregation(filters),
    queryFn: () => logsService.getLogAggregation(filters),
    enabled: Boolean(filters?.start_date && filters?.end_date)
  })
}

// Chart Data Hook
export function useChartData(filters?: ChartFilters) {
  return useQuery({
    queryKey: QUERY_KEYS.chartData(filters),
    queryFn: () => logsService.getChartData(filters),
    enabled: Boolean(filters?.start_date && filters?.end_date)
  })
}

// Metadata Hook
export function useMetadata() {
  return useQuery({
    queryKey: QUERY_KEYS.metadata(),
    queryFn: () => healthService.getMetadata(),
    staleTime: 10 * 60 * 1000 // Cache for 10 minutes since metadata is static
  })
}

// Single Log Hook
export function useLog(id: number) {
  return useQuery({
    queryKey: QUERY_KEYS.log(id),
    queryFn: () => logsService.getLog(id),
    enabled: Boolean(id)
  })
}

// Delete Log Mutation
export function useDeleteLog() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (logId: number) => logsService.deleteLog(logId),
    onSuccess: (_, logId) => {
      // Invalidate and refetch logs list
      queryClient.invalidateQueries({ queryKey: ['logs'] })

      // Remove the specific log from cache
      queryClient.removeQueries({ queryKey: QUERY_KEYS.log(logId) })

      // Invalidate aggregation data since log counts may have changed
      queryClient.invalidateQueries({ queryKey: ['log-aggregation'] })
      queryClient.invalidateQueries({ queryKey: ['chart-data'] })

      toast.success('Log deleted successfully')
    },
    onError: (error) => {
      toast.error(getUserErrorMessage(error, 'Failed to delete log'))
    }
  })
}

// Export Logs Mutation
export function useExportLogs() {
  return useMutation({
    mutationFn: async ({
      filters,
      filename
    }: {
      filters?: ExportFilters
      filename: string
    }) => {
      const blob = await logsService.exportLogs(filters)

      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      return blob
    },
    onSuccess: () => {
      toast.success('Logs exported successfully!')
    },
    onError: (error) => {
      toast.error(getUserErrorMessage(error, 'Failed to export logs'))
    }
  })
}

// Create Log Mutation
export function useCreateLog() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (logData: LogCreate) => logsService.createLog(logData),
    onSuccess: () => {
      // Invalidate and refetch logs list
      queryClient.invalidateQueries({ queryKey: ['logs'] })

      // Invalidate aggregation data since new log was added
      queryClient.invalidateQueries({ queryKey: ['log-aggregation'] })
      queryClient.invalidateQueries({ queryKey: ['chart-data'] })
      queryClient.invalidateQueries({ queryKey: ['metadata'] })
    },
    onError: (error) => {
      toast.error(getUserErrorMessage(error, 'Failed to create log'))
    }
  })
}

// Formatted Chart Data Hook
export function useFormattedChartData(
  filters?: ChartFilters,
  timeGrouping?: GroupBy
) {
  return useQuery({
    queryKey: QUERY_KEYS.chartData(filters),
    queryFn: () => logsService.getChartData(filters),
    enabled: Boolean(filters?.start_date && filters?.end_date),
    select: (data) => {
      if (!data?.data || !timeGrouping) return []

      return data.data.map((item) => ({
        ...item,
        date: format(
          new Date(item.timestamp),
          timeGrouping === ('hour' as GroupBy) ? 'MMM dd HH:mm' : 'MMM dd'
        )
      }))
    }
  })
}

// Update Log Mutation
export function useUpdateLog() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: LogUpdate }) =>
      logsService.updateLog(id, data),
    onSuccess: (_, { id }) => {
      // Invalidate and refetch logs list
      queryClient.invalidateQueries({ queryKey: ['logs'] })

      // Invalidate the specific log
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.log(id) })

      // Invalidate aggregation data since log data may have changed
      queryClient.invalidateQueries({ queryKey: ['log-aggregation'] })
      queryClient.invalidateQueries({ queryKey: ['chart-data'] })

      toast.success('Log updated successfully')
    },
    onError: (error) => {
      toast.error(getUserErrorMessage(error, 'Failed to update log'))
    }
  })
}
