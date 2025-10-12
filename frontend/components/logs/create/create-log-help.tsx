'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function CreateLogHelp() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tips</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-muted-foreground">
        <p>• Choose the appropriate severity level for your log entry</p>
        <p>
          • Use descriptive source names to identify where the log came from
        </p>
        <p>• Write clear, actionable messages that will help with debugging</p>
        <p>
          • Include relevant context like error codes, user IDs, or request IDs
        </p>
      </CardContent>
    </Card>
  )
}
