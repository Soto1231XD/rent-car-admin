"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import StatusBadge from "@/components/ui/StatusBadge";
import DataTableShell from "@/components/ui/DataTableShell";
import { Rental } from "@/types/rental";

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
      const clientName = getClientName(rental).toLowerCase();
      const carName = getCarName(rental).toLowerCase();

      const matchesClient =
        !clientSearch ||
        clientName.includes(clientSearch.toLowerCase());

      const matchesCar =
        !carSearch ||
        carName.includes(carSearch.toLowerCase());

      const matchesStatus =
        !statusFilter || rental.status === statusFilter;

      return matchesClient && matchesCar && matchesStatus;
    });
  }, [rentals, clientSearch, carSearch, statusFilter]);

  return (
    <DataTableShell
      filters={
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
      }
      filteredCount={filteredRentals.length}
      totalCount={rentals.length}
      itemLabel="rentas"
      hasFilters={hasFilters}
      onClearFilters={clearFilters}
      emptyTitle="No se encontraron rentas"
      emptyDescription="Intenta ajustar el cliente, vehículo o estado seleccionado."
    >
      <table className="w-full min-w-[980px] text-left text-sm">
        <thead className="bg-slate-50 text-slate-600">
          <tr>
            <th className="px-6 py-4 font-semibold">Cliente</th>
            <th className="px-6 py-4 font-semibold">Tipo</th>
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
                {getClientName(rental)}
              </td>
              <td className="px-6 py-4 text-slate-900">
                {rental.renterType === "COMISIONISTA" ? "Comisionista" : "Cliente"}
              </td>
              <td className="px-6 py-4 text-slate-900">{getCarName(rental)}</td>
              <td className="px-6 py-4 text-slate-900">
                {formatDate(rental.startDate)}
              </td>
              <td className="px-6 py-4 text-slate-900">
                {formatDate(rental.endDate)}
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
    </DataTableShell>
  );
}

function getClientName(rental: Rental) {
  return rental.client?.fullName ?? "Cliente no disponible";
}

function getCarName(rental: Rental) {
  if (!rental.car) {
    return "Vehículo no disponible";
  }

  return `${rental.car.brand} ${rental.car.model} ${rental.car.year}`;
}

function formatDate(value: string) {
  return value.slice(0, 10);
}
