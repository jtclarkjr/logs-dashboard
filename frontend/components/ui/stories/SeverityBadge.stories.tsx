import type { Meta, StoryObj } from '@storybook/react'
import { SeverityBadge } from '../severity-badge'
import { SeverityLevel } from '@/lib/enums/severity'

const meta: Meta<typeof SeverityBadge> = {
  title: 'UI/SeverityBadge',
  component: SeverityBadge,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'],
  argTypes: {
    severity: {
      control: 'select',
      options: Object.values(SeverityLevel)
    }
  }
}

export default meta
type Story = StoryObj<typeof meta>

export const Debug: Story = {
  args: {
    severity: SeverityLevel.DEBUG
  }
}

export const Info: Story = {
  args: {
    severity: SeverityLevel.INFO
  }
}

export const Warning: Story = {
  args: {
    severity: SeverityLevel.WARNING
  }
}

export const Error: Story = {
  args: {
    severity: SeverityLevel.ERROR
  }
}

export const Critical: Story = {
  args: {
    severity: SeverityLevel.CRITICAL
  }
}

export const AllSeverities: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <SeverityBadge severity={SeverityLevel.DEBUG} />
      <SeverityBadge severity={SeverityLevel.INFO} />
      <SeverityBadge severity={SeverityLevel.WARNING} />
      <SeverityBadge severity={SeverityLevel.ERROR} />
      <SeverityBadge severity={SeverityLevel.CRITICAL} />
    </div>
  )
}

export const InLogContext: Story = {
  render: () => (
    <div className="space-y-4 max-w-md">
      <div className="flex items-center justify-between p-4 border rounded-lg">
        <div className="flex items-center gap-2">
          <SeverityBadge severity={SeverityLevel.INFO} />
          <span className="text-sm">User login successful</span>
        </div>
        <span className="text-xs text-muted-foreground">12:34:56</span>
      </div>

      <div className="flex items-center justify-between p-4 border rounded-lg">
        <div className="flex items-center gap-2">
          <SeverityBadge severity={SeverityLevel.WARNING} />
          <span className="text-sm">High memory usage detected</span>
        </div>
        <span className="text-xs text-muted-foreground">12:35:12</span>
      </div>

      <div className="flex items-center justify-between p-4 border rounded-lg">
        <div className="flex items-center gap-2">
          <SeverityBadge severity={SeverityLevel.ERROR} />
          <span className="text-sm">Database connection failed</span>
        </div>
        <span className="text-xs text-muted-foreground">12:35:45</span>
      </div>

      <div className="flex items-center justify-between p-4 border rounded-lg">
        <div className="flex items-center gap-2">
          <SeverityBadge severity={SeverityLevel.CRITICAL} />
          <span className="text-sm">System crash detected</span>
        </div>
        <span className="text-xs text-muted-foreground">12:36:01</span>
      </div>
    </div>
  )
}

export const WithCustomSizing: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <SeverityBadge severity={SeverityLevel.ERROR} className="text-xs" />
      <SeverityBadge severity={SeverityLevel.ERROR} />
      <SeverityBadge
        severity={SeverityLevel.ERROR}
        className="text-sm px-3 py-1"
      />
    </div>
  )
}
