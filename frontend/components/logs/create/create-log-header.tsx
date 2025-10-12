'use client'

import { ArrowLeftIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CreateLogHeaderProps {
  onBack: () => void
}

export function CreateLogHeader({ onBack }: CreateLogHeaderProps) {
  return (
    <div className="flex items-center gap-4">
      <Button
        variant="ghost"
        size="sm"
        onClick={onBack}
        className="flex items-center gap-2"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Back
      </Button>
      <div>
        <h1 className="text-3xl font-bold">Create New Log</h1>
        <p className="text-muted-foreground">
          Add a new log entry to the system
        </p>
      </div>
    </div>
  )
}
