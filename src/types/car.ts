export type CarStatus =
  | "DISPONIBLE"
  | "MANTENIMIENTO"
  | "NO_DISPONIBLE"
  | "RENTADO";

export type Transmission = "AUTOMATICO" | "ESTANDAR";

export type FuelType = "GASOLINA" | "DIESEL" | "HIBRIDA" | "ELECTRICA";

export type Car = {
  id: string;
  brand: string;
  model: string;
  year: number;
  plate: string;
  color: string;
  transmission: Transmission;
  fuelType?: FuelType;
  engineType?: string | null;
  displacement?: string | null;
  hasCarPlay?: boolean;
  trunkCapacity?: string | null;
  passengers: number;
  status: CarStatus;
  dailyPrice: number;
  highSeasonPrice?: number | null;
  deposit?: number | null;
  weeklyPrice?: number;
  monthlyPrice?: number;
  description?: string | null;
  features?: string[] | null;
  images: string[];
  createdAt?: string;
  updatedAt?: string;
};
