'use client'

import {
  LogsHeader,
  LogsFilters,
  LogsTable,
  LogsPagination,
  DeleteLogDialog,
  LogDetailsDrawer,
  CreateLogDialog
} from '@/components/logs'
import {
  LogListResponse,
  SortOrder,
  SeverityFilter,
  SourceFilter,
  SortByField
} from '@/lib/types'
import {
  useLogs,
  useDeleteLog,
  useLogsFilters,
  useLogsUIState
} from '@/lib/hooks'
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
  const displayLogs = logs || initialData

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <LogsHeader
        onResetFilters={resetFilters}
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
      <LogsPagination logs={displayLogs} onPageChange={setCurrentPage} />

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
        onSuccess={() => {
          // Optionally refresh the logs or do other actions after successful creation
        }}
      />
    </div>
  )
}
