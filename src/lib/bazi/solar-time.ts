export interface DateTime {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
}

export function applyTrueSolarTime(dt: DateTime, longitude: number): DateTime {
  const offsetMinutes = Math.round((longitude - 120) * 4);
  const date = new Date(Date.UTC(dt.year, dt.month - 1, dt.day, dt.hour, dt.minute));
  date.setUTCMinutes(date.getUTCMinutes() + offsetMinutes);
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
    hour: date.getUTCHours(),
    minute: date.getUTCMinutes(),
  };
}
