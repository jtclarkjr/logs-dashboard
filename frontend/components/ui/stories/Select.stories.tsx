import type { Meta, StoryObj } from '@storybook/nextjs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
  SelectSeparator
} from '../select'
import { Label } from '../label'
import { SeverityBadge } from '../severity-badge'
import { SeverityLevel } from '@/lib/enums/severity'

const meta: Meta<typeof Select> = {
  title: 'UI/Select',
  component: Select,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs']
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Select>
      <SelectTrigger className="w-48">
        <SelectValue placeholder="Select an option" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="option1">Option 1</SelectItem>
        <SelectItem value="option2">Option 2</SelectItem>
        <SelectItem value="option3">Option 3</SelectItem>
      </SelectContent>
    </Select>
  )
}

export const WithLabel: Story = {
  render: () => (
    <div className="space-y-2">
      <Label htmlFor="select-with-label">Choose Priority</Label>
      <Select>
        <SelectTrigger className="w-48" id="select-with-label">
          <SelectValue placeholder="Select priority" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="low">Low</SelectItem>
          <SelectItem value="medium">Medium</SelectItem>
          <SelectItem value="high">High</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}

export const WithGroups: Story = {
  render: () => (
    <Select>
      <SelectTrigger className="w-64">
        <SelectValue placeholder="Select a service" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Backend Services</SelectLabel>
          <SelectItem value="api-gateway">API Gateway</SelectItem>
          <SelectItem value="auth-service">Authentication Service</SelectItem>
          <SelectItem value="user-service">User Service</SelectItem>
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectLabel>Databases</SelectLabel>
          <SelectItem value="postgres">PostgreSQL</SelectItem>
          <SelectItem value="redis">Redis</SelectItem>
          <SelectItem value="mongodb">MongoDB</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}

export const SeveritySelect: Story = {
  render: () => (
    <div className="space-y-2">
      <Label>Log Severity</Label>
      <Select>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Select severity" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Severities</SelectItem>
          <SelectSeparator />
          {Object.values(SeverityLevel).map((level) => (
            <SelectItem key={level} value={level}>
              <SeverityBadge severity={level} />
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

export const SmallSize: Story = {
  render: () => (
    <Select>
      <SelectTrigger size="sm" className="w-32">
        <SelectValue placeholder="Small" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="option1">Option 1</SelectItem>
        <SelectItem value="option2">Option 2</SelectItem>
        <SelectItem value="option3">Option 3</SelectItem>
      </SelectContent>
    </Select>
  )
}

export const Disabled: Story = {
  render: () => (
    <Select disabled>
      <SelectTrigger className="w-48">
        <SelectValue placeholder="Disabled select" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="option1">Option 1</SelectItem>
        <SelectItem value="option2">Option 2</SelectItem>
      </SelectContent>
    </Select>
  )
}

export const LogsAppExamples: Story = {
  render: () => (
    <div className="space-y-6 w-96">
      <div className="space-y-2">
        <Label>Time Grouping</Label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select time grouping" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="hour">Hour</SelectItem>
            <SelectItem value="day">Day</SelectItem>
            <SelectItem value="week">Week</SelectItem>
            <SelectItem value="month">Month</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Log Source</Label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select source" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sources</SelectItem>
            <SelectSeparator />
            <SelectGroup>
              <SelectLabel>Services</SelectLabel>
              <SelectItem value="api-server">API Server</SelectItem>
              <SelectItem value="auth-service">Auth Service</SelectItem>
              <SelectItem value="user-service">User Service</SelectItem>
            </SelectGroup>
            <SelectSeparator />
            <SelectGroup>
              <SelectLabel>Infrastructure</SelectLabel>
              <SelectItem value="database">Database</SelectItem>
              <SelectItem value="cache">Cache</SelectItem>
              <SelectItem value="queue">Message Queue</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Sort By</Label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Sort logs by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="timestamp-desc">Newest First</SelectItem>
            <SelectItem value="timestamp-asc">Oldest First</SelectItem>
            <SelectItem value="severity-desc">Severity ↓</SelectItem>
            <SelectItem value="severity-asc">Severity ↑</SelectItem>
            <SelectItem value="source-desc">Source ↓</SelectItem>
            <SelectItem value="source-asc">Source ↑</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

export const DifferentWidths: Story = {
  render: () => (
    <div className="space-y-4">
      <Select>
        <SelectTrigger className="w-32">
          <SelectValue placeholder="Small" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
        </SelectContent>
      </Select>

      <Select>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Medium" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
        </SelectContent>
      </Select>

      <Select>
        <SelectTrigger className="w-64">
          <SelectValue placeholder="Large" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
        </SelectContent>
      </Select>

      <Select>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Full Width" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}

export const LongContent: Story = {
  render: () => (
    <Select>
      <SelectTrigger className="w-80">
        <SelectValue placeholder="Select a very long option" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="short">Short option</SelectItem>
        <SelectItem value="medium">Medium length option</SelectItem>
        <SelectItem value="long">
          This is a very long option that might overflow
        </SelectItem>
        <SelectItem value="longest">
          This is an extremely long option that definitely will overflow and
          test the line clamping behavior
        </SelectItem>
      </SelectContent>
    </Select>
  )
}
