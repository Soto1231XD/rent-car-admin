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
export type RentalSource = "STAFF" | "WEB";
export type RentalDepositStatus = "HELD" | "RELEASED" | "CAPTURED";

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
  source: RentalSource;
  isNewClient: boolean;
  confirmedAt?: string | null;
  chargePaymentIntentId?: string | null;
  depositPaymentIntentId?: string | null;
  depositAmount?: number | null;
  depositStatus?: RentalDepositStatus | null;
  depositCapturedAmount?: number | null;
  client?: Client;
  car?: Car;
  createdAt?: string;
  updatedAt?: string;
  // Solo viene presente en la respuesta de un PATCH que completó la renta:
  // true cuando el carro no tiene todavía una tarjeta de Control de
  // kilometraje donde reflejar el kilometraje de entrega.
  mileageControlMissing?: boolean;
};
