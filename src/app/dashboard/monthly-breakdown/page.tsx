import MonthlyBreakdownTable from "@/components/dashboard/MonthlyBreakdownTable";
import { getAveoLedger, getGeneralExpenses, getMonthlyBreakdown } from "@/lib/api";

export default async function MonthlyBreakdownPage() {
  const [entries, generalExpenses, aveoLedgers] = await Promise.all([
    getMonthlyBreakdown(),
    getGeneralExpenses(),
    getAveoLedger(),
  ]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">
          Control mensual
        </h1>

        <p className="mt-1 text-sm text-slate-600">
          Ingresos y egresos por auto, calculados a partir de las rentas
          completadas, mantenimientos y gastos extras pagados. Nómina y otros
          gastos generales se agregan aquí manualmente, mes por mes.
        </p>
      </div>

      <MonthlyBreakdownTable
        entries={entries}
        generalExpenses={generalExpenses}
        aveoLedgers={aveoLedgers}
      />
    </div>
  );
}
