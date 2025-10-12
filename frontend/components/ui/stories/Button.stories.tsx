import type { Meta, StoryObj } from '@storybook/react'
import { Button } from '../button'
import { PlusIcon, TrashIcon, DownloadIcon } from 'lucide-react'

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: [
        'default',
        'destructive',
        'outline',
        'secondary',
        'ghost',
        'link'
      ]
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg', 'icon', 'icon-sm', 'icon-lg']
    },
    disabled: {
      control: 'boolean'
    }
  }
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: 'Button'
  }
}

export const Primary: Story = {
  args: {
    variant: 'default',
    children: 'Primary Button'
  }
}

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary Button'
  }
}

export const Destructive: Story = {
  args: {
    variant: 'destructive',
    children: 'Destructive Button'
  }
}

export const Outline: Story = {
  args: {
    variant: 'outline',
    children: 'Outline Button'
  }
}

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    children: 'Ghost Button'
  }
}

export const Link: Story = {
  args: {
    variant: 'link',
    children: 'Link Button'
  }
}

export const Small: Story = {
  args: {
    size: 'sm',
    children: 'Small Button'
  }
}

export const Large: Story = {
  args: {
    size: 'lg',
    children: 'Large Button'
  }
}

export const WithIcon: Story = {
  args: {
    children: (
      <>
        <PlusIcon />
        Create Log
      </>
    )
  }
}

export const WithIconOnly: Story = {
  args: {
    size: 'icon',
    children: <PlusIcon />
  }
}

export const Disabled: Story = {
  args: {
    disabled: true,
    children: 'Disabled Button'
  }
}

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button variant="default">Default</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
    </div>
  )
}

export const AllSizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <Button size="sm">Small</Button>
      <Button size="default">Default</Button>
      <Button size="lg">Large</Button>
      <Button size="icon-sm">
        <PlusIcon />
      </Button>
      <Button size="icon">
        <PlusIcon />
      </Button>
      <Button size="icon-lg">
        <PlusIcon />
      </Button>
    </div>
  )
}

export const LogsAppExamples: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button>
        <PlusIcon />
        Create Log
      </Button>
      <Button variant="outline">
        <DownloadIcon />
        Export CSV
      </Button>
      <Button variant="destructive" size="sm">
        <TrashIcon />
        Delete
      </Button>
      <Button variant="ghost" size="sm">
        Reset Filters
      </Button>
    </div>
  )
}
