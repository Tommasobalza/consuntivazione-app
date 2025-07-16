"use client"

import type { Task } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, ListChecks, BrainCircuit } from "lucide-react"
import { useMemo } from "react"

interface SummaryCardsProps {
  tasks: Task[]
}

const formatTotalDuration = (totalMinutes: number) => {
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return `${hours}h ${minutes}m`
}

export function SummaryCards({ tasks }: SummaryCardsProps) {
  const { totalDuration, taskCount, uniqueCategories } = useMemo(() => {
    const totalDuration = tasks.reduce((sum, task) => sum + task.duration, 0)
    const taskCount = tasks.length
    const uniqueCategories = new Set(tasks.map(task => task.category)).size
    return { totalDuration, taskCount, uniqueCategories }
  }, [tasks])

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tempo Totale Registrato</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatTotalDuration(totalDuration)}</div>
          <p className="text-xs text-muted-foreground">Registrato per oggi</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Attività Completate</CardTitle>
          <ListChecks className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{taskCount}</div>
          <p className="text-xs text-muted-foreground">Attività registrate</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Aree di Focus</CardTitle>
          <BrainCircuit className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{uniqueCategories}</div>
          <p className="text-xs text-muted-foreground">Categorie uniche di lavoro</p>
        </CardContent>
      </Card>
    </div>
  )
}
