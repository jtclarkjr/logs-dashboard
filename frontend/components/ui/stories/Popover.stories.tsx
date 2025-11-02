import type { Meta, StoryObj } from '@storybook/nextjs'
import { Popover, PopoverContent, PopoverTrigger } from '../popover'
import { Button } from '../button'
import { Input } from '../input'
import { Label } from '../label'
import {
  CalendarIcon,
  FilterIcon,
  InfoIcon,
  SettingsIcon,
  HelpCircleIcon
} from 'lucide-react'

const meta: Meta<typeof Popover> = {
  title: 'UI/Popover',
  component: Popover,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs']
}

export default meta
type Story = StoryObj<typeof meta>

export const Basic: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Open Popover</Button>
      </PopoverTrigger>
      <PopoverContent>
        <div className="space-y-2">
          <h4 className="font-medium">Basic Popover</h4>
          <p className="text-sm text-muted-foreground">
            This is a basic popover with some content inside.
          </p>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export const WithForm: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button>
          <SettingsIcon className="h-4 w-4 mr-2" />
          Quick Settings
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium">Display Settings</h4>
            <p className="text-sm text-muted-foreground">
              Quickly adjust display preferences
            </p>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Auto-refresh</Label>
              <input type="checkbox" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-sm">Compact view</Label>
              <input type="checkbox" />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-sm">Show timestamps</Label>
              <input type="checkbox" defaultChecked />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export const QuickFilters: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          <FilterIcon className="h-4 w-4 mr-2" />
          Quick Filters
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium">Filter Logs</h4>
            <p className="text-sm text-muted-foreground">
              Apply common filters quickly
            </p>
          </div>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label className="text-xs">Time Range</Label>
              <select className="w-full px-2 py-1 text-sm border rounded">
                <option>Last 1 hour</option>
                <option>Last 6 hours</option>
                <option>Last 24 hours</option>
                <option>Last 7 days</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Log Level</Label>
              <select className="w-full px-2 py-1 text-sm border rounded">
                <option>All levels</option>
                <option>Error & Critical</option>
                <option>Warning & above</option>
                <option>Info & above</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Source</Label>
              <Input
                placeholder="Filter by source..."
                className="h-8 text-sm"
              />
            </div>
            <Button size="sm" className="w-full">
              Apply Filters
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export const LogEntryInfo: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm">
          <InfoIcon className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <div className="space-y-3">
          <div className="space-y-1">
            <h4 className="font-medium text-sm">Log Entry Details</h4>
            <p className="text-xs text-muted-foreground">ID: log_abc123def</p>
          </div>
          <div className="space-y-2 text-xs">
            <div className="grid grid-cols-2 gap-1">
              <span className="text-muted-foreground">Timestamp:</span>
              <span className="font-mono">14:32:18.245</span>
            </div>
            <div className="grid grid-cols-2 gap-1">
              <span className="text-muted-foreground">Source:</span>
              <span className="font-mono">api-gateway</span>
            </div>
            <div className="grid grid-cols-2 gap-1">
              <span className="text-muted-foreground">Thread:</span>
              <span className="font-mono">exec-2</span>
            </div>
            <div className="grid grid-cols-2 gap-1">
              <span className="text-muted-foreground">User:</span>
              <span>john.doe</span>
            </div>
          </div>
          <div className="pt-2 border-t">
            <Button variant="outline" size="sm" className="w-full h-7">
              View Full Details
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export const DatePicker: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">
          <CalendarIcon className="h-4 w-4 mr-2" />
          Select Date
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium">Select Date Range</h4>
            <p className="text-sm text-muted-foreground">
              Choose a date range for log filtering
            </p>
          </div>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label className="text-xs">Start Date</Label>
              <Input type="date" className="h-8" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">End Date</Label>
              <Input type="date" className="h-8" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Quick Select</Label>
              <div className="grid grid-cols-2 gap-1">
                <Button variant="outline" size="sm" className="h-7 text-xs">
                  Today
                </Button>
                <Button variant="outline" size="sm" className="h-7 text-xs">
                  Yesterday
                </Button>
                <Button variant="outline" size="sm" className="h-7 text-xs">
                  Last 7d
                </Button>
                <Button variant="outline" size="sm" className="h-7 text-xs">
                  Last 30d
                </Button>
              </div>
            </div>
            <Button size="sm" className="w-full">
              Apply Date Range
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export const Help: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm">
          <HelpCircleIcon className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <div className="space-y-3">
          <div className="space-y-1">
            <h4 className="font-medium text-sm">Log Severity Levels</h4>
            <p className="text-xs text-muted-foreground">
              Understanding log severity classifications
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <div>
                <p className="text-xs font-medium">DEBUG</p>
                <p className="text-xs text-muted-foreground">
                  Detailed diagnostic info
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div>
                <p className="text-xs font-medium">INFO</p>
                <p className="text-xs text-muted-foreground">
                  General information
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div>
                <p className="text-xs font-medium">WARNING</p>
                <p className="text-xs text-muted-foreground">
                  Potentially harmful situations
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div>
                <p className="text-xs font-medium">ERROR</p>
                <p className="text-xs text-muted-foreground">
                  Error events but app continues
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-700 rounded-full"></div>
              <div>
                <p className="text-xs font-medium">CRITICAL</p>
                <p className="text-xs text-muted-foreground">
                  Very severe error events
                </p>
              </div>
            </div>
          </div>
          <div className="pt-2 border-t">
            <Button variant="outline" size="sm" className="w-full h-7">
              Learn More
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export const Positioning: Story = {
  render: () => (
    <div className="flex gap-4">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">Top</Button>
        </PopoverTrigger>
        <PopoverContent side="top">
          <p className="text-sm">Popover positioned on top</p>
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">Right</Button>
        </PopoverTrigger>
        <PopoverContent side="right">
          <p className="text-sm">Popover positioned on right</p>
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">Bottom</Button>
        </PopoverTrigger>
        <PopoverContent side="bottom">
          <p className="text-sm">Popover positioned on bottom</p>
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">Left</Button>
        </PopoverTrigger>
        <PopoverContent side="left">
          <p className="text-sm">Popover positioned on left</p>
        </PopoverContent>
      </Popover>
    </div>
  )
}

export const UserActions: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-xs font-medium">
            JD
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56">
        <div className="space-y-3">
          <div className="space-y-1">
            <h4 className="font-medium text-sm">John Doe</h4>
            <p className="text-xs text-muted-foreground">
              john.doe@company.com
            </p>
          </div>
          <div className="space-y-1">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start h-8"
            >
              View Profile
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start h-8"
            >
              Account Settings
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start h-8"
            >
              Activity Log
            </Button>
          </div>
          <div className="border-t pt-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start h-8"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
