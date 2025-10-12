import { useState } from 'react'
import type { LogResponse } from '@/lib/types/log'

interface LogsUIState {
  deleteDialogOpen: boolean
  logToDelete: LogResponse | null
  drawerOpen: boolean
  selectedLog: LogResponse | null
  createDialogOpen: boolean
}

export function useLogsUIState() {
  // UI state management
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [logToDelete, setLogToDelete] = useState<LogResponse | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedLog, setSelectedLog] = useState<LogResponse | null>(null)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  // Compound actions
  const openDeleteDialog = (log: LogResponse) => {
    setLogToDelete(log)
    setDeleteDialogOpen(true)
  }

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false)
    setLogToDelete(null)
  }

  const openLogDetails = (log: LogResponse) => {
    setSelectedLog(log)
    setDrawerOpen(true)
  }

  const closeLogDetails = () => {
    setDrawerOpen(false)
    setSelectedLog(null)
  }

  const openCreateDialog = () => {
    // Close the view drawer if it's open when creating a new log
    if (drawerOpen) {
      closeLogDetails()
    }
    setCreateDialogOpen(true)
  }

  const closeCreateDialog = () => {
    setCreateDialogOpen(false)
  }

  // Reset all UI state
  const resetUIState = () => {
    setDeleteDialogOpen(false)
    setLogToDelete(null)
    setDrawerOpen(false)
    setSelectedLog(null)
    setCreateDialogOpen(false)
  }

  // Return state and actions
  return {
    // State
    deleteDialogOpen,
    logToDelete,
    drawerOpen,
    selectedLog,
    createDialogOpen,

    // Basic setters (for external control)
    setDeleteDialogOpen,
    setLogToDelete,
    setDrawerOpen,
    setSelectedLog,
    setCreateDialogOpen,

    // Compound actions (recommended for use)
    openDeleteDialog,
    closeDeleteDialog,
    openLogDetails,
    closeLogDetails,
    openCreateDialog,
    closeCreateDialog,
    resetUIState,

    // Derived state
    hasOpenModals: Boolean(deleteDialogOpen || drawerOpen || createDialogOpen)
  }
}

export type { LogsUIState }
