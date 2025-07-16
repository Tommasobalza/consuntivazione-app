
"use client";

import * as React from 'react';
import { useMemo } from 'react';
import type { Task, TaskCategory, TaskLocation, DateRange } from '@/lib/types';
import { taskCategories, taskLocations } from '@/lib/types';
import { getMonth, getYear, format } from 'date-fns';
import { it } from 'date-fns/locale';
import { Calendar as CalendarIcon } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';


interface GlobalFiltersProps {
  tasks: Task[];
  dateFilterMode: 'month' | 'range';
  setDateFilterMode: (mode: 'month' | 'range') => void;
  selectedMonth: number;
  setSelectedMonth: (month: number) => void;
  selectedYear: number;
  setSelectedYear: (year: number) => void;
  dateRange: DateRange | undefined;
  setDateRange: (range: DateRange | undefined) => void;
  selectedCategory: TaskCategory | 'all';
  setSelectedCategory: (category: TaskCategory | 'all') => void;
  selectedLocation: TaskLocation | 'all';
  setSelectedLocation: (location: TaskLocation | 'all') => void;
  selectedActivityName: string;
  setSelectedActivityName: (name: string) => void;
}

export function GlobalFilters({
  tasks,
  dateFilterMode,
  setDateFilterMode,
  selectedMonth,
  setSelectedMonth,
  selectedYear,
  setSelectedYear,
  dateRange,
  setDateRange,
  selectedCategory,
  setSelectedCategory,
  selectedLocation,
  setSelectedLocation,
  selectedActivityName,
  setSelectedActivityName
}: GlobalFiltersProps) {

  const { availableMonths, availableActivities } = useMemo(() => {
    const monthSet = new Set<string>();
    const activityNameSet = new Set<string>();
    
    tasks.forEach(task => {
      const date = new Date(task.timestamp);
      const year = getYear(date);
      const month = getMonth(date);
      monthSet.add(`${year}-${month}`);
      if(task.name) {
        activityNameSet.add(task.name);
      }
    });

    const months = Array.from(monthSet).map(m => {
      const [year, month] = m.split('-').map(Number);
      const date = new Date(year, month);
      return {
        value: `${year}-${month}`,
        label: new Intl.DateTimeFormat('it-IT', { month: 'long', year: 'numeric' }).format(date),
      };
    }).sort((a,b) => new Date(b.value).getTime() - new Date(a.value).getTime());
    
    const activities = Array.from(activityNameSet).sort();
    
    return { availableMonths: months, availableActivities: activities };
  }, [tasks]);

  const handleMonthChange = (value: string) => {
    const [year, month] = value.split('-').map(Number);
    setSelectedYear(year);
    setSelectedMonth(month);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Filtri Globali</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label>Data</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dateRange && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateFilterMode === 'month' ? (
                    availableMonths.find(m => m.value === `${selectedYear}-${selectedMonth}`)?.label || 'Seleziona un mese'
                  ) : dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "LLL dd, y", { locale: it })} -{" "}
                        {format(dateRange.to, "LLL dd, y", { locale: it })}
                      </>
                    ) : (
                      format(dateRange.from, "LLL dd, y", { locale: it })
                    )
                  ) : (
                    <span>Seleziona un intervallo</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-4 space-y-4" align="start">
                <RadioGroup
                  defaultValue={dateFilterMode}
                  onValueChange={(value) => setDateFilterMode(value as 'month' | 'range')}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="month" id="r1" />
                    <Label htmlFor="r1">Per Mese</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="range" id="r2" />
                    <Label htmlFor="r2">Per Intervallo</Label>
                  </div>
                </RadioGroup>

                {dateFilterMode === 'month' ? (
                  <Select onValueChange={handleMonthChange} value={`${selectedYear}-${selectedMonth}`}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona un mese" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableMonths.map(month => (
                        <SelectItem key={month.value} value={month.value}>
                          {month.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                    locale={it}
                  />
                )}
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-2">
            <Label>Categoria</Label>
            <Select onValueChange={(value) => setSelectedCategory(value as TaskCategory | 'all')} value={selectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Seleziona una categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutte le Categorie</SelectItem>
                {taskCategories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Località</Label>
             <Select onValueChange={(value) => setSelectedLocation(value as TaskLocation | 'all')} value={selectedLocation}>
              <SelectTrigger>
                <SelectValue placeholder="Seleziona una località" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutte le Località</SelectItem>
                {taskLocations.map(loc => (
                  <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Attività</Label>
            <Select onValueChange={(value) => setSelectedActivityName(value)} value={selectedActivityName}>
              <SelectTrigger>
                <SelectValue placeholder="Seleziona un'attività" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutte le Attività</SelectItem>
                {availableActivities.map(activity => (
                  <SelectItem key={activity} value={activity}>{activity}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

    