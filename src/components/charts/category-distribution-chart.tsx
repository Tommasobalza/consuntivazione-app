"use client"

import { useMemo } from "react"
import { Pie, PieChart, Tooltip } from "recharts"
import type { Task } from "@/lib/types"
import { categoryConfig } from "@/lib/types"
import {
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart"

interface CategoryDistributionChartProps {
  tasks: Task[]
}

export function CategoryDistributionChart({ tasks }: CategoryDistributionChartProps) {
  const chartData = useMemo(() => {
    const categoryMap = new Map<string, number>()
    tasks.forEach((task) => {
      categoryMap.set(
        task.category,
        (categoryMap.get(task.category) || 0) + task.duration
      )
    })
    return Array.from(categoryMap.entries()).map(([name, value]) => ({
      name,
      value,
      fill: categoryConfig[name as keyof typeof categoryConfig].color,
    }))
  }, [tasks])

  if (tasks.length === 0) {
    return (
      <div className="flex h-[250px] w-full items-center justify-center text-muted-foreground">
        Nessun dato per i filtri selezionati.
      </div>
    )
  }

  return (
    <ChartContainer config={{}} className="mx-auto aspect-square h-[250px]">
      <PieChart>
        <Tooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel indicator="dot" />}
        />
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="name"
          innerRadius={60}
          strokeWidth={5}
        />
      </PieChart>
    </ChartContainer>
  )
}
