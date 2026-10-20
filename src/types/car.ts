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
  // Cargo único de cambio de clasificación para ESTE auto (varía por auto,
  // no solo por letra de clasificación -- ver RentalForm.tsx).
  classificationSwapFee: number;
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
