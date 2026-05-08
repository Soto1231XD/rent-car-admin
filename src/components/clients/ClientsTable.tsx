"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Client } from "@/types/client";
import EmptyState from "../ui/EmptyState";

type Props = {
  clients: Client[];
};

export default function ClientsTable({ clients }: Props) {
  const [clientSearch, setClientSearch] = useState("");
  const [carSearch, setCarSearch] = useState("");

  const hasFilters = clientSearch !== "" || carSearch !== "";

const clearFilters = () => {
  setClientSearch("");
  setCarSearch("");
};

  const filteredClients = useMemo(() => {
  return clients.filter((client) => {
    const matchesClient =
      !clientSearch ||
      client.fullName.toLowerCase().includes(clientSearch.toLowerCase());

    const matchesCar =
      !carSearch ||
      (client.rentedCar ?? "")
        .toLowerCase()
        .includes(carSearch.toLowerCase());

    return matchesClient && matchesCar;
  });
}, [clients, clientSearch, carSearch]);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 p-5">
  <div className="flex flex-col gap-3 md:flex-row">
    <input
      type="text"
      placeholder="Buscar por nombre del cliente..."
      value={clientSearch}
      onChange={(event) => setClientSearch(event.target.value)}
      className="input flex-1"
    />

    <input
      type="text"
      placeholder="Buscar por vehículo..."
      value={carSearch}
      onChange={(event) => setCarSearch(event.target.value)}
      className="input flex-1"
    />
  </div>

  <div className="mt-3 flex flex-col gap-2 text-sm sm:flex-row sm:items-center sm:justify-between">
    <p className="text-slate-500">
      Mostrando {filteredClients.length} de {clients.length} clientes
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
        <table className="min-w-[860px] w-full border-collapse text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-6 py-4 font-semibold">Cliente</th>
              <th className="px-6 py-4 font-semibold">Vehículo rentado</th>
              <th className="px-6 py-4 font-semibold">Teléfono</th>
              <th className="px-6 py-4 font-semibold">Correo</th>
              <th className="px-6 py-4 font-semibold">Licencia</th>
              <th className="px-6 py-4 font-semibold">Acciones</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {filteredClients.map((client) => (
              <tr key={client.id} className="transition hover:bg-slate-50">
                <td className="px-6 py-4 font-medium text-slate-900">
                  {client.fullName}
                </td>

                <td className="px-6 py-4 text-slate-900">
                  {client.rentedCar ?? "Sin vehículo"}
                </td>

                <td className="px-6 py-4 text-slate-900">
                  {client.phone}
                </td>

                <td className="px-6 py-4 text-slate-900">
                  {client.email}
                </td>

                <td className="px-6 py-4 text-slate-900">
                  {client.driverLicenseNumber}
                </td>

                <td className="px-6 py-4">
                  <Link
                    href={`/dashboard/clients/${client.id}`}
                    className="text-sm font-medium text-slate-900 hover:underline"
                  >
                    Ver detalle
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredClients.length === 0 && (
  <EmptyState
    title="No se encontraron clientes"
    description="Intenta buscar por otro nombre o vehículo."
    actionLabel={hasFilters ? "Limpiar filtros" : undefined}
    onAction={hasFilters ? clearFilters : undefined}
  />
)}
      </div>
    </div>
  );
}
