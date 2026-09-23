import { Client } from "@/types/client";

export type MembershipStatus =
  | "PENDIENTE"
  | "ACTIVA"
  | "GRACIA"
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

export type Membership = {
  id: string;
  clientId: string;
  status: MembershipStatus;
  renewalType: MembershipRenewalType;
  startDate?: string | null;
  currentPeriodEnd?: string | null;
  graceEndsAt?: string | null;
  cancelledAt?: string | null;
  mpPreapprovalId?: string | null;
  mpPreferenceId?: string | null;
  notes?: string | null;
  client?: Client;
  payments?: MembershipPayment[];
  createdAt?: string;
  updatedAt?: string;
};
