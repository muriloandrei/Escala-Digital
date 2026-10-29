export function isWeekStart(date: string, index: number): boolean {
  return index === 0 || new Date(`${date}T00:00:00Z`).getUTCDay() === 1;
}

export function groupScheduleWeeks(dates: string[]): string[][] {
  const weeks: string[][] = [];
  dates.forEach((date, index) => {
    if (isWeekStart(date, index)) weeks.push([]);
    weeks[weeks.length - 1].push(date);
  });
  return weeks;
}
