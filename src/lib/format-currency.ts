export function toMoneyNumber(value?: number | string | null): number {
  if (value === null || value === undefined || value === "") {
    return 0;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  const parsed = Number(value.replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

export function formatCurrency(value?: number | string | null): string {
  return `$${toMoneyNumber(value).toLocaleString("es-MX", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} MXN`;
}

export function normalizeCurrencyValue(value: unknown): unknown {
  return typeof value === "string" ? value.replace(/,/g, "") : value;
}

// Live-formats a currency <input> as the user types: keeps thousands
// separators while still allowing a decimal point and up to 2 cent digits
// (unlike a plain digit-only strip, which used to eat the "." and made it
// impossible to type cents at all).
export function formatCurrencyInputValue(
  value?: string | number | null
): string {
  if (value === undefined || value === null || value === "") {
    return "";
  }

  const cleaned = String(value).replace(/[^\d.]/g, "");
  const hasDecimalPoint = cleaned.includes(".");
  const [integerPart, ...decimalParts] = cleaned.split(".");
  const decimalPart = decimalParts.join("").slice(0, 2);

  if (!integerPart && !decimalPart) {
    return "";
  }

  const formattedInteger = integerPart
    ? Number(integerPart).toLocaleString("es-MX")
    : "0";

  return hasDecimalPoint ? `${formattedInteger}.${decimalPart}` : formattedInteger;
}

export function formatCurrencyInput(event: { currentTarget: HTMLInputElement }) {
  event.currentTarget.value = formatCurrencyInputValue(event.currentTarget.value);
}
