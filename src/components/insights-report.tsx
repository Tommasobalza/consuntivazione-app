"use client"

import { useState, useTransition } from "react"
import type { Task } from "@/lib/types"
import { generateInsightsReport } from "@/ai/flows/generate-insights-report"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { Lightbulb, Loader2 } from "lucide-react"

interface InsightsReportProps {
  tasks: Task[]
}

export function InsightsReport({ tasks }: InsightsReportProps) {
  const [isPending, startTransition] = useTransition()
  const [report, setReport] = useState<string | null>(null)
  const { toast } = useToast()

  const handleGenerateReport = () => {
    startTransition(async () => {
      if (tasks.length === 0) {
        toast({
          title: "No tasks to analyze",
          description: "Please log some activities before generating a report.",
          variant: "destructive",
        })
        return
      }

      try {
        const dailyLogs = tasks
          .map(
            (task) => `- ${task.duration} minutes on '${task.category}': ${task.description}`
          )
          .join("\n")

        const result = await generateInsightsReport({ dailyLogs })
        setReport(result.insights)
      } catch (error) {
        console.error("Failed to generate report:", error)
        toast({
          title: "Error Generating Report",
          description: "An unexpected error occurred. Please try again later.",
          variant: "destructive",
        })
        setReport(null)
      }
    })
  }

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>AI-Powered Insights</CardTitle>
        <CardDescription>Generate a report to find patterns in your work.</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        {report ? (
          <Alert>
            <Lightbulb className="h-4 w-4" />
            <AlertTitle>Your Insights Report</AlertTitle>
            <AlertDescription className="whitespace-pre-wrap font-mono text-xs">
              {report}
            </AlertDescription>
          </Alert>
        ) : (
          <div className="flex items-center justify-center text-sm text-muted-foreground h-full">
            <p>Your generated report will appear here.</p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleGenerateReport} disabled={isPending || tasks.length === 0} className="w-full">
          {isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Lightbulb className="mr-2 h-4 w-4" />
          )}
          {isPending ? "Generating..." : "Generate Report"}
        </Button>
      </CardFooter>
    </Card>
  )
}
