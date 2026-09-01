import Link from "next/link";
import { Clock, ReceiptText } from "lucide-react";
import ExtraExpensesTable from "@/components/extra-expenses/ExtraExpensesTable";
import SummaryCard from "@/components/ui/SummaryCard";
import { getCars, getExtraExpenses } from "@/lib/api";
import { buildExcludedCutoffMap, isCountedInGeneralReports } from "@/lib/excluded-cars";
import { getCurrentMonthRange, isWithinRange } from "@/lib/date-range";
import { formatCurrency } from "@/lib/format-currency";

type Props = {
  searchParams: Promise<{
    success?: string;
  }>;
};

export default async function ExtraExpensesPage({ searchParams }: Props) {
  await searchParams;
  const [extraExpenses, cars] = await Promise.all([getExtraExpenses(), getCars()]);

  const cutoffByCarId = buildExcludedCutoffMap(cars);
  const { start, end } = getCurrentMonthRange();

  // Mismo criterio que el Dashboard: solo lo ya pagado Y con fecha de este
  // mes cuenta como gasto del mes, excluyendo los carros "aparte" a partir
  // de su fecha de corte, para reconciliar con la tarjeta "Gastos extras"
  // del Dashboard.
  const paidExpenses = extraExpenses.filter((expense) => expense.status === "PAGADO");
  const monthlyPaidExpenses = paidExpenses.filter(
    (expense) =>
      isWithinRange(expense.date, start, end) &&
      isCountedInGeneralReports(expense.carId, expense.date, cutoffByCarId)
  );
  const monthlyPaid = monthlyPaidExpenses.reduce((sum, expense) => sum + expense.cost, 0);

  const pendingExpenses = extraExpenses.filter((expense) => expense.status === "PENDIENTE");
  const totalPending = pendingExpenses.reduce((sum, expense) => sum + expense.cost, 0);

  const monthlyExpenseCount = extraExpenses.filter((expense) =>
    isWithinRange(expense.date, start, end)
  ).length;

  return (
    <div>
      <div className="mb-6 space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Gastos extras
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Control de gastos operativos fuera del mantenimiento formal.
            </p>
          </div>

          <Link
            href="/dashboard/extra-expenses/new"
            className="inline-flex w-full justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 sm:w-auto"
          >
            Nuevo gasto extra
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <SummaryCard
            title="Pagado este mes"
            value={formatCurrency(monthlyPaid)}
            detail="Sin contar carros aparte"
            icon={<ReceiptText />}
          />
          <SummaryCard
            title="Pendiente por pagar"
            value={formatCurrency(totalPending)}
            detail={`${pendingExpenses.length} ${pendingExpenses.length === 1 ? "gasto" : "gastos"} (a la fecha)`}
            icon={<Clock />}
          />
          <SummaryCard
            title="Gastos registrados este mes"
            value={monthlyExpenseCount}
            detail={`${extraExpenses.length} en total histórico`}
            icon={<ReceiptText />}
            valueClassName="text-3xl"
          />
        </div>
      </div>

      <ExtraExpensesTable extraExpenses={extraExpenses} />
    </div>
  );
}
