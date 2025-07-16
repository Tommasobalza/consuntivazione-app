"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import type { Task, TaskCategory, TaskDuration, TaskLocation } from "@/lib/types"
import { taskCategories, categoryConfig, taskDurations, taskLocations, locationConfig } from "@/lib/types"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
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
    message: "La descrizione deve contenere almeno 3 caratteri.",
  }),
  duration: z.coerce.number().refine(val => taskDurations.includes(val as TaskDuration)),
  category: z.enum(taskCategories),
  location: z.enum(taskLocations),
})

interface ActivityLoggerProps {
  onAddTask: (task: Omit<Task, "id" | "timestamp">) => void
}

const formatDurationLabel = (minutes: TaskDuration) => {
  if (minutes === 480) return "Tutto il giorno (8 ore)";
  if (minutes === 240) return "Metà giornata (4 ore)";
  if (minutes === 60) return "1 ora";
  if (minutes === 30) return "30 minuti";
  return `${minutes} min`;
}

export function ActivityLogger({ onAddTask }: ActivityLoggerProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      duration: 30,
      category: "Sviluppo",
      location: "Smart Working",
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    onAddTask(values)
    form.reset()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registra Nuova Attività</CardTitle>
        <CardDescription>Documenta il tempo che hai dedicato a un'attività.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrizione Attività</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Es: Implementata la nuova funzionalità della dashboard" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleziona una categoria" />
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
               <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Durata</FormLabel>
                     <Select onValueChange={(value) => field.onChange(Number(value))} defaultValue={String(field.value)}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleziona una durata" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {taskDurations.map((duration) => (
                          <SelectItem key={duration} value={String(duration)}>
                            {formatDurationLabel(duration)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
             <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Località</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleziona una località" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {taskLocations.map((location) => {
                           const Icon = locationConfig[location as TaskLocation].icon;
                          return (
                            <SelectItem key={location} value={location}>
                               <div className="flex items-center gap-2">
                                <Icon className="h-4 w-4" />
                                {location}
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
            <Button type="submit" className="w-full sm:w-auto">
              <PlusCircle className="mr-2 h-4 w-4" />
              Aggiungi Attività
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
