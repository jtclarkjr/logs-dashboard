import type { Meta, StoryObj } from '@storybook/react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '../dialog'
import { Button } from '../button'
import { Input } from '../input'
import { Label } from '../label'
import { Textarea } from '../textarea'

const meta: Meta<typeof Dialog> = {
  title: 'UI/Dialog',
  component: Dialog,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs']
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Open Dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Dialog Title</DialogTitle>
          <DialogDescription>
            This is a description of what this dialog is for.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p>Dialog content goes here.</p>
        </div>
        <DialogFooter>
          <Button variant="outline">Cancel</Button>
          <Button>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export const CreateLogDialog: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Create Log Entry</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Log</DialogTitle>
          <DialogDescription>
            Fill in the details for the new log entry
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Severity Level</Label>
            <select className="w-full px-3 py-2 border rounded-md">
              <option>DEBUG</option>
              <option>INFO</option>
              <option>WARNING</option>
              <option>ERROR</option>
              <option>CRITICAL</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label>Source</Label>
            <Input placeholder="e.g., api-server, database" />
          </div>
          <div className="space-y-2">
            <Label>Message</Label>
            <Textarea placeholder="Enter the log message..." rows={4} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline">Cancel</Button>
          <Button>Create Log</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export const DeleteConfirmDialog: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive">Delete Log</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Log Entry</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this log entry? This action cannot
            be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="p-4 border rounded-lg bg-muted/50">
          <div className="text-sm">
            <strong>Timestamp:</strong> Dec 12, 2024 14:30:25
            <br />
            <strong>Severity:</strong> ERROR
            <br />
            <strong>Source:</strong> api-server
            <br />
            <strong>Message:</strong> Database connection failed
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline">Cancel</Button>
          <Button variant="destructive">Delete</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
