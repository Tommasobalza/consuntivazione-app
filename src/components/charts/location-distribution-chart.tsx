"use client"

import { useMemo } from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts"
import type { Task, TaskLocation } from "@/lib/types"
import { locationConfig, taskLocations } from "@/lib/types"
import {
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart"

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

const locationColors: { [key in TaskLocation]: string } = {
  'Smart Working': 'hsl(var(--chart-2))',
  'Sede': 'hsl(var(--chart-1))',
  'External': 'hsl(var(--chart-3))',
};

export function LocationDistributionChart({ tasks }: LocationDistributionChartProps) {
  const chartData = useMemo(() => {
    const locationMap = new Map<string, number>()
    tasks.forEach((task) => {
      locationMap.set(
        task.location,
        (locationMap.get(task.location) || 0) + task.duration
      )
    });
    
    const data = taskLocations.map(location => ({
        name: location,
        value: locationMap.get(location) || 0,
        fill: locationColors[location],
    }));

    return data.filter(d => d.value > 0);
  }, [tasks])

  if (tasks.length === 0 || chartData.length === 0) {
    return (
      <div className="flex h-[250px] w-full items-center justify-center text-muted-foreground">
        Nessun dato per i filtri selezionati.
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
