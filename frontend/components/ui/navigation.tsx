'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { FileTextIcon, BarChart3Icon, MenuIcon } from 'lucide-react'
import {
  Button,
  Sheet,
  SheetContent,
  SheetTrigger,
  Badge
} from '@/components/ui'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: BarChart3Icon },
  { name: 'Logs', href: '/logs', icon: FileTextIcon }
]
function NavigationItems({ mobile = false }: { mobile?: boolean }) {
  const pathname = usePathname()

  return (
    <nav className={cn('flex gap-1', mobile ? 'flex-col' : 'flex-row')}>
      {navigation.map((item) => {
        const Icon = item.icon
        const isActive =
          pathname === item.href ||
          (item.href !== '/' && pathname.startsWith(item.href))

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            )}
          >
            <Icon className="h-4 w-4" />
            {item.name}
          </Link>
        )
      })}
    </nav>
  )
}

export function MainNavigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center px-4 md:px-6">
        {/* Logo */}
        <div className="mr-4 flex">
          <Link href="/" className="flex items-center space-x-2">
            <BarChart3Icon className="h-6 w-6" />
            <span className="font-bold text-xl">Logs Dashboard</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex flex-1 items-center justify-between">
          <NavigationItems />

          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="text-xs">
              v1.0.0
            </Badge>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="flex flex-1 items-center justify-between md:hidden">
          <div />
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm">
                <MenuIcon className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <div className="flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Navigation</h2>
                </div>
                <NavigationItems mobile />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
