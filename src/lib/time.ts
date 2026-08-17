export function isWithinHours(dateValue: string | undefined | null, hours: number) {
  if (!dateValue) {
    return false;
  }

  const elapsedMs = Date.now() - new Date(dateValue).getTime();

  return elapsedMs >= 0 && elapsedMs < hours * 60 * 60 * 1000;
}
