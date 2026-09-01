import { Rental, RentalSource, RenterType } from "@/types/rental";

export type ClientDocument = {
  id: string;
  clientId: string;
  label: string;
  url: string;
  createdAt?: string;
};

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
  documents?: ClientDocument[];
  birthDate?: string | null;
  type?: RenterType;
  source: RentalSource;
  rentals?: Rental[];
  createdAt?: string;
  updatedAt?: string;
};
