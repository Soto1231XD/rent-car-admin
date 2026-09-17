import Link from "next/link";
import { notFound } from "next/navigation";
import AveoUnifiedTable from "@/components/aveo/AveoUnifiedTable";
import { getAveoEntries, getAveoLedger, getCar } from "@/lib/api";
import { formatCurrency } from "@/lib/format-currency";
import { formatCarLabel } from "@/lib/car-label";

type Props = {
  params: Promise<{
    carId: string;
  }>;
  searchParams: Promise<{
    success?: string;
  }>;
};

export default async function AveoCarPage({ params, searchParams }: Props) {
  const { carId } = await params;
  await searchParams;
  const [car, allEntries, allLedgers] = await Promise.all([
    getCar(carId),
    getAveoEntries(),
    getAveoLedger(),
  ]);

  if (!car || !car.excludedFromReportsAt) {
    notFound();
  }

  const entries = allEntries.filter((entry) => entry.carId === carId);
  const ledger = allLedgers.find((item) => item.car.id === carId);
  const ledgers = ledger ? [ledger] : [];

  const manualIncome = entries.reduce((sum, entry) => sum + entry.incomeAmount, 0);
  const manualExpenses = entries.reduce(
    (sum, entry) =>
      sum + entry.expenses.reduce((expenseSum, expense) => expenseSum + expense.amount, 0),
    0
  );
  const manualCompanyProfit = entries.reduce(
    (sum, entry) => sum + (entry.companyProfit ?? 0),
    0
  );

  const automaticIncome = ledger?.totals.income ?? 0;
  const automaticExpenses = ledger?.totals.expenses ?? 0;
  const automaticCompanyProfit =
    ledger?.movements
      .filter((movement) => movement.type === "income")
      .reduce((sum, movement) => sum + (movement.companyProfit ?? 0), 0) ?? 0;

  const totalIncome = manualIncome + automaticIncome;
  const totalExpenses = manualExpenses + automaticExpenses;
  const totalCompanyProfit = manualCompanyProfit + automaticCompanyProfit;
  const totalDifference = totalIncome - totalCompanyProfit - totalExpenses;

  return (
    <div>
      <div className="mb-6 space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              href="/dashboard/aveo"
              className="text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              ← Volver a Carros aparte
            </Link>

            <h1 className="mt-3 text-2xl font-bold text-slate-900">
              {formatCarLabel(car)}
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Libro de cuentas de este carro, aparte de los reportes financieros generales.
            </p>
          </div>

          <Link
            href={`/dashboard/aveo/${carId}/new`}
            className="inline-flex w-full justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm text-white sm:w-auto"
          >
            Agregar movimiento manual
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard label="Ingresos totales" value={formatCurrency(totalIncome)} />
          <SummaryCard
            label="Ganancia de la rentadora"
            value={formatCurrency(totalCompanyProfit)}
          />
          <SummaryCard label="Gastos totales" value={formatCurrency(totalExpenses)} />
          <SummaryCard
            label="Diferencia total (neto)"
            value={formatCurrency(totalDifference)}
            highlight={totalDifference >= 0 ? "positive" : "negative"}
          />
        </div>
      </div>

      <p className="mb-3 text-sm text-slate-600">
        Las rentas y gastos reales de este carro aparecen solos (Automático);
        usa &quot;Agregar movimiento manual&quot; solo para casos fuera del
        sistema (por ejemplo, un cobro en efectivo aparte). La ganancia de la
        rentadora sale de los ingresos (no se suma aparte), así que la
        diferencia total ya la descuenta, igual que los gastos.
      </p>
      <AveoUnifiedTable
        ledgers={ledgers}
        entries={entries}
        carId={carId}
        carName={formatCarLabel(car)}
        excludedSince={car.excludedFromReportsAt}
      />
    </div>
  );
}

function SummaryCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: "positive" | "negative";
}) {
  const valueClass =
    highlight === "positive"
      ? "text-emerald-700"
      : highlight === "negative"
        ? "text-rose-700"
        : "text-slate-900";

  return (
    <div className="rounded-2xl bg-white p-4 shadow">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className={`mt-1 text-xl font-semibold ${valueClass}`}>{value}</p>
    </div>
  );
}
