
"use client";

import { useState, useMemo } from 'react';
import type { Task, Tag, TaskCategory, TaskLocation } from '@/lib/types';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { ActivityLogger } from '@/components/activity-logger';
import { ActivityList } from '@/components/activity-list';
import { SummaryCards } from '@/components/summary-cards';
import { CategoryDistributionChart } from '@/components/charts/category-distribution-chart';
import { LocationDistributionChart } from '@/components/charts/location-distribution-chart';
import { InsightsReport } from '@/components/insights-report';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { addDays, format, startOfMonth, eachDayOfInterval, isBefore, isSameDay, startOfDay, getMonth, getYear } from 'date-fns';
import { it } from 'date-fns/locale';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';
import { TagManager } from './tag-manager';
import { GlobalFilters } from './global-filters';
import { PresenceStats } from './presence-stats';
import { Button } from './ui/button';
import { useToast } from "@/hooks/use-toast";


export function Dashboard() {
  const [tasks, setTasks] = useLocalStorage<Task[]>('daily-tasks', []);
  const [tags, setTags] = useLocalStorage<Tag[]>('activity-tags', []);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const { toast } = useToast();
  
  // State for global filters
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedCategory, setSelectedCategory] = useState<TaskCategory | "all">("all");
  const [selectedLocation, setSelectedLocation] = useState<TaskLocation | "all">("all");
  const [calendarMonth, setCalendarMonth] = useState<Date>(startOfMonth(new Date()));

  const tasksForSelectedDate = useMemo(() => {
    return tasks
      .filter(task => isSameDay(new Date(task.timestamp), selectedDate))
      .map(task => ({
        ...task,
        tag: task.tagId ? tags.find(t => t.id === task.tagId) : undefined
      }));
  }, [tasks, selectedDate, tags]);

  const handleAddTask = (task: Omit<Task, 'id' | 'timestamp' | 'tag'>) => {
    const totalDurationForDay = tasksForSelectedDate.reduce((acc, curr) => acc + curr.duration, 0);
    const maxDuration = 480; // 8 hours in minutes

    if (totalDurationForDay + task.duration > maxDuration) {
      toast({
        title: "Limite giornaliero superato",
        description: `Non puoi registrare più di 8 ore al giorno. Hai ancora ${ (maxDuration - totalDurationForDay) / 60 } ore disponibili.`,
        variant: "destructive",
      });
      return;
    }

    const newTask: Task = {
      ...task,
      id: crypto.randomUUID(),
      timestamp: selectedDate.toISOString(),
    };
    setTasks(prevTasks => [...prevTasks, newTask]);
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
  };
  
  const handleClearTasks = () => {
    setTasks(prevTasks => prevTasks.filter(task => !isSameDay(new Date(task.timestamp), selectedDate)));
  };
  
  const filteredTasksForStats = useMemo(() => {
    return tasks.filter(task => {
      const taskDate = new Date(task.timestamp);
      const isMonthMatch = getMonth(taskDate) === selectedMonth && getYear(taskDate) === selectedYear;
      const isCategoryMatch = selectedCategory === 'all' || task.category === selectedCategory;
      const isLocationMatch = selectedLocation === 'all' || task.location === selectedLocation;
      return isMonthMatch && isCategoryMatch && isLocationMatch;
    });
  }, [tasks, selectedMonth, selectedYear, selectedCategory, selectedLocation]);

  const today = startOfDay(new Date());
  const startOfCurrentMonth = startOfMonth(new Date(selectedYear, selectedMonth));
  
  const daysInMonth = useMemo(() => {
    const monthEndDate = isSameDay(startOfCurrentMonth, startOfMonth(today)) ? today : new Date(selectedYear, selectedMonth + 1, 0);
    return eachDayOfInterval({ start: startOfCurrentMonth, end: monthEndDate });
  }, [startOfCurrentMonth, today, selectedYear, selectedMonth]);

  const missedDays = useMemo(() => {
    const loggedDays = new Set(tasks.map(task => startOfDay(new Date(task.timestamp)).toDateString()));
    return daysInMonth.filter(day => isBefore(day, today) && !loggedDays.has(day.toDateString()));
  }, [tasks, daysInMonth, today]);

  const loggedDaysModifiers = {
    logged: tasks.map(task => new Date(task.timestamp))
  };

  const loggedDaysModifiersStyles = {
    logged: {
      fontWeight: 'bold',
      textDecoration: 'underline',
      color: 'hsl(var(--primary))'
    }
  };

  const handleDateChange = (days: number) => {
    setSelectedDate(currentDate => addDays(currentDate, days));
  };
  
  const handleSelectDate = (date: Date | undefined) => {
    if (date) {
        setSelectedDate(date);
        setCalendarMonth(startOfMonth(date));
    }
  }

  const handleTabChange = (value: string) => {
    if (value === "home") {
        setSelectedDate(new Date());
        setCalendarMonth(startOfMonth(new Date()));
    }
    if (value === "calendar") {
        setCalendarMonth(startOfMonth(selectedDate));
    }
  };
  
  return (
    <div className="space-y-4">
       {missedDays.length > 0 && (
        <Alert variant="destructive" className="mt-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Hai dei giorni non registrati!</AlertTitle>
          <AlertDescription>
            Hai {missedDays.length} giorno/i passato/i in questo mese senza attività registrate. Vai alla scheda Calendario per compilare i dati mancanti.
          </AlertDescription>
        </Alert>
      )}
      <Tabs defaultValue="home" className="space-y-4" onValueChange={handleTabChange}>
        <div className='flex justify-between items-start'>
          <TabsList>
            <TabsTrigger value="home">Home</TabsTrigger>
            <TabsTrigger value="calendar">Calendario</TabsTrigger>
            <TabsTrigger value="stats">Statistiche</TabsTrigger>
          </TabsList>
           <div className="text-right">
              <div className="flex items-center justify-end gap-2">
                <Button variant="ghost" size="icon" onClick={() => handleDateChange(-1)} disabled={isBefore(selectedDate, addDays(today, -365))}>
                    <ChevronLeft className="h-5 w-5" />
                </Button>
                <p className="text-lg font-semibold min-w-[220px] text-center">{isSameDay(selectedDate, today) ? "Oggi" : format(selectedDate, "EEEE, d MMMM", { locale: it })}</p>
                 <Button variant="ghost" size="icon" onClick={() => handleDateChange(1)} disabled={isSameDay(selectedDate, today) || isBefore(today, selectedDate)}>
                    <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            <p className="text-sm text-muted-foreground">
              {isSameDay(selectedDate, new Date()) ? "Visualizzando le attività di oggi" : `Visualizzando le attività per ${format(selectedDate, "d MMMM", { locale: it })}`}
            </p>
          </div>
        </div>
        
        <TabsContent value="home" className="space-y-4">
           <div className="space-y-4">
            <SummaryCards tasks={tasksForSelectedDate} />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <div className="lg:col-span-4 grid gap-4 auto-rows-max">
                <ActivityLogger onAddTask={handleAddTask} tags={tags} setTags={setTags} />
              </div>
              <div className="lg:col-span-3 grid gap-4 auto-rows-max">
                 <ActivityList tasks={tasksForSelectedDate} onDeleteTask={handleDeleteTask} onClearTasks={handleClearTasks} />
                 <TagManager tags={tags} setTags={setTags} />
              </div>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="calendar" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <div className="lg:col-span-4 grid gap-4 auto-rows-max">
              <ActivityLogger onAddTask={handleAddTask} tags={tags} setTags={setTags} />
              <ActivityList tasks={tasksForSelectedDate} onDeleteTask={handleDeleteTask} onClearTasks={handleClearTasks} />
            </div>
            <div className="lg:col-span-3 grid gap-4 auto-rows-max">
              <Card>
                <CardHeader>
                  <CardTitle>Seleziona un Giorno</CardTitle>
                </CardHeader>
                <CardContent className="flex justify-center">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleSelectDate}
                    month={calendarMonth}
                    onMonthChange={setCalendarMonth}
                    modifiers={loggedDaysModifiers}
                    modifiersStyles={loggedDaysModifiersStyles}
                    className="rounded-md border"
                    disabled={(date) => date > new Date() || date < addDays(new Date(), -365)}
                    locale={it}
                    weekStartsOn={1}
                  />
                </CardContent>
              </Card>
               <TagManager tags={tags} setTags={setTags} />
            </div>
          </div>
        </TabsContent>
         <TabsContent value="stats" className="space-y-4">
          <GlobalFilters
            tasks={tasks}
            selectedMonth={selectedMonth}
            setSelectedMonth={setSelectedMonth}
            selectedYear={selectedYear}
            setSelectedYear={setSelectedYear}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            selectedLocation={selectedLocation}
            setSelectedLocation={setSelectedLocation}
          />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <div className="lg:col-span-4 grid gap-4 auto-rows-max">
                 <InsightsReport tasks={filteredTasksForStats} />
                 <PresenceStats tasks={filteredTasksForStats} />
              </div>
              <div className="lg:col-span-3 grid gap-4 auto-rows-max">
                 <Card>
                    <CardHeader>
                        <CardTitle>Distribuzione per Categoria</CardTitle>
                        <CardDescription>Riepilogo del tempo per il periodo selezionato.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <CategoryDistributionChart tasks={filteredTasksForStats} />
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Distribuzione per Località</CardTitle>
                        <CardDescription>Riepilogo del tempo per il periodo selezionato.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <LocationDistributionChart tasks={filteredTasksForStats} />
                    </CardContent>
                </Card>
              </div>
            </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
