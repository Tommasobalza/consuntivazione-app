"use client"

import { useMemo } from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts"
import type { Task } from "@/lib/types"
import { locationConfig } from "@/lib/types"
import {
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { CardDescription } from "../ui/card"

interface LocationDistributionChartProps {
  tasks: Task[]
}

const formatMinutes = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0 && mins > 0) {
        return `${hours}h ${mins}m`;
    }
    if (hours > 0) {
        return `${hours}h`;
    }
    return `${mins}m`;
}

export function LocationDistributionChart({ tasks }: LocationDistributionChartProps) {
  const chartData = useMemo(() => {
    const locationMap = new Map<string, number>()
    tasks.forEach((task) => {
      locationMap.set(
        task.location,
        (locationMap.get(task.location) || 0) + task.duration
      )
    });
    
    // Ensure both locations are always present in the data
    const data = Array.from(Object.keys(locationConfig)).map(location => ({
        name: location,
        value: locationMap.get(location) || 0,
        fill: location === 'Sede' ? 'hsl(var(--chart-1))' : 'hsl(var(--chart-2))',
    }));

    return data;
  }, [tasks])

  if (tasks.length === 0) {
    return (
      <div className="flex h-[250px] w-full items-center justify-center text-muted-foreground">
        Registra delle attività per vedere la distribuzione.
      </div>
    )
  }

  return (
    <ChartContainer config={{}} className="h-[250px] w-full">
      <BarChart 
        accessibilityLayer 
        data={chartData} 
        layout="vertical"
        margin={{ left: 10, right: 10 }}
      >
        <CartesianGrid horizontal={false} />
        <YAxis
          dataKey="name"
          type="category"
          tickLine={false}
          axisLine={false}
          tickMargin={10}
          width={80}
        />
        <XAxis dataKey="value" type="number" hide />
        <Tooltip
          cursor={{ fill: "hsl(var(--muted))" }}
          content={<ChartTooltipContent 
            formatter={(value) => formatMinutes(value as number)}
            indicator="dot" 
            />}
        />
        <Bar dataKey="value" radius={5} />
      </BarChart>
    </ChartContainer>
  )
}
