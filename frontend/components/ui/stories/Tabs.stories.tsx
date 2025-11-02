import type { Meta, StoryObj } from '@storybook/nextjs'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../tabs'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '../card'
import { Button } from '../button'
import { Badge } from '../badge'
import {
  BarChart3Icon,
  LineChartIcon,
  PieChartIcon,
  ActivityIcon
} from 'lucide-react'

const meta: Meta<typeof Tabs> = {
  title: 'UI/Tabs',
  component: Tabs,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs']
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Tabs defaultValue="tab1" className="w-96">
      <TabsList>
        <TabsTrigger value="tab1">Tab One</TabsTrigger>
        <TabsTrigger value="tab2">Tab Two</TabsTrigger>
        <TabsTrigger value="tab3">Tab Three</TabsTrigger>
      </TabsList>
      <TabsContent value="tab1">
        <p>Content for tab one</p>
      </TabsContent>
      <TabsContent value="tab2">
        <p>Content for tab two</p>
      </TabsContent>
      <TabsContent value="tab3">
        <p>Content for tab three</p>
      </TabsContent>
    </Tabs>
  )
}

export const WithIcons: Story = {
  render: () => (
    <Tabs defaultValue="overview" className="w-96">
      <TabsList>
        <TabsTrigger value="overview">
          <ActivityIcon />
          Overview
        </TabsTrigger>
        <TabsTrigger value="analytics">
          <BarChart3Icon />
          Analytics
        </TabsTrigger>
        <TabsTrigger value="reports">
          <LineChartIcon />
          Reports
        </TabsTrigger>
      </TabsList>
      <TabsContent value="overview">
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold">System Overview</h3>
            <p className="text-muted-foreground">
              General system information and status.
            </p>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="analytics">
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold">Analytics Dashboard</h3>
            <p className="text-muted-foreground">
              Detailed analytics and metrics.
            </p>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="reports">
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold">Reports</h3>
            <p className="text-muted-foreground">
              Generated reports and exports.
            </p>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}

export const WithCards: Story = {
  render: () => (
    <Tabs defaultValue="account" className="w-[500px]">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
      </TabsList>
      <TabsContent value="account">
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>
              Make changes to your account here. Click save when you&apos;re
              done.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Name
              </label>
              <input
                id="name"
                placeholder="Pedro Duarte"
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium">
                Username
              </label>
              <input
                id="username"
                placeholder="@peduarte"
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <Button>Save changes</Button>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="password">
        <Card>
          <CardHeader>
            <CardTitle>Password</CardTitle>
            <CardDescription>
              Change your password here. After saving, you&apos;ll be logged
              out.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="current" className="text-sm font-medium">
                Current password
              </label>
              <input
                id="current"
                type="password"
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="new" className="text-sm font-medium">
                New password
              </label>
              <input
                id="new"
                type="password"
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <Button>Save password</Button>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}

export const LogsAppExamples: Story = {
  render: () => (
    <Tabs defaultValue="timeline" className="w-full max-w-4xl">
      <TabsList>
        <TabsTrigger value="timeline">
          <LineChartIcon />
          Timeline Chart
        </TabsTrigger>
        <TabsTrigger value="distribution">
          <PieChartIcon />
          Severity Distribution
        </TabsTrigger>
        <TabsTrigger value="sources">
          <BarChart3Icon />
          Top Sources
        </TabsTrigger>
      </TabsList>
      <TabsContent value="timeline">
        <Card>
          <CardHeader>
            <CardTitle>Log Count Over Time</CardTitle>
            <CardDescription>
              Trend of log counts grouped by time period
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-muted rounded flex items-center justify-center">
              <LineChartIcon className="h-12 w-12 text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">
                Timeline Chart Placeholder
              </span>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="distribution">
        <Card>
          <CardHeader>
            <CardTitle>Severity Distribution</CardTitle>
            <CardDescription>
              Breakdown of logs by severity level
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-muted rounded flex items-center justify-center">
              <PieChartIcon className="h-12 w-12 text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">
                Pie Chart Placeholder
              </span>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="sources">
        <Card>
          <CardHeader>
            <CardTitle>Top Log Sources</CardTitle>
            <CardDescription>
              Most active log sources in the selected time period
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-muted rounded flex items-center justify-center">
              <BarChart3Icon className="h-12 w-12 text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">
                Bar Chart Placeholder
              </span>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}

export const WithBadges: Story = {
  render: () => (
    <Tabs defaultValue="all" className="w-96">
      <TabsList>
        <TabsTrigger value="all">
          All <Badge className="ml-2">12</Badge>
        </TabsTrigger>
        <TabsTrigger value="errors">
          Errors{' '}
          <Badge variant="destructive" className="ml-2">
            3
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="warnings">
          Warnings{' '}
          <Badge variant="secondary" className="ml-2">
            5
          </Badge>
        </TabsTrigger>
      </TabsList>
      <TabsContent value="all">
        <div className="p-4 border rounded-lg">
          <p>Showing all 12 log entries</p>
        </div>
      </TabsContent>
      <TabsContent value="errors">
        <div className="p-4 border rounded-lg border-red-200 bg-red-50">
          <p>Showing 3 error entries</p>
        </div>
      </TabsContent>
      <TabsContent value="warnings">
        <div className="p-4 border rounded-lg border-yellow-200 bg-yellow-50">
          <p>Showing 5 warning entries</p>
        </div>
      </TabsContent>
    </Tabs>
  )
}

export const Vertical: Story = {
  render: () => (
    <Tabs defaultValue="tab1" orientation="vertical" className="flex w-96 h-64">
      <TabsList className="flex-col h-full w-24">
        <TabsTrigger value="tab1" className="w-full">
          Tab 1
        </TabsTrigger>
        <TabsTrigger value="tab2" className="w-full">
          Tab 2
        </TabsTrigger>
        <TabsTrigger value="tab3" className="w-full">
          Tab 3
        </TabsTrigger>
      </TabsList>
      <div className="flex-1 ml-4">
        <TabsContent value="tab1" className="h-full">
          <div className="h-full border rounded-lg p-4">
            <h3 className="font-semibold">Tab 1 Content</h3>
            <p className="text-muted-foreground">
              This is the content for tab 1
            </p>
          </div>
        </TabsContent>
        <TabsContent value="tab2" className="h-full">
          <div className="h-full border rounded-lg p-4">
            <h3 className="font-semibold">Tab 2 Content</h3>
            <p className="text-muted-foreground">
              This is the content for tab 2
            </p>
          </div>
        </TabsContent>
        <TabsContent value="tab3" className="h-full">
          <div className="h-full border rounded-lg p-4">
            <h3 className="font-semibold">Tab 3 Content</h3>
            <p className="text-muted-foreground">
              This is the content for tab 3
            </p>
          </div>
        </TabsContent>
      </div>
    </Tabs>
  )
}

export const DisabledTab: Story = {
  render: () => (
    <Tabs defaultValue="tab1" className="w-96">
      <TabsList>
        <TabsTrigger value="tab1">Active</TabsTrigger>
        <TabsTrigger value="tab2" disabled>
          Disabled
        </TabsTrigger>
        <TabsTrigger value="tab3">Another</TabsTrigger>
      </TabsList>
      <TabsContent value="tab1">
        <p>Content for active tab</p>
      </TabsContent>
      <TabsContent value="tab2">
        <p>This content won&apos;t be shown</p>
      </TabsContent>
      <TabsContent value="tab3">
        <p>Content for another tab</p>
      </TabsContent>
    </Tabs>
  )
}
