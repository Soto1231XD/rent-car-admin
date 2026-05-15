"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import StatusBadge from "@/components/ui/StatusBadge";
import DataTableShell from "@/components/ui/DataTableShell";
import { Car } from "@/types/car";

type Props = {
  cars: Car[];
};

export default function CarsTable({ cars }: Props) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const hasFilters = search !== "" || statusFilter !== "";

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("");
  };

  const filteredCars = useMemo(() => {
    const value = search.toLowerCase().trim();

    return cars.filter((car) => {
      const fullCarName = `${car.brand} ${car.model} ${car.year}`.toLowerCase();

      const matchesSearch =
        !value ||
        fullCarName.includes(value) ||
        car.plate.toLowerCase().includes(value) ||
        car.color.toLowerCase().includes(value);

      const matchesStatus = !statusFilter || car.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [cars, search, statusFilter]);

  return (
    <DataTableShell
      filters={
        <div className="flex flex-col gap-3 md:flex-row">
          <input
            type="text"
            placeholder="Buscar por marca, modelo, placa o color..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="input flex-1"
          />

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="input flex-1 md:w-60"
          >
            <option value="">Todos los estados</option>
            <option value="DISPONIBLE">Disponible</option>
            <option value="RENTADO">Rentado</option>
            <option value="MANTENIMIENTO">Mantenimiento</option>
            <option value="NO_DISPONIBLE">No disponible</option>
          </select>
        </div>
      }
      filteredCount={filteredCars.length}
      totalCount={cars.length}
      itemLabel="carros"
      hasFilters={hasFilters}
      onClearFilters={clearFilters}
      emptyTitle="No se encontraron carros"
      emptyDescription="Intenta ajustar la búsqueda o limpiar los filtros aplicados."
    >
      <table className="w-full min-w-[760px] border-collapse text-left text-sm">
        <thead className="bg-slate-50 text-slate-600">
          <tr>
            <th className="px-6 py-4 font-semibold">Vehículo</th>
            <th className="px-6 py-4 font-semibold">Año</th>
            <th className="px-6 py-4 font-semibold">Placa</th>
            <th className="px-6 py-4 font-semibold">Estado</th>
            <th className="px-6 py-4 font-semibold">Precio diario</th>
            <th className="px-6 py-4 font-semibold">Acciones</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100">
          {filteredCars.map((car) => (
            <tr key={car.id} className="transition hover:bg-slate-50">
              <td className="px-6 py-4 font-medium text-slate-900">
                {car.brand} {car.model}
              </td>
              <td className="px-6 py-4 text-slate-900">{car.year}</td>
              <td className="px-6 py-4 text-slate-900">{car.plate}</td>
              <td className="px-6 py-4">
                <StatusBadge status={car.status} />
              </td>
              <td className="px-6 py-4 text-slate-900">
                ${car.dailyPrice.toLocaleString("es-MX")} MXN
              </td>
              <td className="px-6 py-4">
                <Link
                  href={`/dashboard/cars/${car.id}`}
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
