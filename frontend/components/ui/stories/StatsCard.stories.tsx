import type { Meta, StoryObj } from '@storybook/nextjs'
import { StatsCard } from '../stats-card'
import {
  TrendingUpIcon,
  AlertTriangleIcon,
  InfoIcon,
  UsersIcon,
  ActivityIcon,
  DatabaseIcon
} from 'lucide-react'

const meta: Meta<typeof StatsCard> = {
  title: 'UI/StatsCard',
  component: StatsCard,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text' },
    value: { control: 'text' },
    description: { control: 'text' }
  }
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    title: 'Total Users',
    value: '12,345',
    description: 'Active users this month'
  }
}

export const WithIcon: Story = {
  args: {
    title: 'Total Logs',
    value: '24,789',
    description: 'Logs processed today',
    icon: <ActivityIcon />
  }
}

export const WithPositiveTrend: Story = {
  args: {
    title: 'API Requests',
    value: '45,231',
    description: 'from last week',
    icon: <TrendingUpIcon />,
    trend: {
      value: 12.5,
      isPositive: true
    }
  }
}

export const WithNegativeTrend: Story = {
  args: {
    title: 'Error Rate',
    value: '2.1%',
    description: 'from last hour',
    icon: <AlertTriangleIcon />,
    trend: {
      value: 5.2,
      isPositive: false
    }
  }
}

export const LogsAppExamples: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatsCard
        title="Total Logs"
        value="12,345"
        description="Last 7 days"
        icon={<ActivityIcon />}
        trend={{ value: 20, isPositive: true }}
      />

      <StatsCard
        title="Error Rate"
        value="2.1%"
        description="of total logs"
        icon={<AlertTriangleIcon />}
        trend={{ value: 12, isPositive: false }}
      />

      <StatsCard
        title="Sources Active"
        value="8"
        description="services reporting"
        icon={<DatabaseIcon />}
      />

      <StatsCard
        title="Critical Logs"
        value="23"
        description="require attention"
        icon={<AlertTriangleIcon />}
        trend={{ value: 45, isPositive: false }}
      />
    </div>
  )
}

export const DifferentFormats: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <StatsCard
        title="Revenue"
        value="$12,345"
        description="This month"
        icon={<TrendingUpIcon />}
        trend={{ value: 15.2, isPositive: true }}
      />

      <StatsCard
        title="Conversion Rate"
        value="3.24%"
        description="from visitors"
        trend={{ value: 2.1, isPositive: true }}
      />

      <StatsCard
        title="Processing Time"
        value="1.2s"
        description="average response"
        trend={{ value: 8.5, isPositive: false }}
      />
    </div>
  )
}

export const SystemMetrics: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <StatsCard
        title="CPU Usage"
        value="45%"
        description="across all nodes"
        icon={<ActivityIcon />}
        trend={{ value: 5, isPositive: true }}
      />

      <StatsCard
        title="Memory Usage"
        value="8.2 GB"
        description="of 16 GB available"
        icon={<DatabaseIcon />}
      />

      <StatsCard
        title="Active Connections"
        value="1,247"
        description="database connections"
        icon={<UsersIcon />}
        trend={{ value: 12, isPositive: true }}
      />

      <StatsCard
        title="Storage Used"
        value="85%"
        description="of allocated space"
        icon={<DatabaseIcon />}
        trend={{ value: 3, isPositive: true }}
      />

      <StatsCard
        title="Network I/O"
        value="2.4 MB/s"
        description="current throughput"
        icon={<ActivityIcon />}
      />

      <StatsCard
        title="Uptime"
        value="99.9%"
        description="last 30 days"
        icon={<TrendingUpIcon />}
      />
    </div>
  )
}

export const LargeNumbers: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <StatsCard
        title="Total Requests"
        value="2.4M"
        description="this month"
        icon={<ActivityIcon />}
        trend={{ value: 25, isPositive: true }}
      />

      <StatsCard
        title="Data Processed"
        value="1.2TB"
        description="today"
        icon={<DatabaseIcon />}
        trend={{ value: 8, isPositive: true }}
      />
    </div>
  )
}

export const WithoutTrend: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <StatsCard
        title="Server Status"
        value="Online"
        description="all systems operational"
        icon={<ActivityIcon />}
      />

      <StatsCard
        title="Last Backup"
        value="2h ago"
        description="automated backup"
        icon={<DatabaseIcon />}
      />

      <StatsCard
        title="License Status"
        value="Valid"
        description="expires in 6 months"
        icon={<InfoIcon />}
      />
    </div>
  )
}

export const SingleCard: Story = {
  args: {
    title: 'Daily Active Users',
    value: '8,427',
    description: 'unique users today',
    icon: <UsersIcon />,
    trend: {
      value: 12.3,
      isPositive: true
    },
    className: 'w-64'
  }
}
