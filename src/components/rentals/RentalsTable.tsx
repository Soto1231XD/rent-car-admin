"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import StatusBadge from "@/components/ui/StatusBadge";
import { Rental } from "@/types/rental";
import EmptyState from "@/components/ui/EmptyState";

type Props = {
  rentals: Rental[];
};

export default function RentalsTable({ rentals }: Props) {
  const [clientSearch, setClientSearch] = useState("");
  const [carSearch, setCarSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const hasFilters =
  clientSearch !== "" || carSearch !== "" || statusFilter !== "";

const clearFilters = () => {
  setClientSearch("");
  setCarSearch("");
  setStatusFilter("");
};

  const filteredRentals = useMemo(() => {
    return rentals.filter((rental) => {
      const matchesClient =
        !clientSearch ||
        rental.clientName.toLowerCase().includes(clientSearch.toLowerCase());

      const matchesCar =
        !carSearch ||
        rental.carName.toLowerCase().includes(carSearch.toLowerCase());

      const matchesStatus =
        !statusFilter || rental.status === statusFilter;

      return matchesClient && matchesCar && matchesStatus;
    });
  }, [rentals, clientSearch, carSearch, statusFilter]);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 p-5">
  <div className="grid gap-3 md:grid-cols-3">
    <input
      type="text"
      placeholder="Buscar por cliente..."
      value={clientSearch}
      onChange={(event) => setClientSearch(event.target.value)}
      className="input"
    />

    <input
      type="text"
      placeholder="Buscar por vehículo..."
      value={carSearch}
      onChange={(event) => setCarSearch(event.target.value)}
      className="input"
    />

    <select
      value={statusFilter}
      onChange={(event) => setStatusFilter(event.target.value)}
      className="input"
    >
      <option value="">Todos los estados</option>
      <option value="ACTIVO">Activo</option>
      <option value="COMPLETADO">Completado</option>
      <option value="RESERVACION">Reservación</option>
      <option value="CANCELADO">Cancelado</option>
    </select>
  </div>

  <div className="mt-3 flex flex-col gap-2 text-sm sm:flex-row sm:items-center sm:justify-between">
    <p className="text-slate-500">
      Mostrando {filteredRentals.length} de {rentals.length} rentas
    </p>

    {hasFilters && (
      <button
        type="button"
        onClick={clearFilters}
        className="font-medium text-slate-700 hover:text-slate-900 hover:underline"
      >
        Limpiar filtros
      </button>
    )}
  </div>
</div>

      <div className="overflow-x-auto">
        <table className="min-w-[900px] w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-6 py-4 font-semibold">Cliente</th>
              <th className="px-6 py-4 font-semibold">Vehículo</th>
              <th className="px-6 py-4 font-semibold">Inicio</th>
              <th className="px-6 py-4 font-semibold">Fin</th>
              <th className="px-6 py-4 font-semibold">Total</th>
              <th className="px-6 py-4 font-semibold">Estado</th>
              <th className="px-6 py-4 font-semibold">Acciones</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {filteredRentals.map((rental) => (
              <tr key={rental.id} className="transition hover:bg-slate-50">
                <td className="px-6 py-4 font-medium text-slate-900">
                  {rental.clientName}
                </td>

                <td className="px-6 py-4 text-slate-900">
                  {rental.carName}
                </td>

                <td className="px-6 py-4 text-slate-900">
                  {rental.startDate}
                </td>

                <td className="px-6 py-4 text-slate-900">
                  {rental.endDate}
                </td>

                <td className="px-6 py-4 text-slate-900">
                  ${rental.totalPrice.toLocaleString("es-MX")} MXN
                </td>

                <td className="px-6 py-4">
                  <StatusBadge status={rental.status} />
                </td>

                <td className="px-6 py-4">
                  <Link
                    href={`/dashboard/rentals/${rental.id}`}
                    className="text-sm font-medium text-slate-900 hover:underline"
                  >
                    Ver detalle
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredRentals.length === 0 && (
  <EmptyState
    title="No se encontraron rentas"
    description="Intenta ajustar el cliente, vehículo o estado seleccionado."
    actionLabel={hasFilters ? "Limpiar filtros" : undefined}
    onAction={hasFilters ? clearFilters : undefined}
  />
)}
      </div>
    </div>
  );
}
