import { Rental, RenterType } from "@/types/rental";

export type Client = {
  id: string;
  fullName: string;
  email?: string | null;
  phone: string;
  idNumber: string;
  address?: string | null;
  driverLicenseNumber?: string | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  notes?: string | null;
  idDocumentImage?: string | null;
  type?: RenterType;
  rentals?: Rental[];
  createdAt?: string;
  updatedAt?: string;
};
