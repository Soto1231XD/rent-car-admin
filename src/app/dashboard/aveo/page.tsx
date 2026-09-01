import Link from "next/link";
import { ArrowRight } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";
import { getAveoEntries, getAveoLedger, getCars } from "@/lib/api";
import { formatCurrency } from "@/lib/format-currency";
import { formatCarLabel } from "@/lib/car-label";

export default async function AveoLandingPage() {
  const [cars, entries, ledgers] = await Promise.all([
    getCars(),
    getAveoEntries(),
    getAveoLedger(),
  ]);

  const excludedCars = cars
    .filter((car) => car.excludedFromReportsAt)
    .sort((a, b) =>
      (a.excludedFromReportsAt ?? "").localeCompare(b.excludedFromReportsAt ?? "")
    );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Carros aparte</h1>
        <p className="mt-1 text-sm text-slate-600">
          Cada carro marcado como &quot;cuenta aparte&quot; (borrado o
          prestado) tiene aquí su propio libro de cuentas, separado de los
          reportes financieros generales.
        </p>
      </div>

      {excludedCars.length === 0 ? (
        <EmptyState
          title="Ningún carro está marcado como aparte"
          description='Para agregar uno, entra a la ficha del carro y activa "Excluir de reportes generales" — desde ese momento aparecerá aquí con su propio módulo.'
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {excludedCars.map((car) => {
            const carEntries = entries.filter((entry) => entry.carId === car.id);
            const ledger = ledgers.find((item) => item.car.id === car.id);

            const manualIncome = carEntries.reduce(
              (sum, entry) => sum + entry.incomeAmount,
              0
            );
            const manualExpenses = carEntries.reduce(
              (sum, entry) =>
                sum +
                entry.expenses.reduce(
                  (expenseSum, expense) => expenseSum + expense.amount,
                  0
                ),
              0
            );
            const manualCompanyProfit = carEntries.reduce(
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
              <Link
                key={car.id}
                href={`/dashboard/aveo/${car.id}`}
                className="group flex flex-col justify-between rounded-2xl bg-white p-5 shadow transition hover:shadow-md"
              >
                <div>
                  <p className="font-semibold text-slate-900">{formatCarLabel(car)}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Aparte desde {formatDate(car.excludedFromReportsAt)}
                  </p>

                  <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                    <MiniStat label="Ingresos" value={formatCurrency(totalIncome)} />
                    <MiniStat label="Gastos" value={formatCurrency(totalExpenses)} />
                    <MiniStat
                      label="Neto"
                      value={formatCurrency(totalDifference)}
                      tone={totalDifference >= 0 ? "positive" : "negative"}
                    />
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-1.5 text-sm font-medium text-slate-700 group-hover:text-slate-950">
                  Ver módulo
                  <ArrowRight size={14} className="transition group-hover:translate-x-0.5" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function MiniStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "positive" | "negative";
}) {
  const valueClass =
    tone === "positive"
      ? "text-emerald-700"
      : tone === "negative"
        ? "text-rose-700"
        : "text-slate-900";

  return (
    <div className="rounded-xl bg-slate-50 p-2">
      <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className={`mt-0.5 text-sm font-semibold ${valueClass}`}>{value}</p>
    </div>
  );
}

function formatDate(value?: string | null) {
  if (!value) {
    return "-";
  }

  return value.slice(0, 10);
}
