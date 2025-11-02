import type { Meta, StoryObj } from '@storybook/nextjs'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage
} from '../form'
import { FormFieldWrapper } from '../form-field'
import { Input } from '../input'
import { Textarea } from '../textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../select'
import { Button } from '../button'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const meta: Meta<typeof Form> = {
  title: 'UI/Form',
  component: Form,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs']
}

export default meta
type Story = StoryObj<typeof meta>

// Schema definitions for react-hook-form examples
const loginFormSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters.' })
})

const profileFormSchema = z.object({
  firstName: z.string().min(1, { message: 'First name is required.' }),
  lastName: z.string().min(1, { message: 'Last name is required.' }),
  bio: z
    .string()
    .max(500, { message: 'Bio must be 500 characters or less.' })
    .optional(),
  role: z.string().min(1, { message: 'Please select a role.' })
})

// React Hook Form Examples
export const ReactHookFormLogin: Story = {
  render: function ReactHookFormLoginExample() {
    const form = useForm<z.infer<typeof loginFormSchema>>({
      resolver: zodResolver(loginFormSchema),
      defaultValues: {
        email: '',
        password: ''
      }
    })

    function onSubmit(values: z.infer<typeof loginFormSchema>) {
      console.log('Login form submitted:', values)
    }

    return (
      <div className="w-full max-w-sm mx-auto">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-semibold">Sign In</h2>
          <p className="text-muted-foreground">
            Enter your credentials to access your account
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="name@example.com"
                      type="email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your password"
                      type="password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full">
              Sign In
            </Button>
          </form>
        </Form>
      </div>
    )
  }
}

export const ReactHookFormProfile: Story = {
  render: function ReactHookFormProfileExample() {
    const form = useForm<z.infer<typeof profileFormSchema>>({
      resolver: zodResolver(profileFormSchema),
      defaultValues: {
        firstName: '',
        lastName: '',
        bio: '',
        role: ''
      }
    })

    function onSubmit(values: z.infer<typeof profileFormSchema>) {
      console.log('Profile form submitted:', values)
    }

    return (
      <div className="w-full max-w-2xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold">Profile Settings</h2>
          <p className="text-muted-foreground">
            Update your profile information
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="admin">Administrator</SelectItem>
                      <SelectItem value="developer">Developer</SelectItem>
                      <SelectItem value="analyst">Analyst</SelectItem>
                      <SelectItem value="viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Choose your role in the organization.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell us about yourself..."
                      className="resize-none min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Brief description about yourself. Maximum 500 characters.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-4">
              <Button variant="outline" type="button">
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </Form>
      </div>
    )
  }
}

// FormFieldWrapper Examples (existing pattern)
export const FormFieldWrapperExample: Story = {
  render: () => (
    <div className="space-y-6 w-96">
      <FormFieldWrapper
        label="Email Address"
        required
        description="We'll never share your email with anyone else."
      >
        <Input type="email" placeholder="Enter your email" />
      </FormFieldWrapper>

      <FormFieldWrapper
        label="Password"
        required
        errors={['Password must be at least 8 characters']}
      >
        <Input
          type="password"
          placeholder="Enter password"
          className="border-destructive"
        />
      </FormFieldWrapper>

      <FormFieldWrapper
        label="Bio"
        description="Tell us a little about yourself."
      >
        <Textarea placeholder="Write your bio..." rows={3} />
      </FormFieldWrapper>

      <FormFieldWrapper label="Country" required>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select country" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="us">United States</SelectItem>
            <SelectItem value="uk">United Kingdom</SelectItem>
            <SelectItem value="ca">Canada</SelectItem>
          </SelectContent>
        </Select>
      </FormFieldWrapper>
    </div>
  )
}

export const LogCreationForm: Story = {
  render: () => (
    <form className="space-y-6 w-[500px]">
      <h2 className="text-2xl font-bold">Create New Log Entry</h2>

      <FormFieldWrapper
        label="Severity Level"
        required
        description="Select the appropriate severity level for this log entry"
      >
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select severity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="debug">DEBUG</SelectItem>
            <SelectItem value="info">INFO</SelectItem>
            <SelectItem value="warning">WARNING</SelectItem>
            <SelectItem value="error">ERROR</SelectItem>
            <SelectItem value="critical">CRITICAL</SelectItem>
          </SelectContent>
        </Select>
      </FormFieldWrapper>

      <FormFieldWrapper
        label="Log Source"
        required
        description="The system or component that generated this log"
      >
        <Input placeholder="e.g., api-server, database, auth-service" />
      </FormFieldWrapper>

      <FormFieldWrapper
        label="Log Message"
        required
        description="Detailed description of what happened"
      >
        <Textarea placeholder="Enter the detailed log message..." rows={4} />
      </FormFieldWrapper>

      <FormFieldWrapper
        label="Timestamp"
        description="Leave empty to use current time"
      >
        <Input type="datetime-local" />
      </FormFieldWrapper>

      <div className="flex gap-2 pt-4">
        <Button type="submit">Create Log Entry</Button>
        <Button type="button" variant="outline">
          Cancel
        </Button>
      </div>
    </form>
  )
}
