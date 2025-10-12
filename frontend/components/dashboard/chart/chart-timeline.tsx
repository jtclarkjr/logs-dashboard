'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingState } from '@/components/ui/loading-state'
import { EmptyState } from '@/components/ui/empty-state'
import { ChartTooltip } from '@/components/ui/chart'
import { QueryError } from '@/components/ui/error-boundary'
import type { ChartDataResponse } from '@/lib/types/chart'

interface TimelineChartProps {
  chartData?: ChartDataResponse
  timeSeriesData: Array<{
    date: string
    total: number
    timestamp: string
  }>
  isLoading: boolean
  error?: Error | null
  timeGrouping: 'hour' | 'day' | 'week' | 'month'
}

export function TimelineChart({
  timeSeriesData,
  isLoading,
  error,
  timeGrouping
}: TimelineChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Log Count Over Time</CardTitle>
        <CardDescription>
          Trend of log counts grouped by {timeGrouping}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <LoadingState variant="chart" />
        ) : error ? (
          <QueryError error={error} title="Failed to load chart data" />
        ) : timeSeriesData.length > 0 ? (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <ChartTooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-background border rounded-lg p-3 shadow-md">
                          <p className="font-medium">{label}</p>
                          <p className="text-blue-600">
                            Total: {payload[0]?.value}
                          </p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <EmptyState
            title="No chart data available"
            description="No logs found for the selected filters and time period"
          />
        )}
      </CardContent>
    </Card>
  )
}
