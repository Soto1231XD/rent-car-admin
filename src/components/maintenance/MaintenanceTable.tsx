"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import StatusBadge from "@/components/ui/StatusBadge";
import { Maintenance } from "@/types/maintenance";
import DeleteResourceButton from "@/components/ui/DeleteResourceButton";
import DataTableShell from "@/components/ui/DataTableShell";

type Props = {
  maintenances: Maintenance[];
};

export default function MaintenanceTable({ maintenances }: Props) {
  const [carSearch, setCarSearch] = useState("");
  const [serviceSearch, setServiceSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const hasFilters =
    carSearch !== "" || serviceSearch !== "" || statusFilter !== "";

  const clearFilters = () => {
    setCarSearch("");
    setServiceSearch("");
    setStatusFilter("");
  };

  const filteredMaintenances = useMemo(() => {
    return maintenances.filter((maintenance) => {
      const carName = getCarName(maintenance).toLowerCase();

      const matchesCar =
        !carSearch ||
        carName.includes(carSearch.toLowerCase());

      const matchesService =
        !serviceSearch ||
        maintenance.serviceType.toLowerCase().includes(serviceSearch.toLowerCase());

      const matchesStatus =
        !statusFilter || maintenance.status === statusFilter;

      return matchesCar && matchesService && matchesStatus;
    });
  }, [maintenances, carSearch, serviceSearch, statusFilter]);

  return (
    <DataTableShell
      filters={
        <div className="grid gap-3 md:grid-cols-3">
          <input
            type="text"
            placeholder="Buscar por vehículo..."
            value={carSearch}
            onChange={(event) => setCarSearch(event.target.value)}
            className="input"
          />

          <input
            type="text"
            placeholder="Buscar por servicio..."
            value={serviceSearch}
            onChange={(event) => setServiceSearch(event.target.value)}
            className="input"
          />

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="input"
          >
            <option value="">Todos los estados</option>
            <option value="PENDIENTE">Pendiente</option>
            <option value="EN_PROGRESO">En progreso</option>
            <option value="COMPLETADO">Completado</option>
          </select>
        </div>
      }
      filteredCount={filteredMaintenances.length}
      totalCount={maintenances.length}
      itemLabel="mantenimientos"
      hasFilters={hasFilters}
      onClearFilters={clearFilters}
      emptyTitle="No se encontraron mantenimientos"
      emptyDescription="Intenta ajustar el vehículo, servicio o estado seleccionado."
    >
      <table className="w-full min-w-[980px] text-left text-sm">
        <thead className="bg-slate-50 text-slate-600">
          <tr>
            <th className="px-6 py-4">Vehículo</th>
            <th className="px-6 py-4">Servicio</th>
            <th className="px-6 py-4">Fecha</th>
            <th className="px-6 py-4">Costo</th>
            <th className="px-6 py-4">Estado</th>
            <th className="px-6 py-4">Comentarios</th>
            <th className="px-6 py-4">Acciones</th>
          </tr>
        </thead>

        <tbody className="divide-y">
          {filteredMaintenances.map((maintenance) => (
            <tr key={maintenance.id} className="transition hover:bg-slate-50">
              <td className="px-6 py-4 text-slate-900">{getCarName(maintenance)}</td>
              <td className="px-6 py-4 text-slate-900">
                {maintenance.serviceType}
              </td>
              <td className="px-6 py-4 text-slate-900">{formatDate(maintenance.date)}</td>
              <td className="px-6 py-4 text-slate-900">
                ${maintenance.cost.toLocaleString("es-MX")} MXN
              </td>
              <td className="whitespace-nowrap px-6 py-4">
                <StatusBadge status={maintenance.status} />
              </td>
              <td className="max-w-[200px] truncate px-6 py-4 text-slate-600">
                {maintenance.notes || "-"}
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/dashboard/maintenance/${maintenance.id}/edit`}
                    className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
                  >
                    Editar
                  </Link>

                  <DeleteResourceButton
                    id={maintenance.id}
                    resourceType="maintenance"
                    resourceName={`${maintenance.serviceType} - ${getCarName(maintenance)}`}
                    redirectTo="/dashboard/maintenance"
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </DataTableShell>
  );
}

function getCarName(maintenance: Maintenance) {
  if (!maintenance.car) {
    return "Vehículo no disponible";
  }

  return `${maintenance.car.brand} ${maintenance.car.model} ${maintenance.car.year}`;
}

function formatDate(value: string) {
  return value.slice(0, 10);
}
