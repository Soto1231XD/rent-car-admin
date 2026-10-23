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
  // `null` = este auto no participa en el programa de membresía (no se le
  // asignó a propósito). Solo agrupa/filtra -- ya no tiene ningún precio
  // propio, ver membershipDailyPrice/membershipHighSeasonPrice.
  classification: CarClassification | null;
  // Precio con membresía de ESTE auto (aparte de dailyPrice/highSeasonPrice,
  // que son el precio normal). `null` = sin precio de membresía
  // configurado -- se trata como "no participa" aunque tenga clasificación.
  membershipDailyPrice: number | null;
  membershipHighSeasonPrice: number | null;
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
