"use client"

import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import type { Task, TaskCategory, TaskDuration, TaskLocation, Tag } from "@/lib/types"
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
import { PlusCircle, Tag as TagIcon } from "lucide-react"

const formSchema = z.object({
  description: z.string().min(3, {
    message: "La descrizione deve contenere almeno 3 caratteri.",
  }),
  duration: z.coerce.number().refine(val => taskDurations.includes(val as TaskDuration)),
  category: z.enum(taskCategories),
  location: z.enum(taskLocations),
  tagId: z.string().optional(),
})

type ActivityLoggerFormValues = z.infer<typeof formSchema>;

interface ActivityLoggerProps {
  onAddTask: (task: Omit<Task, "id" | "timestamp" | "tag">) => void
  tags: Tag[]
  setTags: React.Dispatch<React.SetStateAction<Tag[]>>
}

const formatDurationLabel = (minutes: TaskDuration) => {
  if (minutes === 480) return "Tutto il giorno (8 ore)";
  if (minutes === 240) return "Metà giornata (4 ore)";
  if (minutes === 60) return "1 ora";
  if (minutes === 30) return "30 minuti";
  return `${minutes} min`;
}

export function ActivityLogger({ onAddTask, tags }: ActivityLoggerProps) {
  const form = useForm<ActivityLoggerFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      duration: 30,
      category: "Sviluppo",
      location: "Smart Working",
      tagId: "manual"
    },
  })

  function onSubmit(values: ActivityLoggerFormValues) {
    const { tagId, ...rest } = values;
    const taskData = { ...rest, tagId: tagId === "manual" ? undefined : tagId };
    onAddTask(taskData)
    form.reset({
        ...form.getValues(),
        description: "",
        tagId: "manual",
    });
  }

  const handleTagChange = (tagId: string) => {
    form.setValue("tagId", tagId);
    if (tagId === "manual") {
      form.reset({
        description: "",
        duration: 30,
        category: "Sviluppo",
        location: "Smart Working",
        tagId: "manual",
      });
    } else {
      const selectedTag = tags.find(t => t.id === tagId);
      if (selectedTag) {
        form.setValue("category", selectedTag.category);
        form.setValue("description", selectedTag.name);
      }
    }
  }


  return (
    <Card>
      <CardHeader>
        <CardTitle>Registra Nuova Attività</CardTitle>
        <CardDescription>Seleziona un tag o documenta manualmente un'attività.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
             <Controller
              control={form.control}
              name="tagId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tag Attività (Opzionale)</FormLabel>
                  <Select onValueChange={handleTagChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleziona un tag per compilare..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="manual">
                        <div className="flex items-center gap-2">
                            <TagIcon className="h-4 w-4" />
                            <span>Inserimento Manuale</span>
                        </div>
                      </SelectItem>
                      {tags.map((tag) => (
                        <SelectItem key={tag.id} value={tag.id}>
                          <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: tag.color }}></span>
                            <span>{tag.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

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
                    <Select onValueChange={field.onChange} value={field.value}>
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
                     <Select onValueChange={(value) => field.onChange(Number(value))} value={String(field.value)}>
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
                    <Select onValueChange={field.onChange} value={field.value}>
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
