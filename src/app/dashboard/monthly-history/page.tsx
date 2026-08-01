import MonthlyHistoryTable from "@/components/dashboard/MonthlyHistoryTable";
import { getMonthlyHistory } from "@/lib/api";

export default async function MonthlyHistoryPage() {
  const entries = await getMonthlyHistory();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">
          Historial mensual
        </h1>

        <p className="mt-1 text-sm text-slate-600">
          Ingreso, comisionistas y gastos extras de cada mes, calculados a partir
          de las rentas completadas y los gastos pagados registrados.
        </p>
      </div>

      <MonthlyHistoryTable entries={entries} />
    </div>
  );
}