"use client";

import { useState } from 'react';
import type { Task } from '@/lib/types';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { ActivityLogger } from '@/components/activity-logger';
import { ActivityList } from '@/components/activity-list';
import { SummaryCards } from '@/components/summary-cards';
import { CategoryDistributionChart } from '@/components/charts/category-distribution-chart';
import { InsightsReport } from '@/components/insights-report';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function Dashboard() {
  const [tasks, setTasks] = useLocalStorage<Task[]>('daily-tasks', []);

  const handleAddTask = (task: Omit<Task, 'id' | 'timestamp'>) => {
    const newTask: Task = {
      ...task,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
    };
    setTasks(prevTasks => [...prevTasks, newTask]);
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
  };
  
  const handleClearTasks = () => {
    setTasks([]);
  };

  const todayTasks = tasks.filter(task => {
    const taskDate = new Date(task.timestamp).toDateString();
    const today = new Date().toDateString();
    return taskDate === today;
  });

  return (
    <div className="flex-1 space-y-4 p-4 sm:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-gray-800 dark:text-white">
          Work Insights
        </h1>
      </div>
      <div className="space-y-4">
        <SummaryCards tasks={todayTasks} />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <div className="lg:col-span-4 grid gap-4 auto-rows-max">
            <ActivityLogger onAddTask={handleAddTask} />
            <ActivityList tasks={todayTasks} onDeleteTask={handleDeleteTask} onClearTasks={handleClearTasks} />
          </div>
          <div className="lg:col-span-3 grid gap-4 auto-rows-max">
             <Card>
                <CardHeader>
                    <CardTitle>Time Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                    <CategoryDistributionChart tasks={todayTasks} />
                </CardContent>
            </Card>
            <InsightsReport tasks={todayTasks} />
          </div>
        </div>
      </div>
    </div>
  );
}
