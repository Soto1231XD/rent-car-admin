import { Rental, RentalSource, RenterType } from "@/types/rental";
import { Membership } from "@/types/membership";

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
  idNumber?: string | null;
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
  // En getClients() (lista completa) solo viene la más reciente, y solo
  // con id/status/renewalType -- el resumen de días (daysSummary) hay que
  // pedirlo aparte con getMembershipResult(id) una vez elegida. En
  // getClient(id) (ficha de un solo cliente) sí vienen completas.
  memberships?: Membership[];
  createdAt?: string;
  updatedAt?: string;
};
