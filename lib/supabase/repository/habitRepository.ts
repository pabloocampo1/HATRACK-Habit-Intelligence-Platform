



// lib/supabase/repository/habitRepository.t

import { supabase } from "../config/supabaseClient";

export const getHabitWithLogs = async (userId: string) => {
  // Traemos el hábito y sus logs del mes actual en una sola petición (Join)
  const firstDay = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
  
  const { data, error } = await supabase
    .from('habits')
    .select(`
      id, 
      name, 
      weekly_frequency, 
      habit_logs (id, created_at)
    `)
    .eq('user_id', userId)
    .gte('habit_logs.created_at', firstDay);

	console.log(data);
	

  if (error) throw new Error(error.message);
  return data;
};