import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { SeverityLevel } from '@/lib/enums/severity'

interface SeverityBadgeProps {
  severity: SeverityLevel
  className?: string
}

const severityConfig = {
  [SeverityLevel.DEBUG]: {
    variant: 'secondary' as const,
    className: 'bg-gray-100 text-gray-800 hover:bg-gray-200'
  },
  [SeverityLevel.INFO]: {
    variant: 'secondary' as const,
    className: 'bg-blue-100 text-blue-800 hover:bg-blue-200'
  },
  [SeverityLevel.WARNING]: {
    variant: 'secondary' as const,
    className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
  },
  [SeverityLevel.ERROR]: {
    variant: 'destructive' as const,
    className: 'bg-red-100 text-red-800 hover:bg-red-200'
  },
  [SeverityLevel.CRITICAL]: {
    variant: 'destructive' as const,
    className: 'bg-red-200 text-red-900 hover:bg-red-300 font-medium'
  }
}

export function SeverityBadge({ severity, className }: SeverityBadgeProps) {
  const config = severityConfig[severity]

  return (
    <Badge variant={config.variant} className={cn(config.className, className)}>
      {severity}
    </Badge>
  )
}
