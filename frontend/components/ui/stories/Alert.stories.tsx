import type { Meta, StoryObj } from '@storybook/react'
import { Alert, AlertTitle, AlertDescription } from '../alert'
import {
  InfoIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  AlertCircleIcon
} from 'lucide-react'

const meta: Meta<typeof Alert> = {
  title: 'UI/Alert',
  component: Alert,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'destructive']
    }
  }
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Alert className="w-96">
      <InfoIcon />
      <AlertTitle>Heads up!</AlertTitle>
      <AlertDescription>
        You can add components and dependencies to your app using the cli.
      </AlertDescription>
    </Alert>
  )
}

export const Destructive: Story = {
  render: () => (
    <Alert variant="destructive" className="w-96">
      <XCircleIcon />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>
        Your session has expired. Please log in again.
      </AlertDescription>
    </Alert>
  )
}

export const WithoutIcon: Story = {
  render: () => (
    <Alert className="w-96">
      <AlertTitle>Simple Alert</AlertTitle>
      <AlertDescription>
        This alert doesn&apos;t have an icon, so it takes up less space.
      </AlertDescription>
    </Alert>
  )
}

export const OnlyTitle: Story = {
  render: () => (
    <Alert className="w-96">
      <InfoIcon />
      <AlertTitle>Just a title</AlertTitle>
    </Alert>
  )
}

export const OnlyDescription: Story = {
  render: () => (
    <Alert className="w-96">
      <AlertTriangleIcon />
      <AlertDescription>Just a description without a title.</AlertDescription>
    </Alert>
  )
}

export const DifferentIcons: Story = {
  render: () => (
    <div className="space-y-4 w-96">
      <Alert>
        <InfoIcon />
        <AlertTitle>Information</AlertTitle>
        <AlertDescription>
          Here&apos;s some helpful information for you.
        </AlertDescription>
      </Alert>

      <Alert>
        <CheckCircleIcon />
        <AlertTitle>Success</AlertTitle>
        <AlertDescription>
          Your action was completed successfully.
        </AlertDescription>
      </Alert>

      <Alert>
        <AlertTriangleIcon />
        <AlertTitle>Warning</AlertTitle>
        <AlertDescription>
          Please review this important information.
        </AlertDescription>
      </Alert>

      <Alert variant="destructive">
        <AlertCircleIcon />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Something went wrong. Please try again.
        </AlertDescription>
      </Alert>
    </div>
  )
}

export const LogsAppExamples: Story = {
  render: () => (
    <div className="space-y-4 w-[500px]">
      <Alert>
        <InfoIcon />
        <AlertTitle>Dashboard Information</AlertTitle>
        <AlertDescription>
          Dashboard showing data from 12,345 total logs across 8 sources. Data
          range: Dec 01, 2024 to Dec 12, 2024
        </AlertDescription>
      </Alert>

      <Alert>
        <CheckCircleIcon />
        <AlertTitle>Log created successfully!</AlertTitle>
        <AlertDescription>
          Your log entry has been added to the system.
        </AlertDescription>
      </Alert>

      <Alert>
        <AlertTriangleIcon />
        <AlertTitle>High Error Rate Detected</AlertTitle>
        <AlertDescription>
          The error rate has increased by 25% in the last hour. Consider
          investigating the api-server logs.
        </AlertDescription>
      </Alert>

      <Alert variant="destructive">
        <XCircleIcon />
        <AlertTitle>Failed to load logs</AlertTitle>
        <AlertDescription>
          Unable to connect to the log database. Please check your connection
          and try again.
        </AlertDescription>
      </Alert>

      <Alert>
        <AlertTriangleIcon />
        <AlertTitle>No logs found</AlertTitle>
        <AlertDescription>
          Try adjusting your search criteria or filters to find matching logs.
        </AlertDescription>
      </Alert>
    </div>
  )
}

export const SystemAlerts: Story = {
  render: () => (
    <div className="space-y-4 w-[500px]">
      <Alert>
        <InfoIcon />
        <AlertTitle>System Maintenance</AlertTitle>
        <AlertDescription>
          Scheduled maintenance will occur on Sunday at 2:00 AM UTC. The system
          will be unavailable for approximately 1 hour.
        </AlertDescription>
      </Alert>

      <Alert>
        <AlertTriangleIcon />
        <AlertTitle>Storage Warning</AlertTitle>
        <AlertDescription>
          Log storage is at 85% capacity. Consider archiving older logs or
          increasing storage limits.
        </AlertDescription>
      </Alert>

      <Alert variant="destructive">
        <AlertCircleIcon />
        <AlertTitle>Critical System Error</AlertTitle>
        <AlertDescription>
          Database connection failed. Log ingestion has been paused. Please
          contact system administrator immediately.
        </AlertDescription>
      </Alert>
    </div>
  )
}

export const InlineAlert: Story = {
  render: () => (
    <div className="w-96 space-y-4">
      <h2 className="text-lg font-semibold">Create Log Entry</h2>

      <div className="space-y-2">
        <label className="text-sm font-medium">Message</label>
        <textarea
          className="w-full px-3 py-2 border rounded-md"
          rows={3}
          placeholder="Enter log message..."
        />
      </div>

      <Alert>
        <InfoIcon />
        <AlertDescription>
          Timestamps will be automatically assigned if not provided.
        </AlertDescription>
      </Alert>

      <button className="bg-blue-600 text-white px-4 py-2 rounded-md">
        Create Log
      </button>
    </div>
  )
}

export const CompactAlerts: Story = {
  render: () => (
    <div className="space-y-2 w-96">
      <Alert className="py-2">
        <AlertDescription>
          Quick info message without much spacing
        </AlertDescription>
      </Alert>

      <Alert variant="destructive" className="py-2">
        <AlertDescription>Compact error message</AlertDescription>
      </Alert>

      <Alert className="py-2">
        <CheckCircleIcon />
        <AlertDescription>Success message with icon</AlertDescription>
      </Alert>
    </div>
  )
}
