"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import type { Task, TaskCategory } from "@/lib/types"
import { taskCategories, categoryConfig } from "@/lib/types"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { PlusCircle } from "lucide-react"

const formSchema = z.object({
  description: z.string().min(3, {
    message: "Description must be at least 3 characters.",
  }),
  duration: z.coerce.number().min(1, { message: "Duration must be at least 1 minute." }),
  category: z.enum(taskCategories),
})

interface ActivityLoggerProps {
  onAddTask: (task: Omit<Task, "id" | "timestamp">) => void
}

export function ActivityLogger({ onAddTask }: ActivityLoggerProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      duration: 30,
      category: "Development",
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    onAddTask(values)
    form.reset()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Log New Activity</CardTitle>
        <CardDescription>Record the time you spent on a task.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Task Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="e.g., Implemented the new dashboard feature" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (minutes)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 60" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {taskCategories.map((category) => {
                          const Icon = categoryConfig[category as TaskCategory].icon;
                          return (
                            <SelectItem key={category} value={category}>
                              <div className="flex items-center gap-2">
                                <Icon className="h-4 w-4" />
                                {category}
                              </div>
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button type="submit" className="w-full sm:w-auto">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Activity
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
