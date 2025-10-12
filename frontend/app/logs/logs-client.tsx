'use client'

import { LogsHeader } from '@/components/logs/logs-header'
import { LogsFilters } from '@/components/logs/logs-filters'
import { LogsTable } from '@/components/logs/logs-table'
import { LogsPagination } from '@/components/logs/logs-pagination'
import { LogDetailsDrawer } from '@/components/logs/log-details-drawer'
import { DeleteLogDialog } from '@/components/logs/delete/delete-log-dialog'
import { CreateLogDialog } from '@/components/logs/create/create-log-dialog'
import type { LogListResponse } from '@/lib/types/log'
import type {
  SortOrder,
  SeverityFilter,
  SourceFilter,
  SortByField
} from '@/lib/types/filters'
import { useLogs, useDeleteLog } from '@/lib/hooks/query/use-logs'
import { useLogsFilters } from '@/lib/hooks/state/use-logs-filters'
import { useLogsUIState } from '@/lib/hooks/state/use-logs-ui-state'
import { DateRange } from 'react-day-picker'

interface LogsClientProps {
  initialData: LogListResponse
  initialFilters?: {
    searchQuery?: string
    selectedSeverity?: SeverityFilter
    selectedSource?: SourceFilter
    sortBy?: SortByField
    sortOrder?: SortOrder
    currentPage?: number
    dateRange?: DateRange
  }
}

export function LogsClient({
  initialData,
  initialFilters = {}
}: LogsClientProps) {
  // Filter state management
  const {
    searchQuery,
    selectedSeverity,
    sortBy,
    sortOrder,
    dateRange,
    setSearchQuery,
    setSelectedSeverity,
    setDateRange,
    handleSortChange,
    setCurrentPage,
    setPageSize,
    resetFilters,
    getAPIFilters
  } = useLogsFilters(initialFilters)

  // UI state management
  const {
    deleteDialogOpen,
    logToDelete,
    drawerOpen,
    selectedLog,
    createDialogOpen,
    openDeleteDialog,
    closeDeleteDialog,
    openLogDetails,
    closeLogDetails,
    openCreateDialog,
    closeCreateDialog
  } = useLogsUIState()

  // React Query hooks - use computed filters from hook
  const { data: logs, isLoading, error } = useLogs(getAPIFilters())
  const deleteLogMutation = useDeleteLog()

  const confirmDeleteLog = () => {
    if (!logToDelete) return

    deleteLogMutation.mutate(logToDelete.id, {
      onSuccess: () => {
        closeDeleteDialog()
      }
    })
  }

  // Use current data or fall back to initial data
  const displayLogs: LogListResponse = logs || initialData

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <LogsHeader
        onCreateLog={openCreateDialog}
      />

      {/* Filters */}
      <LogsFilters
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        selectedSeverity={selectedSeverity}
        onSeverityChange={setSelectedSeverity}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortChange={handleSortChange}
        onResetFilters={resetFilters}
      />

      {/* Results */}
      <LogsTable
        logs={displayLogs}
        isLoading={isLoading}
        error={error}
        onViewLog={openLogDetails}
        onDeleteLog={openDeleteDialog}
        onResetFilters={resetFilters}
      />

      {/* Pagination */}
      <LogsPagination 
        logs={displayLogs} 
        onPageChange={setCurrentPage} 
        onPageSizeChange={setPageSize}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteLogDialog
        open={deleteDialogOpen}
        onOpenChange={closeDeleteDialog}
        logToDelete={logToDelete}
        onConfirmDelete={confirmDeleteLog}
        isDeleting={deleteLogMutation.isPending}
      />

      {/* Log Details Drawer */}
      <LogDetailsDrawer
        open={drawerOpen}
        onOpenChange={closeLogDetails}
        log={selectedLog}
        onDelete={openDeleteDialog}
      />

      {/* Create Log Dialog */}
      <CreateLogDialog
        open={createDialogOpen}
        onOpenChange={closeCreateDialog}
      />
    </div>
  )
}
