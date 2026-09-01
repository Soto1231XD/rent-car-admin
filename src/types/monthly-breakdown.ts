export type MonthlyBreakdownCarEntry = {
  carId: string;
  carName: string;
  income: number;
  expenses: number;
  net: number;
};

export type MonthlyBreakdownEntry = {
  year: number;
  month: number;
  cars: MonthlyBreakdownCarEntry[];
  payroll: number;
  other: number;
  totals: {
    income: number;
    expenses: number;
    net: number;
  };
};
