/** Convierte minutos a texto legible en horas (p. ej. 90 → "1 h 30 min"). */
export function formatHoursFromMinutes(minutes: number): string {
  if (minutes <= 0) return "0 h";

  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;

  if (hours === 0) {
    const decimal = (minutes / 60).toFixed(1).replace(/\.0$/, "");
    return `${decimal} h`;
  }

  if (remainder === 0) return `${hours} h`;
  return `${hours} h ${remainder} min`;
}
