import { Car } from "@/types/car";

/**
 * Carros marcados como "aparte" (Aveo y similares) junto con la fecha desde
 * la que sus rentas/gastos dejan de sumarse en los reportes generales.
 * Mapea carId -> excludedFromReportsAt (ISO string).
 */
export function buildExcludedCutoffMap(cars: Car[]): Map<string, string> {
  const map = new Map<string, string>();

  for (const car of cars) {
    if (car.excludedFromReportsAt) {
      map.set(car.id, car.excludedFromReportsAt);
    }
  }

  return map;
}

/**
 * Replica la misma regla que usa el backend (Dashboard, Historial mensual,
 * Control mensual): un registro cuenta en los totales generales a menos que
 * su carro esté marcado como "aparte" Y la fecha del registro sea igual o
 * posterior a esa fecha de corte. Lo anterior al corte, o de un carro que
 * nunca se excluyó, sigue contando igual que siempre.
 */
export function isCountedInGeneralReports(
  carId: string | null | undefined,
  dateValue: string | null | undefined,
  cutoffByCarId: Map<string, string>
): boolean {
  if (!carId || !dateValue) {
    return true;
  }

  const cutoff = cutoffByCarId.get(carId);
  if (!cutoff) {
    return true;
  }

  return new Date(dateValue) < new Date(cutoff);
}
