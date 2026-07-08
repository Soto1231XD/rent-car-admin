import { Car } from "@/types/car";

export type MaintenanceStatus = "PENDIENTE" | "EN_PROGRESO" | "COMPLETADO";

export type Maintenance = {
  id: string;
  carId: string | null;
  serviceType: string;
  cost: number;
  date: string;
  status: MaintenanceStatus;
  notes?: string | null;
  car?: Car;
  createdAt?: string;
  updatedAt?: string;
};
