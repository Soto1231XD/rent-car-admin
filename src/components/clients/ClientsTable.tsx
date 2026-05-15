"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Client } from "@/types/client";
import DataTableShell from "@/components/ui/DataTableShell";

type Props = {
  clients: Client[];
};

export default function ClientsTable({ clients }: Props) {
  const [clientSearch, setClientSearch] = useState("");
  const hasFilters = clientSearch !== "";

  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      const clientValue = clientSearch.toLowerCase().trim();

      return (
        !clientValue ||
        client.fullName.toLowerCase().includes(clientValue) ||
        client.email.toLowerCase().includes(clientValue) ||
        client.phone.toLowerCase().includes(clientValue)
      );
    });
  }, [clients, clientSearch]);

  return (
    <DataTableShell
      filters={
        <input
          type="text"
          placeholder="Buscar por nombre, correo o teléfono..."
          value={clientSearch}
          onChange={(event) => setClientSearch(event.target.value)}
          className="input w-full"
        />
      }
      filteredCount={filteredClients.length}
      totalCount={clients.length}
      itemLabel="clientes"
      hasFilters={hasFilters}
      onClearFilters={() => setClientSearch("")}
      emptyTitle="No se encontraron clientes"
      emptyDescription="Intenta buscar por otro nombre, correo o teléfono."
    >
      <table className="w-full min-w-[720px] border-collapse text-left text-sm">
        <thead className="bg-slate-50 text-slate-600">
          <tr>
            <th className="px-6 py-4 font-semibold">Cliente</th>
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
              <td className="px-6 py-4 text-slate-900">{client.phone}</td>
              <td className="px-6 py-4 text-slate-900">{client.email}</td>
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
    </DataTableShell>
  );
}
