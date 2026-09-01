import Link from "next/link";
import { CalendarCheck, CalendarClock, CalendarRange, DollarSign } from "lucide-react";
import RentalsTable from "@/components/rentals/RentalsTable";
import SummaryCard from "@/components/ui/SummaryCard";
import { getCars, getRentals } from "@/lib/api";
import { buildExcludedCutoffMap, isCountedInGeneralReports } from "@/lib/excluded-cars";
import { getCurrentMonthRange, isWithinRange } from "@/lib/date-range";
import { formatCurrency } from "@/lib/format-currency";

type Props = {
  searchParams: Promise<{
    success?: string;
  }>;
};

export default async function RentalsPage({ searchParams }: Props) {
  await searchParams;
  const [rentals, cars] = await Promise.all([getRentals(), getCars()]);

  const cutoffByCarId = buildExcludedCutoffMap(cars);
  const { start, end } = getCurrentMonthRange();

  // Mismo criterio que el Dashboard: solo las rentas completadas Y con fecha
  // de este mes cuentan como ingreso del mes, excluyendo los carros "aparte"
  // (Aveo y similares) a partir de su fecha de corte — así este número
  // siempre reconcilia con la tarjeta "Ingreso del mes" del Dashboard.
  const completedRentals = rentals.filter((rental) => rental.status === "COMPLETADO");
  const monthlyCompletedRentals = completedRentals.filter(
    (rental) =>
      isWithinRange(rental.endDate ?? rental.startDate, start, end) &&
      isCountedInGeneralReports(rental.carId, rental.endDate ?? rental.startDate, cutoffByCarId)
  );
  const monthlyIncome = monthlyCompletedRentals.reduce(
    (sum, rental) => sum + rental.totalPrice,
    0
  );
  const activeCount = rentals.filter((rental) => rental.status === "ACTIVO").length;
  const reservedCount = rentals.filter((rental) => rental.status === "RESERVACION").length;

  return (
    <div>
      <div className="mb-6 space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Rentas
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Gestiona las rentas activas y pasadas.
            </p>
          </div>

          <Link
            href="/dashboard/rentals/new"
            className="inline-flex w-full justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 sm:w-auto"
          >
            Nueva renta
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            title="Ingresos del mes"
            value={formatCurrency(monthlyIncome)}
            detail="Rentas completadas este mes, sin carros aparte"
            icon={<DollarSign />}
          />
          <SummaryCard
            title="Rentas activas"
            value={activeCount}
            detail="En curso ahora mismo"
            icon={<CalendarClock />}
            valueClassName="text-3xl"
          />
          <SummaryCard
            title="Reservaciones"
            value={reservedCount}
            detail="Pendientes de iniciar"
            icon={<CalendarRange />}
            valueClassName="text-3xl"
          />
          <SummaryCard
            title="Completadas este mes"
            value={monthlyCompletedRentals.length}
            detail={`${completedRentals.length} en total histórico`}
            icon={<CalendarCheck />}
            valueClassName="text-3xl"
          />
        </div>
      </div>

      <RentalsTable rentals={rentals} />
    </div>
  );
}
