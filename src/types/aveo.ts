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
