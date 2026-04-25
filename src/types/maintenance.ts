export type MaintenanceStatus = "PENDIENTE" | "EN PROGRESO" | "COMPLETADO";

export type Maintenance = {
  id: number;
  carName: string;
  serviceType: string;
  cost: number;
  date: string;
  status: MaintenanceStatus;
  notes?: string;
};