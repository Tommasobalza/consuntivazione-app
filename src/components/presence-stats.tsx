
"use client";

import { useMemo } from 'react';
import type { Task } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Building, CalendarDays, TrendingUp } from 'lucide-react';
import { format, startOfDay } from 'date-fns';

interface PresenceStatsProps {
  tasks: Task[];
}

export function PresenceStats({ tasks }: PresenceStatsProps) {
  const stats = useMemo(() => {
    const officeTasks = tasks.filter(t => t.location === 'Sede');
    if (officeTasks.length === 0) {
      return { lastVisit: null, totalDays: 0 };
    }

    const officeDays = new Set(officeTasks.map(t => startOfDay(new Date(t.timestamp)).toISOString()));
    
    const lastVisit = new Date(Math.max(...Array.from(officeDays).map(day => new Date(day).getTime())));

    return {
      lastVisit: format(lastVisit, 'd MMMM yyyy'),
      totalDays: officeDays.size,
    };
  }, [tasks]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Statistiche Presenza in Sede</CardTitle>
        <CardDescription>Analisi delle tue giornate di lavoro in sede per il periodo selezionato.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center">
            <CalendarDays className="h-6 w-6 mr-4 text-muted-foreground" />
            <div>
                <p className="text-sm font-medium text-muted-foreground">Ultima volta in sede</p>
                <p className="text-xl font-bold">{stats.lastVisit ?? 'N/D'}</p>
            </div>
        </div>
         <div className="flex items-center">
            <Building className="h-6 w-6 mr-4 text-muted-foreground" />
            <div>
                <p className="text-sm font-medium text-muted-foreground">Totale giorni in sede</p>
                <p className="text-xl font-bold">{stats.totalDays}</p>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
