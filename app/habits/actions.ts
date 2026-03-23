

import { Habit, HabitLog, Stats, CreateHabitPayload, LogActivityPayload } from "@/lib/types";

async function getToken() {
  // En producción, obtener del contexto de autenticación
  // Por ahora asumir que se pasa desde cliente
  return null;
}

export async function getHabits(token: string): Promise<Habit[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/habits`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error("Error al obtener hábitos");
  return res.json();
}

export async function createHabit(token: string, habit: CreateHabitPayload): Promise<Habit> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/habits`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(habit),
  });

  if (!res.ok) throw new Error("Error al crear hábito");
  return res.json();
}

export async function updateHabit(token: string, id: string, habit: Partial<CreateHabitPayload>): Promise<Habit> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/habits/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(habit),
  });

  if (!res.ok) throw new Error("Error al actualizar hábito");
  return res.json();
}

export async function deleteHabit(token: string, id: string): Promise<void> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/habits/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error("Error al eliminar hábito");
}

export async function logActivity(
  token: string,
  habitId: string,
  log: LogActivityPayload
): Promise<HabitLog> {

	
	

	
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/habits/${habitId}/logs`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(log),
    }
  );

  if (!res.ok) throw new Error("Error al registrar actividad");
  return res.json();
}

export async function getHabitLogs(token: string, habitId: string): Promise<HabitLog[]> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/habits/${habitId}/logs`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!res.ok) throw new Error("Error al obtener registros");
  return res.json();
}

export async function getStats(token: string): Promise<Stats> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/stats`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error("Error al obtener estadísticas");
  return res.json();
}
