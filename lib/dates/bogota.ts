const BOGOTA_TIME_ZONE = "America/Bogota";

const ymdFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: BOGOTA_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function bogotaTodayYMD(reference: Date = new Date()) {
  return ymdFormatter.format(reference);
}

export function bogotaDateToYMD(value: Date | string) {
  return ymdFormatter.format(typeof value === "string" ? new Date(value) : value);
}

export function bogotaYMDToDate(value: string) {
  return new Date(`${value.slice(0, 10)}T12:00:00-05:00`);
}

export function addDaysBogotaYMD(value: string, days: number) {
  const date = bogotaYMDToDate(value);
  date.setUTCDate(date.getUTCDate() + days);
  return bogotaDateToYMD(date);
}

export function startOfWeekBogotaYMD(reference: Date = new Date()) {
  const today = bogotaTodayYMD(reference);
  const date = bogotaYMDToDate(today);
  const day = date.getUTCDay(); // 0 domingo, 1 lunes...
  const diff = day === 0 ? -6 : 1 - day;
  return addDaysBogotaYMD(today, diff);
}

export function monthRangeBogotaYMD(reference: Date = new Date()) {
  const [year, month] = bogotaTodayYMD(reference).split("-").map(Number);
  const start = `${year}-${String(month).padStart(2, "0")}-01`;
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const end = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
  return { start, end };
}

export function daysAgoBogotaYMD(days: number, reference: Date = new Date()) {
  return addDaysBogotaYMD(bogotaTodayYMD(reference), -days);
}

export function diffDaysBogotaYMD(from: string, to: string) {
  return Math.ceil(
    (bogotaYMDToDate(to).getTime() - bogotaYMDToDate(from).getTime()) /
      86_400_000,
  );
}

export { BOGOTA_TIME_ZONE };
