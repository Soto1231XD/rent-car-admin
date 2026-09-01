import Link from "next/link";
import { Clock, PlayCircle, Wrench } from "lucide-react";
import MaintenanceTable from "@/components/maintenance/MaintenanceTable";
import SummaryCard from "@/components/ui/SummaryCard";
import { getCars, getMaintenances } from "@/lib/api";
import { buildExcludedCutoffMap, isCountedInGeneralReports } from "@/lib/excluded-cars";
import { getCurrentMonthRange, isWithinRange } from "@/lib/date-range";
import { formatCurrency } from "@/lib/format-currency";

type Props = {
  searchParams: Promise<{
    success?: string;
  }>;
};

export default async function MaintenancePage({ searchParams }: Props) {
  await searchParams;
  const [allMaintenances, cars] = await Promise.all([getMaintenances(), getCars()]);
  const maintenances = allMaintenances.filter(
    (maintenance) => maintenance.recordType === "SERVICIO"
  );

  const cutoffByCarId = buildExcludedCutoffMap(cars);
  const { start, end } = getCurrentMonthRange();

  // Mismo criterio que el resto del sistema: solo los servicios completados
  // Y con fecha de este mes cuentan como gasto del mes, excluyendo los
  // carros "aparte" a partir de su fecha de corte.
  const completedMaintenances = maintenances.filter(
    (maintenance) => maintenance.status === "COMPLETADO"
  );
  const monthlyCompleted = completedMaintenances.filter(
    (maintenance) =>
      isWithinRange(maintenance.date, start, end) &&
      isCountedInGeneralReports(maintenance.carId, maintenance.date, cutoffByCarId)
  );
  const monthlySpent = monthlyCompleted.reduce(
    (sum, maintenance) => sum + (maintenance.cost ?? 0),
    0
  );

  const pendingCount = maintenances.filter(
    (maintenance) => maintenance.status === "PENDIENTE"
  ).length;
  const inProgressCount = maintenances.filter(
    (maintenance) => maintenance.status === "EN_PROGRESO"
  ).length;

  return (
    <div>
      <div className="mb-6 space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Mantenimiento
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Control de servicios y estado de vehículos.
            </p>
          </div>

          <Link
            href="/dashboard/maintenance/new"
            className="inline-flex w-full justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 sm:w-auto"
          >
            Nuevo mantenimiento
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <SummaryCard
            title="Gastado este mes"
            value={formatCurrency(monthlySpent)}
            detail="Servicios completados, sin carros aparte"
            icon={<Wrench />}
          />
          <SummaryCard
            title="Pendientes"
            value={pendingCount}
            detail="Servicios por realizar"
            icon={<Clock />}
            valueClassName="text-3xl"
          />
          <SummaryCard
            title="En progreso"
            value={inProgressCount}
            detail="Servicios en curso"
            icon={<PlayCircle />}
            valueClassName="text-3xl"
          />
        </div>
      </div>

      <MaintenanceTable maintenances={maintenances} />
    </div>
  );
}
