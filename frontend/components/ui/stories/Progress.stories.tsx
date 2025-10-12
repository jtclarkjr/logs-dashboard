import type { Meta, StoryObj } from '@storybook/react'
import React from 'react'
import { Progress } from '../progress'
import { Label } from '../label'

const meta: Meta<typeof Progress> = {
  title: 'UI/Progress',
  component: Progress,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: { type: 'range', min: 0, max: 100, step: 1 }
    }
  }
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    value: 50,
    className: 'w-80'
  }
}

export const WithLabel: Story = {
  render: () => (
    <div className="space-y-2 w-80">
      <div className="flex justify-between">
        <Label>Progress</Label>
        <span className="text-sm text-muted-foreground">65%</span>
      </div>
      <Progress value={65} />
    </div>
  )
}

export const DifferentValues: Story = {
  render: () => (
    <div className="space-y-6 w-80">
      <div className="space-y-2">
        <div className="flex justify-between">
          <Label>Low Progress</Label>
          <span className="text-sm text-muted-foreground">15%</span>
        </div>
        <Progress value={15} />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between">
          <Label>Medium Progress</Label>
          <span className="text-sm text-muted-foreground">45%</span>
        </div>
        <Progress value={45} />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between">
          <Label>High Progress</Label>
          <span className="text-sm text-muted-foreground">80%</span>
        </div>
        <Progress value={80} />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between">
          <Label>Complete</Label>
          <span className="text-sm text-muted-foreground">100%</span>
        </div>
        <Progress value={100} />
      </div>
    </div>
  )
}

export const LogsAppExamples: Story = {
  render: () => (
    <div className="space-y-6 w-96">
      <div className="space-y-2">
        <div className="flex justify-between">
          <Label>Storage Usage</Label>
          <span className="text-sm text-muted-foreground">8.5 GB / 10 GB</span>
        </div>
        <Progress value={85} className="h-3" />
        <p className="text-xs text-muted-foreground">
          Log storage at 85% capacity
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between">
          <Label>Critical Logs</Label>
          <span className="text-sm text-muted-foreground">2%</span>
        </div>
        <Progress value={2} className="h-2 bg-red-100" />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between">
          <Label>Warning Logs</Label>
          <span className="text-sm text-muted-foreground">15%</span>
        </div>
        <Progress value={15} className="h-2 bg-yellow-100" />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between">
          <Label>Info Logs</Label>
          <span className="text-sm text-muted-foreground">75%</span>
        </div>
        <Progress value={75} className="h-2 bg-blue-100" />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between">
          <Label>Debug Logs</Label>
          <span className="text-sm text-muted-foreground">8%</span>
        </div>
        <Progress value={8} className="h-2 bg-gray-100" />
      </div>
    </div>
  )
}

export const DifferentSizes: Story = {
  render: () => (
    <div className="space-y-4 w-80">
      <div className="space-y-2">
        <Label>Small (h-1)</Label>
        <Progress value={60} className="h-1" />
      </div>

      <div className="space-y-2">
        <Label>Default (h-2)</Label>
        <Progress value={60} />
      </div>

      <div className="space-y-2">
        <Label>Medium (h-3)</Label>
        <Progress value={60} className="h-3" />
      </div>

      <div className="space-y-2">
        <Label>Large (h-4)</Label>
        <Progress value={60} className="h-4" />
      </div>
    </div>
  )
}

export const AnimatedProgress: Story = {
  render: function AnimatedProgressComponent() {
    const [progress, setProgress] = React.useState(0)

    React.useEffect(() => {
      const timer = setTimeout(() => setProgress(66), 500)
      return () => clearTimeout(timer)
    }, [])

    return (
      <div className="space-y-2 w-80">
        <div className="flex justify-between">
          <Label>Loading Progress</Label>
          <span className="text-sm text-muted-foreground">{progress}%</span>
        </div>
        <Progress value={progress} />
      </div>
    )
  }
}
