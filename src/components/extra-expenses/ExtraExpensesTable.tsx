"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import StatusBadge from "@/components/ui/StatusBadge";
import DeleteResourceButton from "@/components/ui/DeleteResourceButton";
import DataTableShell from "@/components/ui/DataTableShell";
import Pagination, { paginate } from "@/components/ui/Pagination";
import { ExtraExpense } from "@/types/extra-expense";
import { formatCarLabel } from "@/lib/car-label";
import { formatCurrency } from "@/lib/format-currency";

type Props = {
  extraExpenses: ExtraExpense[];
};

export default function ExtraExpensesTable({ extraExpenses }: Props) {
  const [carSearch, setCarSearch] = useState("");
  const [conceptSearch, setConceptSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [paidByFilter, setPaidByFilter] = useState("");
  const [page, setPage] = useState(1);

  const hasFilters =
    carSearch !== "" ||
    conceptSearch !== "" ||
    statusFilter !== "" ||
    paidByFilter !== "";

  const clearFilters = () => {
    setCarSearch("");
    setConceptSearch("");
    setStatusFilter("");
    setPaidByFilter("");
    setPage(1);
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

      const matchesPaidBy =
        !paidByFilter || extraExpense.paidBy === paidByFilter;

      return matchesCar && matchesConcept && matchesStatus && matchesPaidBy;
    });
  }, [extraExpenses, carSearch, conceptSearch, statusFilter, paidByFilter]);

  const {
    pageItems: pagedExtraExpenses,
    totalPages,
    safePage,
  } = paginate(filteredExtraExpenses, page);

  return (
    <DataTableShell
      filters={
        <div className="grid gap-3 md:grid-cols-4">
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

          <select
            value={paidByFilter}
            onChange={(event) => setPaidByFilter(event.target.value)}
            className="input"
          >
            <option value="">Cliente o empresa</option>
            <option value="EMPRESA">Lo cubrió la empresa</option>
            <option value="CLIENTE">Lo cubrió el cliente</option>
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
      pagination={
        <Pagination page={safePage} totalPages={totalPages} onPageChange={setPage} />
      }
    >
      <table className="w-full min-w-[980px] text-left text-sm">
        <thead className="bg-slate-50 text-slate-600">
          <tr>
            <th className="px-6 py-4">Vehiculo</th>
            <th className="px-6 py-4">Concepto</th>
            <th className="px-6 py-4">Fecha</th>
            <th className="px-6 py-4">Costo</th>
            <th className="px-6 py-4">Estado</th>
            <th className="px-6 py-4">Lo cubrió</th>
            <th className="px-6 py-4">Comentarios</th>
            <th className="px-6 py-4">Acciones</th>
          </tr>
        </thead>

        <tbody className="divide-y">
          {pagedExtraExpenses.map((extraExpense) => (
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
                {formatCurrency(extraExpense.cost)}
              </td>
              <td className="whitespace-nowrap px-6 py-4">
                <StatusBadge status={extraExpense.status} />
              </td>
              <td className="whitespace-nowrap px-6 py-4">
                {extraExpense.paidBy === "CLIENTE" ? (
                  <span className="inline-flex rounded-full bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700 ring-1 ring-violet-200">
                    Cliente
                  </span>
                ) : (
                  <span className="text-sm text-slate-500">Empresa</span>
                )}
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
    return "Sin vehículo asociado";
  }

  return formatCarLabel(extraExpense.car);
}

function formatDate(value: string) {
  return value.slice(0, 10);
}
