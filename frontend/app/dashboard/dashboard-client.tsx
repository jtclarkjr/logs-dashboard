'use client'

import { format } from 'date-fns'
import { DateRange } from 'react-day-picker'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { DashboardFilters } from '@/components/dashboard/dashboard-filters'
import { DashboardStats } from '@/components/dashboard/dashboard-stats'
import { DashboardMetadata } from '@/components/dashboard/dashboard-metadata'
import { TimelineChart } from '@/components/dashboard/chart/chart-timeline'
import { SeverityDistributionChart } from '@/components/dashboard/chart/chart-severity-distribution'
import { TopSourcesChart } from '@/components/dashboard/chart/chart-top-sources'
import type { LogAggregationResponse } from '@/lib/types/log'
import type { ChartDataResponse } from '@/lib/types/chart'
import type { MetadataResponse } from '@/lib/types/common'
import type { GroupBy, SeverityFilter, SourceFilter } from '@/lib/types/filters'
import {
  useLogAggregation,
  useFormattedChartData,
  useMetadata,
  useExportLogs
} from '@/lib/hooks/query/use-logs'
import { useDashboardFilters } from '@/lib/hooks/state/use-dashboard-filters'
import { toast } from 'sonner'

interface DashboardClientProps {
  initialData: {
    aggregationData?: LogAggregationResponse
    timeSeriesData?: ChartDataResponse
    metadata?: MetadataResponse
  }
  initialFilters?: {
    dateRange?: DateRange
    selectedSeverity?: SeverityFilter
    selectedSource?: SourceFilter
    timeGrouping?: GroupBy
  }
}

export function DashboardClient({
  initialData,
  initialFilters = {}
}: DashboardClientProps) {
  // Filter state management
  const {
    dateRange,
    selectedSeverity,
    selectedSource,
    timeGrouping,
    setDateRange,
    setSelectedSeverity,
    setSelectedSource,
    setTimeGrouping,
    resetFilters,
    getAggregationFilters,
    getChartDataFilters,
    getExportFilters,
    getExportFilename,
    canExport
  } = useDashboardFilters(initialFilters)

  // Data queries
  const {
    data: aggregationData,
    isLoading: isLoadingAggregation,
    error: aggregationError
  } = useLogAggregation(getAggregationFilters())

  const {
    data: timeSeriesData,
    isLoading: isLoadingChart,
    error: chartError
  } = useFormattedChartData(getChartDataFilters(), timeGrouping)

  const {
    data: metadata,
    isLoading: isLoadingMetadata,
    error: metadataError
  } = useMetadata()

  const exportLogsMutation = useExportLogs()

  const handleExportCsv = () => {
    if (!canExport) {
      toast.error('Please select a date range')
      return
    }

    const filters = getExportFilters()
    if (!filters) {
      toast.error('Invalid date range')
      return
    }

    exportLogsMutation.mutate({
      filters,
      filename: getExportFilename()
    })
  }

  // Use current data or fall back to initial data
  const displayAggregationData = aggregationData || initialData.aggregationData
  const displayTimeSeriesData =
    timeSeriesData ||
    (initialData.timeSeriesData?.data
      ? initialData.timeSeriesData.data.map((item) => ({
          ...item,
          date: format(
            new Date(item.timestamp),
            timeGrouping === ('hour' as GroupBy) ? 'MMM dd HH:mm' : 'MMM dd'
          )
        }))
      : [])
  const displayMetadata = metadata || initialData.metadata

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <DashboardHeader
        onResetFilters={resetFilters}
        onExportCsv={handleExportCsv}
        isExporting={exportLogsMutation.isPending}
      />

      {/* Filters Panel */}
      <DashboardFilters
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        selectedSeverity={selectedSeverity}
        onSeverityChange={setSelectedSeverity}
        selectedSource={selectedSource}
        onSourceChange={setSelectedSource}
        timeGrouping={timeGrouping}
        onTimeGroupingChange={setTimeGrouping}
        metadata={displayMetadata}
      />

      {/* Stats Overview */}
      <DashboardStats
        aggregationData={displayAggregationData}
        isLoading={isLoadingAggregation}
        error={aggregationError}
        dateRange={dateRange}
        onResetFilters={resetFilters}
      />

      {/* Charts Section */}
      <Tabs defaultValue="timeline" className="space-y-4">
        <TabsList>
          <TabsTrigger value="timeline">Timeline Chart</TabsTrigger>
          <TabsTrigger value="distribution">Severity Distribution</TabsTrigger>
          <TabsTrigger value="sources">Top Sources</TabsTrigger>
        </TabsList>

        {/* Timeline Chart */}
        <TabsContent value="timeline">
          <TimelineChart
            timeSeriesData={displayTimeSeriesData || []}
            isLoading={isLoadingChart}
            error={chartError}
            timeGrouping={timeGrouping}
          />
        </TabsContent>

        {/* Severity Distribution */}
        <TabsContent value="distribution">
          <SeverityDistributionChart
            aggregationData={displayAggregationData}
            isLoading={isLoadingAggregation}
            error={aggregationError}
          />
        </TabsContent>

        {/* Top Sources */}
        <TabsContent value="sources">
          <TopSourcesChart
            aggregationData={displayAggregationData}
            isLoading={isLoadingAggregation}
            error={aggregationError}
          />
        </TabsContent>
      </Tabs>

      {/* Quick Info Alert */}
      <DashboardMetadata
        metadata={displayMetadata}
        isLoading={isLoadingMetadata}
        error={metadataError}
      />
    </div>
  )
}
