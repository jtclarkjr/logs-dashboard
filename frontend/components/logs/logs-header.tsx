'use client'

import { FilterIcon, PlusIcon } from 'lucide-react'
import { Button } from '@/components/ui'

interface LogsHeaderProps {
  onResetFilters: () => void
  onCreateLog: () => void
}

export function LogsHeader({ onResetFilters, onCreateLog }: LogsHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-3xl font-bold">Logs</h1>
        <p className="text-muted-foreground">
          Search, filter, and manage your application logs
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
        <Button onClick={onCreateLog} className="flex items-center gap-2">
          <PlusIcon className="h-4 w-4" />
          Create Log
        </Button>
      </div>
    </div>
  )
}
