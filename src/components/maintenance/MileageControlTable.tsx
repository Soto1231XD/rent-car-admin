"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { History } from "lucide-react";
import DataTableShell from "@/components/ui/DataTableShell";
import Pagination, { paginate } from "@/components/ui/Pagination";
import DeleteResourceButton from "@/components/ui/DeleteResourceButton";
import MileageHistoryDialog from "@/components/maintenance/MileageHistoryDialog";
import { Maintenance } from "@/types/maintenance";
import { formatCarLabel } from "@/lib/car-label";
import { formatCurrency } from "@/lib/format-currency";

type Props = {
  revisions: Maintenance[];
};

export default function MileageControlTable({ revisions }: Props) {
  const [carSearch, setCarSearch] = useState("");
  const [page, setPage] = useState(1);
  const [historyTarget, setHistoryTarget] = useState<Maintenance | null>(null);

  const hasFilters = carSearch !== "";

  const clearFilters = () => {
    setCarSearch("");
    setPage(1);
  };

  const filteredRevisions = useMemo(() => {
    const value = carSearch.toLowerCase().trim();

    return revisions.filter(
      (revision) => !value || getCarName(revision).toLowerCase().includes(value)
    );
  }, [revisions, carSearch]);

  const { pageItems: pagedRevisions, totalPages, safePage } = paginate(
    filteredRevisions,
    page
  );

  return (
    <DataTableShell
      filters={
        <input
          type="text"
          placeholder="Buscar por vehículo..."
          value={carSearch}
          onChange={(event) => setCarSearch(event.target.value)}
          className="input md:max-w-sm"
        />
      }
      filteredCount={filteredRevisions.length}
      totalCount={revisions.length}
      itemLabel="revisiones"
      hasFilters={hasFilters}
      onClearFilters={clearFilters}
      emptyTitle="No se encontraron revisiones"
      emptyDescription="Intenta ajustar el vehículo buscado."
      pagination={
        <Pagination page={safePage} totalPages={totalPages} onPageChange={setPage} />
      }
    >
      <table className="w-full min-w-[2000px] text-left text-sm">
        <thead className="bg-slate-50 text-slate-600">
          <tr>
            <th className="px-6 py-4">Vehículo</th>
            <th className="px-6 py-4">Fecha de revisión</th>
            <th className="px-6 py-4">Kilometraje actual</th>
            <th className="px-6 py-4">Kilometraje previsto para próximo servicio</th>
            <th className="px-6 py-4">Kilometraje antes de ingresar a servicio</th>
            <th className="px-6 py-4">Agencia o independiente</th>
            <th className="px-6 py-4">Lugar donde se realizó</th>
            <th className="px-6 py-4">Descripción del trabajo realizado</th>
            <th className="px-6 py-4">Incluye material</th>
            <th className="px-6 py-4">Costo del servicio</th>
            <th className="px-6 py-4">Fecha de servicio</th>
            <th className="px-6 py-4">Comentarios</th>
            <th className="px-6 py-4">Acciones</th>
          </tr>
        </thead>

        <tbody className="divide-y">
          {pagedRevisions.map((revision) => (
            <tr key={revision.id} className="transition hover:bg-slate-50">
              <td className="px-6 py-4 font-medium text-slate-900">
                {getCarName(revision)}
              </td>
              <td className="px-6 py-4 text-slate-900">{formatDate(revision.date)}</td>
              <td className="px-6 py-4 text-slate-900">
                {revision.serviceMileage != null
                  ? `${revision.serviceMileage.toLocaleString("es-MX")} km`
                  : "-"}
              </td>
              <td
                className={`px-6 py-4 ${
                  isServiceOverdue(revision) ? "font-semibold text-red-600" : "text-slate-900"
                }`}
              >
                {formatNextService(revision)}
              </td>
              <td className="px-6 py-4 text-slate-900">
                {revision.previousMileage != null
                  ? `${revision.previousMileage.toLocaleString("es-MX")} km`
                  : "-"}
              </td>
              <td className="px-6 py-4 text-slate-900">
                {formatProviderType(revision.providerType)}
              </td>
              <td className="px-6 py-4 text-slate-900">{revision.location || "-"}</td>
              <td className="px-6 py-4 text-slate-900">{revision.serviceType || "-"}</td>
              <td className="px-6 py-4 text-slate-900">
                {formatIncludesMaterial(revision.includesMaterial)}
              </td>
              <td className="px-6 py-4 text-slate-900">
                {revision.cost != null ? formatCurrency(revision.cost) : "-"}
              </td>
              <td className="px-6 py-4 text-slate-900">
                {revision.reviewDate ? formatDate(revision.reviewDate) : "-"}
              </td>
              <td className="max-w-[200px] truncate px-6 py-4 text-slate-600">
                {revision.notes || "-"}
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setHistoryTarget(revision)}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900"
                  >
                    <History size={14} />
                    Historial
                  </button>

                  <Link
                    href={`/dashboard/maintenance/${revision.id}/edit`}
                    className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
                  >
                    Editar
                  </Link>

                  <DeleteResourceButton
                    id={revision.id}
                    resourceType="maintenance"
                    resourceName={`revisión de ${getCarName(revision)} del ${formatDate(revision.date)}`}
                    redirectTo="/dashboard/mileage-control"
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <MileageHistoryDialog
        isOpen={historyTarget !== null}
        maintenanceId={historyTarget?.id ?? ""}
        carName={historyTarget ? getCarName(historyTarget) : ""}
        current={historyTarget}
        onClose={() => setHistoryTarget(null)}
      />
    </DataTableShell>
  );
}

function getCarName(revision: Maintenance) {
  if (!revision.car) {
    return "Vehículo no disponible";
  }

  return formatCarLabel(revision.car);
}

function formatDate(value: string) {
  return value.slice(0, 10);
}

function formatProviderType(providerType: Maintenance["providerType"]) {
  if (providerType === "AGENCIA") {
    return "Agencia";
  }

  if (providerType === "INDEPENDIENTE") {
    return "Independiente";
  }

  return "-";
}

function formatIncludesMaterial(includesMaterial: Maintenance["includesMaterial"]) {
  if (includesMaterial == null) {
    return "-";
  }

  return includesMaterial ? "Sí" : "No";
}

function isServiceOverdue(revision: Maintenance) {
  return (
    revision.serviceMileage != null &&
    revision.nextServiceMileage != null &&
    revision.serviceMileage >= revision.nextServiceMileage
  );
}

function formatNextService(revision: Maintenance) {
  return revision.nextServiceMileage != null
    ? `${revision.nextServiceMileage.toLocaleString("es-MX")} km`
    : "No definido";
}
