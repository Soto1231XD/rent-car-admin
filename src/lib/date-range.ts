/** Rango [inicio, fin) del mes actual, para filtrar registros "de este mes". */
export function getCurrentMonthRange() {
  const start = new Date();
  start.setDate(1);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setMonth(start.getMonth() + 1);

  return { start, end };
}

export function isWithinRange(value: string, start: Date, end: Date) {
  const date = new Date(value);
  return date >= start && date < end;
}
