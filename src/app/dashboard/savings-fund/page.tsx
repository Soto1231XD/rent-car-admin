import Link from "next/link";
import { PiggyBank, TrendingDown, TrendingUp } from "lucide-react";
import SavingsFundTable from "@/components/savings-fund/SavingsFundTable";
import SummaryCard from "@/components/ui/SummaryCard";
import { getSavingsFundEntries } from "@/lib/api";
import { getCurrentMonthRange, isWithinRange } from "@/lib/date-range";
import { formatCurrency } from "@/lib/format-currency";

type Props = {
  searchParams: Promise<{
    success?: string;
  }>;
};

export default async function SavingsFundPage({ searchParams }: Props) {
  await searchParams;
  const entries = await getSavingsFundEntries();
  const { start, end } = getCurrentMonthRange();

  const monthlyEntries = entries.filter((entry) => isWithinRange(entry.date, start, end));
  const monthlyDamage = monthlyEntries.reduce((sum, entry) => sum + entry.incomeAmount, 0);
  const monthlyRepair = monthlyEntries.reduce((sum, entry) => sum + entry.expenseAmount, 0);
  const monthlySavings = monthlyDamage - monthlyRepair;

  // El fondo se va acumulando mes a mes, así que además del corte del mes se
  // muestra cuánto se lleva ahorrado en total.
  const totalSavings = entries.reduce(
    (sum, entry) => sum + entry.incomeAmount - entry.expenseAmount,
    0
  );

  return (
    <div>
      <div className="mb-6 space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Fondo de ahorro
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Por cada daño de un vehículo: cuánto se le cobró al cliente por
              el daño y cuánto costó repararlo — la diferencia es el ahorro
              que se guarda en el fondo.
            </p>
          </div>

          <Link
            href="/dashboard/savings-fund/new"
            className="inline-flex w-full justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm text-white sm:w-auto"
          >
            Agregar registro
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <SummaryCard
            title="Daño del mes"
            value={formatCurrency(monthlyDamage)}
            detail="Cobrado a clientes por daños"
            icon={<TrendingUp />}
          />
          <SummaryCard
            title="Reparación del mes"
            value={formatCurrency(monthlyRepair)}
            detail="Gastado en reparar esos daños"
            icon={<TrendingDown />}
          />
          <SummaryCard
            title="Ahorro del mes"
            value={formatCurrency(monthlySavings)}
            detail={`${formatCurrency(totalSavings)} acumulado en total`}
            icon={<PiggyBank />}
            highlight={monthlySavings >= 0 ? "positive" : "negative"}
          />
        </div>
      </div>

      <SavingsFundTable entries={entries} />
    </div>
  );
}
