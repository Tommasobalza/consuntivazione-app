
"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Copy, X } from "lucide-react"

interface CopyTasksCardProps {
  isCopying: boolean
  onToggleCopyMode: () => void
}

export function CopyTasksCard({ isCopying, onToggleCopyMode }: CopyTasksCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Copia Attività su più Giorni</CardTitle>
        <CardDescription>
          {isCopying
            ? "Seleziona un giorno di inizio, poi tieni premuto SHIFT e clicca su un giorno di fine per incollare le attività sull'intervallo."
            : "Copia le attività di questo giorno in un'altra data o su un intervallo di date."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={onToggleCopyMode} className="w-full">
          {isCopying ? (
            <>
              <X className="mr-2 h-4 w-4" />
              Annulla Copia
            </>
          ) : (
            <>
              <Copy className="mr-2 h-4 w-4" />
              Copia Attività del Giorno
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
