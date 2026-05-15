import { Rental } from "@/types/rental";

export type Client = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  idNumber: string;
  address?: string | null;
  driverLicenseNumber: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  notes?: string | null;
  rentals?: Rental[];
  createdAt?: string;
  updatedAt?: string;
};
