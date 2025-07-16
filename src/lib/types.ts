import type { LucideIcon } from 'lucide-react';
import { Briefcase, Code, GraduationCap, Grip, Laptop, Building } from 'lucide-react';

export const taskCategories = ["Sviluppo", "Riunione", "Formazione", "Altro"] as const;
export type TaskCategory = (typeof taskCategories)[number];

export const taskDurations = [480, 240, 60, 30] as const;
export type TaskDuration = (typeof taskDurations)[number];

export const taskLocations = ["Smart Working", "Sede"] as const;
export type TaskLocation = (typeof taskLocations)[number];

export interface Tag {
  id: string;
  name: string;
  color: string;
  description: string;
  category: TaskCategory;
  location: TaskLocation;
  duration: TaskDuration;
}

export interface Task {
  id: string;
  description: string;
  duration: TaskDuration;
  category: TaskCategory;
  location: TaskLocation;
  timestamp: string; // ISO string
  tagId?: string;
  tag?: Tag;
}


export const categoryConfig: Record<TaskCategory, { icon: LucideIcon; color: string }> = {
  Sviluppo: { icon: Code, color: 'hsl(var(--chart-1))' },
  Riunione: { icon: Briefcase, color: 'hsl(var(--chart-2))' },
  Formazione: { icon: GraduationCap, color: 'hsl(var(--chart-3))' },
  Altro: { icon: Grip, color: 'hsl(var(--chart-4))' },
};

export const locationConfig: Record<TaskLocation, { icon: LucideIcon }> = {
  'Smart Working': { icon: Laptop },
  'Sede': { icon: Building },
};

export const tailwindColors = [
    "red", "orange", "amber", "yellow", "lime", "green", "emerald", "teal", "cyan", "sky", "blue", "indigo", "violet", "purple", "fuchsia", "pink", "rose"
];
