import type { Meta, StoryObj } from '@storybook/nextjs'
import { Input } from '../input'
import { Label } from '../label'
import { SearchIcon, EyeIcon, EyeOffIcon } from 'lucide-react'
import { useState } from 'react'

const meta: Meta<typeof Input> = {
  title: 'UI/Input',
  component: Input,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'password', 'email', 'number', 'search', 'tel', 'url']
    },
    disabled: {
      control: 'boolean'
    },
    placeholder: {
      control: 'text'
    }
  }
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    placeholder: 'Enter text...'
  }
}

export const WithLabel: Story = {
  render: () => (
    <div className="space-y-2">
      <Label htmlFor="input-with-label">Email</Label>
      <Input
        id="input-with-label"
        type="email"
        placeholder="Enter your email"
      />
    </div>
  )
}

export const Password: Story = {
  args: {
    type: 'password',
    placeholder: 'Enter password...'
  }
}

export const Search: Story = {
  args: {
    type: 'search',
    placeholder: 'Search...'
  }
}

export const Disabled: Story = {
  args: {
    placeholder: 'Disabled input',
    disabled: true
  }
}

export const WithIcon: Story = {
  render: () => (
    <div className="relative">
      <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
      <Input placeholder="Search logs..." className="pl-9" />
    </div>
  )
}
export const PasswordToggle: Story = {
  render: function PasswordToggleComponent() {
    const [showPassword, setShowPassword] = useState(false)

    return (
      <div className="relative">
        <Input
          type={showPassword ? 'text' : 'password'}
          placeholder="Enter password..."
          className="pr-9"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-3 h-4 w-4 text-muted-foreground hover:text-foreground cursor-pointer"
        >
          {showPassword ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
    )
  }
}

export const DifferentTypes: Story = {
  render: () => (
    <div className="space-y-4 w-80">
      <div className="space-y-2">
        <Label>Text</Label>
        <Input type="text" placeholder="Text input" />
      </div>
      <div className="space-y-2">
        <Label>Email</Label>
        <Input type="email" placeholder="email@example.com" />
      </div>
      <div className="space-y-2">
        <Label>Number</Label>
        <Input type="number" placeholder="123" />
      </div>
      <div className="space-y-2">
        <Label>Password</Label>
        <Input type="password" placeholder="••••••••" />
      </div>
      <div className="space-y-2">
        <Label>Search</Label>
        <Input type="search" placeholder="Search..." />
      </div>
    </div>
  )
}

export const LogsAppExamples: Story = {
  render: () => (
    <div className="space-y-4 w-96">
      <div className="space-y-2">
        <Label>Log Source</Label>
        <Input placeholder="e.g., api-server, database, auth-service" />
      </div>
      <div className="space-y-2">
        <Label>Search Logs</Label>
        <div className="relative">
          <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search logs..." className="pl-9" />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Filter by Timestamp</Label>
        <Input type="datetime-local" />
      </div>
    </div>
  )
}

export const States: Story = {
  render: () => (
    <div className="space-y-4 w-80">
      <Input placeholder="Normal state" />
      <Input
        placeholder="Focused state"
        className="focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
      />
      <Input placeholder="Error state" className="border-destructive" />
      <Input placeholder="Disabled state" disabled />
    </div>
  )
}
