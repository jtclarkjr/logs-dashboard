import type { Meta, StoryObj } from '@storybook/nextjs'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
  SheetFooter
} from '../sheet'
import { Button } from '../button'
import { Input } from '../input'
import { Label } from '../label'
import { Textarea } from '../textarea'
import {
  MenuIcon,
  SettingsIcon,
  FilterIcon,
  HelpCircleIcon
} from 'lucide-react'

const meta: Meta<typeof Sheet> = {
  title: 'UI/Sheet',
  component: Sheet,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs']
}

export default meta
type Story = StoryObj<typeof meta>

export const FromRight: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button>Open Sheet (Right)</Button>
      </SheetTrigger>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Sheet from Right</SheetTitle>
          <SheetDescription>
            This sheet slides in from the right side of the screen.
          </SheetDescription>
        </SheetHeader>
        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input placeholder="Enter your name" />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea placeholder="Enter description..." />
          </div>
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button variant="outline">Cancel</Button>
          </SheetClose>
          <Button>Save</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

export const FromLeft: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Open Sheet (Left)</Button>
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>Navigation Menu</SheetTitle>
          <SheetDescription>
            This sheet slides in from the left, perfect for navigation menus.
          </SheetDescription>
        </SheetHeader>
        <div className="py-4">
          <nav className="space-y-2">
            <a
              href="#"
              className="block px-3 py-2 rounded-md hover:bg-accent text-sm"
            >
              Dashboard
            </a>
            <a
              href="#"
              className="block px-3 py-2 rounded-md hover:bg-accent text-sm"
            >
              Logs
            </a>
            <a
              href="#"
              className="block px-3 py-2 rounded-md hover:bg-accent text-sm"
            >
              Analytics
            </a>
            <a
              href="#"
              className="block px-3 py-2 rounded-md hover:bg-accent text-sm"
            >
              Settings
            </a>
            <a
              href="#"
              className="block px-3 py-2 rounded-md hover:bg-accent text-sm"
            >
              Help
            </a>
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export const FromTop: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Open Sheet (Top)</Button>
      </SheetTrigger>
      <SheetContent side="top" className="h-[400px]">
        <SheetHeader>
          <SheetTitle>Notification Center</SheetTitle>
          <SheetDescription>
            This sheet slides in from the top, great for notifications or
            announcements.
          </SheetDescription>
        </SheetHeader>
        <div className="py-4 space-y-4">
          <div className="p-4 border rounded-lg">
            <h4 className="font-medium">System Update</h4>
            <p className="text-sm text-muted-foreground">
              New features have been deployed.
            </p>
          </div>
          <div className="p-4 border rounded-lg">
            <h4 className="font-medium">Maintenance Window</h4>
            <p className="text-sm text-muted-foreground">
              Scheduled maintenance tonight at 2 AM EST.
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export const FromBottom: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Open Sheet (Bottom)</Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[300px]">
        <SheetHeader>
          <SheetTitle>Quick Actions</SheetTitle>
          <SheetDescription>
            This sheet slides in from the bottom, ideal for mobile-style action
            sheets.
          </SheetDescription>
        </SheetHeader>
        <div className="py-4 grid grid-cols-3 gap-4">
          <Button className="h-20 flex flex-col gap-2">
            <SettingsIcon className="h-6 w-6" />
            <span className="text-xs">Settings</span>
          </Button>
          <Button variant="outline" className="h-20 flex flex-col gap-2">
            <FilterIcon className="h-6 w-6" />
            <span className="text-xs">Filters</span>
          </Button>
          <Button variant="outline" className="h-20 flex flex-col gap-2">
            <HelpCircleIcon className="h-6 w-6" />
            <span className="text-xs">Help</span>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export const LogFiltersSheet: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button>
          <FilterIcon className="h-4 w-4 mr-2" />
          Filter Logs
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Log Filters</SheetTitle>
          <SheetDescription>
            Configure filters to refine your log search results.
          </SheetDescription>
        </SheetHeader>
        <div className="py-4 space-y-6">
          <div className="space-y-2">
            <Label>Date Range</Label>
            <div className="grid grid-cols-2 gap-2">
              <Input type="date" placeholder="From" />
              <Input type="date" placeholder="To" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Log Level</Label>
            <select className="w-full px-3 py-2 border rounded-md">
              <option value="">All Levels</option>
              <option value="debug">DEBUG</option>
              <option value="info">INFO</option>
              <option value="warning">WARNING</option>
              <option value="error">ERROR</option>
              <option value="critical">CRITICAL</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label>Source Application</Label>
            <Input placeholder="e.g., api-server, database" />
          </div>

          <div className="space-y-2">
            <Label>Message Contains</Label>
            <Input placeholder="Search in log messages..." />
          </div>

          <div className="space-y-2">
            <Label>User ID</Label>
            <Input placeholder="Filter by user ID" />
          </div>
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button variant="outline">Reset</Button>
          </SheetClose>
          <SheetClose asChild>
            <Button>Apply Filters</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

export const MobileMenu: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button size="sm" variant="ghost">
          <MenuIcon className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px]">
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>
        <div className="py-4">
          <nav className="space-y-1">
            <div className="px-3 py-2">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Main
              </h3>
              <div className="mt-2 space-y-1">
                <a
                  href="#"
                  className="flex items-center px-2 py-2 text-sm rounded-md hover:bg-accent"
                >
                  Dashboard
                </a>
                <a
                  href="#"
                  className="flex items-center px-2 py-2 text-sm rounded-md hover:bg-accent"
                >
                  Logs
                </a>
                <a
                  href="#"
                  className="flex items-center px-2 py-2 text-sm rounded-md hover:bg-accent"
                >
                  Analytics
                </a>
              </div>
            </div>

            <div className="px-3 py-2">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Management
              </h3>
              <div className="mt-2 space-y-1">
                <a
                  href="#"
                  className="flex items-center px-2 py-2 text-sm rounded-md hover:bg-accent"
                >
                  Users
                </a>
                <a
                  href="#"
                  className="flex items-center px-2 py-2 text-sm rounded-md hover:bg-accent"
                >
                  Sources
                </a>
                <a
                  href="#"
                  className="flex items-center px-2 py-2 text-sm rounded-md hover:bg-accent"
                >
                  Settings
                </a>
              </div>
            </div>
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export const CreateLogSheet: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button>Create Log Entry</Button>
      </SheetTrigger>
      <SheetContent className="w-[500px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Create New Log Entry</SheetTitle>
          <SheetDescription>
            Add a new log entry to the system manually.
          </SheetDescription>
        </SheetHeader>
        <div className="py-4 space-y-6">
          <div className="space-y-2">
            <Label>Severity Level *</Label>
            <select className="w-full px-3 py-2 border rounded-md">
              <option value="">Select severity</option>
              <option value="debug">DEBUG</option>
              <option value="info">INFO</option>
              <option value="warning">WARNING</option>
              <option value="error">ERROR</option>
              <option value="critical">CRITICAL</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label>Source *</Label>
            <Input placeholder="e.g., api-server, database, auth-service" />
          </div>

          <div className="space-y-2">
            <Label>Thread/Process ID</Label>
            <Input placeholder="Optional thread or process identifier" />
          </div>

          <div className="space-y-2">
            <Label>Message *</Label>
            <Textarea
              placeholder="Enter the detailed log message..."
              className="min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <Label>Stack Trace</Label>
            <Textarea
              placeholder="Paste stack trace if available..."
              className="min-h-[80px] font-mono text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label>Timestamp</Label>
            <Input type="datetime-local" />
            <p className="text-xs text-muted-foreground">
              Leave empty to use current time
            </p>
          </div>

          <div className="space-y-2">
            <Label>Additional Context</Label>
            <Textarea
              placeholder="Any additional context or metadata..."
              rows={3}
            />
          </div>
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button variant="outline">Cancel</Button>
          </SheetClose>
          <SheetClose asChild>
            <Button>Create Log Entry</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
