import { Car } from "@/types/car";
import { Client } from "@/types/client";

export type RentalStatus =
  | "RESERVACION"
  | "ACTIVO"
  | "COMPLETADO"
  | "CANCELADO";

export type RentalPriceMode = "NORMAL" | "TEMPORADA_ALTA";

export type Rental = {
  id: string;
  clientId: string;
  carId: string;
  startDate: string;
  endDate: string;
  priceMode: RentalPriceMode;
  dailyRateApplied: number;
  daysCharged: number;
  totalPrice: number;
  status: RentalStatus;
  notes?: string | null;
  client?: Client;
  car?: Car;
  createdAt?: string;
  updatedAt?: string;
};
