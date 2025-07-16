
"use client";

import { useState, useMemo, useEffect } from 'react';
import type { Task, Tag, TaskCategory, TaskLocation, LeaveDay, UserProfile, SaveSettings } from '@/lib/types';
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
import { AlertTriangle, ChevronLeft, ChevronRight, Calendar as CalendarIcon, CheckCircle2, Save } from 'lucide-react';
import { TagManager } from './tag-manager';
import { GlobalFilters } from './global-filters';
import { PresenceStats } from './presence-stats';
import { Button } from './ui/button';
import { useToast } from "@/hooks/use-toast";
import { LeaveManager } from './leave-manager';
import { CopyTasksCard } from './copy-tasks-card';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';

interface DashboardProps {
  userProfile: UserProfile;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  saveSettings: SaveSettings;
  setSaveSettings: React.Dispatch<React.SetStateAction<SaveSettings>>;
}

export function Dashboard({ userProfile, setUserProfile, saveSettings, setSaveSettings }: DashboardProps) {
  const [tasks, setTasks, saveTasks] = useLocalStorage<Task[]>('daily-tasks', []);
  const [tags, setTags, saveTags] = useLocalStorage<Tag[]>('activity-tags', [], { silent: true });
  const [leaveDays, setLeaveDays, saveLeaveDays] = useLocalStorage<LeaveDay[]>('leave-days', [], { silent: true });
  // User profile and save settings are now managed in the parent Home component
  
  const [hasPendingChanges, setHasPendingChanges] = useState(false);
  
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const { toast } = useToast();
  
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedCategory, setSelectedCategory] = useState<TaskCategory | "all">("all");
  const [selectedLocation, setSelectedLocation] = useState<TaskLocation | "all">("all");
  const [selectedActivityName, setSelectedActivityName] = useState<string>("all");
  const [calendarMonth, setCalendarMonth] = useState<Date>(startOfMonth(new Date()));

  const [isCopying, setIsCopying] = useState(false);
  const [tasksToCopy, setTasksToCopy] = useState<Omit<Task, 'id' | 'timestamp'>[]>([]);

  useEffect(() => {
    if (!saveSettings.autoSave) {
      setHasPendingChanges(true);
    } else {
      setHasPendingChanges(false);
    }
  }, [tasks, tags, leaveDays, userProfile, saveSettings.autoSave]);
  
  const handleSaveChanges = () => {
    saveTasks();
    saveTags();
    saveLeaveDays();
    // saveUserProfile(); is handled by parent now
    // saveSettingsConfig(); is handled by parent now
    setHasPendingChanges(false);
    toast({
      title: "Modifiche salvate",
      description: "Tutti i tuoi dati sono stati salvati con successo.",
    });
  };

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
      const isActivityNameMatch = selectedActivityName === 'all' || (task.name && task.name.toLowerCase() === selectedActivityName.toLowerCase());
      return isMonthMatch && isCategoryMatch && isLocationMatch && isActivityNameMatch;
    });
  }, [tasks, selectedMonth, selectedYear, selectedCategory, selectedLocation, selectedActivityName]);

  const today = startOfDay(new Date());

  const missedDays = useMemo(() => {
    const loggedDays = new Set(tasks.map(task => startOfDay(new Date(task.timestamp)).toDateString()));
    const leaveDaysSet = new Set(leaveDays.map(day => startOfDay(new Date(day.date)).toDateString()));
    
    // Check all days from the beginning of logged data up to today
    const firstLogDate = tasks.length > 0 ? startOfDay(new Date(Math.min(...tasks.map(t => new Date(t.timestamp).getTime())))) : today;
    const checkStartDate = isBefore(firstLogDate, startOfMonth(new Date("2024-01-01"))) ? firstLogDate : new Date("2024-01-01");
    
    const daysToCheck = eachDayOfInterval({ start: checkStartDate, end: today });

    return daysToCheck.filter(day => {
        const dayString = day.toDateString();
        const isWeekend = day.getDay() === 0 || day.getDay() === 6;
        return !isWeekend && !loggedDays.has(dayString) && !leaveDaysSet.has(dayString);
    });
  }, [tasks, leaveDays, today]);

  const missedDaysCurrentMonth = useMemo(() => {
    const startOfCurrentMonth = startOfMonth(new Date(selectedYear, selectedMonth));
    const monthEndDate = getYear(startOfCurrentMonth) === getYear(today) && getMonth(startOfCurrentMonth) === getMonth(today) ? today : new Date(selectedYear, selectedMonth + 1, 0);
     if (isBefore(monthEndDate, startOfCurrentMonth)) return [];
    
    const daysInMonth = eachDayOfInterval({ start: startOfCurrentMonth, end: monthEndDate });
    const loggedDays = new Set(tasks.map(task => startOfDay(new Date(task.timestamp)).toDateString()));
    const leaveDaysSet = new Set(leaveDays.map(day => startOfDay(new Date(day.date)).toDateString()));
    
    return daysInMonth.filter(day => {
        const dayString = day.toDateString();
        const isWeekend = day.getDay() === 0 || day.getDay() === 6;
        return isBefore(day, today) && !isWeekend && !loggedDays.has(dayString) && !leaveDaysSet.has(dayString);
    });
  }, [tasks, leaveDays, today, selectedMonth, selectedYear]);

  const isCurrentMonthCompleted = useMemo(() => {
    const isCurrentMonth = getMonth(new Date()) === selectedMonth && getYear(new Date()) === selectedYear;
    return isCurrentMonth && missedDaysCurrentMonth.length === 0;
  }, [selectedMonth, selectedYear, missedDaysCurrentMonth]);


  const calendarModifiers = useMemo(() => ({
    logged: tasks.map(task => new Date(task.timestamp)),
    leave: leaveDays.map(day => new Date(day.date)),
    copying: isCopying ? new Date() : undefined, // just to apply style
    missed: missedDays,
  }), [tasks, leaveDays, isCopying, missedDays]);

  const calendarModifiersStyles = {
    logged: {
      color: 'hsl(142.1 76.2% 36.3%)', // green-600
      fontWeight: 'bold',
    },
    leave: {
      color: 'hsl(var(--accent))',
      textDecoration: 'line-through'
    },
    copying: {
      cursor: 'copy'
    },
    selected: {
        backgroundColor: 'hsl(var(--primary) / 0.3)',
        color: 'hsl(var(--primary-foreground))'
    },
    missed: {
      color: 'hsl(var(--destructive) / 0.9)',
      fontWeight: 'bold'
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
      {isSameDay(startOfMonth(selectedDate), startOfMonth(today)) && (
          <>
            {missedDaysCurrentMonth.length > 0 ? (
                <Alert variant="destructive" className="mt-4 bg-red-50 dark:bg-red-950 border-red-500/50 text-red-700 dark:text-red-300 [&>svg]:text-red-600 dark:[&>svg]:text-red-400">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle className="font-bold">Hai dei giorni non registrati!</AlertTitle>
                    <AlertDescription>
                        Hai {missedDaysCurrentMonth.length} giorno/i passato/i in questo mese senza attività registrate. Vai alla scheda Calendario per compilare i dati mancanti.
                    </AlertDescription>
                </Alert>
            ) : isCurrentMonthCompleted && (
                 <Alert className="mt-4 bg-green-50 dark:bg-green-950 border-green-500/50 text-green-700 dark:text-green-300 [&>svg]:text-green-600 dark:[&>svg]:text-green-400">
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertTitle className="font-bold">Ottimo lavoro!</AlertTitle>
                    <AlertDescription>
                        Tutti i giorni lavorativi di questo mese sono stati compilati. Continua così!
                    </AlertDescription>
                </Alert>
            )}
        </>
      )}

      <Tabs defaultValue="home" className="space-y-4" onValueChange={handleTabChange}>
        <div className='flex justify-between items-start'>
          <TabsList>
            <TabsTrigger value="home">Home</TabsTrigger>
            <TabsTrigger value="calendar">Calendario</TabsTrigger>
            <TabsTrigger value="stats">Statistiche</TabsTrigger>
            <TabsTrigger value="leave">Out Of Office</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-4">
            {!saveSettings.autoSave && hasPendingChanges && (
              <Button onClick={handleSaveChanges}>
                <Save className="mr-2 h-4 w-4" />
                Salva Modifiche
              </Button>
            )}
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
                              modifiers={calendarModifiers}
                              modifiersStyles={calendarModifiersStyles}
                          />
                      </PopoverContent>
                  </Popover>
                </div>
              <p className="text-sm text-muted-foreground">
                {isSameDay(selectedDate, new Date()) ? "Visualizzando le attività di oggi" : `Visualizzando le attività per ${format(selectedDate, "d MMMM", { locale: it })}`}
              </p>
            </div>
          </div>
        </div>
        
        <TabsContent value="home" className="space-y-4">
           <div className="space-y-4">
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
            selectedActivityName={selectedActivityName}
            setSelectedActivityName={setSelectedActivityName}
          />
          <SummaryCards tasks={filteredTasksForStats} />
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
        <TabsContent value="leave" className="space-y-4">
          <LeaveManager leaveDays={leaveDays} setLeaveDays={setLeaveDays} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
