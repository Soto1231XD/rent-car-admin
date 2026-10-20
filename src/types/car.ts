export type CarStatus =
  | "DISPONIBLE"
  | "MANTENIMIENTO"
  | "NO_DISPONIBLE"
  | "RENTADO";

export type Transmission = "AUTOMATICO" | "ESTANDAR";

export type FuelType = "GASOLINA" | "DIESEL" | "HIBRIDA" | "ELECTRICA";

export type CarClassification = "A" | "B" | "C" | "D" | "E";

export type Car = {
  id: string;
  brand: string;
  model: string;
  year?: number | null;
  plate?: string | null;
  color?: string | null;
  transmission: Transmission;
  fuelType?: FuelType;
  engineType?: string | null;
  displacement?: string | null;
  hasCarPlay?: boolean;
  trunkCapacity?: string | null;
  passengers: number;
  status: CarStatus;
  dailyPrice: number;
  highSeasonPrice: number;
  commissionDailyPrice?: number | null;
  commissionHighSeasonPrice?: number | null;
  deposit: number;
  classification: CarClassification;
  // Excepción de cargo de cambio de clasificación para ESTE auto. `null`
  // significa "usa el precio base de su clasificación" (ver
  // types/classification-pricing.ts); un valor significa que este auto
  // cobra distinto al resto de su clasificación (ej. Jetta vs Ertiga en D).
  classificationSwapFee: number | null;
  currentMileage?: number | null;
  /** Calculado por el backend a partir del historial de mantenimiento. Solo lectura. */
  nextServiceMileage?: number | null;
  /** Calculado por el backend a partir del historial de mantenimiento. Solo lectura. */
  nextServiceDate?: string | null;
  /** Calculado por el backend: true si el auto alcanzó su próximo servicio. */
  serviceDue?: boolean;
  weeklyPrice?: number;
  monthlyPrice?: number;
  description?: string | null;
  features?: string[] | null;
  images: string[];
  /** Si tiene valor, este auto dejó de contarse en los reportes generales desde esa fecha (p.ej. un auto prestado con cuenta aparte, ver módulo Aveo). */
  excludedFromReportsAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
};
