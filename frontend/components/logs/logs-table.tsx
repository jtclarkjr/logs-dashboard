'use client'

import { format } from 'date-fns'
import { MoreHorizontalIcon, TrashIcon, EyeIcon } from 'lucide-react'
import {
  Card,
  CardContent,
  Table,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Badge,
  SeverityBadge,
  LoadingState,
  EmptyState,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Button,
  QueryError,
  FadeTransition
} from '@/components/ui'
import { DEFAULT_PAGE_SIZE } from '@/lib/constants/pagination'
import type { LogListResponse, LogResponse } from '@/lib/types/log'

interface LogsTableProps {
  logs?: LogListResponse
  isLoading: boolean
  error?: Error | null
  onViewLog: (log: LogResponse) => void
  onDeleteLog: (log: LogResponse) => void
  onResetFilters: () => void
}

export function LogsTable({
  logs,
  isLoading,
  error,
  onViewLog,
  onDeleteLog,
  onResetFilters
}: LogsTableProps) {
  // Calculate skeleton row count based on actual data or default page size
  const skeletonRowCount =
    logs?.logs?.length || logs?.page_size || DEFAULT_PAGE_SIZE

  return (
    <Card className="mb-0">
      <CardContent>
        {isLoading ? (
          <LoadingState variant="table" count={skeletonRowCount} />
        ) : error ? (
          <QueryError error={error} title="Failed to load logs" />
        ) : !logs || logs.logs.length === 0 ? (
          <EmptyState
            title="No logs found"
            description="Try adjusting your search criteria or filters"
            action={{
              label: 'Reset Filters',
              onClick: onResetFilters
            }}
          />
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead className="w-[50px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <FadeTransition
                as="tbody"
                isVisible={!isLoading}
                duration="fast"
                data-slot="table-body"
                className="[&_tr:last-child]:border-0"
              >
                {logs.logs.map((log) => (
                  <TableRow
                    key={log.id}
                    className="animate-in fade-in-0 duration-200"
                  >
                    <TableCell className="font-mono text-sm">
                      {format(new Date(log.timestamp), 'MMM dd, yyyy HH:mm:ss')}
                    </TableCell>
                    <TableCell>
                      <SeverityBadge severity={log.severity} />
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{log.source}</Badge>
                    </TableCell>
                    <TableCell className="max-w-md truncate">
                      {log.message}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontalIcon className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => onViewLog(log)}>
                            <EyeIcon className="mr-2 h-4 w-4" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onDeleteLog(log)}>
                            <TrashIcon className="mr-2 h-4 w-4" />
                            <span className="text-destructive hover:bg-destructive/10 hover:text-destructive focus:text-destructive">
                              Delete
                            </span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </FadeTransition>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
