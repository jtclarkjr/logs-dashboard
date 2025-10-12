import type { Meta, StoryObj } from '@storybook/react'
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption
} from '../table'
import { Badge } from '../badge'
import { SeverityBadge } from '../severity-badge'
import { SeverityLevel } from '@/lib/enums/severity'
import { Button } from '../button'
import { MoreHorizontalIcon, TrashIcon, EyeIcon } from 'lucide-react'

const meta: Meta<typeof Table> = {
  title: 'UI/Table',
  component: Table,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs']
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Table>
      <TableCaption>A list of your recent invoices.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">Invoice</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Method</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell className="font-medium">INV001</TableCell>
          <TableCell>Paid</TableCell>
          <TableCell>Credit Card</TableCell>
          <TableCell className="text-right">$250.00</TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-medium">INV002</TableCell>
          <TableCell>Pending</TableCell>
          <TableCell>PayPal</TableCell>
          <TableCell className="text-right">$150.00</TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-medium">INV003</TableCell>
          <TableCell>Unpaid</TableCell>
          <TableCell>Bank Transfer</TableCell>
          <TableCell className="text-right">$350.00</TableCell>
        </TableRow>
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={3}>Total</TableCell>
          <TableCell className="text-right">$750.00</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  )
}

export const LogsTable: Story = {
  render: () => (
    <Table>
      <TableCaption>Recent log entries from your application</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Timestamp</TableHead>
          <TableHead>Severity</TableHead>
          <TableHead>Source</TableHead>
          <TableHead>Message</TableHead>
          <TableHead className="w-[50px]">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell className="font-mono text-sm">
            Dec 12, 2024 14:30:25
          </TableCell>
          <TableCell>
            <SeverityBadge severity={SeverityLevel.ERROR} />
          </TableCell>
          <TableCell>
            <Badge variant="outline">api-server</Badge>
          </TableCell>
          <TableCell className="max-w-md truncate">
            Database connection failed: Connection refused on localhost:5432
          </TableCell>
          <TableCell>
            <Button variant="ghost" size="sm">
              <MoreHorizontalIcon className="h-4 w-4" />
            </Button>
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-mono text-sm">
            Dec 12, 2024 14:29:15
          </TableCell>
          <TableCell>
            <SeverityBadge severity={SeverityLevel.WARNING} />
          </TableCell>
          <TableCell>
            <Badge variant="outline">auth-service</Badge>
          </TableCell>
          <TableCell className="max-w-md truncate">
            High memory usage detected: 85% of allocated memory in use
          </TableCell>
          <TableCell>
            <Button variant="ghost" size="sm">
              <MoreHorizontalIcon className="h-4 w-4" />
            </Button>
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-mono text-sm">
            Dec 12, 2024 14:28:45
          </TableCell>
          <TableCell>
            <SeverityBadge severity={SeverityLevel.INFO} />
          </TableCell>
          <TableCell>
            <Badge variant="outline">user-service</Badge>
          </TableCell>
          <TableCell className="max-w-md truncate">
            User login successful for user ID: 12345
          </TableCell>
          <TableCell>
            <Button variant="ghost" size="sm">
              <MoreHorizontalIcon className="h-4 w-4" />
            </Button>
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-mono text-sm">
            Dec 12, 2024 14:27:30
          </TableCell>
          <TableCell>
            <SeverityBadge severity={SeverityLevel.CRITICAL} />
          </TableCell>
          <TableCell>
            <Badge variant="outline">database</Badge>
          </TableCell>
          <TableCell className="max-w-md truncate">
            System crash detected: Out of memory error in main process
          </TableCell>
          <TableCell>
            <Button variant="ghost" size="sm">
              <MoreHorizontalIcon className="h-4 w-4" />
            </Button>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  )
}

export const WithActions: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell className="font-medium">John Doe</TableCell>
          <TableCell>
            <Badge>Active</Badge>
          </TableCell>
          <TableCell>Admin</TableCell>
          <TableCell>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <EyeIcon className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-destructive">
                <TrashIcon className="h-4 w-4" />
              </Button>
            </div>
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-medium">Jane Smith</TableCell>
          <TableCell>
            <Badge variant="secondary">Inactive</Badge>
          </TableCell>
          <TableCell>User</TableCell>
          <TableCell>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <EyeIcon className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-destructive">
                <TrashIcon className="h-4 w-4" />
              </Button>
            </div>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  )
}

export const Dense: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="py-2">ID</TableHead>
          <TableHead className="py-2">Name</TableHead>
          <TableHead className="py-2">Value</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell className="py-1">1</TableCell>
          <TableCell className="py-1">Item A</TableCell>
          <TableCell className="py-1">100</TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="py-1">2</TableCell>
          <TableCell className="py-1">Item B</TableCell>
          <TableCell className="py-1">200</TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="py-1">3</TableCell>
          <TableCell className="py-1">Item C</TableCell>
          <TableCell className="py-1">300</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  )
}

export const StripedRows: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Product</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Price</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow className="bg-muted/50">
          <TableCell>Product 1</TableCell>
          <TableCell>Electronics</TableCell>
          <TableCell>$99.99</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Product 2</TableCell>
          <TableCell>Books</TableCell>
          <TableCell>$19.99</TableCell>
        </TableRow>
        <TableRow className="bg-muted/50">
          <TableCell>Product 3</TableCell>
          <TableCell>Clothing</TableCell>
          <TableCell>$49.99</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Product 4</TableCell>
          <TableCell>Home</TableCell>
          <TableCell>$79.99</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  )
}

export const Empty: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Timestamp</TableHead>
          <TableHead>Severity</TableHead>
          <TableHead>Source</TableHead>
          <TableHead>Message</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell
            colSpan={4}
            className="h-24 text-center text-muted-foreground"
          >
            No logs found. Try adjusting your filters.
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  )
}

export const Responsive: Story = {
  render: () => (
    <div className="w-full max-w-4xl">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[100px]">ID</TableHead>
            <TableHead className="min-w-[150px]">Name</TableHead>
            <TableHead className="min-w-[200px]">Description</TableHead>
            <TableHead className="min-w-[100px]">Status</TableHead>
            <TableHead className="min-w-[120px]">Created</TableHead>
            <TableHead className="min-w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>001</TableCell>
            <TableCell className="font-medium">
              Long Product Name That Might Wrap
            </TableCell>
            <TableCell>
              This is a detailed description that might be quite long and could
              wrap to multiple lines in narrow viewports
            </TableCell>
            <TableCell>
              <Badge>Active</Badge>
            </TableCell>
            <TableCell className="font-mono text-sm">2024-12-12</TableCell>
            <TableCell>
              <Button variant="ghost" size="sm">
                View
              </Button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  )
}
