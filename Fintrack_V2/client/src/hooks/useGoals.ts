import { useState, useMemo } from 'react';

export interface Goal {
  id: string;
  title: string;
  target: number;
  current: number;
  deadline: string;
  icon: string;
  color: string;
}

export type NewGoalInput = Omit<Goal, 'id' | 'current' | 'icon' | 'color'>;

const INITIAL_GOALS: Goal[] = [
  { id: '1', title: 'Emergency Fund', target: 300000, current: 180000, deadline: '2026-12-31', icon: '🛡️', color: '#6366f1' },
  { id: '2', title: 'Europe Trip',     target: 200000, current: 45000,  deadline: '2027-06-30', icon: '✈️', color: '#ec4899' },
  { id: '3', title: 'New Laptop',     target: 80000,  current: 60000,  deadline: '2026-06-30', icon: '💻', color: '#10b981' },
  { id: '4', title: 'Investment Fund',target: 500000, current: 95000,  deadline: '2028-01-01', icon: '📈', color: '#f59e0b' },
];

// Helper for date calculations
const NOW = new Date('2026-03-26').getTime();

export function useGoals() {
  const [goals, setGoals] = useState<Goal[]>(INITIAL_GOALS);

  const addGoal = (data: NewGoalInput) => {
    const newGoal: Goal = {
      ...data,
      id: Math.random().toString(36).substr(2, 9),
      current: 0,
      // Defaulting these since they aren't in your current form
      icon: '💰', 
      color: '#' + Math.floor(Math.random()*16777215).toString(16), 
      target: Number(data.target),
    };
    setGoals(prev => [newGoal, ...prev]);
  };

  const stats = useMemo(() => {
    return goals.map(g => {
      const pct = Math.round((g.current / g.target) * 100);
      const daysLeft = Math.ceil((new Date(g.deadline).getTime() - NOW) / 86400000);
      return { ...g, pct, daysLeft };
    });
  }, [goals]);

  return { goals: stats, addGoal };
}