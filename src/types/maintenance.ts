import { Car } from "@/types/car";

export type MaintenanceStatus = "PENDIENTE" | "EN_PROGRESO" | "COMPLETADO";
export type MaintenanceProviderType = "AGENCIA" | "INDEPENDIENTE";
export type MaintenanceRecordType = "REVISION" | "SERVICIO";

export type Maintenance = {
  id: string;
  carId: string | null;
  recordType: MaintenanceRecordType;
  serviceType?: string | null;
  cost?: number | null;
  date: string;
  status: MaintenanceStatus;
  notes?: string | null;
  reviewDate?: string | null;
  serviceMileage?: number | null;
  previousMileage?: number | null;
  nextServiceMileage?: number | null;
  nextServiceDate?: string | null;
  providerType?: MaintenanceProviderType | null;
  location?: string | null;
  includesMaterial?: boolean | null;
  car?: Car;
  createdAt?: string;
  updatedAt?: string;
};

// Foto del valor anterior de los 6 campos que sí se van editando con el
// tiempo en una revisión de Control de kilometraje, guardada justo antes de
// sobrescribirlos.
export type MaintenanceFieldHistory = {
  id: string;
  maintenanceId: string;
  date: string;
  serviceMileage?: number | null;
  previousMileage?: number | null;
  nextServiceMileage?: number | null;
  cost?: number | null;
  reviewDate?: string | null;
  providerType?: MaintenanceProviderType | null;
  location?: string | null;
  serviceType?: string | null;
  includesMaterial?: boolean | null;
  recordedAt: string;
};
