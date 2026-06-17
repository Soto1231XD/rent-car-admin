import { Car } from "@/types/car";

export type ExtraExpenseStatus = "PENDIENTE" | "PAGADO" | "CANCELADO";

export type ExtraExpense = {
  id: string;
  carId: string;
  concept: string;
  cost: number;
  date: string;
  status: ExtraExpenseStatus;
  notes?: string | null;
  car?: Car;
  createdAt?: string;
  updatedAt?: string;
};
