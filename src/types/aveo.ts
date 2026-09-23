export type AveoExpense = {
  id: string;
  entryId: string;
  amount: number;
  description: string;
};

export type AveoEntry = {
  id: string;
  carId?: string | null;
  date: string;
  incomeAmount: number;
  incomeNote?: string | null;
  days?: number | null;
  companyProfit?: number | null;
  notes?: string | null;
  expenses: AveoExpense[];
  createdAt?: string;
  updatedAt?: string;
};

export type AveoLedgerMovement = {
  type: "income" | "expense";
  date: string;
  amount: number;
  label: string;
  rentalId?: string;
  expenseId?: string;
  days?: number | null;
  companyProfit?: number | null;
  // Solo aplica a movimientos type "expense" — si lo cubrió el cliente, el
  // monto ya viene excluido de "totals.expenses", esto es solo para poder
  // mostrar la leyenda en la fila.
  paidBy?: "CLIENTE" | "EMPRESA";
};

export type AveoLedger = {
  car: {
    id: string;
    name: string;
    excludedFromReportsAt: string | null;
  };
  movements: AveoLedgerMovement[];
  totals: {
    income: number;
    expenses: number;
    difference: number;
  };
};
