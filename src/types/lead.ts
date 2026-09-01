import { Car } from "@/types/car";

export type LeadStatus = "NUEVA" | "CONTACTADA" | "CERRADA" | "CONVERTIDA";

export type Lead = {
  id: string;
  fullName: string;
  phone: string;
  email?: string | null;
  carId?: string | null;
  car?: Car | null;
  pickupDate?: string | null;
  returnDate?: string | null;
  message?: string | null;
  status: LeadStatus;
  convertedClientId?: string | null;
  createdAt?: string;
  updatedAt?: string;
};
