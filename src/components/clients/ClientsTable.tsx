"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Client } from "@/types/client";
import { RenterType } from "@/types/rental";
import DataTableShell from "@/components/ui/DataTableShell";

type Props = {
  clients: Client[];
};

export default function ClientsTable({ clients }: Props) {
  const [clientSearch, setClientSearch] = useState("");
  const [clientType, setClientType] = useState<RenterType | "">("");
  const hasFilters = clientSearch !== "" || clientType !== "";

  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      const clientValue = clientSearch.toLowerCase().trim();

      const matchesSearch =
        !clientValue ||
        client.fullName.toLowerCase().includes(clientValue) ||
        (client.email ?? "").toLowerCase().includes(clientValue) ||
        client.phone.toLowerCase().includes(clientValue);

      const matchesType = !clientType || (client.type ?? "CLIENTE") === clientType;

      return matchesSearch && matchesType;
    });
  }, [clients, clientSearch, clientType]);

  return (
    <DataTableShell
      filters={
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="sm:min-w-0 sm:flex-1">
            <input
              type="text"
              placeholder="Buscar por nombre, correo o teléfono..."
              value={clientSearch}
              onChange={(event) => setClientSearch(event.target.value)}
              className="input w-full"
            />
          </div>

          <div className="sm:w-52 sm:shrink-0">
            <select
              value={clientType}
              onChange={(event) =>
                setClientType(event.target.value as RenterType | "")
              }
              className="input w-full"
            >
              <option value="">Todos los tipos</option>
              <option value="CLIENTE">Clientes</option>
              <option value="COMISIONISTA">Comisionistas</option>
            </select>
          </div>
        </div>
      }
      filteredCount={filteredClients.length}
      totalCount={clients.length}
      itemLabel="clientes"
      hasFilters={hasFilters}
      onClearFilters={() => {
        setClientSearch("");
        setClientType("");
      }}
      emptyTitle="No se encontraron clientes"
      emptyDescription="Intenta buscar por otro nombre, correo, teléfono o tipo de cliente."
    >
      <table className="w-full min-w-[760px] border-collapse text-left text-sm">
        <thead className="bg-slate-50 text-slate-600">
          <tr>
            <th className="px-6 py-4 font-semibold">Cliente</th>
            <th className="px-6 py-4 font-semibold">Tipo</th>
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
              <td className="px-6 py-4">
                <ClientTypeBadge type={client.type ?? "CLIENTE"} />
              </td>
              <td className="px-6 py-4 text-slate-900">{client.phone}</td>
              <td className="px-6 py-4 text-slate-900">
                {client.email || "No registrado"}
              </td>
              <td className="px-6 py-4 text-slate-900">
                {client.driverLicenseNumber || "No registrada"}
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

function ClientTypeBadge({ type }: { type: RenterType }) {
  const isCommissioner = type === "COMISIONISTA";

  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ${
        isCommissioner
          ? "bg-violet-50 text-violet-700 ring-1 ring-violet-200"
          : "bg-slate-100 text-slate-700 ring-1 ring-slate-200"
      }`}
    >
      {isCommissioner ? "Comisionista" : "Cliente"}
    </span>
  );
}