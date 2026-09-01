"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import StatusBadge from "@/components/ui/StatusBadge";
import DataTableShell from "@/components/ui/DataTableShell";
import Pagination, { paginate } from "@/components/ui/Pagination";
import { Rental } from "@/types/rental";
import { isWithinHours } from "@/lib/time";
import { formatCarLabel } from "@/lib/car-label";
import { formatCurrency } from "@/lib/format-currency";

const NEW_CLIENT_BADGE_HOURS = 12;

type Props = {
  rentals: Rental[];
};

export default function RentalsTable({ rentals }: Props) {
  const [clientSearch, setClientSearch] = useState("");
  const [carSearch, setCarSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [codeSearch, setCodeSearch] = useState("");
  const [page, setPage] = useState(1);

  const hasFilters =
    clientSearch !== "" ||
    carSearch !== "" ||
    statusFilter !== "" ||
    codeSearch !== "";

  const clearFilters = () => {
    setClientSearch("");
    setCarSearch("");
    setStatusFilter("");
    setCodeSearch("");
    setPage(1);
  };

  const filteredRentals = useMemo(() => {
    return rentals.filter((rental) => {
      const clientName = getClientName(rental).toLowerCase();
      const carName = getCarName(rental).toLowerCase();
      const code = getRentalCode(rental);

      const matchesClient =
        !clientSearch ||
        clientName.includes(clientSearch.toLowerCase());

      const matchesCar =
        !carSearch ||
        carName.includes(carSearch.toLowerCase());

      const matchesStatus =
        !statusFilter || rental.status === statusFilter;

      const matchesCode =
        !codeSearch || code.includes(codeSearch.toUpperCase());

      return matchesClient && matchesCar && matchesStatus && matchesCode;
    });
  }, [rentals, clientSearch, carSearch, statusFilter, codeSearch]);

  const { pageItems: pagedRentals, totalPages, safePage } = paginate(filteredRentals, page);

  return (
    <DataTableShell
      filters={
        <div className="grid gap-3 md:grid-cols-4">
          <input
            type="text"
            placeholder="Buscar por código..."
            value={codeSearch}
            onChange={(event) => setCodeSearch(event.target.value)}
            className="input"
          />

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
      pagination={
        <Pagination page={safePage} totalPages={totalPages} onPageChange={setPage} />
      }
    >
      <table className="w-full min-w-[980px] text-left text-sm">
        <thead className="bg-slate-50 text-slate-600">
          <tr>
            <th className="px-6 py-4 font-semibold">Código</th>
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
          {pagedRentals.map((rental) => (
            <tr key={rental.id} className="transition hover:bg-slate-50">
              <td className="px-6 py-4 font-mono text-xs font-semibold text-slate-600">
                {getRentalCode(rental)}
              </td>
              <td className="px-6 py-4 font-medium text-slate-900">
                {getClientName(rental)}
                {rental.source === "WEB" && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {(!rental.isNewClient ||
                      isWithinHours(rental.createdAt, NEW_CLIENT_BADGE_HOURS)) && (
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                          rental.isNewClient
                            ? "bg-blue-100 text-blue-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {rental.isNewClient ? "Cliente nuevo · Web" : "Cliente recurrente · Web"}
                      </span>
                    )}
                    {!rental.confirmedAt && rental.status === "RESERVACION" && (
                      <span className="inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                        Sin confirmar
                      </span>
                    )}
                  </div>
                )}
              </td>
              <td className="px-6 py-4 text-slate-900">
                {rental.renterType === "COMISIONISTA" ? "Comisionista" : "Cliente"}
              </td>
              <td className="px-6 py-4 text-slate-900">{getCarName(rental)}</td>
              <td className="px-6 py-4 text-slate-900">
                {formatDate(rental.startDate)}
              </td>
              <td className="px-6 py-4 text-slate-900">
                {rental.rentalType === "INDEFINIDA" && !rental.endDate
                  ? "Indefinida"
                  : formatDate(rental.endDate)}
              </td>
              <td className="px-6 py-4 text-slate-900">
                {formatCurrency(rental.totalPrice)}
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

function getRentalCode(rental: Rental) {
  return rental.id.slice(-8).toUpperCase();
}

function getClientName(rental: Rental) {
  return rental.client?.fullName ?? "Cliente no disponible";
}

function getCarName(rental: Rental) {
  if (!rental.car) {
    return "Vehículo no disponible";
  }

  return formatCarLabel(rental.car);
}

function formatDate(value: string | null) {
  return value ? value.slice(0, 10) : "-";
}
