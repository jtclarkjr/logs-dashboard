import type { Meta, StoryObj } from '@storybook/nextjs'
import { Tooltip, TooltipContent, TooltipTrigger } from '../tooltip'
import { Button } from '../button'
import { Badge } from '../badge'
import { InfoIcon, HelpCircleIcon, AlertCircleIcon } from 'lucide-react'

const meta: Meta<typeof Tooltip> = {
  title: 'UI/Tooltip',
  component: Tooltip,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs']
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline">Hover me</Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>This is a tooltip</p>
      </TooltipContent>
    </Tooltip>
  )
}

export const WithIcon: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <span>Log Severity</span>
      <Tooltip>
        <TooltipTrigger asChild>
          <InfoIcon className="h-4 w-4 text-muted-foreground cursor-help" />
        </TooltipTrigger>
        <TooltipContent>
          <p>The severity level indicates the importance of the log entry</p>
        </TooltipContent>
      </Tooltip>
    </div>
  )
}

export const DifferentSides: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-8 p-8">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button>Top (default)</Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Tooltip on top</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button>Bottom</Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>Tooltip on bottom</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button>Left</Button>
        </TooltipTrigger>
        <TooltipContent side="left">
          <p>Tooltip on left</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button>Right</Button>
        </TooltipTrigger>
        <TooltipContent side="right">
          <p>Tooltip on right</p>
        </TooltipContent>
      </Tooltip>
    </div>
  )
}

export const LogsAppExamples: Story = {
  render: () => (
    <div className="space-y-6 max-w-2xl">
      <div className="space-y-4">
        <h3 className="font-semibold">Log Dashboard Tooltips</h3>

        <div className="flex items-center gap-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="destructive">ERROR</Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>Error logs indicate system failures or critical issues</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="secondary">WARNING</Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>Warning logs highlight potential issues that need attention</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Badge>INFO</Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                Info logs provide general information about system operations
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold">Dashboard Stats</h3>
        <div className="border rounded-lg p-4 space-y-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-sm">Total Logs</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircleIcon className="h-3 w-3 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Total number of log entries in the selected time period</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <span className="font-bold">12,345</span>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-sm">Error Rate</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <AlertCircleIcon className="h-3 w-3 text-red-500 cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Percentage of error logs compared to total logs</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <span className="font-bold text-red-600">2.1%</span>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-sm">Active Sources</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <InfoIcon className="h-3 w-3 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Number of different services currently sending logs</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <span className="font-bold">8</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold">Action Buttons</h3>
        <div className="flex gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="sm">Export CSV</Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Export the current log data as a CSV file</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm">
                Reset Filters
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Clear all applied filters and show all logs</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="destructive" size="sm">
                Delete
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Permanently delete the selected log entries</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </div>
  )
}

export const LongContent: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button>Hover for detailed info</Button>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs">
        <p>
          This is a longer tooltip that contains more detailed information about
          the feature or functionality. It can wrap to multiple lines when
          needed.
        </p>
      </TooltipContent>
    </Tooltip>
  )
}

export const WithCustomStyling: Story = {
  render: () => (
    <div className="flex gap-4">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Success</Button>
        </TooltipTrigger>
        <TooltipContent className="bg-green-600">
          <p>Success tooltip with custom styling</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Warning</Button>
        </TooltipTrigger>
        <TooltipContent className="bg-yellow-600">
          <p>Warning tooltip with custom styling</p>
        </TooltipContent>
      </Tooltip>
    </div>
  )
}
