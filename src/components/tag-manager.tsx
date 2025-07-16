"use client"

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Tag, TaskCategory, TaskDuration, TaskLocation } from "@/lib/types";
import { taskCategories, categoryConfig, taskDurations, taskLocations, locationConfig, tailwindColors } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlusCircle, Edit, Trash2 } from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from "./ui/badge";

const tagFormSchema = z.object({
  name: z.string().min(2, "Il nome deve avere almeno 2 caratteri."),
  color: z.string().min(1, "Seleziona un colore."),
  description: z.string().min(3, "La descrizione deve contenere almeno 3 caratteri."),
  duration: z.coerce.number().refine(val => taskDurations.includes(val as TaskDuration)),
  category: z.enum(taskCategories),
  location: z.enum(taskLocations),
});

type TagFormValues = z.infer<typeof tagFormSchema>;

interface TagManagerProps {
  tags: Tag[];
  setTags: React.Dispatch<React.SetStateAction<Tag[]>>;
}

const formatDurationLabel = (minutes: TaskDuration) => {
  if (minutes === 480) return "Tutto il giorno (8 ore)";
  if (minutes === 240) return "Metà giornata (4 ore)";
  if (minutes === 60) return "1 ora";
  if (minutes === 30) return "30 minuti";
  return `${minutes} min`;
}

export function TagManager({ tags, setTags }: TagManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingTag, setEditingTag] = React.useState<Tag | null>(null);

  const form = useForm<TagFormValues>({
    resolver: zodResolver(tagFormSchema),
    defaultValues: {
      name: "",
      color: tailwindColors[0],
      description: "",
      duration: 30,
      category: "Sviluppo",
      location: "Smart Working",
    },
  });

  React.useEffect(() => {
    if (editingTag) {
      form.reset(editingTag);
    } else {
      form.reset({
        name: "",
        color: tailwindColors[0],
        description: "",
        duration: 30,
        category: "Sviluppo",
        location: "Smart Working",
      });
    }
  }, [editingTag, form]);

  const onSubmit = (data: TagFormValues) => {
    if (editingTag) {
      setTags(tags.map((tag) => (tag.id === editingTag.id ? { ...tag, ...data } : tag)));
    } else {
      const newTag: Tag = { id: crypto.randomUUID(), ...data };
      setTags([...tags, newTag]);
    }
    setEditingTag(null);
    setIsDialogOpen(false);
  };

  const handleDelete = (tagId: string) => {
    setTags(tags.filter((tag) => tag.id !== tagId));
  };

  const handleOpenDialog = (tag: Tag | null) => {
    setEditingTag(tag);
    setIsDialogOpen(true);
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Gestione Tag</CardTitle>
          <CardDescription>Crea e gestisci i tuoi tag attività.</CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={() => handleOpenDialog(null)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Nuovo Tag
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingTag ? "Modifica Tag" : "Crea Nuovo Tag"}</DialogTitle>
              <DialogDescription>
                {editingTag ? "Modifica i dettagli del tuo tag." : "Crea un nuovo tag per velocizzare la registrazione."}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Tag</FormLabel>
                      <FormControl>
                        <Input placeholder="Es: Daily Standup" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrizione Attività</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Es: Partecipazione al daily standup del team" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Categoria</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {taskCategories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                            </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="duration"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Durata</FormLabel>
                            <Select onValueChange={(v) => field.onChange(Number(v))} value={String(field.value)}>
                            <FormControl>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {taskDurations.map((d) => <SelectItem key={d} value={String(d)}>{formatDurationLabel(d)}</SelectItem>)}
                            </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                </div>
                <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Località</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {taskLocations.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                        </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                  control={form.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Colore</FormLabel>
                      <FormControl>
                         <div className="flex flex-wrap gap-2">
                          {tailwindColors.map((color) => (
                            <button
                              type="button"
                              key={color}
                              className={`w-6 h-6 rounded-full border-2 ${field.value === color ? 'border-primary' : 'border-transparent'}`}
                              style={{ backgroundColor: color }}
                              onClick={() => field.onChange(color)}
                            />
                          ))}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit">{editingTag ? "Salva Modifiche" : "Crea Tag"}</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-40">
           {tags.length > 0 ? (
            <div className="space-y-2">
              {tags.map((tag) => (
                <div key={tag.id} className="flex items-center justify-between rounded-md p-2 border">
                  <div className="flex items-center gap-3">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: tag.color }} />
                    <span className="font-medium">{tag.name}</span>
                    <Badge variant="outline">{tag.category}</Badge>
                    <Badge variant="outline">{formatDurationLabel(tag.duration)}</Badge>

                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleOpenDialog(tag)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDelete(tag.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
           ) : (
             <div className="text-center text-muted-foreground py-10">
                Nessun tag creato. Clicca su "Nuovo Tag" per iniziare.
             </div>
           )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
