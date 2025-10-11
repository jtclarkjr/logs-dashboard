'use client'

import { DateRange } from 'react-day-picker'
import { FilterIcon } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  DateRangePicker,
  SeverityBadge
} from '@/components/ui'
import {
  SeverityLevel,
  MetadataResponse,
  GroupBy,
  SeverityFilter,
  SourceFilter
} from '@/lib/types'

interface DashboardFiltersProps {
  dateRange: DateRange | undefined
  onDateRangeChange: (dateRange: DateRange | undefined) => void
  selectedSeverity: SeverityFilter
  onSeverityChange: (severity: SeverityFilter) => void
  selectedSource: SourceFilter
  onSourceChange: (source: SourceFilter) => void
  timeGrouping: GroupBy
  onTimeGroupingChange: (grouping: GroupBy) => void
  metadata?: MetadataResponse
}

export function DashboardFilters({
  dateRange,
  onDateRangeChange,
  selectedSeverity,
  onSeverityChange,
  selectedSource,
  onSourceChange,
  timeGrouping,
  onTimeGroupingChange,
  metadata
}: DashboardFiltersProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FilterIcon className="h-5 w-5" />
          Filters
        </CardTitle>
        <CardDescription>
          Select date range, severity, and source to filter log data
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col lg:flex-row gap-4">
          <DateRangePicker
            dateRange={dateRange}
            onDateRangeChange={onDateRangeChange}
            className="w-full lg:w-auto"
            placeholder="Select date range"
          />

          <Select value={selectedSeverity} onValueChange={onSeverityChange}>
            <SelectTrigger className="w-full lg:w-48">
              <SelectValue placeholder="Select severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severities</SelectItem>
              {Object.values(SeverityLevel).map((level) => (
                <SelectItem key={level} value={level}>
                  <div className="flex items-center gap-2">
                    <SeverityBadge severity={level} className="text-xs" />
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedSource} onValueChange={onSourceChange}>
            <SelectTrigger className="w-full lg:w-48">
              <SelectValue placeholder="Select source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              {metadata?.sources.map((source) => (
                <SelectItem key={source} value={source}>
                  {source}
                </SelectItem>
              )) || []}
            </SelectContent>
          </Select>

          <Select value={timeGrouping} onValueChange={onTimeGroupingChange}>
            <SelectTrigger className="w-full lg:w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hour">Hour</SelectItem>
              <SelectItem value="day">Day</SelectItem>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="month">Month</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  )
}
