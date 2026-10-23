import { Car } from "@/types/car";
import { Client } from "@/types/client";
import { MembershipDayRedemption } from "@/types/membership";

export type RentalStatus =
  | "RESERVACION"
  | "ACTIVO"
  | "COMPLETADO"
  | "CANCELADO";

export type RentalPriceMode = "NORMAL" | "TEMPORADA_ALTA";
export type RenterType = "CLIENTE" | "COMISIONISTA";
export type RentalType = "NORMAL" | "INDEFINIDA";
export type RentalSource = "STAFF" | "WEB";

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
  depositAmount?: number | null;
  deliveryLocationId?: string | null;
  deliveryPlazaId?: string | null;
  deliveryAddress?: string | null;
  deliveryFee?: number | null;
  deliveryLocation?: string | null;
  returnLocationId?: string | null;
  returnPlazaId?: string | null;
  returnAddress?: string | null;
  returnFee?: number | null;
  returnLocation?: string | null;
  // Cuántos días de esta renta se cobraron a la tarifa de canje de
  // membresía (0 en rentas normales) -- congelado al crear/editar la
  // renta, ya va incluido en totalPrice.
  membershipRedeemedDays?: number;
  client?: Client;
  car?: Car;
  // Canjes de días de membresía ligados a esta renta (si se usaron días
  // de tarifa preferencial al crearla).
  dayRedemptions?: MembershipDayRedemption[];
  createdAt?: string;
  updatedAt?: string;
  // Solo viene presente en la respuesta de un PATCH que completó la renta:
  // true cuando el carro no tiene todavía una tarjeta de Control de
  // kilometraje donde reflejar el kilometraje de entrega.
  mileageControlMissing?: boolean;
};
