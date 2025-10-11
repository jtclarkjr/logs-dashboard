'use client'

import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import { Button } from '@/components/ui'
import { LogListResponse } from '@/lib/types'

interface LogsPaginationProps {
  logs?: LogListResponse
  onPageChange: (page: number) => void
}

export function LogsPagination({ logs, onPageChange }: LogsPaginationProps) {
  if (!logs) return null

  return (
    <div className="flex items-center justify-between px-2 py-4">
      <div className="flex-1 text-sm text-muted-foreground">
        Showing {(logs.page - 1) * logs.page_size + 1} to{' '}
        {Math.min(logs.page * logs.page_size, logs.total)} of{' '}
        {logs.total.toLocaleString()} results
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(logs.page - 1)}
          disabled={logs.page <= 1}
        >
          <ChevronLeftIcon className="h-4 w-4" />
          Previous
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
          Next
          <ChevronRightIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
