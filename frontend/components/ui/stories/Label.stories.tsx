import type { Meta, StoryObj } from '@storybook/nextjs'
import { Label } from '../label'
import { Input } from '../input'
import { Textarea } from '../textarea'
import { InfoIcon, AlertTriangleIcon } from 'lucide-react'

const meta: Meta<typeof Label> = {
  title: 'UI/Label',
  component: Label,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs']
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: 'Label'
  }
}

export const WithInput: Story = {
  render: () => (
    <div className="space-y-2">
      <Label htmlFor="input-example">Email Address</Label>
      <Input id="input-example" type="email" placeholder="Enter your email" />
    </div>
  )
}

export const WithTextarea: Story = {
  render: () => (
    <div className="space-y-2">
      <Label htmlFor="textarea-example">Message</Label>
      <Textarea id="textarea-example" placeholder="Type your message..." />
    </div>
  )
}

export const Required: Story = {
  render: () => (
    <div className="space-y-2">
      <Label htmlFor="required-input">
        Password <span className="text-red-500">*</span>
      </Label>
      <Input id="required-input" type="password" placeholder="Required field" />
    </div>
  )
}

export const WithIcon: Story = {
  render: () => (
    <div className="space-y-2">
      <Label htmlFor="icon-input">
        <InfoIcon className="h-4 w-4" />
        Additional Information
      </Label>
      <Input id="icon-input" placeholder="Enter additional info" />
    </div>
  )
}

export const WithDescription: Story = {
  render: () => (
    <div className="space-y-2">
      <Label htmlFor="desc-input">API Key</Label>
      <Input id="desc-input" type="password" placeholder="Enter your API key" />
      <p className="text-xs text-muted-foreground">
        Your API key is used to authenticate requests to our service.
      </p>
    </div>
  )
}

export const LogsAppExamples: Story = {
  render: () => (
    <div className="space-y-6 w-96">
      <div className="space-y-2">
        <Label htmlFor="severity">Severity Level</Label>
        <select
          id="severity"
          className="w-full px-3 py-2 border rounded-md bg-background"
        >
          <option>DEBUG</option>
          <option>INFO</option>
          <option>WARNING</option>
          <option>ERROR</option>
          <option>CRITICAL</option>
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="source">
          Log Source <span className="text-red-500">*</span>
        </Label>
        <Input id="source" placeholder="e.g., api-server, database" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">
          <AlertTriangleIcon className="h-4 w-4" />
          Error Message
        </Label>
        <Textarea id="message" placeholder="Describe the error..." rows={4} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="timestamp">Timestamp</Label>
        <Input id="timestamp" type="datetime-local" />
        <p className="text-xs text-muted-foreground">
          Leave empty to use current time
        </p>
      </div>
    </div>
  )
}

export const DifferentStates: Story = {
  render: () => (
    <div className="space-y-6 w-80">
      <div className="space-y-2">
        <Label>Normal Label</Label>
        <Input placeholder="Normal input" />
      </div>

      <div className="space-y-2 group" data-disabled="true">
        <Label>Disabled Label</Label>
        <Input placeholder="Disabled input" disabled />
      </div>

      <div className="space-y-2">
        <Label className="text-destructive">Error Label</Label>
        <Input placeholder="Error input" className="border-destructive" />
      </div>

      <div className="space-y-2">
        <Label className="text-xs">Small Label</Label>
        <Input placeholder="With small label" />
      </div>
    </div>
  )
}

export const FormExample: Story = {
  render: () => (
    <form className="space-y-6 w-96">
      <h3 className="text-lg font-semibold">Create Log Entry</h3>

      <div className="space-y-2">
        <Label htmlFor="form-severity">
          <InfoIcon className="h-4 w-4" />
          Severity Level <span className="text-red-500">*</span>
        </Label>
        <select
          id="form-severity"
          className="w-full px-3 py-2 border rounded-md bg-background"
        >
          <option value="">Select severity...</option>
          <option value="DEBUG">DEBUG</option>
          <option value="INFO">INFO</option>
          <option value="WARNING">WARNING</option>
          <option value="ERROR">ERROR</option>
          <option value="CRITICAL">CRITICAL</option>
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="form-source">
          Source <span className="text-red-500">*</span>
        </Label>
        <Input
          id="form-source"
          placeholder="e.g., api-server, database, auth-service"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="form-message">
          Message <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="form-message"
          placeholder="Enter the log message..."
          rows={4}
        />
      </div>
    </form>
  )
}
