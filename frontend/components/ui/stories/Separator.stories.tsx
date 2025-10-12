import type { Meta, StoryObj } from '@storybook/react'
import { Separator } from '../separator'

const meta: Meta<typeof Separator> = {
  title: 'UI/Separator',
  component: Separator,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'],
  argTypes: {
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical']
    },
    decorative: {
      control: 'boolean'
    }
  }
}

export default meta
type Story = StoryObj<typeof meta>

export const Horizontal: Story = {
  render: () => (
    <div className="w-80 space-y-4">
      <div>Content above separator</div>
      <Separator />
      <div>Content below separator</div>
    </div>
  )
}

export const Vertical: Story = {
  render: () => (
    <div className="flex items-center space-x-4 h-8">
      <div>Left content</div>
      <Separator orientation="vertical" />
      <div>Right content</div>
    </div>
  )
}

export const InMenu: Story = {
  render: () => (
    <div className="w-64 bg-card border rounded-lg p-1">
      <div className="px-2 py-1.5 text-sm hover:bg-accent rounded cursor-pointer">
        New file
      </div>
      <div className="px-2 py-1.5 text-sm hover:bg-accent rounded cursor-pointer">
        Open
      </div>
      <Separator className="my-1" />
      <div className="px-2 py-1.5 text-sm hover:bg-accent rounded cursor-pointer">
        Save
      </div>
      <div className="px-2 py-1.5 text-sm hover:bg-accent rounded cursor-pointer">
        Save as...
      </div>
      <Separator className="my-1" />
      <div className="px-2 py-1.5 text-sm hover:bg-accent rounded cursor-pointer text-destructive">
        Delete
      </div>
    </div>
  )
}

export const LogsAppExamples: Story = {
  render: () => (
    <div className="space-y-6 w-96">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Log Entry Details</h3>
        <div className="space-y-2">
          <div className="text-sm">
            <strong>Timestamp:</strong> 2024-12-12 14:30:25
          </div>
          <div className="text-sm">
            <strong>Severity:</strong> ERROR
          </div>
          <div className="text-sm">
            <strong>Source:</strong> api-server
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <h4 className="font-medium">Message</h4>
          <p className="text-sm text-muted-foreground">
            Database connection failed: Connection refused on localhost:5432
          </p>
        </div>

        <Separator />

        <div className="space-y-2">
          <h4 className="font-medium">Stack Trace</h4>
          <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
            at DatabaseConnection.connect (db.js:45) at LogService.write
            (log-service.js:23)
          </pre>
        </div>
      </div>

      <div className="border rounded-lg p-4">
        <h3 className="font-medium mb-3">Dashboard Stats</h3>
        <div className="flex justify-between items-center text-sm">
          <span>Total Logs</span>
          <span>12,345</span>
        </div>
        <Separator className="my-2" />
        <div className="flex justify-between items-center text-sm">
          <span>Error Rate</span>
          <span className="text-red-600">2.1%</span>
        </div>
        <Separator className="my-2" />
        <div className="flex justify-between items-center text-sm">
          <span>Active Sources</span>
          <span>8</span>
        </div>
      </div>
    </div>
  )
}

export const BreadcrumbSeparator: Story = {
  render: () => (
    <div className="flex items-center space-x-2 text-sm">
      <span>Dashboard</span>
      <Separator orientation="vertical" className="h-4" />
      <span>Logs</span>
      <Separator orientation="vertical" className="h-4" />
      <span className="text-muted-foreground">Details</span>
    </div>
  )
}

export const ToolbarSeparator: Story = {
  render: () => (
    <div className="flex items-center space-x-2 p-2 border rounded-lg">
      <button className="px-2 py-1 text-sm hover:bg-accent rounded">New</button>
      <button className="px-2 py-1 text-sm hover:bg-accent rounded">
        Edit
      </button>
      <Separator orientation="vertical" className="h-6" />
      <button className="px-2 py-1 text-sm hover:bg-accent rounded">
        Export
      </button>
      <button className="px-2 py-1 text-sm hover:bg-accent rounded">
        Import
      </button>
      <Separator orientation="vertical" className="h-6" />
      <button className="px-2 py-1 text-sm hover:bg-accent rounded text-destructive">
        Delete
      </button>
    </div>
  )
}

export const CardSections: Story = {
  render: () => (
    <div className="w-80 border rounded-lg">
      <div className="p-4">
        <h3 className="font-semibold">Log Analysis</h3>
        <p className="text-sm text-muted-foreground">
          Analyze your application logs for insights
        </p>
      </div>

      <Separator />

      <div className="p-4 space-y-3">
        <div className="flex justify-between text-sm">
          <span>Total entries</span>
          <span>1,234</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Errors</span>
          <span className="text-red-600">23</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Warnings</span>
          <span className="text-yellow-600">156</span>
        </div>
      </div>

      <Separator />

      <div className="p-4">
        <button className="w-full bg-primary text-primary-foreground py-2 px-4 rounded text-sm">
          View Details
        </button>
      </div>
    </div>
  )
}
