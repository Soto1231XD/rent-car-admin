export type GeneralExpenseType = "NOMINA" | "OTROS";

export type GeneralExpense = {
  id: string;
  type: GeneralExpenseType;
  amount: number;
  date: string;
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
};
