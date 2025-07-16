
"use client"

import * as React from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { format, isSameDay, startOfDay } from "date-fns"
import { it } from "date-fns/locale"
import { Calendar as CalendarIcon, Trash2 } from "lucide-react"

import { cn } from "@/lib/utils"
import type { LeaveDay, LeaveDuration, LeaveType, Task } from "@/lib/types"
import { leaveTypes, leaveDurations } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { ScrollArea } from "./ui/scroll-area"

const leaveFormSchema = z.object({
  date: z.date({
    required_error: "È richiesta una data.",
  }),
  type: z.enum(leaveTypes, {
    required_error: "È richiesto un tipo di assenza.",
  }),
  duration: z.coerce.number().refine(val => leaveDurations.includes(val as LeaveDuration), {
    message: "Seleziona una durata valida."
  }),
})

type LeaveFormValues = z.infer<typeof leaveFormSchema>

interface LeaveManagerProps {
  leaveDays: LeaveDay[]
  setLeaveDays: React.Dispatch<React.SetStateAction<LeaveDay[]>>
  tasks: Task[];
}

const formatDurationLabel = (minutes: LeaveDuration) => {
  if (minutes === 480) return "Tutto il giorno (8 ore)";
  if (minutes === 240) return "Metà giornata (4 ore)";
  return `${minutes / 60} ore`;
}

const MAX_DURATION_PER_DAY = 480;

export function LeaveManager({ leaveDays, setLeaveDays, tasks }: LeaveManagerProps) {
  const { toast } = useToast()
  const form = useForm<LeaveFormValues>({
    resolver: zodResolver(leaveFormSchema),
    defaultValues: {
      duration: 480,
    }
  })

  function onSubmit(data: LeaveFormValues) {
    const dayDate = startOfDay(data.date);
    
    const tasksOnDay = tasks.filter(t => isSameDay(new Date(t.timestamp), dayDate));
    const tasksDuration = tasksOnDay.reduce((sum, t) => sum + t.duration, 0);

    const leaveOnDay = leaveDays.filter(d => isSameDay(new Date(d.date), dayDate));
    const leaveDuration = leaveOnDay.reduce((sum, d) => sum + d.duration, 0);
    
    if (tasksDuration + leaveDuration + data.duration > MAX_DURATION_PER_DAY) {
       toast({
        title: "Limite giornaliero superato",
        description: "La somma di attività e assenze non può superare le 8 ore giornaliere.",
        variant: "destructive",
      })
      return;
    }

    const newLeaveDay: LeaveDay = {
      date: dayDate.toISOString(),
      type: data.type,
      duration: data.duration as LeaveDuration
    }

    setLeaveDays([...leaveDays, newLeaveDay].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()))
    toast({
      title: "Assenza registrata",
      description: `Giorno di ${data.type} aggiunto per il ${format(data.date, "PPP", { locale: it })}.`,
    })
    form.reset({ date: undefined, type: undefined, duration: 480 })
  }
  
  const handleDelete = (date: string, duration: number, type: LeaveType) => {
    const indexToRemove = leaveDays.findIndex(d => d.date === date && d.duration === duration && d.type === type);
    if (indexToRemove > -1) {
      const newLeaveDays = [...leaveDays];
      newLeaveDays.splice(indexToRemove, 1);
      setLeaveDays(newLeaveDays);
       toast({
        title: "Assenza rimossa",
        description: "Il giorno di assenza è stato rimosso con successo.",
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestione Out Of Office</CardTitle>
        <CardDescription>
          Aggiungi giorni di ferie, malattia o festività, specificando la durata.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                          <FormItem className="flex flex-col">
                          <FormLabel>Data</FormLabel>
                          <Popover>
                              <PopoverTrigger asChild>
                              <FormControl>
                                  <Button
                                  variant={"outline"}
                                  className={cn(
                                      "pl-3 text-left font-normal",
                                      !field.value && "text-muted-foreground"
                                  )}
                                  >
                                  {field.value ? (
                                      format(field.value, "PPP", { locale: it })
                                  ) : (
                                      <span>Seleziona una data</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                              </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  disabled={(date) => date < new Date("2020-01-01")}
                                  initialFocus
                                  locale={it}
                              />
                              </PopoverContent>
                          </Popover>
                          <FormMessage />
                          </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                          <FormItem>
                          <FormLabel>Tipo di Assenza</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                              <SelectTrigger>
                                  <SelectValue placeholder="Seleziona un tipo" />
                              </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                              {leaveTypes.map((type) => (
                                  <SelectItem key={type} value={type}>
                                  {type}
                                  </SelectItem>
                              ))}
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
                              {leaveDurations.map((duration) => (
                                <SelectItem key={duration} value={String(duration)}>
                                  {formatDurationLabel(duration as LeaveDuration)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit">Aggiungi Assenza</Button>
                </form>
                </Form>
            </div>
             <div>
                <h3 className="text-sm font-medium mb-2">Giorni di assenza registrati</h3>
                 <ScrollArea className="h-48 pr-4">
                    {leaveDays.length > 0 ? (
                        <div className="space-y-2">
                        {leaveDays.map((day, index) => (
                            <div key={`${day.date}-${index}`} className="flex items-center justify-between text-sm border p-2 rounded-md">
                            <div>
                                <p className="font-medium">{format(new Date(day.date), "d MMMM yyyy", { locale: it })}</p>
                                <p className="text-xs text-muted-foreground">{day.type} - {formatDurationLabel(day.duration)}</p>
                            </div>
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDelete(day.date, day.duration, day.type)}>
                                <Trash2 className="w-4 h-4" />
                            </Button>
                            </div>
                        ))}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground text-center pt-8">Nessun giorno di assenza registrato.</p>
                    )}
                 </ScrollArea>
            </div>
        </div>
      </CardContent>
    </Card>
  )
}
