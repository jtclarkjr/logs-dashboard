'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer
} from 'recharts'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  LoadingState,
  EmptyState,
  ChartTooltip,
  QueryError
} from '@/components/ui'
import type { LogAggregationResponse } from '@/lib/types/log'

interface TopSourcesChartProps {
  aggregationData?: LogAggregationResponse
  isLoading: boolean
  error?: Error | null
}

export function TopSourcesChart({
  aggregationData,
  isLoading,
  error
}: TopSourcesChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Log Sources</CardTitle>
        <CardDescription>
          Most active log sources in the selected time period
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <LoadingState variant="chart" />
        ) : error ? (
          <QueryError error={error} title="Failed to load source data" />
        ) : aggregationData?.by_source.length ? (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={aggregationData.by_source.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="source"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <ChartTooltip />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <EmptyState
            title="No source data available"
            description="No logs found for the selected filters"
          />
        )}
      </CardContent>
    </Card>
  )
}
