"use client"

import { useState, useTransition, useEffect } from "react"
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

  useEffect(() => {
    setReport(null);
  }, [tasks]);

  const handleGenerateReport = () => {
    startTransition(async () => {
      if (tasks.length === 0) {
        toast({
          title: "Nessuna attività da analizzare",
          description: "Nessuna attività trovata per i filtri selezionati.",
          variant: "destructive",
        })
        return
      }

      try {
        const dailyLogs = tasks
          .map(
            (task) => `- ${task.duration} minuti su '${task.category}' (${task.location}): ${task.name}`
          )
          .join("\n")

        const result = await generateInsightsReport({ dailyLogs })
        setReport(result.insights)
      } catch (error) {
        console.error("Errore nella generazione del report:", error)
        toast({
          title: "Errore durante la generazione del Report",
          description: "Si è verificato un errore inaspettato. Riprova più tardi.",
          variant: "destructive",
        })
        setReport(null)
      }
    })
  }

  return (
    <Card className="flex flex-col min-h-[300px]">
      <CardHeader>
        <CardTitle>Approfondimenti IA</CardTitle>
        <CardDescription>Genera un report per scoprire pattern nel tuo lavoro in base ai filtri selezionati.</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        {report ? (
          <Alert>
            <Lightbulb className="h-4 w-4" />
            <AlertTitle>Il tuo Report di Approfondimenti</AlertTitle>
            <AlertDescription className="whitespace-pre-wrap font-mono text-xs">
              {report}
            </AlertDescription>
          </Alert>
        ) : (
          <div className="flex items-center justify-center text-sm text-muted-foreground h-full">
            <p>Il report generato apparirà qui.</p>
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
          {isPending ? "Generazione..." : "Genera Report"}
        </Button>
      </CardFooter>
    </Card>
  )
}
