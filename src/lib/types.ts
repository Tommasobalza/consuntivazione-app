import type { LucideIcon } from 'lucide-react';
import { Briefcase, Code, GraduationCap, Grip, Laptop, Building, User, Bot, Shell, Smile, Star, HardHat, CodeXml, TerminalSquare, GitBranch, Database, Cpu, Server, UserCheck, UserCog, UserCircle } from 'lucide-react';

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
  category: TaskCategory;
}

export interface Task {
  id: string;
  name: string;
  description?: string;
  duration: TaskDuration;
  category: TaskCategory;
  location: TaskLocation;
  timestamp: string; // ISO string
  tagId?: string;
  tag?: Tag;
}

export const leaveTypes = ["Ferie", "Malattia", "Festività"] as const;
export type LeaveType = (typeof leaveTypes)[number];

export interface LeaveDay {
  date: string; // ISO string for the day
  type: LeaveType;
}

export interface UserProfile {
    name: string;
    role: string;
    icon: string;
}

export interface SaveSettings {
    autoSave: boolean;
}

export const userIcons: Record<string, LucideIcon> = {
    User,
    UserCircle,
    UserCog,
    UserCheck,
    Bot,
    Smile,
    Shell,
    Star,
    HardHat,
    CodeXml,
    TerminalSquare,
    GitBranch,
    Database,
    Cpu,
    Server,
};

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
    "#ef4444", "#f97316", "#f59e0b", "#eab308", "#84cc16", "#22c55e", "#10b981", "#14b8a6", "#06b6d4", "#0ea5e9", "#3b82f6", "#6366f1", "#8b5cf6", "#a855f7", "#d946ef", "#ec4899", "#f43f5e"
];
