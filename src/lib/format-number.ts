// Live-formats an integer-only <input> as the user types (thousands
// separators, no decimal point) — for counts like mileage, not money.
export function formatIntegerInputValue(
  value?: string | number | null
): string {
  if (value === undefined || value === null || value === "") {
    return "";
  }

  const digits = String(value).replace(/\D/g, "");
  return digits ? Number(digits).toLocaleString("es-MX") : "";
}

export function formatIntegerInput(event: { currentTarget: HTMLInputElement }) {
  event.currentTarget.value = formatIntegerInputValue(event.currentTarget.value);
}
