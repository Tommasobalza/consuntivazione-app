
"use client";

import { useState, useMemo, useEffect } from 'react';
import type { Task, Tag, TaskCategory, TaskLocation, LeaveDay, UserProfile, SaveSettings, DateRange } from '@/lib/types';
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
import { addDays, format, startOfMonth, eachDayOfInterval, isBefore, isSameDay, startOfDay, getMonth, getYear, isWeekend, isWithinInterval } from 'date-fns';
import { it } from 'date-fns/locale';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, ChevronLeft, ChevronRight, Calendar as CalendarIcon, CheckCircle2, Copy, Settings, X } from 'lucide-react';
import { TagManager } from './tag-manager';
import { GlobalFilters } from './global-filters';
import { PresenceStats } from './presence-stats';
import { Button } from './ui/button';
import { useToast } from "@/hooks/use-toast";
import { LeaveManager } from './leave-manager';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { UserProfileDisplay } from './user-profile-display';
import { SettingsManager } from './settings-manager';


interface DashboardProps {
  userProfile: UserProfile;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  saveSettings: SaveSettings;
  setSaveSettings: React.Dispatch<React.SetStateAction<SaveSettings>>;
}

const MAX_DURATION_PER_DAY = 480; // 8 hours in minutes

export function Dashboard({ userProfile, setUserProfile, saveSettings, setSaveSettings }: DashboardProps) {
  const [tasks, setTasks, saveTasks, hasPendingTasks] = useLocalStorage<Task[]>('daily-tasks', []);
  const [tags, setTags, saveTags, hasPendingTags] = useLocalStorage<Tag[]>('activity-tags', []);
  const [leaveDays, setLeaveDays, saveLeaveDays, hasPendingLeave] = useLocalStorage<LeaveDay[]>('leave-days', []);
  
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const { toast } = useToast();
  
  // State for global filters
  const [dateFilterMode, setDateFilterMode] = useState<'month' | 'range'>('month');
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [selectedCategory, setSelectedCategory] = useState<TaskCategory | "all">("all");
  const [selectedLocation, setSelectedLocation] = useState<TaskLocation | "all">("all");
  const [selectedActivityName, setSelectedActivityName] = useState<string>("all");
  
  const [calendarMonth, setCalendarMonth] = useState<Date>(startOfMonth(new Date()));

  const [isCopying, setIsCopying] = useState(false);
  const [tasksToCopy, setTasksToCopy] = useState<Omit<Task, 'id' | 'timestamp' | 'tag'>[]>([]);

  const [daysToPaste, setDaysToPaste] = useState<Date[]>([]);
  const [lastSelectedDay, setLastSelectedDay] = useState<Date | undefined>(undefined);
  
  const hasPendingChanges = hasPendingTasks || hasPendingTags || hasPendingLeave;

  const handleSaveChanges = () => {
    saveTasks();
    saveTags();
    saveLeaveDays();
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
  
  const leaveDurationForSelectedDate = useMemo(() => {
    return leaveDays
      .filter(d => isSameDay(new Date(d.date), selectedDate))
      .reduce((total, day) => total + day.duration, 0);
  }, [leaveDays, selectedDate]);

  const handleAddTask = (task: Omit<Task, 'id' | 'timestamp' | 'tag'>) => {
    const totalTaskDurationForDay = tasksForSelectedDate.reduce((acc, curr) => acc + curr.duration, 0);
    const availableDuration = MAX_DURATION_PER_DAY - leaveDurationForSelectedDate;

    if (totalTaskDurationForDay + task.duration > availableDuration) {
      toast({
        title: "Limite giornaliero superato",
        description: `Con l'assenza registrata, non puoi superare ${availableDuration / 60} ore di attività.`,
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

  const handleUpdateTask = (taskId: string, updatedTaskData: Partial<Task>) => {
    setTasks(prevTasks => prevTasks.map(task => 
        task.id === taskId ? { ...task, ...updatedTaskData } : task
    ));
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

      let isDateMatch = false;
      if (dateFilterMode === 'month') {
        isDateMatch = getMonth(taskDate) === selectedMonth && getYear(taskDate) === selectedYear;
      } else if (dateRange?.from) {
        const to = dateRange.to || dateRange.from;
        isDateMatch = isWithinInterval(taskDate, { start: startOfDay(dateRange.from), end: startOfDay(to) });
      }

      const isCategoryMatch = selectedCategory === 'all' || task.category === selectedCategory;
      const isLocationMatch = selectedLocation === 'all' || task.location === selectedLocation;
      const isActivityNameMatch = selectedActivityName === 'all' || (task.name && task.name.toLowerCase() === selectedActivityName.toLowerCase());
      
      return isDateMatch && isCategoryMatch && isLocationMatch && isActivityNameMatch;
    });
  }, [tasks, dateFilterMode, selectedMonth, selectedYear, dateRange, selectedCategory, selectedLocation, selectedActivityName]);

  const today = startOfDay(new Date());

  const missedDays = useMemo(() => {
    const firstLogDate = tasks.length > 0 ? startOfDay(new Date(Math.min(...tasks.map(t => new Date(t.timestamp).getTime())))) : today;
    const checkStartDate = isBefore(firstLogDate, startOfMonth(new Date("2024-01-01"))) ? firstLogDate : new Date("2024-01-01");
    
    const daysToCheck = eachDayOfInterval({ start: checkStartDate, end: today });
    
    const dayInfo = new Map<string, { tasks: number, leave: number }>();

    tasks.forEach(task => {
        const dayString = startOfDay(new Date(task.timestamp)).toDateString();
        const current = dayInfo.get(dayString) || { tasks: 0, leave: 0 };
        current.tasks += task.duration;
        dayInfo.set(dayString, current);
    });

    leaveDays.forEach(day => {
        const dayString = startOfDay(new Date(day.date)).toDateString();
        const current = dayInfo.get(dayString) || { tasks: 0, leave: 0 };
        current.leave += day.duration;
        dayInfo.set(dayString, current);
    });

    return daysToCheck.filter(day => {
        const dayString = day.toDateString();
        if (isWeekend(day)) return false;
        
        const info = dayInfo.get(dayString);
        if (!info) return true; // Completely empty day
        
        return info.tasks + info.leave < MAX_DURATION_PER_DAY;
    });
  }, [tasks, leaveDays, today]);
  
  const missedDaysCurrentMonth = useMemo(() => {
    const startOfCurrentMonth = startOfMonth(new Date(selectedYear, selectedMonth));
    const monthEndDate = getYear(startOfCurrentMonth) === getYear(today) && getMonth(startOfCurrentMonth) === getMonth(today) ? today : new Date(selectedYear, selectedMonth + 1, 0);
    if (isBefore(monthEndDate, startOfCurrentMonth)) return [];
    
    return missedDays.filter(day => getMonth(day) === selectedMonth && getYear(day) === selectedYear && isBefore(day, today));
  }, [missedDays, selectedMonth, selectedYear, today]);


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
      color: 'hsl(142.1 76.2% 36.3%)', 
      fontWeight: 'bold',
    },
    leave: {
      color: 'hsl(var(--accent))',
      backgroundColor: 'hsl(var(--accent) / 0.1)',
      textDecoration: 'line-through'
    },
    copying: {
      cursor: 'copy'
    },
    missed: {
      color: 'hsl(0 72.2% 50.6%)',
      fontWeight: 'bold'
    },
    selected: {
        backgroundColor: 'hsl(var(--primary) / 0.1)',
        border: '1px solid hsl(var(--primary))',
        color: 'inherit',
    },
  };

  const handleDateChange = (days: number) => {
    setSelectedDate(currentDate => addDays(currentDate, days));
  };
  
  const handleDayClick = (day: Date, modifiers: { selected?: boolean }, e: React.MouseEvent) => {
    if (isCopying) {
        e.preventDefault();
        let newDaysToPaste = [...daysToPaste];
        if (e.shiftKey && lastSelectedDay) {
            const range = eachDayOfInterval({
                start: new Date(Math.min(lastSelectedDay.getTime(), day.getTime())),
                end: new Date(Math.max(lastSelectedDay.getTime(), day.getTime())),
            });
            newDaysToPaste = range;
        } else if (e.ctrlKey) {
            const dayIndex = newDaysToPaste.findIndex(d => isSameDay(d, day));
            if (dayIndex > -1) {
                newDaysToPaste.splice(dayIndex, 1);
            } else {
                newDaysToPaste.push(day);
            }
        } else {
            newDaysToPaste = [day];
        }
        setDaysToPaste(newDaysToPaste);
        setLastSelectedDay(day);
    } else {
        setSelectedDate(day);
        setCalendarMonth(startOfMonth(day));
    }
  };

  const handleToggleCopyMode = () => {
    if (isCopying) {
      setIsCopying(false);
      setTasksToCopy([]);
      setDaysToPaste([]);
      setLastSelectedDay(undefined);
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
      const tasksToCopyData = tasksOnSelectedDay.map(({ id, timestamp, tag, ...rest }) => rest);
      setTasksToCopy(tasksToCopyData);
      setIsCopying(true);
      toast({
        title: "Modalità copia attiva",
        description: "Seleziona una o più date sul calendario per incollare."
      });
    }
  };

  const handleConfirmPaste = () => {
    if (!daysToPaste.length) return;

    const newTasks: Task[] = [];
    let conflictedDays = 0;

    daysToPaste.forEach(day => {
        const dayStart = startOfDay(day);
        if (isWeekend(dayStart)) return;

        const leaveOnDay = leaveDays.some(d => isSameDay(new Date(d.date), dayStart));
        if (leaveOnDay) return;

        const tasksOnDay = tasks.filter(t => isSameDay(new Date(t.timestamp), dayStart));
        const durationOnDay = tasksOnDay.reduce((sum, task) => sum + task.duration, 0);
        const durationToCopy = tasksToCopy.reduce((sum, task) => sum + task.duration, 0);

        if (durationOnDay + durationToCopy > MAX_DURATION_PER_DAY) {
            conflictedDays++;
            return;
        }

        tasksToCopy.forEach(taskToCopy => {
            newTasks.push({
                ...taskToCopy,
                id: crypto.randomUUID(),
                timestamp: dayStart.toISOString(),
            });
        });
    });

    if (newTasks.length > 0) {
      setTasks(prevTasks => [...prevTasks, ...newTasks]);
      toast({
          title: "Attività copiate con successo!",
          description: `Attività incollate su ${newTasks.length / tasksToCopy.length} giorni. ${conflictedDays > 0 ? `${conflictedDays} giorni saltati per conflitto.` : ''}`
      });
    } else if (conflictedDays > 0) {
         toast({
            title: "Copia non riuscita",
            description: `Tutti i ${conflictedDays} giorni selezionati avevano conflitti di durata e sono stati saltati.`,
            variant: "destructive"
        });
    }

    // Reset copy state
    setIsCopying(false);
    setTasksToCopy([]);
    setDaysToPaste([]);
    setLastSelectedDay(undefined);
  };


  const handleTabChange = (value: string) => {
    if (value === "calendar") {
        setCalendarMonth(startOfMonth(selectedDate));
    }
  };
  
  return (
    <div className="space-y-4">
       <div className="flex items-center justify-between space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Consuntivazione
          </h1>
          <div className="flex items-center gap-4">
            <UserProfileDisplay userProfile={userProfile} />
          </div>
        </div>
      {isSameDay(startOfMonth(selectedDate), startOfMonth(today)) && (
          <>
            {missedDaysCurrentMonth.length > 0 ? (
                <Alert variant="destructive" className="mt-4 bg-red-50 dark:bg-red-950 border-red-500/50 text-red-700 dark:text-red-300 [&>svg]:text-red-600 dark:[&>svg]:text-red-400">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle className="font-bold">Hai dei giorni non registrati!</AlertTitle>
                    <AlertDescription>
                        Hai {missedDaysCurrentMonth.length} giorno/i passato/i in questo mese senza attività registrate o parzialmente compilati. Vai alla scheda Calendario per compilare i dati mancanti.
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
            <TabsTrigger value="settings">Impostazioni</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-4">
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
                                  if (date) {
                                      setSelectedDate(date);
                                  }
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
            </div>
          </div>
        </div>
        
        <TabsContent value="home" className="space-y-4">
           <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
              <div className="grid gap-4 auto-rows-max">
                 {leaveDurationForSelectedDate >= MAX_DURATION_PER_DAY ? (
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
                        {isCopying && <CardDescription className="text-primary font-semibold">Modalità Incolla: Seleziona date o intervalli (con SHIFT/CTRL).</CardDescription>}
                    </CardHeader>
                    <CardContent className="flex justify-center">
                        <Calendar
                           mode="multiple"
                           min={0}
                           selected={isCopying ? daysToPaste : [selectedDate]}
                           onDayClick={handleDayClick}
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
                <Card>
                    <CardHeader>
                        <CardTitle>Copia Attività su più Giorni</CardTitle>
                        <CardDescription>
                            {isCopying 
                                ? (daysToPaste.length > 0 ? `Hai selezionato ${daysToPaste.length} giorni.` : "Usa CTRL/SHIFT per selezionare i giorni.")
                                : "Copia le attività di oggi in altre date."
                            }
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-2">
                         <Button onClick={handleToggleCopyMode} variant={isCopying ? "destructive" : "default"} className="w-full">
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
                        {isCopying && daysToPaste.length > 0 && (
                             <Button onClick={handleConfirmPaste} className="w-full">
                                Incolla su {daysToPaste.length} giorni
                            </Button>
                        )}
                    </CardContent>
                </Card>
              </div>
              <div className="grid gap-4 auto-rows-max">
                <ActivityList 
                  tasks={tasksForSelectedDate} 
                  onDeleteTask={handleDeleteTask} 
                  onClearTasks={handleClearTasks}
                  isEditable={true}
                  onUpdateTask={handleUpdateTask}
                />
              </div>
           </div>
        </TabsContent>
         <TabsContent value="stats" className="space-y-4">
          <GlobalFilters
            tasks={tasks}
            dateFilterMode={dateFilterMode}
            setDateFilterMode={setDateFilterMode}
            selectedMonth={selectedMonth}
            setSelectedMonth={setSelectedMonth}
            selectedYear={selectedYear}
            setSelectedYear={setSelectedYear}
            dateRange={dateRange}
            setDateRange={setDateRange}
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
          <LeaveManager leaveDays={leaveDays} setLeaveDays={setLeaveDays} tasks={tasks} />
        </TabsContent>
         <TabsContent value="settings" className="space-y-4">
            <SettingsManager
                userProfile={userProfile}
                setUserProfile={setUserProfile}
                saveSettings={saveSettings}
                setSaveSettings={setSaveSettings}
                hasPendingChanges={hasPendingChanges}
                onSaveChanges={handleSaveChanges}
            />
        </TabsContent>
      </Tabs>
    </div>
  );
}
