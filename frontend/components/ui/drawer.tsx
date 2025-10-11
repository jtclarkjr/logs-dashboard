'use client'

import * as React from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from './button'

interface DrawerProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children?: React.ReactNode
}

interface DrawerContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
}

interface DrawerHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
}

interface DrawerTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children?: React.ReactNode
}

interface DrawerBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
}

interface DrawerFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
}

const DrawerContext = React.createContext<{
  open: boolean
  onOpenChange: (open: boolean) => void
}>({
  open: false,
  onOpenChange: () => {}
})

const Drawer = React.forwardRef<HTMLDivElement, DrawerProps>(
  ({ open = false, onOpenChange, children }, ref) => {
    const [isVisible, setIsVisible] = React.useState(false)
    const [isAnimating, setIsAnimating] = React.useState(false)

    React.useEffect(() => {
      if (open) {
        setIsVisible(true)
        // Small delay to ensure the element is rendered before starting animation
        setTimeout(() => setIsAnimating(true), 10)
      } else {
        setIsAnimating(false)
        // Keep element visible during exit animation
        const timer = setTimeout(() => setIsVisible(false), 300)
        return () => clearTimeout(timer)
      }
    }, [open])

    return (
      <DrawerContext.Provider
        value={{ open, onOpenChange: onOpenChange || (() => {}) }}
      >
        {isVisible && (
          <div className="fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <div
              className={cn(
                'absolute inset-0 bg-black/50 transition-opacity duration-300 ease-in-out',
                isAnimating ? 'opacity-100' : 'opacity-0'
              )}
              onClick={() => onOpenChange?.(false)}
            />
            {/* Drawer */}
            <div
              ref={ref}
              className={cn(
                'fixed right-0 top-0 z-50 h-full w-full max-w-md bg-background shadow-lg',
                'transform transition-transform duration-300 ease-in-out',
                isAnimating ? 'translate-x-0' : 'translate-x-full'
              )}
            >
              {children}
            </div>
          </div>
        )}
      </DrawerContext.Provider>
    )
  }
)
Drawer.displayName = 'Drawer'

const DrawerContent = React.forwardRef<HTMLDivElement, DrawerContentProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex h-full w-full flex-col border-l bg-background',
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
DrawerContent.displayName = 'DrawerContent'

const DrawerHeader = React.forwardRef<HTMLDivElement, DrawerHeaderProps>(
  ({ className, children, ...props }, ref) => {
    const { onOpenChange } = React.useContext(DrawerContext)

    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center justify-between border-b px-6 py-4',
          className
        )}
        {...props}
      >
        <div className="flex-1">{children}</div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onOpenChange(false)}
          className="h-6 w-6 p-0"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Button>
      </div>
    )
  }
)
DrawerHeader.displayName = 'DrawerHeader'

const DrawerTitle = React.forwardRef<HTMLHeadingElement, DrawerTitleProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <h2
        ref={ref}
        className={cn('text-lg font-semibold text-foreground', className)}
        {...props}
      >
        {children}
      </h2>
    )
  }
)
DrawerTitle.displayName = 'DrawerTitle'

const DrawerBody = React.forwardRef<HTMLDivElement, DrawerBodyProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex-1 overflow-y-auto px-6 py-4', className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)
DrawerBody.displayName = 'DrawerBody'

const DrawerFooter = React.forwardRef<HTMLDivElement, DrawerFooterProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('border-t px-6 py-4', className)} {...props}>
        {children}
      </div>
    )
  }
)
DrawerFooter.displayName = 'DrawerFooter'

export {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerBody,
  DrawerFooter
}
