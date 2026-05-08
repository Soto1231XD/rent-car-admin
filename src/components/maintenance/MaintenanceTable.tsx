"use client";

import { useMemo, useState } from "react";
import StatusBadge from "@/components/ui/StatusBadge";
import { Maintenance } from "@/types/maintenance";
import EmptyState from "@/components/ui/EmptyState";

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
    return maintenances.filter((m) => {
      const matchesCar =
        !carSearch ||
        m.carName.toLowerCase().includes(carSearch.toLowerCase());

      const matchesService =
        !serviceSearch ||
        m.serviceType.toLowerCase().includes(serviceSearch.toLowerCase());

      const matchesStatus =
        !statusFilter || m.status === statusFilter;

      return matchesCar && matchesService && matchesStatus;
    });
  }, [maintenances, carSearch, serviceSearch, statusFilter]);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* FILTROS */}
      <div className="border-b border-slate-200 p-5">
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
      <option value="EN PROGRESO">En progreso</option>
      <option value="COMPLETADO">Completado</option>
    </select>
  </div>

  <div className="mt-3 flex flex-col gap-2 text-sm sm:flex-row sm:items-center sm:justify-between">
    <p className="text-slate-500">
      Mostrando {filteredMaintenances.length} de {maintenances.length} mantenimientos
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

      {/* TABLA */}
      <div className="overflow-x-auto">
        <table className="min-w-[760px] w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-6 py-4">Vehículo</th>
              <th className="px-6 py-4">Servicio</th>
              <th className="px-6 py-4">Fecha</th>
              <th className="px-6 py-4">Costo</th>
              <th className="px-6 py-4">Estado</th>
              <th className="px-6 py-4">Comentarios</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {filteredMaintenances.map((m) => (
              <tr key={m.id} className="transition hover:bg-slate-50">
                <td className="px-6 py-4 text-slate-900">{m.carName}</td>

                <td className="px-6 py-4 text-slate-900">
                  {m.serviceType}
                </td>

                <td className="px-6 py-4 text-slate-900">{m.date}</td>

                <td className="px-6 py-4 text-slate-900">
                  ${m.cost.toLocaleString("es-MX")} MXN
                </td>

                <td className="px-6 py-4">
                  <StatusBadge status={m.status} />
                </td>

                <td className="px-6 py-4 text-slate-600 max-w-[200px] truncate">
  {m.notes || "—"}
</td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredMaintenances.length === 0 && (
  <EmptyState
    title="No se encontraron mantenimientos"
    description="Intenta ajustar el vehículo, servicio o estado seleccionado."
    actionLabel={hasFilters ? "Limpiar filtros" : undefined}
    onAction={hasFilters ? clearFilters : undefined}
  />
)}
      </div>
    </div>
  );
}
