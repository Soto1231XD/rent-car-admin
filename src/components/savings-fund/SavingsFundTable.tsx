"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import DeleteResourceButton from "@/components/ui/DeleteResourceButton";
import DataTableShell from "@/components/ui/DataTableShell";
import Pagination, { paginate } from "@/components/ui/Pagination";
import { SavingsFundEntry } from "@/types/savings-fund";
import { formatCarLabel } from "@/lib/car-label";
import { formatCurrency } from "@/lib/format-currency";

type Props = {
  entries: SavingsFundEntry[];
};

export default function SavingsFundTable({ entries }: Props) {
  const [clientSearch, setClientSearch] = useState("");
  const [carSearch, setCarSearch] = useState("");
  const [page, setPage] = useState(1);

  const hasFilters = clientSearch !== "" || carSearch !== "";

  const clearFilters = () => {
    setClientSearch("");
    setCarSearch("");
    setPage(1);
  };

  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      const matchesClient =
        !clientSearch ||
        entry.clientName.toLowerCase().includes(clientSearch.toLowerCase());

      const matchesCar =
        !carSearch ||
        getCarName(entry).toLowerCase().includes(carSearch.toLowerCase());

      return matchesClient && matchesCar;
    });
  }, [entries, clientSearch, carSearch]);

  const { pageItems: pagedEntries, totalPages, safePage } = paginate(filteredEntries, page);

  return (
    <DataTableShell
      filters={
        <div className="grid gap-3 md:grid-cols-2">
          <input
            type="text"
            placeholder="Buscar por cliente..."
            value={clientSearch}
            onChange={(event) => setClientSearch(event.target.value)}
            className="input"
          />

          <input
            type="text"
            placeholder="Buscar por vehiculo..."
            value={carSearch}
            onChange={(event) => setCarSearch(event.target.value)}
            className="input"
          />
        </div>
      }
      filteredCount={filteredEntries.length}
      totalCount={entries.length}
      itemLabel="registros"
      hasFilters={hasFilters}
      onClearFilters={clearFilters}
      emptyTitle="No se encontraron registros"
      emptyDescription="Intenta ajustar el cliente o vehiculo seleccionado."
      pagination={
        <Pagination page={safePage} totalPages={totalPages} onPageChange={setPage} />
      }
    >
      <table className="w-full min-w-[900px] text-left text-sm">
        <thead className="bg-slate-50 text-slate-600">
          <tr>
            <th className="px-6 py-4">Fecha</th>
            <th className="px-6 py-4">Nombre cliente</th>
            <th className="px-6 py-4">Daño del carro</th>
            <th className="px-6 py-4">Costo de reparación</th>
            <th className="px-6 py-4">Ahorro</th>
            <th className="px-6 py-4">Auto</th>
            <th className="px-6 py-4">Acciones</th>
          </tr>
        </thead>

        <tbody className="divide-y">
          {pagedEntries.map((entry) => {
            const difference = entry.incomeAmount - entry.expenseAmount;

            return (
              <tr key={entry.id} className="transition hover:bg-slate-50">
                <td className="px-6 py-4 text-slate-900">
                  {formatDate(entry.date)}
                </td>
                <td className="px-6 py-4 text-slate-900">
                  {entry.clientName}
                </td>
                <td className="px-6 py-4 text-slate-900">
                  {formatCurrency(entry.incomeAmount)}
                </td>
                <td className="px-6 py-4 text-slate-900">
                  {formatCurrency(entry.expenseAmount)}
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${
                      difference >= 0
                        ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                        : "bg-rose-50 text-rose-700 ring-1 ring-rose-200"
                    }`}
                  >
                    {formatCurrency(difference)}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-900">
                  {getCarName(entry)}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/dashboard/savings-fund/${entry.id}/edit`}
                      className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
                    >
                      Editar
                    </Link>

                    <DeleteResourceButton
                      id={entry.id}
                      resourceType="savingsFundEntry"
                      resourceName={`el registro de ${entry.clientName} del ${formatDate(entry.date)}`}
                      redirectTo="/dashboard/savings-fund"
                    />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </DataTableShell>
  );
}

function getCarName(entry: SavingsFundEntry) {
  if (!entry.car) {
    return "Sin vehículo asociado";
  }

  return formatCarLabel(entry.car);
}

function formatDate(value: string) {
  return value.slice(0, 10);
}
