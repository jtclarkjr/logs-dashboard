import type { Meta, StoryObj } from '@storybook/react'
import { LoadingState } from '../loading-state'

const meta: Meta<typeof LoadingState> = {
  title: 'UI/LoadingState',
  component: LoadingState,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['table', 'cards', 'chart', 'simple']
    },
    count: {
      control: { type: 'number', min: 1, max: 10 }
    }
  }
}

export default meta
type Story = StoryObj<typeof meta>

export const Simple: Story = {
  args: {
    variant: 'simple',
    count: 3
  }
}

export const Table: Story = {
  args: {
    variant: 'table',
    count: 5
  }
}

export const Cards: Story = {
  args: {
    variant: 'cards',
    count: 4
  }
}

export const Chart: Story = {
  args: {
    variant: 'chart'
  }
}

export const LogsAppExamples: Story = {
  render: () => (
    <div className="space-y-8 w-full max-w-6xl">
      <div>
        <h3 className="text-lg font-semibold mb-4">Loading Logs Table</h3>
        <LoadingState variant="table" count={6} />
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Loading Dashboard Stats</h3>
        <LoadingState variant="cards" count={4} />
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Loading Chart</h3>
        <LoadingState variant="chart" />
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Loading Simple Content</h3>
        <LoadingState variant="simple" count={5} />
      </div>
    </div>
  )
}

export const DifferentCounts: Story = {
  render: () => (
    <div className="space-y-8 w-full max-w-4xl">
      <div>
        <h3 className="text-lg font-semibold mb-4">Table - 3 rows</h3>
        <LoadingState variant="table" count={3} />
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Cards - 6 cards</h3>
        <LoadingState variant="cards" count={6} />
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Simple - 8 lines</h3>
        <LoadingState variant="simple" count={8} />
      </div>
    </div>
  )
}
