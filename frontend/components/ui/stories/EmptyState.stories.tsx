import type { Meta, StoryObj } from '@storybook/react'
import { EmptyState } from '../empty-state'
import {
  SearchIcon,
  FileTextIcon,
  AlertCircleIcon,
  DatabaseIcon,
  FilterIcon
} from 'lucide-react'

const meta: Meta<typeof EmptyState> = {
  title: 'UI/EmptyState',
  component: EmptyState,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text' },
    description: { control: 'text' }
  }
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    title: 'No items found',
    description: 'There are no items to display at the moment.'
  }
}

export const WithIcon: Story = {
  args: {
    icon: <SearchIcon className="h-16 w-16" />,
    title: 'No results found',
    description: 'Try adjusting your search criteria or filters.'
  }
}

export const WithAction: Story = {
  args: {
    icon: <FileTextIcon className="h-16 w-16" />,
    title: 'No documents',
    description: 'Get started by creating your first document.',
    action: {
      label: 'Create Document',
      onClick: () => alert('Create clicked')
    }
  }
}

export const LogsAppExamples: Story = {
  render: () => (
    <div className="space-y-8 w-full max-w-4xl">
      <EmptyState
        icon={<FileTextIcon className="h-16 w-16" />}
        title="No logs found"
        description="Try adjusting your search criteria or filters to find matching logs."
        action={{
          label: 'Reset Filters',
          onClick: () => alert('Reset filters clicked')
        }}
      />

      <EmptyState
        icon={<SearchIcon className="h-16 w-16" />}
        title="No search results"
        description="We couldn&apos;t find any logs matching your search query. Try using different keywords."
        action={{
          label: 'Clear Search',
          onClick: () => alert('Clear search clicked')
        }}
      />

      <EmptyState
        icon={<DatabaseIcon className="h-16 w-16" />}
        title="No data available"
        description="There are no logs available for the selected time period. Try selecting a different date range."
        action={{
          label: 'Select Date Range',
          onClick: () => alert('Date range picker clicked')
        }}
      />

      <EmptyState
        icon={<AlertCircleIcon className="h-16 w-16" />}
        title="Connection error"
        description="Unable to load logs from the server. Please check your connection and try again."
        action={{
          label: 'Retry',
          onClick: () => alert('Retry clicked')
        }}
      />
    </div>
  )
}

export const DifferentStates: Story = {
  render: () => (
    <div className="space-y-8 w-full max-w-4xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <EmptyState
          title="No notifications"
          description="You&apos;re all caught up! No new notifications."
        />

        <EmptyState
          icon={<FilterIcon className="h-12 w-12" />}
          title="Filters applied"
          description="No results match your current filters."
          action={{
            label: 'Clear Filters',
            onClick: () => alert('Clear filters')
          }}
        />

        <EmptyState
          icon={<SearchIcon className="h-12 w-12" />}
          title="Start searching"
          description="Enter a search term to find what you're looking for."
        />

        <EmptyState
          icon={<FileTextIcon className="h-12 w-12" />}
          title="Create your first item"
          description="Get started by adding your first item to the collection."
          action={{
            label: 'Add Item',
            onClick: () => alert('Add item')
          }}
        />
      </div>
    </div>
  )
}

export const MinimalStates: Story = {
  render: () => (
    <div className="space-y-6 w-full max-w-2xl">
      <EmptyState title="No results" />

      <EmptyState title="Empty folder" description="This folder is empty." />

      <EmptyState
        icon={<SearchIcon className="h-12 w-12" />}
        title="No matches found"
      />
    </div>
  )
}

export const ErrorStates: Story = {
  render: () => (
    <div className="space-y-6 w-full max-w-3xl">
      <EmptyState
        icon={<AlertCircleIcon className="h-16 w-16 text-red-500" />}
        title="Failed to load data"
        description="Something went wrong while loading the data. Please try again later."
        action={{
          label: 'Try Again',
          onClick: () => alert('Retry')
        }}
      />

      <EmptyState
        icon={<DatabaseIcon className="h-16 w-16 text-orange-500" />}
        title="Service unavailable"
        description="The logging service is temporarily unavailable. Please check back in a few minutes."
        action={{
          label: 'Refresh',
          onClick: () => alert('Refresh')
        }}
      />
    </div>
  )
}

export const InTable: Story = {
  render: () => (
    <div className="border rounded-lg w-full max-w-4xl">
      <div className="border-b p-4">
        <h2 className="font-semibold">Log Entries</h2>
      </div>
      <EmptyState
        icon={<FileTextIcon className="h-12 w-12" />}
        title="No log entries"
        description="There are no log entries to display for the selected filters."
        action={{
          label: 'Reset Filters',
          onClick: () => alert('Reset filters')
        }}
        className="border-0 shadow-none"
      />
    </div>
  )
}
