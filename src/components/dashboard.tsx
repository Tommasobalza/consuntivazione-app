"use client";

import { useState, useMemo } from 'react';
import type { Task } from '@/lib/types';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { ActivityLogger } from '@/components/activity-logger';
import { ActivityList } from '@/components/activity-list';
import { SummaryCards } from '@/components/summary-cards';
import { CategoryDistributionChart } from '@/components/charts/category-distribution-chart';
import { InsightsReport } from '@/components/insights-report';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { addDays, format, startOfMonth, eachDayOfInterval, isBefore, isSameDay, startOfDay } from 'date-fns';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

export function Dashboard() {
  const [tasks, setTasks] = useLocalStorage<Task[]>('daily-tasks', []);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const handleAddTask = (task: Omit<Task, 'id' | 'timestamp'>) => {
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

  const tasksForSelectedDate = useMemo(() => {
    return tasks.filter(task => {
      const taskDate = new Date(task.timestamp);
      return isSameDay(taskDate, selectedDate);
    });
  }, [tasks, selectedDate]);

  const today = startOfDay(new Date());
  const startOfCurrentMonth = startOfMonth(today);
  
  const daysInMonth = useMemo(() => 
    eachDayOfInterval({ start: startOfCurrentMonth, end: today }), 
    [startOfCurrentMonth, today]
  );

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

  const handleDateChange = (value: string) => {
    if (value === "today") {
      setSelectedDate(new Date());
    }
  };

  return (
    <div className="space-y-4">
      {missedDays.length > 0 && isSameDay(selectedDate, today) && (
        <Alert variant="destructive" className="mt-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Hai dei giorni non registrati!</AlertTitle>
          <AlertDescription>
            Hai {missedDays.length} giorno/i passato/i in questo mese senza attività registrate. Vai alla scheda Calendario per compilare i dati mancanti.
          </AlertDescription>
        </Alert>
      )}
      <Tabs defaultValue="today" className="space-y-4" onValueChange={handleDateChange}>
        <div className='flex justify-between items-start'>
          <TabsList>
            <TabsTrigger value="today">Oggi</TabsTrigger>
            <TabsTrigger value="calendar">Calendario</TabsTrigger>
          </TabsList>
          <div className="text-right">
            <p className="text-lg font-semibold">{format(selectedDate, "EEEE, d MMMM")}</p>
            <p className="text-sm text-muted-foreground">
              {isSameDay(selectedDate, new Date()) ? "Visualizzando le attività di oggi" : `Visualizzando le attività per ${format(selectedDate, "d MMMM")}`}
            </p>
          </div>
        </div>
        
        <TabsContent value="today" className="space-y-4">
           <div className="space-y-4">
            <SummaryCards tasks={tasksForSelectedDate} />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <div className="lg:col-span-4 grid gap-4 auto-rows-max">
                <ActivityLogger onAddTask={handleAddTask} />
                <ActivityList tasks={tasksForSelectedDate} onDeleteTask={handleDeleteTask} onClearTasks={handleClearTasks} />
              </div>
              <div className="lg:col-span-3 grid gap-4 auto-rows-max">
                 <Card>
                    <CardHeader>
                        <CardTitle>Distribuzione del Tempo</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CategoryDistributionChart tasks={tasksForSelectedDate} />
                    </CardContent>
                </Card>
                <InsightsReport tasks={tasksForSelectedDate} />
              </div>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="calendar" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <div className="lg:col-span-4 grid gap-4 auto-rows-max">
              <ActivityLogger onAddTask={handleAddTask} />
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
                    onSelect={(date) => date && setSelectedDate(date)}
                    modifiers={loggedDaysModifiers}
                    modifiersStyles={loggedDaysModifiersStyles}
                    className="rounded-md border"
                    disabled={(date) => date > new Date() || date < addDays(new Date(), -365)}
                  />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                    <CardTitle>Distribuzione del Tempo</CardTitle>
                </CardHeader>
                <CardContent>
                    <CategoryDistributionChart tasks={tasksForSelectedDate} />
                </CardContent>
              </Card>
              <InsightsReport tasks={tasksForSelectedDate} />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
