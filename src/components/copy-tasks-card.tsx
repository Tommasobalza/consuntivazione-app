
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
        <CardTitle>Copia Attività</CardTitle>
        <CardDescription>
          {isCopying
            ? "Seleziona una data sul calendario per incollare le attività."
            : "Copia le attività di questo giorno in un'altra data."}
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
