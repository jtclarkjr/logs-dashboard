/// <reference lib="dom" />
import { describe, it, expect } from 'bun:test'
import { renderHook, act } from '@testing-library/react'
import { useLogsUIState } from '@/lib/hooks/state/use-logs-ui-state'
import { SeverityLevel } from '@/lib/enums/severity'
import { LogEntry } from '@/lib/types/log'

// Mock log data
const mockLog: LogEntry = {
  id: 1,
  message: 'Test log message',
  severity: SeverityLevel.INFO,
  source: 'api',
  timestamp: '2024-01-01T00:00:00Z',
  created_at: '2024-01-01T00:00:00Z'
}

describe('useLogsUIState', () => {
  it('should initialize with default closed state', () => {
    const { result } = renderHook(() => useLogsUIState())

    expect(result.current.deleteDialogOpen).toBe(false)
    expect(result.current.logToDelete).toBe(null)
    expect(result.current.drawerOpen).toBe(false)
    expect(result.current.selectedLog).toBe(null)
    expect(result.current.createDialogOpen).toBe(false)
    expect(result.current.hasOpenModals).toBe(false)
  })

  it('should open and close delete dialog correctly', () => {
    const { result } = renderHook(() => useLogsUIState())

    act(() => {
      result.current.openDeleteDialog(mockLog)
    })

    expect(result.current.deleteDialogOpen).toBe(true)
    expect(result.current.logToDelete).toEqual(mockLog)
    expect(result.current.hasOpenModals).toBe(true)

    act(() => {
      result.current.closeDeleteDialog()
    })

    expect(result.current.deleteDialogOpen).toBe(false)
    expect(result.current.logToDelete).toBe(null)
    expect(result.current.hasOpenModals).toBe(false)
  })

  it('should open and close log details drawer correctly', () => {
    const { result } = renderHook(() => useLogsUIState())

    act(() => {
      result.current.openLogDetails(mockLog)
    })

    expect(result.current.drawerOpen).toBe(true)
    expect(result.current.selectedLog).toEqual(mockLog)
    expect(result.current.hasOpenModals).toBe(true)

    act(() => {
      result.current.closeLogDetails()
    })

    expect(result.current.drawerOpen).toBe(false)
    expect(result.current.selectedLog).toBe(null)
    expect(result.current.hasOpenModals).toBe(false)
  })

  it('should open and close create dialog correctly', () => {
    const { result } = renderHook(() => useLogsUIState())

    act(() => {
      result.current.openCreateDialog()
    })

    expect(result.current.createDialogOpen).toBe(true)
    expect(result.current.hasOpenModals).toBe(true)

    act(() => {
      result.current.closeCreateDialog()
    })

    expect(result.current.createDialogOpen).toBe(false)
    expect(result.current.hasOpenModals).toBe(false)
  })

  it('should close drawer when opening create dialog', () => {
    const { result } = renderHook(() => useLogsUIState())

    // First open drawer
    act(() => {
      result.current.openLogDetails(mockLog)
    })

    expect(result.current.drawerOpen).toBe(true)
    expect(result.current.selectedLog).toEqual(mockLog)

    // Then open create dialog
    act(() => {
      result.current.openCreateDialog()
    })

    expect(result.current.drawerOpen).toBe(false)
    expect(result.current.selectedLog).toBe(null)
    expect(result.current.createDialogOpen).toBe(true)
  })

  it('should reset all UI state correctly', () => {
    const { result } = renderHook(() => useLogsUIState())

    // Set all states to open
    act(() => {
      result.current.openDeleteDialog(mockLog)
      result.current.openLogDetails(mockLog)
      result.current.openCreateDialog()
    })

    expect(result.current.hasOpenModals).toBe(true)

    // Reset all
    act(() => {
      result.current.resetUIState()
    })

    expect(result.current.deleteDialogOpen).toBe(false)
    expect(result.current.logToDelete).toBe(null)
    expect(result.current.drawerOpen).toBe(false)
    expect(result.current.selectedLog).toBe(null)
    expect(result.current.createDialogOpen).toBe(false)
    expect(result.current.hasOpenModals).toBe(false)
  })

  it('should provide basic setters for external control', () => {
    const { result } = renderHook(() => useLogsUIState())

    act(() => {
      result.current.setDeleteDialogOpen(true)
      result.current.setLogToDelete(mockLog)
    })

    expect(result.current.deleteDialogOpen).toBe(true)
    expect(result.current.logToDelete).toEqual(mockLog)

    act(() => {
      result.current.setDrawerOpen(true)
      result.current.setSelectedLog(mockLog)
    })

    expect(result.current.drawerOpen).toBe(true)
    expect(result.current.selectedLog).toEqual(mockLog)

    act(() => {
      result.current.setCreateDialogOpen(true)
    })

    expect(result.current.createDialogOpen).toBe(true)
  })

  it('should compute hasOpenModals correctly for different combinations', () => {
    const { result } = renderHook(() => useLogsUIState())

    // No modals open
    expect(result.current.hasOpenModals).toBe(false)

    // Only delete dialog
    act(() => {
      result.current.setDeleteDialogOpen(true)
    })
    expect(result.current.hasOpenModals).toBe(true)

    act(() => {
      result.current.setDeleteDialogOpen(false)
    })

    // Only drawer
    act(() => {
      result.current.setDrawerOpen(true)
    })
    expect(result.current.hasOpenModals).toBe(true)

    act(() => {
      result.current.setDrawerOpen(false)
    })

    // Only create dialog
    act(() => {
      result.current.setCreateDialogOpen(true)
    })
    expect(result.current.hasOpenModals).toBe(true)
  })
})
