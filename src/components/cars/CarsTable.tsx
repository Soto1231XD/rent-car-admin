"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import StatusBadge from "@/components/ui/StatusBadge";
import { Car } from "@/types/car";
import EmptyState from "@/components/ui/EmptyState";

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

      const matchesStatus =
        !statusFilter || car.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [cars, search, statusFilter]);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/*  FILTROS */}
      <div className="border-b border-slate-200 p-5">
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
            className="input md:w-60 flex-1"
          >
            <option value="">Todos los estados</option>
            <option value="DISPONIBLE">Disponible</option>
            <option value="MANTENIMIENTO">Mantenimiento</option>
            <option value="FUERA DE SERVICIO">Fuera de servicio</option>
          </select>
        </div>

        {/*  CONTADOR + LIMPIAR */}
        <div className="mt-3 flex flex-col gap-2 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="text-slate-500">
            Mostrando {filteredCars.length} de {cars.length} carros
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

      {/*  TABLA */}
      <div className="overflow-x-auto">
        <table className="min-w-[760px] w-full border-collapse text-left text-sm">
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

        {filteredCars.length === 0 && (
  <EmptyState
    title="No se encontraron carros"
    description="Intenta ajustar la búsqueda o limpiar los filtros aplicados."
    actionLabel={hasFilters ? "Limpiar filtros" : undefined}
    onAction={hasFilters ? clearFilters : undefined}
  />
)}
      </div>
    </div>
  );
}
