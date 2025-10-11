'use client'

import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  LoadingState,
  EmptyState,
  ChartTooltip,
  Progress,
  SeverityBadge,
  QueryError
} from '@/components/ui'
import { LogAggregationResponse, SeverityLevel } from '@/lib/types'

const SEVERITY_COLORS = {
  [SeverityLevel.DEBUG]: '#6b7280',
  [SeverityLevel.INFO]: '#3b82f6',
  [SeverityLevel.WARNING]: '#f59e0b',
  [SeverityLevel.ERROR]: '#ef4444',
  [SeverityLevel.CRITICAL]: '#dc2626'
}

interface SeverityDistributionChartProps {
  aggregationData?: LogAggregationResponse
  isLoading: boolean
  error?: Error | null
}

export function SeverityDistributionChart({
  aggregationData,
  isLoading,
  error
}: SeverityDistributionChartProps) {
  const severityDistribution =
    aggregationData?.by_severity.map((item) => ({
      name: item.severity,
      value: item.count,
      color: SEVERITY_COLORS[item.severity as SeverityLevel]
    })) || []

  return (
    <Card>
      <CardHeader>
        <CardTitle>Severity Distribution</CardTitle>
        <CardDescription>Breakdown of logs by severity level</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <LoadingState variant="chart" />
        ) : error ? (
          <QueryError error={error} title="Failed to load severity data" />
        ) : severityDistribution.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={severityDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${typeof percent === 'number' ? (percent * 100).toFixed(0) : 0}%`
                    }
                  >
                    {severityDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Severity Breakdown</h4>
              {aggregationData?.by_severity.map((item) => {
                const percentage =
                  aggregationData.total_logs > 0
                    ? ((item.count / aggregationData.total_logs) * 100).toFixed(
                        1
                      )
                    : '0'

                return (
                  <div key={item.severity} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <SeverityBadge
                        severity={item.severity as SeverityLevel}
                      />
                      <span className="text-sm font-medium">
                        {item.count.toLocaleString()} ({percentage}%)
                      </span>
                    </div>
                    <Progress value={parseFloat(percentage)} className="h-2" />
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <EmptyState
            title="No severity data available"
            description="No logs found for the selected filters"
          />
        )}
      </CardContent>
    </Card>
  )
}
