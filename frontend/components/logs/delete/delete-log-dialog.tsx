'use client'

import { format } from 'date-fns'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Button,
  Badge,
  SeverityBadge
} from '@/components/ui'
import { LogResponse } from '@/lib/types'

interface DeleteLogDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  logToDelete: LogResponse | null
  onConfirmDelete: () => void
  isDeleting: boolean
}

export function DeleteLogDialog({
  open,
  onOpenChange,
  logToDelete,
  onConfirmDelete,
  isDeleting
}: DeleteLogDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Log</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this log? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>
        {logToDelete && (
          <div className="p-4 border rounded-lg bg-muted/50">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <SeverityBadge severity={logToDelete.severity} />
                <Badge variant="outline">{logToDelete.source}</Badge>
              </div>
              <p className="text-sm font-mono">
                {format(
                  new Date(logToDelete.timestamp),
                  'MMM dd, yyyy HH:mm:ss'
                )}
              </p>
              <p className="text-sm">{logToDelete.message}</p>
            </div>
          </div>
        )}
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirmDelete}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
