
"use client";

import { useState, useMemo } from 'react';
import type { Task, Tag, TaskCategory, TaskLocation, LeaveDay } from '@/lib/types';
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
import { AlertTriangle, ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { TagManager } from './tag-manager';
import { GlobalFilters } from './global-filters';
import { PresenceStats } from './presence-stats';
import { Button } from './ui/button';
import { useToast } from "@/hooks/use-toast";
import { LeaveManager } from './leave-manager';
import { CopyTasksCard } from './copy-tasks-card';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';

export function Dashboard() {
  const [tasks, setTasks] = useLocalStorage<Task[]>('daily-tasks', []);
  const [tags, setTags] = useLocalStorage<Tag[]>('activity-tags', []);
  const [leaveDays, setLeaveDays] = useLocalStorage<LeaveDay[]>('leave-days', []);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const { toast } = useToast();
  
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedCategory, setSelectedCategory] = useState<TaskCategory | "all">("all");
  const [selectedLocation, setSelectedLocation] = useState<TaskLocation | "all">("all");
  const [calendarMonth, setCalendarMonth] = useState<Date>(startOfMonth(new Date()));

  const [isCopying, setIsCopying] = useState(false);
  const [tasksToCopy, setTasksToCopy] = useState<Omit<Task, 'id' | 'timestamp'>[]>([]);

  const tasksForSelectedDate = useMemo(() => {
    return tasks
      .filter(task => isSameDay(new Date(task.timestamp), selectedDate))
      .map(task => ({
        ...task,
        tag: task.tagId ? tags.find(t => t.id === task.tagId) : undefined
      }));
  }, [tasks, selectedDate, tags]);
  
  const isLeaveDay = useMemo(() => {
    return leaveDays.some(d => isSameDay(new Date(d.date), selectedDate));
  }, [leaveDays, selectedDate]);

  const handleAddTask = (task: Omit<Task, 'id' | 'timestamp' | 'tag'>) => {
    if (isLeaveDay) {
      toast({
        title: "Giorno di assenza",
        description: "Non puoi registrare attività in un giorno di ferie, malattia o festività.",
        variant: "destructive",
      });
      return;
    }
    
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
    const leaveDaysSet = new Set(leaveDays.map(day => startOfDay(new Date(day.date)).toDateString()));
    
    return daysInMonth.filter(day => {
        const dayString = day.toDateString();
        const isWeekend = day.getDay() === 0 || day.getDay() === 6;
        return isBefore(day, today) && !isWeekend && !loggedDays.has(dayString) && !leaveDaysSet.has(dayString);
    });
  }, [tasks, leaveDays, daysInMonth, today]);

  const calendarModifiers = useMemo(() => ({
    logged: tasks.map(task => new Date(task.timestamp)),
    leave: leaveDays.map(day => new Date(day.date)),
    copying: isCopying ? new Date() : undefined, // just to apply style
  }), [tasks, leaveDays, isCopying]);

  const calendarModifiersStyles = {
    logged: {
      fontWeight: 'bold',
      color: 'hsl(var(--primary))'
    },
    leave: {
      color: 'hsl(var(--destructive))',
      textDecoration: 'line-through'
    },
    copying: {
      cursor: 'copy'
    }
  };

  const handleDateChange = (days: number) => {
    setSelectedDate(currentDate => addDays(currentDate, days));
  };
  
  const handleSelectDate = (date: Date | undefined) => {
    if (!date) return;

    if (isCopying) {
      handlePasteTasks(date);
    } else {
      setSelectedDate(date);
      setCalendarMonth(startOfMonth(date));
    }
  }

  const handleToggleCopyMode = () => {
    if (isCopying) {
      setIsCopying(false);
      setTasksToCopy([]);
    } else {
      const tasksOnSelectedDay = tasks.filter(task => isSameDay(new Date(task.timestamp), selectedDate));
      if (tasksOnSelectedDay.length === 0) {
        toast({
          title: "Nessuna attività da copiare",
          description: "Non ci sono attività registrate nel giorno selezionato.",
          variant: "destructive"
        });
        return;
      }
      const tasksToCopyData = tasksOnSelectedDay.map(({ id, timestamp, ...rest }) => rest);
      setTasksToCopy(tasksToCopyData);
      setIsCopying(true);
      toast({
        title: "Modalità copia attiva",
        description: "Seleziona una data sul calendario per incollare le attività."
      });
    }
  };

  const handlePasteTasks = (targetDate: Date) => {
    const isTargetLeaveDay = leaveDays.some(d => isSameDay(new Date(d.date), targetDate));
    if (isTargetLeaveDay) {
        toast({
            title: "Operazione non consentita",
            description: "Non puoi incollare attività in un giorno di assenza.",
            variant: "destructive",
        });
        return;
    }

    const tasksOnTargetDay = tasks.filter(task => isSameDay(new Date(task.timestamp), targetDate));
    const durationOnTargetDay = tasksOnTargetDay.reduce((sum, task) => sum + task.duration, 0);
    const durationToCopy = tasksToCopy.reduce((sum, task) => sum + task.duration, 0);

    if (durationOnTargetDay + durationToCopy > 480) {
        toast({
            title: "Limite giornaliero superato",
            description: "L'aggiunta di queste attività supererebbe il limite di 8 ore.",
            variant: "destructive",
        });
        return;
    }

    const newTasks: Task[] = tasksToCopy.map(task => ({
        ...task,
        id: crypto.randomUUID(),
        timestamp: targetDate.toISOString(),
    }));

    setTasks(prevTasks => [...prevTasks, ...newTasks]);
    toast({
        title: "Attività copiate con successo!",
        description: `${newTasks.length} attività aggiunte al ${format(targetDate, "d MMMM yyyy", { locale: it })}.`
    });
    setIsCopying(false);
    setTasksToCopy([]);
  };

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
       {missedDays.length > 0 && isSameDay(selectedDate, today) && (
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
              <div className="flex items-center justify-end gap-1">
                <Button variant="ghost" size="icon" onClick={() => handleDateChange(-1)}>
                    <ChevronLeft className="h-5 w-5" />
                </Button>
                <p className="text-lg font-semibold min-w-[220px] text-center">{isSameDay(selectedDate, today) ? "Oggi" : format(selectedDate, "EEEE, d MMMM", { locale: it })}</p>
                 <Button variant="ghost" size="icon" onClick={() => handleDateChange(1)}>
                    <ChevronRight className="h-5 w-5" />
                </Button>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <CalendarIcon className="h-5 w-5" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                        <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={(date) => {
                                if (date) setSelectedDate(date);
                            }}
                            initialFocus
                            locale={it}
                            weekStartsOn={1}
                        />
                    </PopoverContent>
                </Popover>
              </div>
            <p className="text-sm text-muted-foreground">
              {isSameDay(selectedDate, new Date()) ? "Visualizzando le attività di oggi" : `Visualizzando le attività per ${format(selectedDate, "d MMMM", { locale: it })}`}
            </p>
          </div>
        </div>
        
        <TabsContent value="home" className="space-y-4">
           <div className="space-y-4">
            <SummaryCards tasks={tasksForSelectedDate} isLeaveDay={isLeaveDay} />
            <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
              <div className="grid gap-4 auto-rows-max">
                 {isLeaveDay ? (
                  <Card className="flex items-center justify-center min-h-[400px]">
                      <div className="text-center text-muted-foreground">
                          <p className="text-lg font-semibold">Giorno di Assenza</p>
                          <p>Non è possibile registrare attività.</p>
                      </div>
                  </Card>
                 ) : <ActivityLogger onAddTask={handleAddTask} tags={tags} setTags={setTags} />}
                 <LeaveManager leaveDays={leaveDays} setLeaveDays={setLeaveDays} />
              </div>
              <div className="grid gap-4 auto-rows-max">
                 <ActivityList tasks={tasksForSelectedDate} onDeleteTask={handleDeleteTask} onClearTasks={handleClearTasks} />
                 <TagManager tags={tags} setTags={setTags} />
              </div>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="calendar" className="space-y-4">
           <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
              <div className="grid gap-4 auto-rows-max">
                 <Card className={isCopying ? "border-primary ring-2 ring-primary" : ""}>
                    <CardHeader>
                        <CardTitle>Panoramica Calendario</CardTitle>
                        {isCopying && <CardDescription className="text-primary font-semibold">Modalità Incolla: Seleziona una data di destinazione.</CardDescription>}
                    </CardHeader>
                    <CardContent className="flex justify-center">
                        <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={handleSelectDate}
                            month={calendarMonth}
                            onMonthChange={setCalendarMonth}
                            modifiers={calendarModifiers}
                            modifiersStyles={calendarModifiersStyles}
                            className="rounded-md border"
                            locale={it}
                            weekStartsOn={1}
                        />
                    </CardContent>
                </Card>
                <CopyTasksCard isCopying={isCopying} onToggleCopyMode={handleToggleCopyMode} />
              </div>
              <div className="grid gap-4 auto-rows-max">
                <ActivityList tasks={tasksForSelectedDate} onDeleteTask={handleDeleteTask} onClearTasks={handleClearTasks} />
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
          <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
              <div className="grid gap-4 auto-rows-max">
                 <InsightsReport tasks={filteredTasksForStats} />
                 <PresenceStats tasks={filteredTasksForStats} />
              </div>
              <div className="grid gap-4 auto-rows-max">
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

    

    

    