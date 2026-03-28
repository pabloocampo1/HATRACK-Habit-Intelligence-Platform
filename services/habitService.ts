
import { getHabitWithLogs } from "@/lib/supabase/repository/habitRepository";

export const getHabitPerformance = async (userId: string) => {
  const habits = await getHabitWithLogs(userId);

  
  return habits.map(habit => {
    const accomplished = habit.habit_logs.length;
    const goal = habit.weekly_frequency * 4; 
    
  
    const performancePercent = goal > 0 ? (accomplished / goal) * 100 : 0;

    return {
      name: habit.name,
      accomplished,
      goal,
      status: performancePercent >= 100 ? 'LEGEND' : 'IN_PROGRESS',
      percent: Math.round(performancePercent)
    };
  });
};