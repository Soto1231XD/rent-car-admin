"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import StatusBadge from "@/components/ui/StatusBadge";
import DataTableShell from "@/components/ui/DataTableShell";
import { Car } from "@/types/car";

type Props = {
  cars: Car[];
};

export default function PricesTable({ cars }: Props) {
  const [modelSearch, setModelSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [transmissionFilter, setTransmissionFilter] = useState("");

  const hasFilters =
    modelSearch !== "" || statusFilter !== "" || transmissionFilter !== "";

  const clearFilters = () => {
    setModelSearch("");
    setStatusFilter("");
    setTransmissionFilter("");
  };

  const filteredCars = useMemo(() => {
    return cars.filter((car) => {
      const modelName = getModelName(car).toLowerCase();

      const matchesModel =
        !modelSearch ||
        modelName.includes(modelSearch.toLowerCase()) ||
        (car.plate ?? "").toLowerCase().includes(modelSearch.toLowerCase());

      const matchesStatus =
        !statusFilter || car.status === statusFilter;

      const matchesTransmission =
        !transmissionFilter || car.transmission === transmissionFilter;

      return matchesModel && matchesStatus && matchesTransmission;
    });
  }, [cars, modelSearch, statusFilter, transmissionFilter]);

  return (
    <DataTableShell
      filters={
        <div className="grid gap-3 md:grid-cols-3">
          <input
            type="text"
            placeholder="Buscar por modelo o placa..."
            value={modelSearch}
            onChange={(event) => setModelSearch(event.target.value)}
            className="input"
          />

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="input"
          >
            <option value="">Todos los estados</option>
            <option value="DISPONIBLE">Disponible</option>
            <option value="RENTADO">Rentado</option>
            <option value="MANTENIMIENTO">Mantenimiento</option>
            <option value="NO_DISPONIBLE">No disponible</option>
          </select>

          <select
            value={transmissionFilter}
            onChange={(event) => setTransmissionFilter(event.target.value)}
            className="input"
          >
            <option value="">Todas las transmisiones</option>
            <option value="AUTOMATICO">Automático</option>
            <option value="ESTANDAR">Estándar</option>
          </select>
        </div>
      }
      filteredCount={filteredCars.length}
      totalCount={cars.length}
      itemLabel="tarifas"
      hasFilters={hasFilters}
      onClearFilters={clearFilters}
      emptyTitle="No se encontraron tarifas"
      emptyDescription="Intenta ajustar el modelo, placa, estado o transmisión."
    >
      <table className="w-full min-w-[1180px] text-left text-sm">
        <thead className="bg-slate-100 text-slate-600">
          <tr>
            <th className="px-6 py-4 font-semibold">Modelo</th>
            <th className="px-6 py-4 font-semibold">Capacidad</th>
            <th className="px-6 py-4 font-semibold">Depósito en garantía</th>
            <th className="px-6 py-4 font-semibold">Precio por día</th>
            <th className="px-6 py-4 font-semibold">Precio temporada alta</th>
            <th className="px-6 py-4 font-semibold">Comisionista</th>
            <th className="px-6 py-4 font-semibold">Comisionista alta</th>
            <th className="px-6 py-4 font-semibold">Estado</th>
            <th className="px-6 py-4 font-semibold">Transmisión</th>
            <th className="px-6 py-4 font-semibold">Placa</th>
            <th className="px-6 py-4 font-semibold">Acciones</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100">
          {filteredCars.map((car) => (
            <tr
              key={car.id}
              className={
                car.status === "NO_DISPONIBLE"
                  ? "bg-red-50 hover:bg-red-100"
                  : "hover:bg-slate-50"
              }
            >
              <td className="px-6 py-4 font-medium text-slate-900">
                {getModelName(car)}
              </td>
              <td className="px-6 py-4 text-slate-900">{car.passengers}</td>
              <td className="px-6 py-4 text-slate-900">
                {formatMoney(car.deposit)}
              </td>
              <td className="px-6 py-4 text-slate-900">
                {formatMoney(car.dailyPrice)}
              </td>
              <td className="px-6 py-4 text-slate-900">
                {formatMoney(car.highSeasonPrice)}
              </td>
              <td className="px-6 py-4 text-slate-900">
                {formatMoney(car.commissionDailyPrice)}
              </td>
              <td className="px-6 py-4 text-slate-900">
                {formatMoney(car.commissionHighSeasonPrice)}
              </td>
              <td className="px-6 py-4">
                <StatusBadge status={car.status} />
              </td>
              <td className="px-6 py-4 text-slate-900">
                {formatTransmission(car.transmission)}
              </td>
              <td className="px-6 py-4 text-slate-900">
                {car.plate || "No registrada"}
              </td>
              <td className="px-6 py-4">
                <Link
                  href={`/dashboard/cars/${car.id}/edit`}
                  className="text-sm font-medium text-slate-900 hover:underline"
                >
                  Editar
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </DataTableShell>
  );
}

function getModelName(car: Car) {
  return `${car.brand} ${car.model} ${car.year}`;
}

function formatMoney(value?: number | string | null) {
  if (value === undefined || value === null) {
    return "No definido";
  }

  const numericValue =
    typeof value === "string" ? Number(value.replace(/,/g, "")) : value;

  if (!Number.isFinite(numericValue) || numericValue <= 0) {
    return "No definido";
  }

  return `$${numericValue.toLocaleString("es-MX")} MXN`;
}

function formatTransmission(transmission: string) {
  return transmission === "AUTOMATICO" ? "Automático" : "Estándar";
}
