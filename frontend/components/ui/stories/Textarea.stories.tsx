import type { Meta, StoryObj } from '@storybook/react'
import { Textarea } from '../textarea'
import { Label } from '../label'

const meta: Meta<typeof Textarea> = {
  title: 'UI/Textarea',
  component: Textarea,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'],
  argTypes: {
    disabled: {
      control: 'boolean'
    },
    placeholder: {
      control: 'text'
    },
    rows: {
      control: 'number'
    }
  }
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    placeholder: 'Type your message here...'
  }
}

export const WithLabel: Story = {
  render: () => (
    <div className="space-y-2 w-80">
      <Label htmlFor="textarea-with-label">Log Message</Label>
      <Textarea
        id="textarea-with-label"
        placeholder="Enter the log message details..."
      />
    </div>
  )
}

export const WithRows: Story = {
  args: {
    placeholder: 'Textarea with 5 rows...',
    rows: 5
  }
}

export const Disabled: Story = {
  args: {
    placeholder: 'This textarea is disabled',
    disabled: true
  }
}

export const AutoResize: Story = {
  args: {
    placeholder: 'This textarea will auto-resize as you type...',
    className: 'resize-none'
  }
}

export const LogsAppExamples: Story = {
  render: () => (
    <div className="space-y-6 w-96">
      <div className="space-y-2">
        <Label>Log Message</Label>
        <Textarea placeholder="Enter the detailed log message..." rows={4} />
      </div>

      <div className="space-y-2">
        <Label>Error Description</Label>
        <Textarea
          placeholder="Describe the error in detail, including steps to reproduce..."
          rows={6}
        />
      </div>

      <div className="space-y-2">
        <Label>Stack Trace</Label>
        <Textarea
          placeholder="Paste the stack trace here..."
          rows={8}
          className="font-mono text-xs"
        />
      </div>

      <div className="space-y-2">
        <Label>Additional Notes</Label>
        <Textarea placeholder="Any additional context or notes..." rows={3} />
      </div>
    </div>
  )
}

export const DifferentSizes: Story = {
  render: () => (
    <div className="space-y-4 w-80">
      <div className="space-y-2">
        <Label>Small (3 rows)</Label>
        <Textarea rows={3} placeholder="Small textarea..." />
      </div>
      <div className="space-y-2">
        <Label>Medium (5 rows)</Label>
        <Textarea rows={5} placeholder="Medium textarea..." />
      </div>
      <div className="space-y-2">
        <Label>Large (8 rows)</Label>
        <Textarea rows={8} placeholder="Large textarea..." />
      </div>
    </div>
  )
}

export const States: Story = {
  render: () => (
    <div className="space-y-4 w-80">
      <Textarea placeholder="Normal state" />
      <Textarea placeholder="Error state" className="border-destructive" />
      <Textarea placeholder="Disabled state" disabled />
    </div>
  )
}
