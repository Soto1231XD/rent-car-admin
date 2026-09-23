"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Membership, MembershipStatus } from "@/types/membership";
import DataTableShell from "@/components/ui/DataTableShell";
import Pagination, { paginate } from "@/components/ui/Pagination";

type Props = {
  memberships: Membership[];
};

export default function MembershipsTable({ memberships }: Props) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<MembershipStatus | "">("");
  const [page, setPage] = useState(1);
  const hasFilters = search !== "" || statusFilter !== "";

  const filtered = useMemo(() => {
    return memberships.filter((membership) => {
      const value = search.toLowerCase().trim();
      const matchesSearch =
        !value || (membership.client?.fullName ?? "").toLowerCase().includes(value);
      const matchesStatus = !statusFilter || membership.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [memberships, search, statusFilter]);

  const { pageItems: pagedMemberships, totalPages, safePage } = paginate(filtered, page);

  return (
    <DataTableShell
      filters={
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="sm:min-w-0 sm:flex-1">
            <input
              type="text"
              placeholder="Buscar por nombre de cliente..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="input w-full"
            />
          </div>

          <div className="sm:w-56 sm:shrink-0">
            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as MembershipStatus | "")
              }
              className="input w-full"
            >
              <option value="">Todos los estados</option>
              <option value="PENDIENTE">Pendiente</option>
              <option value="ACTIVA">Activa</option>
              <option value="GRACIA">En gracia</option>
              <option value="INACTIVA">Inactiva</option>
              <option value="CANCELADA">Cancelada</option>
            </select>
          </div>
        </div>
      }
      filteredCount={filtered.length}
      totalCount={memberships.length}
      itemLabel="membresías"
      hasFilters={hasFilters}
      onClearFilters={() => {
        setSearch("");
        setStatusFilter("");
        setPage(1);
      }}
      emptyTitle="No se encontraron membresías"
      emptyDescription="Intenta buscar por otro nombre o estado."
      pagination={
        <Pagination page={safePage} totalPages={totalPages} onPageChange={setPage} />
      }
    >
      <table className="w-full min-w-[760px] border-collapse text-left text-sm">
        <thead className="bg-slate-50 text-slate-600">
          <tr>
            <th className="px-6 py-4 font-semibold">Cliente</th>
            <th className="px-6 py-4 font-semibold">Estado</th>
            <th className="px-6 py-4 font-semibold">Renovación</th>
            <th className="px-6 py-4 font-semibold">Vigencia</th>
            <th className="px-6 py-4 font-semibold">Acciones</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100">
          {pagedMemberships.map((membership) => (
            <tr key={membership.id} className="transition hover:bg-slate-50">
              <td className="px-6 py-4 font-medium text-slate-900">
                {membership.client?.fullName ?? "Cliente no disponible"}
              </td>
              <td className="px-6 py-4">
                <StatusBadge status={membership.status} />
              </td>
              <td className="px-6 py-4 text-slate-900">
                {membership.renewalType === "AUTOMATICA" ? "Automática" : "Manual"}
              </td>
              <td className="px-6 py-4 text-slate-900">
                {formatDate(membership.currentPeriodEnd)}
              </td>
              <td className="px-6 py-4">
                <Link
                  href={`/dashboard/memberships/${membership.id}`}
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

const STATUS_LABELS: Record<MembershipStatus, string> = {
  PENDIENTE: "Pendiente",
  ACTIVA: "Activa",
  GRACIA: "En gracia",
  INACTIVA: "Inactiva",
  CANCELADA: "Cancelada",
};

const STATUS_STYLES: Record<MembershipStatus, string> = {
  PENDIENTE: "bg-slate-100 text-slate-700 ring-1 ring-slate-200",
  ACTIVA: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  GRACIA: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  INACTIVA: "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
  CANCELADA: "bg-slate-100 text-slate-500 ring-1 ring-slate-200",
};

function StatusBadge({ status }: { status: MembershipStatus }) {
  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ${STATUS_STYLES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

function formatDate(value?: string | null) {
  return value ? value.slice(0, 10) : "—";
}
