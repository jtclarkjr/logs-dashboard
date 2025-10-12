import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

interface LoadingStateProps {
  variant?: 'table' | 'cards' | 'chart' | 'simple'
  count?: number
}

export function LoadingState({
  variant = 'simple',
  count = 3
}: LoadingStateProps) {
  if (variant === 'table') {
    return (
      <div className="rounded-md border">
        <div className="relative w-full overflow-x-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              <tr className="hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors">
                <th className="text-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap">
                  <Skeleton className="h-4 w-20" />
                </th>
                <th className="text-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap">
                  <Skeleton className="h-4 w-16" />
                </th>
                <th className="text-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap">
                  <Skeleton className="h-4 w-16" />
                </th>
                <th className="text-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap">
                  <Skeleton className="h-4 w-24" />
                </th>
                <th className="text-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap w-[50px]">
                  <Skeleton className="h-4 w-16" />
                </th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {Array.from({ length: count }).map((_, i) => (
                <tr
                  key={i}
                  className="hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors animate-pulse"
                >
                  <td className="p-2 align-middle whitespace-nowrap">
                    <Skeleton className="h-4 w-32" />
                  </td>
                  <td className="p-2 align-middle whitespace-nowrap">
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </td>
                  <td className="p-2 align-middle whitespace-nowrap">
                    <Skeleton className="h-5 w-20 rounded-md" />
                  </td>
                  <td className="p-2 align-middle whitespace-nowrap">
                    <Skeleton className="h-4 w-48" />
                  </td>
                  <td className="p-2 align-middle whitespace-nowrap">
                    <Skeleton className="h-8 w-8 rounded" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  if (variant === 'cards') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: count }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (variant === 'chart') {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    )
  }

  // Simple variant
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-4 w-full" />
      ))}
    </div>
  )
}
