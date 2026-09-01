import { Car } from "@/types/car";

export type SavingsFundEntry = {
  id: string;
  date: string;
  clientName: string;
  incomeAmount: number;
  expenseAmount: number;
  carId?: string | null;
  car?: Car | null;
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
};
