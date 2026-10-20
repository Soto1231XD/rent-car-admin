import { Client } from "@/types/client";

// "INACTIVA" es el periodo de gracia (5 días tras vencer sin renovar); si
// pasa sin pago nuevo, cae sola a "CANCELADA" (ver expireOverdueMemberships
// en el backend). No existe un estado intermedio "GRACIA" separado.
export type MembershipStatus =
  | "PENDIENTE"
  | "ACTIVA"
  | "INACTIVA"
  | "CANCELADA";

export type MembershipRenewalType = "AUTOMATICA" | "MANUAL";

export type MembershipPayment = {
  id: string;
  membershipId: string;
  amount: number;
  status: string;
  mpPaymentId?: string | null;
  periodStart?: string | null;
  periodEnd?: string | null;
  createdAt?: string;
};

// "REGULAR" son los días con tarifa preferencial acumulados por
// antigüedad (tabulador); "CUMPLEANOS" es el día de regalo de
// cumpleaños -- bolsa separada, 1 por año.
export type MembershipDaySource = "REGULAR" | "CUMPLEANOS";

export type MembershipDayRedemption = {
  id: string;
  membershipId: string;
  source: MembershipDaySource;
  days: number;
  date: string;
  notes?: string | null;
  // Liga opcional a la renta para la que se usaron estos días (ej. canje
  // hecho directo desde "Nueva renta").
  rentalId?: string | null;
  createdAt?: string;
};

// Nunca viene guardado como número suelto -- el backend lo recalcula
// recorriendo el historial completo (pagos y canjes en orden). Los días
// NO son acumulables sin límite: cada canje reinicia el avance por la
// tabla desde cero, conservando solo lo que haya quedado sin usar.
// "lifetimeRedeemedDays" es solo informativo (total histórico, no
// participa en el cálculo de "availableDays").
export type MembershipDaysSummary = {
  availableDays: number;
  lifetimeRedeemedDays: number;
  lastRegularRedemptionDate?: string | null;
  nextRegularRedemptionEligibleDate?: string | null;
  birthdayMonth?: number | null;
  isBirthdayMonth: boolean;
  birthdayAvailable: boolean;
};

export type Membership = {
  id: string;
  membershipNumber: number;
  clientId: string;
  status: MembershipStatus;
  renewalType: MembershipRenewalType;
  startDate?: string | null;
  currentPeriodEnd?: string | null;
  graceEndsAt?: string | null;
  cancelledAt?: string | null;
  mpPreapprovalId?: string | null;
  mpPreferenceId?: string | null;
  contractPdfUrl?: string | null;
  contractSignedAt?: string | null;
  notes?: string | null;
  client?: Client;
  payments?: MembershipPayment[];
  dayRedemptions?: MembershipDayRedemption[];
  daysSummary?: MembershipDaysSummary;
  createdAt?: string;
  updatedAt?: string;
};
