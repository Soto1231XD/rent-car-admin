export type CarStatus = "DISPONIBLE" | "MANTENIMIENTO" | "FUERA_DE_SERVICIO" | "RENTADO";

export type Transmission = "AUTOMATICO" | "MANUAL";

export type FuelType = "GASOLINA" | "DIESEL" | "HIBRIDA" | "ELECTRICA";

export type Car = {
  id: number;
  brand: string;
  model: string;
  year: number;
  plate: string;
  color: string;
  transmission: Transmission;
  fuelType: FuelType;
  passengers: number;
  status: CarStatus;
  dailyPrice: number;
  weeklyPrice?: number;
  monthlyPrice?: number;
  description?: string;
};