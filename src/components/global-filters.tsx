
"use client";

import { useMemo } from 'react';
import type { Task, TaskCategory, TaskLocation } from '@/lib/types';
import { taskCategories, taskLocations } from '@/lib/types';
import { getMonth, getYear } from 'date-fns';
import { it } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface GlobalFiltersProps {
  tasks: Task[];
  selectedMonth: number;
  setSelectedMonth: (month: number) => void;
  selectedYear: number;
  setSelectedYear: (year: number) => void;
  selectedCategory: TaskCategory | 'all';
  setSelectedCategory: (category: TaskCategory | 'all') => void;
  selectedLocation: TaskLocation | 'all';
  setSelectedLocation: (location: TaskLocation | 'all') => void;
}

export function GlobalFilters({
  tasks,
  selectedMonth,
  setSelectedMonth,
  selectedYear,
  setSelectedYear,
  selectedCategory,
  setSelectedCategory,
  selectedLocation,
  setSelectedLocation,
}: GlobalFiltersProps) {

  const availableMonths = useMemo(() => {
    const monthSet = new Set<string>();
    tasks.forEach(task => {
      const date = new Date(task.timestamp);
      const year = getYear(date);
      const month = getMonth(date);
      monthSet.add(`${year}-${month}`);
    });
    return Array.from(monthSet).map(m => {
      const [year, month] = m.split('-').map(Number);
      const date = new Date(year, month);
      return {
        value: `${year}-${month}`,
        label: new Intl.DateTimeFormat('it-IT', { month: 'long', year: 'numeric' }).format(date),
      };
    }).sort((a,b) => new Date(b.value).getTime() - new Date(a.value).getTime());
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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Mese</Label>
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
        </div>
      </CardContent>
    </Card>
  );
}
