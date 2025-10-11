'use client'

import { DateRange } from 'react-day-picker'
import { format } from 'date-fns'
import {
  TrendingUpIcon,
  AlertTriangleIcon,
  BugIcon,
  InfoIcon
} from 'lucide-react'
import {
  StatsCard,
  LoadingState,
  EmptyState,
  QueryError
} from '@/components/ui'
import { LogAggregationResponse, SeverityLevel } from '@/lib/types'

const SEVERITY_ICONS = {
  [SeverityLevel.DEBUG]: BugIcon,
  [SeverityLevel.INFO]: InfoIcon,
  [SeverityLevel.WARNING]: AlertTriangleIcon,
  [SeverityLevel.ERROR]: AlertTriangleIcon,
  [SeverityLevel.CRITICAL]: AlertTriangleIcon
}

interface DashboardStatsProps {
  aggregationData?: LogAggregationResponse
  isLoading: boolean
  error?: Error | null
  dateRange?: DateRange
  onResetFilters: () => void
}

export function DashboardStats({
  aggregationData,
  isLoading,
  error,
  dateRange,
  onResetFilters
}: DashboardStatsProps) {
  if (isLoading) {
    return <LoadingState variant="cards" count={4} />
  }

  if (error) {
    return (
      <QueryError error={error} title="Failed to load dashboard statistics" />
    )
  }

  if (!aggregationData) {
    return (
      <EmptyState
        title="No aggregation data available"
        description="Please adjust your filters and try again"
        action={{ label: 'Reset Filters', onClick: onResetFilters }}
      />
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatsCard
        title="Total Logs"
        value={aggregationData.total_logs.toLocaleString()}
        description={`${dateRange?.from ? format(dateRange.from, 'MMM dd') : ''} - ${dateRange?.to ? format(dateRange.to, 'MMM dd') : ''}`}
        icon={<TrendingUpIcon className="h-4 w-4" />}
      />

      {aggregationData.by_severity.slice(0, 3).map((item) => {
        const Icon = SEVERITY_ICONS[item.severity as SeverityLevel]
        const percentage =
          aggregationData.total_logs > 0
            ? ((item.count / aggregationData.total_logs) * 100).toFixed(1)
            : '0'

        return (
          <StatsCard
            key={item.severity}
            title={`${item.severity} Logs`}
            value={item.count.toLocaleString()}
            description={`${percentage}% of total logs`}
            icon={<Icon className="h-4 w-4" />}
          />
        )
      })}
    </div>
  )
}
