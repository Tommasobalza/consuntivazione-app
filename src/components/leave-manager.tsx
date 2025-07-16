
"use client"

import * as React from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { format, isSameDay, startOfDay } from "date-fns"
import { it } from "date-fns/locale"
import { Calendar as CalendarIcon, Trash2 } from "lucide-react"

import { cn } from "@/lib/utils"
import type { LeaveDay, LeaveType } from "@/lib/types"
import { leaveTypes } from "@/lib/types"
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
})

type LeaveFormValues = z.infer<typeof leaveFormSchema>

interface LeaveManagerProps {
  leaveDays: LeaveDay[]
  setLeaveDays: React.Dispatch<React.SetStateAction<LeaveDay[]>>
}

export function LeaveManager({ leaveDays, setLeaveDays }: LeaveManagerProps) {
  const { toast } = useToast()
  const form = useForm<LeaveFormValues>({
    resolver: zodResolver(leaveFormSchema),
  })

  function onSubmit(data: LeaveFormValues) {
    const newLeaveDay: LeaveDay = {
      date: startOfDay(data.date).toISOString(),
      type: data.type,
    }

    if (leaveDays.some(d => isSameDay(new Date(d.date), new Date(newLeaveDay.date)))) {
      toast({
        title: "Giorno già registrato",
        description: "Hai già registrato un'assenza per questo giorno.",
        variant: "destructive",
      })
      return
    }

    setLeaveDays([...leaveDays, newLeaveDay].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()))
    toast({
      title: "Assenza registrata",
      description: `Giorno di ${data.type} aggiunto per il ${format(data.date, "PPP", { locale: it })}.`,
    })
    form.reset({ date: undefined, type: undefined })
  }
  
  const handleDelete = (date: string) => {
    setLeaveDays(leaveDays.filter(d => d.date !== date));
     toast({
      title: "Assenza rimossa",
      description: "Il giorno di assenza è stato rimosso con successo.",
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestione Assenze</CardTitle>
        <CardDescription>
          Aggiungi giorni di ferie, malattia o festività.
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
                    <Button type="submit">Aggiungi Assenza</Button>
                </form>
                </Form>
            </div>
             <div>
                <h3 className="text-sm font-medium mb-2">Giorni di assenza registrati</h3>
                 <ScrollArea className="h-48 pr-4">
                    {leaveDays.length > 0 ? (
                        <div className="space-y-2">
                        {leaveDays.map((day) => (
                            <div key={day.date} className="flex items-center justify-between text-sm border p-2 rounded-md">
                            <div>
                                <p className="font-medium">{format(new Date(day.date), "d MMMM yyyy", { locale: it })}</p>
                                <p className="text-xs text-muted-foreground">{day.type}</p>
                            </div>
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDelete(day.date)}>
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

    