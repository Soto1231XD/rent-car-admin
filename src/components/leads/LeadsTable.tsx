"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Lead, LeadStatus } from "@/types/lead";
import DataTableShell from "@/components/ui/DataTableShell";
import Pagination, { paginate } from "@/components/ui/Pagination";
import StatusBadge from "@/components/ui/StatusBadge";
import { formatCarLabel } from "@/lib/car-label";

type Props = {
  leads: Lead[];
};

export default function LeadsTable({ leads }: Props) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<LeadStatus | "">("");
  const [page, setPage] = useState(1);
  const hasFilters = search !== "" || status !== "";

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const value = search.toLowerCase().trim();

      const matchesSearch =
        !value ||
        lead.fullName.toLowerCase().includes(value) ||
        (lead.email ?? "").toLowerCase().includes(value) ||
        lead.phone.toLowerCase().includes(value);

      const matchesStatus = !status || lead.status === status;

      return matchesSearch && matchesStatus;
    });
  }, [leads, search, status]);

  const { pageItems: pagedLeads, totalPages, safePage } = paginate(filteredLeads, page);

  return (
    <DataTableShell
      filters={
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="sm:min-w-0 sm:flex-1">
            <input
              type="text"
              placeholder="Buscar por nombre, correo o teléfono..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="input w-full"
            />
          </div>

          <div className="sm:w-52 sm:shrink-0">
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as LeadStatus | "")}
              className="input w-full"
            >
              <option value="">Todos los estados</option>
              <option value="NUEVA">Nueva</option>
              <option value="CONTACTADA">Contactada</option>
              <option value="CERRADA">Cerrada</option>
              <option value="CONVERTIDA">Convertida</option>
            </select>
          </div>
        </div>
      }
      filteredCount={filteredLeads.length}
      totalCount={leads.length}
      itemLabel="solicitudes"
      hasFilters={hasFilters}
      onClearFilters={() => {
        setSearch("");
        setStatus("");
        setPage(1);
      }}
      emptyTitle="No se encontraron solicitudes"
      emptyDescription="Intenta buscar por otro nombre, correo, teléfono o estado."
      pagination={
        <Pagination page={safePage} totalPages={totalPages} onPageChange={setPage} />
      }
    >
      <table className="w-full min-w-[760px] border-collapse text-left text-sm">
        <thead className="bg-slate-50 text-slate-600">
          <tr>
            <th className="px-6 py-4 font-semibold">Nombre</th>
            <th className="px-6 py-4 font-semibold">Teléfono</th>
            <th className="px-6 py-4 font-semibold">Vehículo de interés</th>
            <th className="px-6 py-4 font-semibold">Estado</th>
            <th className="px-6 py-4 font-semibold">Acciones</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100">
          {pagedLeads.map((lead) => (
            <tr key={lead.id} className="transition hover:bg-slate-50">
              <td className="px-6 py-4 font-medium text-slate-900">
                {lead.fullName}
              </td>
              <td className="px-6 py-4 text-slate-900">{lead.phone}</td>
              <td className="px-6 py-4 text-slate-900">
                {lead.car ? formatCarLabel(lead.car) : "No especificado"}
              </td>
              <td className="px-6 py-4">
                <StatusBadge status={lead.status} />
              </td>
              <td className="px-6 py-4">
                <Link
                  href={`/dashboard/leads/${lead.id}`}
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
