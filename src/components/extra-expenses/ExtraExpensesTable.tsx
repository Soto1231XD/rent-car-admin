"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import StatusBadge from "@/components/ui/StatusBadge";
import DeleteResourceButton from "@/components/ui/DeleteResourceButton";
import DataTableShell from "@/components/ui/DataTableShell";
import { ExtraExpense } from "@/types/extra-expense";

type Props = {
  extraExpenses: ExtraExpense[];
};

export default function ExtraExpensesTable({ extraExpenses }: Props) {
  const [carSearch, setCarSearch] = useState("");
  const [conceptSearch, setConceptSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const hasFilters =
    carSearch !== "" || conceptSearch !== "" || statusFilter !== "";

  const clearFilters = () => {
    setCarSearch("");
    setConceptSearch("");
    setStatusFilter("");
  };

  const filteredExtraExpenses = useMemo(() => {
    return extraExpenses.filter((extraExpense) => {
      const carName = getCarName(extraExpense).toLowerCase();

      const matchesCar =
        !carSearch || carName.includes(carSearch.toLowerCase());

      const matchesConcept =
        !conceptSearch ||
        extraExpense.concept.toLowerCase().includes(conceptSearch.toLowerCase());

      const matchesStatus =
        !statusFilter || extraExpense.status === statusFilter;

      return matchesCar && matchesConcept && matchesStatus;
    });
  }, [extraExpenses, carSearch, conceptSearch, statusFilter]);

  return (
    <DataTableShell
      filters={
        <div className="grid gap-3 md:grid-cols-3">
          <input
            type="text"
            placeholder="Buscar por vehiculo..."
            value={carSearch}
            onChange={(event) => setCarSearch(event.target.value)}
            className="input"
          />

          <input
            type="text"
            placeholder="Buscar por concepto..."
            value={conceptSearch}
            onChange={(event) => setConceptSearch(event.target.value)}
            className="input"
          />

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="input"
          >
            <option value="">Todos los estados</option>
            <option value="PENDIENTE">Pendiente</option>
            <option value="PAGADO">Pagado</option>
            <option value="CANCELADO">Cancelado</option>
          </select>
        </div>
      }
      filteredCount={filteredExtraExpenses.length}
      totalCount={extraExpenses.length}
      itemLabel="gastos extras"
      hasFilters={hasFilters}
      onClearFilters={clearFilters}
      emptyTitle="No se encontraron gastos extras"
      emptyDescription="Intenta ajustar el vehiculo, concepto o estado seleccionado."
    >
      <table className="w-full min-w-[980px] text-left text-sm">
        <thead className="bg-slate-50 text-slate-600">
          <tr>
            <th className="px-6 py-4">Vehiculo</th>
            <th className="px-6 py-4">Concepto</th>
            <th className="px-6 py-4">Fecha</th>
            <th className="px-6 py-4">Costo</th>
            <th className="px-6 py-4">Estado</th>
            <th className="px-6 py-4">Comentarios</th>
            <th className="px-6 py-4">Acciones</th>
          </tr>
        </thead>

        <tbody className="divide-y">
          {filteredExtraExpenses.map((extraExpense) => (
            <tr key={extraExpense.id} className="transition hover:bg-slate-50">
              <td className="px-6 py-4 text-slate-900">
                {getCarName(extraExpense)}
              </td>
              <td className="px-6 py-4 text-slate-900">
                {extraExpense.concept}
              </td>
              <td className="px-6 py-4 text-slate-900">
                {formatDate(extraExpense.date)}
              </td>
              <td className="px-6 py-4 text-slate-900">
                ${extraExpense.cost.toLocaleString("es-MX")} MXN
              </td>
              <td className="whitespace-nowrap px-6 py-4">
                <StatusBadge status={extraExpense.status} />
              </td>
              <td className="max-w-[200px] truncate px-6 py-4 text-slate-600">
                {extraExpense.notes || "-"}
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/dashboard/extra-expenses/${extraExpense.id}/edit`}
                    className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
                  >
                    Editar
                  </Link>

                  <DeleteResourceButton
                    id={extraExpense.id}
                    resourceType="extraExpense"
                    resourceName={`${extraExpense.concept} - ${getCarName(extraExpense)}`}
                    redirectTo="/dashboard/extra-expenses"
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </DataTableShell>
  );
}

function getCarName(extraExpense: ExtraExpense) {
  if (!extraExpense.car) {
    return "Vehiculo no disponible";
  }

  return `${extraExpense.car.brand} ${extraExpense.car.model} ${extraExpense.car.year}`;
}

function formatDate(value: string) {
  return value.slice(0, 10);
}
