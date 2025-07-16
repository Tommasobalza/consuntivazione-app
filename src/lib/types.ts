import type { LucideIcon } from 'lucide-react';
import { Briefcase, Code, MessageSquare, PenTool, School, Settings } from 'lucide-react';

export const taskCategories = ["Development", "Meeting", "Design", "Ops", "Communication", "Learning"] as const;

export type TaskCategory = (typeof taskCategories)[number];

export interface Task {
  id: string;
  description: string;
  duration: number; // in minutes
  category: TaskCategory;
  timestamp: string; // ISO string
}

export const categoryConfig: Record<TaskCategory, { icon: LucideIcon; color: string }> = {
  Development: { icon: Code, color: 'hsl(var(--chart-1))' },
  Meeting: { icon: Briefcase, color: 'hsl(var(--chart-2))' },
  Design: { icon: PenTool, color: 'hsl(var(--chart-3))' },
  Ops: { icon: Settings, color: 'hsl(var(--chart-4))' },
  Communication: { icon: MessageSquare, color: 'hsl(var(--chart-5))' },
  Learning: { icon: School, color: 'hsl(var(--chart-1))' },
};
