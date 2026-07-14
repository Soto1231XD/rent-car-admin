import { Car } from "@/types/car";
import { Client } from "@/types/client";

export type RentalStatus =
  | "RESERVACION"
  | "ACTIVO"
  | "COMPLETADO"
  | "CANCELADO";

export type RentalPriceMode = "NORMAL" | "TEMPORADA_ALTA";
export type RenterType = "CLIENTE" | "COMISIONISTA";
export type RentalType = "NORMAL" | "INDEFINIDA";

export type Rental = {
  id: string;
  clientId: string;
  carId: string | null;
  startDate: string;
  endDate: string | null;
  rentalType: RentalType;
  renterType: RenterType;
  priceMode: RentalPriceMode;
  dailyRateApplied: number;
  daysCharged: number | null;
  totalPrice: number;
  advancePayment: number;
  status: RentalStatus;
  notes?: string | null;
  client?: Client;
  car?: Car;
  createdAt?: string;
  updatedAt?: string;
};
