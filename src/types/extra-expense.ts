import { Car } from "@/types/car";

export type ExtraExpenseStatus = "PENDIENTE" | "PAGADO" | "CANCELADO";
export type ExtraExpensePaidBy = "CLIENTE" | "EMPRESA";

export type ExtraExpense = {
  id: string;
  carId: string | null;
  concept: string;
  cost: number;
  date: string;
  status: ExtraExpenseStatus;
  paidBy: ExtraExpensePaidBy;
  notes?: string | null;
  car?: Car;
  createdAt?: string;
  updatedAt?: string;
};
