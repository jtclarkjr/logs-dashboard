import type { Meta, StoryObj } from '@storybook/nextjs'
import { Badge } from '../badge'
import { CheckIcon, XIcon } from 'lucide-react'

const meta: Meta<typeof Badge> = {
  title: 'UI/Badge',
  component: Badge,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'secondary', 'destructive', 'outline']
    }
  }
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: 'Badge'
  }
}

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary'
  }
}

export const Destructive: Story = {
  args: {
    variant: 'destructive',
    children: 'Destructive'
  }
}

export const Outline: Story = {
  args: {
    variant: 'outline',
    children: 'Outline'
  }
}

export const WithIcon: Story = {
  args: {
    variant: 'secondary',
    children: (
      <>
        <CheckIcon />
        Success
      </>
    )
  }
}

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="default">Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="destructive">Destructive</Badge>
      <Badge variant="outline">Outline</Badge>
    </div>
  )
}

export const WithIcons: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="secondary">
        <CheckIcon />
        Active
      </Badge>
      <Badge variant="destructive">
        <XIcon />
        Inactive
      </Badge>
      <Badge variant="outline">Source: api-server</Badge>
    </div>
  )
}

export const LogsExamples: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="outline">database</Badge>
      <Badge variant="outline">auth-service</Badge>
      <Badge variant="outline">api-gateway</Badge>
      <Badge variant="secondary">Production</Badge>
      <Badge variant="default">Active</Badge>
    </div>
  )
}
