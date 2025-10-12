'use client'

import { ReactNode, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface FadeTransitionBaseProps {
  children: ReactNode
  isVisible?: boolean
  duration?: 'fast' | 'normal' | 'slow'
  className?: string
  onTransitionComplete?: () => void
}

type FadeTransitionProps<T extends React.ElementType = 'div'> =
  FadeTransitionBaseProps & {
    as?: T
  } & Omit<React.ComponentPropsWithoutRef<T>, keyof FadeTransitionBaseProps>

const durationClasses = {
  fast: 'transition-opacity duration-150',
  normal: 'transition-opacity duration-300',
  slow: 'transition-opacity duration-500'
}

export function FadeTransition<T extends React.ElementType = 'div'>({
  as,
  children,
  isVisible = true,
  duration = 'normal',
  className,
  onTransitionComplete,
  ...props
}: FadeTransitionProps<T>) {
  const [internalVisible, setInternalVisible] = useState(isVisible)

  useEffect(() => {
    if (isVisible !== internalVisible) {
      setInternalVisible(isVisible)
    }
  }, [isVisible, internalVisible])

  useEffect(() => {
    if (onTransitionComplete) {
      const timeout = setTimeout(
        () => {
          onTransitionComplete()
        },
        duration === 'fast' ? 150 : duration === 'normal' ? 300 : 500
      )

      return () => clearTimeout(timeout)
    }
  }, [internalVisible, duration, onTransitionComplete])

  const Component = as || 'div'

  return (
    <Component
      className={cn(
        durationClasses[duration],
        internalVisible ? 'opacity-100' : 'opacity-0',
        className
      )}
      {...props}
    >
      {children}
    </Component>
  )
}
