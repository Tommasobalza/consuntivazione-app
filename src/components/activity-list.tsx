
"use client"

import type { Task } from "@/lib/types"
import { categoryConfig, locationConfig } from "@/lib/types"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Trash2, XCircle, Pencil } from "lucide-react"
import { Badge } from "./ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Input } from "./ui/input"
import { useState } from "react"

interface ActivityListProps {
  tasks: Task[]
  onDeleteTask: (taskId: string) => void
  onClearTasks: () => void;
  isEditable?: boolean;
  onUpdateTask?: (taskId: string, updatedTask: Partial<Task>) => void;
}

const formatDuration = (minutes: number) => {
  if (minutes < 60) {
    return `${minutes}m`
  }
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours === 8 && mins === 0) return "Tutto il giorno";
  if (hours === 4 && mins === 0) return "Metà giornata";
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
}

export function ActivityList({ tasks, onDeleteTask, onClearTasks, isEditable = false, onUpdateTask }: ActivityListProps) {
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState<string>("");

  const handleEditClick = (task: Task) => {
    setEditingTaskId(task.id);
    setEditingValue(task.description || "");
  };

  const handleSave = () => {
    if (onUpdateTask && editingTaskId) {
      onUpdateTask(editingTaskId, { description: editingValue });
    }
    setEditingTaskId(null);
    setEditingValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSave();
      e.currentTarget.blur();
    }
    if (e.key === 'Escape') {
      setEditingTaskId(null);
      setEditingValue("");
      e.currentTarget.blur();
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Attività del Giorno</CardTitle>
          <CardDescription>
            {isEditable
              ? "Modifica la descrizione o cancella le attività."
              : "Registro delle attività per il giorno selezionato."
            }
          </CardDescription>
        </div>
        {tasks.length > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <XCircle className="mr-2 h-4 w-4" />
                Cancella Tutto
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Sei assolutamente sicuro?</AlertDialogTitle>
                <AlertDialogDescription>
                  Questa azione non può essere annullata. Eliminerà in modo permanente tutte le attività per il giorno selezionato.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annulla</AlertDialogCancel>
                <AlertDialogAction onClick={onClearTasks}>Continua</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </CardHeader>
      <CardContent>
        <div className="relative w-full overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Attività</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Località</TableHead>
                <TableHead className="text-right">Durata</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.length > 0 ? (
                tasks.map((task) => {
                  const CategoryIcon = categoryConfig[task.category].icon;
                  const LocationIcon = locationConfig[task.location].icon;
                  
                  return (
                    <TableRow key={task.id}>
                      <TableCell>
                        <div className="flex items-start gap-2">
                           {task.tag && <span className="h-2 w-2 rounded-full flex-shrink-0 mt-1.5" style={{ backgroundColor: task.tag.color }}></span>}
                          <div className="w-full">
                            <p className="font-medium">{task.name}</p>
                            {isEditable ? (
                                <div className="flex items-center gap-2 group">
                                  {editingTaskId === task.id ? (
                                    <Input
                                      type="text"
                                      placeholder="Aggiungi una descrizione..."
                                      value={editingValue}
                                      onChange={(e) => setEditingValue(e.target.value)}
                                      onBlur={handleSave}
                                      onKeyDown={handleKeyDown}
                                      className="h-8 text-sm text-muted-foreground"
                                      autoFocus
                                    />
                                  ) : (
                                    <>
                                      <p className="text-sm text-muted-foreground flex-grow h-8 flex items-center">
                                        {task.description || <span className="text-muted-foreground/70">Aggiungi una descrizione...</span>}
                                      </p>
                                      <Button variant="ghost" size="icon" onClick={() => handleEditClick(task)} className="h-7 w-7 opacity-0 group-hover:opacity-100">
                                        <Pencil className="h-4 w-4 text-muted-foreground" />
                                      </Button>
                                    </>
                                  )}
                                </div>
                            ) : (
                               task.description && <p className="text-sm text-muted-foreground">{task.description}</p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="flex items-center gap-2 w-fit">
                          <CategoryIcon className="h-4 w-4" style={{ color: categoryConfig[task.category].color }} />
                          {task.category}
                        </Badge>
                      </TableCell>
                       <TableCell>
                        <Badge variant="outline" className="flex items-center gap-2 w-fit">
                          <LocationIcon className="h-4 w-4 text-muted-foreground" />
                          {task.location}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">{formatDuration(task.duration)}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDeleteTask(task.id)}
                          aria-label="Cancella attività"
                        >
                          <Trash2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    Nessuna attività registrata per il giorno selezionato.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
