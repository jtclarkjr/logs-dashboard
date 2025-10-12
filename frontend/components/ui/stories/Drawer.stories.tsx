import type { Meta, StoryObj } from '@storybook/react'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerBody,
  DrawerFooter
} from '../drawer'
import { Button } from '../button'
import { Input } from '../input'
import { Label } from '../label'
import { Textarea } from '../textarea'
import { Badge } from '../badge'
import { useState } from 'react'
import { SettingsIcon, UserIcon, FilterIcon, FileTextIcon, BellIcon } from 'lucide-react'

const meta: Meta<typeof Drawer> = {
  title: 'UI/Drawer',
  component: Drawer,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs']
}

export default meta
type Story = StoryObj<typeof meta>

export const Basic: Story = {
  render: function BasicDrawerExample() {
    const [open, setOpen] = useState(false)

    return (
      <div>
        <Button onClick={() => setOpen(true)}>Open Drawer</Button>
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Basic Drawer</DrawerTitle>
            </DrawerHeader>
            <DrawerBody>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  This is a basic drawer component. It slides in from the right side of the screen.
                </p>
                <div className="space-y-2">
                  <Label>Sample Input</Label>
                  <Input placeholder="Enter some text..." />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea placeholder="Add a description..." rows={3} />
                </div>
              </div>
            </DrawerBody>
            <DrawerFooter>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setOpen(false)}>
                  Save
                </Button>
              </div>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </div>
    )
  }
}

export const UserProfileDrawer: Story = {
  render: function UserProfileDrawerExample() {
    const [open, setOpen] = useState(false)

    return (
      <div>
        <Button onClick={() => setOpen(true)}>
          <UserIcon className="h-4 w-4 mr-2" />
          View Profile
        </Button>
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>User Profile</DrawerTitle>
            </DrawerHeader>
            <DrawerBody>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white font-semibold text-xl">
                    JD
                  </div>
                  <div>
                    <h3 className="font-semibold">John Doe</h3>
                    <p className="text-sm text-muted-foreground">john.doe@company.com</p>
                    <Badge variant="secondary" className="mt-1">Administrator</Badge>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">PERSONAL INFORMATION</Label>
                    <div className="mt-2 space-y-3">
                      <div className="grid grid-cols-3 gap-1">
                        <span className="text-sm text-muted-foreground">Name:</span>
                        <span className="text-sm col-span-2">John Doe</span>
                      </div>
                      <div className="grid grid-cols-3 gap-1">
                        <span className="text-sm text-muted-foreground">Email:</span>
                        <span className="text-sm col-span-2">john.doe@company.com</span>
                      </div>
                      <div className="grid grid-cols-3 gap-1">
                        <span className="text-sm text-muted-foreground">Department:</span>
                        <span className="text-sm col-span-2">Engineering</span>
                      </div>
                      <div className="grid grid-cols-3 gap-1">
                        <span className="text-sm text-muted-foreground">Joined:</span>
                        <span className="text-sm col-span-2">March 15, 2023</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">ACTIVITY SUMMARY</Label>
                    <div className="mt-2 space-y-3">
                      <div className="grid grid-cols-3 gap-1">
                        <span className="text-sm text-muted-foreground">Last Login:</span>
                        <span className="text-sm col-span-2">2 hours ago</span>
                      </div>
                      <div className="grid grid-cols-3 gap-1">
                        <span className="text-sm text-muted-foreground">Sessions:</span>
                        <span className="text-sm col-span-2">247 total</span>
                      </div>
                      <div className="grid grid-cols-3 gap-1">
                        <span className="text-sm text-muted-foreground">Logs Created:</span>
                        <span className="text-sm col-span-2">1,234 entries</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </DrawerBody>
            <DrawerFooter>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  Edit Profile
                </Button>
                <Button variant="outline" size="sm">
                  View Activity
                </Button>
              </div>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </div>
    )
  }
}

export const LogFiltersDrawer: Story = {
  render: function LogFiltersDrawerExample() {
    const [open, setOpen] = useState(false)

    return (
      <div>
        <Button variant="outline" onClick={() => setOpen(true)}>
          <FilterIcon className="h-4 w-4 mr-2" />
          Advanced Filters
        </Button>
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Log Filters</DrawerTitle>
            </DrawerHeader>
            <DrawerBody>
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label>Date Range</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">From</Label>
                      <Input type="date" />
                    </div>
                    <div>
                      <Label className="text-xs">To</Label>
                      <Input type="date" />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Severity Level</Label>
                  <div className="space-y-2">
                    {['DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL'].map((level) => (
                      <label key={level} className="flex items-center gap-2">
                        <input type="checkbox" className="rounded" defaultChecked={level !== 'DEBUG'} />
                        <span className="text-sm">{level}</span>
                        <Badge variant={level === 'ERROR' || level === 'CRITICAL' ? 'destructive' : 'secondary'} className="ml-auto text-xs">
                          {level === 'INFO' ? '1.2k' : level === 'ERROR' ? '234' : level === 'WARNING' ? '45' : '12'}
                        </Badge>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Source</Label>
                  <Input placeholder="Filter by source (e.g., api-server)" />
                </div>

                <div className="space-y-3">
                  <Label>Message Contains</Label>
                  <Input placeholder="Search in log messages..." />
                </div>

                <div className="space-y-3">
                  <Label>Thread ID</Label>
                  <Input placeholder="Filter by thread ID" />
                </div>

                <div className="space-y-3">
                  <Label>Custom Query</Label>
                  <Textarea
                    placeholder="Enter custom search query..."
                    rows={3}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Use SQL-like syntax for advanced filtering
                  </p>
                </div>
              </div>
            </DrawerBody>
            <DrawerFooter>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  Reset Filters
                </Button>
                <Button size="sm" onClick={() => setOpen(false)}>
                  Apply Filters
                </Button>
              </div>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </div>
    )
  }
}

export const LogDetailsDrawer: Story = {
  render: function LogDetailsDrawerExample() {
    const [open, setOpen] = useState(false)

    return (
      <div>
        <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
          <FileTextIcon className="h-4 w-4 mr-2" />
          View Log Details
        </Button>
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Log Entry #12345</DrawerTitle>
            </DrawerHeader>
            <DrawerBody>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">TIMESTAMP</Label>
                    <p className="text-sm font-mono mt-1">2024-01-15 14:32:18.245</p>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">SEVERITY</Label>
                    <div className="mt-1">
                      <Badge variant="destructive">ERROR</Badge>
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">SOURCE</Label>
                    <p className="text-sm font-mono mt-1">api-gateway</p>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">THREAD</Label>
                    <p className="text-sm font-mono mt-1">http-nio-8080-exec-2</p>
                  </div>
                </div>

                <div>
                  <Label className="text-xs font-medium text-muted-foreground">MESSAGE</Label>
                  <div className="mt-2 p-3 bg-muted rounded-lg">
                    <p className="text-sm font-mono">
                      Failed to connect to database: Connection timeout after 30000ms
                    </p>
                  </div>
                </div>

                <div>
                  <Label className="text-xs font-medium text-muted-foreground">REQUEST DETAILS</Label>
                  <div className="mt-2 space-y-2">
                    <div className="grid grid-cols-3 gap-1 text-sm">
                      <span className="text-muted-foreground">Method:</span>
                      <span className="col-span-2 font-mono">POST</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1 text-sm">
                      <span className="text-muted-foreground">Endpoint:</span>
                      <span className="col-span-2 font-mono">/api/v1/users</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1 text-sm">
                      <span className="text-muted-foreground">User ID:</span>
                      <span className="col-span-2 font-mono">usr_abc123</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1 text-sm">
                      <span className="text-muted-foreground">IP Address:</span>
                      <span className="col-span-2 font-mono">192.168.1.100</span>
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-xs font-medium text-muted-foreground">STACK TRACE</Label>
                  <div className="mt-2 p-3 bg-muted rounded-lg max-h-48 overflow-y-auto">
                    <pre className="text-xs font-mono text-muted-foreground whitespace-pre-wrap">
{`java.sql.SQLException: Connection timeout
    at com.example.db.ConnectionPool.getConnection(ConnectionPool.java:245)
    at com.example.service.UserService.findById(UserService.java:82)
    at com.example.controller.UserController.getUser(UserController.java:45)
    at java.base/java.lang.reflect.Method.invoke(Method.java:568)
    at org.springframework.web.method.support.InvocableHandlerMethod.doInvoke(InvocableHandlerMethod.java:205)
    at org.springframework.web.method.support.InvocableHandlerMethod.invokeForRequest(InvocableHandlerMethod.java:150)
    at org.springframework.web.servlet.mvc.method.annotation.ServletInvocableHandlerMethod.invokeAndHandle(ServletInvocableHandlerMethod.java:117)`}
                    </pre>
                  </div>
                </div>

                <div>
                  <Label className="text-xs font-medium text-muted-foreground">RELATED LOGS</Label>
                  <div className="mt-2 space-y-2">
                    {[
                      { id: '12344', message: 'Database connection pool exhausted', time: '14:32:15' },
                      { id: '12346', message: 'Retry attempt failed', time: '14:32:20' },
                      { id: '12347', message: 'Fallback service activated', time: '14:32:22' }
                    ].map((log) => (
                      <div key={log.id} className="p-2 border rounded text-sm">
                        <div className="flex justify-between items-start">
                          <span className="font-mono text-xs text-muted-foreground">#{log.id}</span>
                          <span className="font-mono text-xs text-muted-foreground">{log.time}</span>
                        </div>
                        <p className="text-sm mt-1">{log.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </DrawerBody>
            <DrawerFooter>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  Export
                </Button>
                <Button variant="outline" size="sm">
                  Mark as Resolved
                </Button>
              </div>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </div>
    )
  }
}

export const SettingsDrawer: Story = {
  render: function SettingsDrawerExample() {
    const [open, setOpen] = useState(false)

    return (
      <div>
        <Button variant="outline" onClick={() => setOpen(true)}>
          <SettingsIcon className="h-4 w-4 mr-2" />
          Settings
        </Button>
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Application Settings</DrawerTitle>
            </DrawerHeader>
            <DrawerBody>
              <div className="space-y-6">
                <div>
                  <Label className="text-sm font-medium">General Settings</Label>
                  <div className="mt-3 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm">Auto-refresh logs</p>
                        <p className="text-xs text-muted-foreground">Automatically refresh log data every 30 seconds</p>
                      </div>
                      <input type="checkbox" className="rounded" defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm">Show timestamps</p>
                        <p className="text-xs text-muted-foreground">Display full timestamp in log entries</p>
                      </div>
                      <input type="checkbox" className="rounded" defaultChecked />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm">Compact view</p>
                        <p className="text-xs text-muted-foreground">Use condensed layout for more logs per page</p>
                      </div>
                      <input type="checkbox" className="rounded" />
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Notifications</Label>
                  <div className="mt-3 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm">Critical alerts</p>
                        <p className="text-xs text-muted-foreground">Get notified of critical errors</p>
                      </div>
                      <input type="checkbox" className="rounded" defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm">Email notifications</p>
                        <p className="text-xs text-muted-foreground">Send alerts via email</p>
                      </div>
                      <input type="checkbox" className="rounded" />
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Performance</Label>
                  <div className="mt-3 space-y-4">
                    <div>
                      <Label className="text-xs">Logs per page</Label>
                      <select className="w-full mt-1 px-3 py-2 border rounded-md text-sm">
                        <option>25</option>
                        <option>50</option>
                        <option>100</option>
                        <option>200</option>
                      </select>
                    </div>

                    <div>
                      <Label className="text-xs">Auto-refresh interval</Label>
                      <select className="w-full mt-1 px-3 py-2 border rounded-md text-sm">
                        <option>15 seconds</option>
                        <option>30 seconds</option>
                        <option>1 minute</option>
                        <option>5 minutes</option>
                        <option>Disabled</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </DrawerBody>
            <DrawerFooter>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setOpen(false)}>
                  Save Changes
                </Button>
              </div>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </div>
    )
  }
}

export const NotificationDrawer: Story = {
  render: function NotificationDrawerExample() {
    const [open, setOpen] = useState(false)

    return (
      <div>
        <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
          <BellIcon className="h-4 w-4 mr-2" />
          Notifications
          <Badge variant="destructive" className="ml-2 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center">
            3
          </Badge>
        </Button>
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Notifications</DrawerTitle>
            </DrawerHeader>
            <DrawerBody>
              <div className="space-y-4">
                {[
                  {
                    id: 1,
                    type: 'error',
                    title: 'Database Connection Failed',
                    message: 'Multiple connection timeouts detected in production',
                    time: '2 minutes ago',
                    unread: true
                  },
                  {
                    id: 2,
                    type: 'warning',
                    title: 'High Memory Usage',
                    message: 'API server memory usage above 85% threshold',
                    time: '15 minutes ago',
                    unread: true
                  },
                  {
                    id: 3,
                    type: 'info',
                    title: 'Deployment Complete',
                    message: 'Version 2.1.4 successfully deployed to production',
                    time: '1 hour ago',
                    unread: false
                  },
                  {
                    id: 4,
                    type: 'error',
                    title: 'Authentication Service Down',
                    message: 'Auth service not responding to health checks',
                    time: '2 hours ago',
                    unread: true
                  }
                ].map((notification) => (
                  <div key={notification.id} className={`p-4 border rounded-lg ${notification.unread ? 'bg-accent/50' : ''}`}>
                    <div className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        notification.type === 'error' ? 'bg-red-500' :
                        notification.type === 'warning' ? 'bg-yellow-500' :
                        'bg-blue-500'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className={`text-sm font-medium ${notification.unread ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {notification.title}
                          </h4>
                          {notification.unread && (
                            <div className="w-2 h-2 bg-primary rounded-full" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {notification.time}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </DrawerBody>
            <DrawerFooter>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  Mark All Read
                </Button>
                <Button size="sm">
                  View All
                </Button>
              </div>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </div>
    )
  }
}