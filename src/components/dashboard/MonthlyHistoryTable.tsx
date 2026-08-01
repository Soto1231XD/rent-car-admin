"use client";

import { useMemo, useState } from "react";
import { MonthlyHistoryEntry } from "@/lib/api";

type Props = {
  entries: MonthlyHistoryEntry[];
};

export default function MonthlyHistoryTable({ entries }: Props) {
  const [monthFilter, setMonthFilter] = useState("");

  const filteredEntries = useMemo(() => {
    if (!monthFilter) {
      return entries;
    }

    return entries.filter((entry) => entry.month === monthFilter);
  }, [entries, monthFilter]);

  if (entries.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
        Aún no hay meses con rentas completadas o gastos pagados registrados.
      </div>
    );
  }

  return (
    <>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <select
          value={monthFilter}
          onChange={(event) => setMonthFilter(event.target.value)}
          className="input sm:max-w-xs"
        >
          <option value="">Todos los meses</option>
          {entries.map((entry) => (
            <option key={entry.month} value={entry.month}>
              {formatMonth(entry.month)}
            </option>
          ))}
        </select>

        {monthFilter && (
          <button
            type="button"
            onClick={() => setMonthFilter("")}
            className="text-left text-sm font-semibold text-blue-600 hover:underline sm:text-right"
          >
            Limpiar filtro
          </button>
        )}
      </div>

      {filteredEntries.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
          No hay datos para el mes seleccionado.
        </div>
      ) : (
        <>
          <div className="space-y-3 md:hidden">
            {filteredEntries.map((entry) => (
              <div
                key={entry.month}
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <p className="font-semibold text-slate-900">
                  {formatMonth(entry.month)}
                </p>

                <div className="mt-3 grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <p className="text-xs font-medium text-slate-500">Ingreso</p>
                    <p className="mt-1 font-semibold text-slate-900">
                      {formatMoney(entry.income)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500">
                      Comisionistas
                    </p>
                    <p className="mt-1 font-semibold text-slate-900">
                      {formatMoney(entry.commissionerIncome)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500">
                      Gastos extras
                    </p>
                    <p className="mt-1 font-semibold text-slate-900">
                      {formatMoney(entry.extraExpenses)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden overflow-x-auto rounded-xl border border-slate-200 md:block">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-6 py-4 font-medium">Mes</th>
                  <th className="px-6 py-4 font-medium">Ingreso del mes</th>
                  <th className="px-6 py-4 font-medium">Comisionistas</th>
                  <th className="px-6 py-4 font-medium">Gastos extras</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredEntries.map((entry) => (
                  <tr key={entry.month}>
                    <td className="whitespace-nowrap px-6 py-4 font-medium text-slate-900">
                      {formatMonth(entry.month)}
                    </td>
                    <td className="px-6 py-4 text-slate-900">
                      {formatMoney(entry.income)}
                    </td>
                    <td className="px-6 py-4 text-slate-900">
                      {formatMoney(entry.commissionerIncome)}
                    </td>
                    <td className="px-6 py-4 text-slate-900">
                      {formatMoney(entry.extraExpenses)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  );
}

function formatMonth(value: string) {
  const [year, month] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, 1));

  const formatted = new Intl.DateTimeFormat("es-MX", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);

  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

function formatMoney(value: number) {
  return `$${value.toLocaleString("es-MX")} MXN`;
}