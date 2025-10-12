'use client'

import { ChevronLeftIcon, ChevronRightIcon, ChevronsLeftIcon, ChevronsRightIcon } from 'lucide-react'
import { Button } from '@/components/ui'
import { LogListResponse } from '@/lib/types/log'
import { PAGE_SIZE_OPTIONS } from '@/lib/constants/pagination'

interface LogsPaginationProps {
  logs?: LogListResponse
  onPageChange: (page: number) => void
  onPageSizeChange?: (pageSize: number) => void
}

export function LogsPagination({ logs, onPageChange, onPageSizeChange }: LogsPaginationProps) {
  if (!logs) return null

  return (
      <div className="flex items-center justify-between px-2 py-4">
        <div className="flex items-center space-x-4">
          <div className="text-sm text-muted-foreground">
            Showing {(logs.page - 1) * logs.page_size + 1} to{' '}
            {Math.min(logs.page * logs.page_size, logs.total)} of{' '}
            {logs.total.toLocaleString()} results
          </div>
          
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Show:</span>
              <select
                value={logs.page_size}
                onChange={(e) => onPageSizeChange(Number(e.target.value))}
                className="text-sm border border-input rounded px-2 py-1 bg-background"
              >
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
          
        </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(1)}
          disabled={logs.page <= 1}
        >
          <ChevronsLeftIcon className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(logs.page - 1)}
          disabled={logs.page <= 1}
        >
          <ChevronLeftIcon className="h-4 w-4" />
        </Button>

        <div className="flex items-center space-x-1">
          {Array.from({ length: Math.min(5, logs.total_pages) }, (_, i) => {
            const pageNum = Math.max(1, logs.page - 2) + i
            if (pageNum > logs.total_pages) return null

            return (
              <Button
                key={pageNum}
                variant={pageNum === logs.page ? 'default' : 'outline'}
                size="sm"
                onClick={() => onPageChange(pageNum)}
              >
                {pageNum}
              </Button>
            )
          })}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(logs.page + 1)}
          disabled={logs.page >= logs.total_pages}
        >
          <ChevronRightIcon className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(logs.total_pages)}
          disabled={logs.page >= logs.total_pages}
        >
          <ChevronsRightIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
