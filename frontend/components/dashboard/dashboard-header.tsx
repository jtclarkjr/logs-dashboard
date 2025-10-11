'use client'

import { DownloadIcon, FilterIcon } from 'lucide-react'
import { Button } from '@/components/ui'

interface DashboardHeaderProps {
  onResetFilters: () => void
  onExportCsv: () => void
  isExporting: boolean
}

export function DashboardHeader({
  onResetFilters,
  onExportCsv,
  isExporting
}: DashboardHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-3xl font-bold">Logs Dashboard</h1>
        <p className="text-muted-foreground">
          Monitor and analyze your application logs with detailed insights
        </p>
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={onResetFilters}
          className="flex items-center gap-2"
        >
          <FilterIcon className="h-4 w-4" />
          Reset Filters
        </Button>
        <Button
          onClick={onExportCsv}
          disabled={isExporting}
          className="flex items-center gap-2"
        >
          <DownloadIcon className="h-4 w-4" />
          {isExporting ? 'Exporting...' : 'Export CSV'}
        </Button>
      </div>
    </div>
  )
}
