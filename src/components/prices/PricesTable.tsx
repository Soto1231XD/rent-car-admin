"use client";

import { useMemo, useState } from "react";
import StatusBadge from "@/components/ui/StatusBadge";
import { CarPrice } from "@/types/price";
import Link from "next/link";

type Props = {
  prices: CarPrice[];
};

export default function PricesTable({ prices }: Props) {
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

  const filteredPrices = useMemo(() => {
    return prices.filter((price) => {
      const matchesModel =
        !modelSearch ||
        price.model.toLowerCase().includes(modelSearch.toLowerCase());

      const matchesStatus =
        !statusFilter || price.status === statusFilter;

      const matchesTransmission =
        !transmissionFilter || price.transmission === transmissionFilter;

      return matchesModel && matchesStatus && matchesTransmission;
    });
  }, [prices, modelSearch, statusFilter, transmissionFilter]);

  return (
    <div className="rounded-2xl bg-white shadow">
      <div className="border-b border-slate-200 p-5">
        <div className="grid gap-3 md:grid-cols-3">
          <input
            type="text"
            placeholder="Buscar por modelo..."
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
            <option value="NO DISPONIBLE">No disponible</option>
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

        <div className="mt-3 flex items-center justify-between text-sm">
          <p className="text-slate-500">
            Mostrando {filteredPrices.length} de {prices.length} precios
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

      <div className="overflow-x-auto">
        <table className="w-full min-w-[950px] text-left text-sm">
          <thead className="bg-slate-100 text-slate-600">
            <tr>
              <th className="px-6 py-4 font-semibold">Modelo</th>
              <th className="px-6 py-4 font-semibold">Capacidad</th>
              <th className="px-6 py-4 font-semibold">Depósito</th>
              <th className="px-6 py-4 font-semibold">Precio por día</th>
              <th className="px-6 py-4 font-semibold">
                Precio temporada alta
              </th>
              <th className="px-6 py-4 font-semibold">Estado</th>
              <th className="px-6 py-4 font-semibold">Transmisión</th>
              <th className="px-6 py-4 font-semibold">Comentarios</th>
              <th className="px-6 py-4 font-semibold">Acciones</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {filteredPrices.map((price) => (
              <tr
                key={price.id}
                className={
                  price.status === "NO DISPONIBLE"
                    ? "bg-red-50 hover:bg-red-100"
                    : "hover:bg-slate-50"
                }
              >
                <td className="px-6 py-4 font-medium text-slate-900">
                  {price.model}
                </td>

                <td className="px-6 py-4 text-slate-900">
                  {price.capacity}
                </td>

                <td className="px-6 py-4 text-slate-900">
                  ${price.deposit.toLocaleString("es-MX")} MXN
                </td>

                <td className="px-6 py-4 text-slate-900">
                  ${price.dailyPrice.toLocaleString("es-MX")} MXN
                </td>

                <td className="px-6 py-4 text-slate-900">
                  ${price.highSeasonPrice.toLocaleString("es-MX")} MXN
                </td>

                <td className="px-6 py-4">
                  <StatusBadge status={price.status} />
                </td>

                <td className="px-6 py-4 text-slate-900">
                  {price.transmission}
                </td>

                <td className="max-w-[220px] truncate px-6 py-4 text-slate-600">
                  {price.comments || "—"}
                </td>

                <td className="px-6 py-4">
  <Link
    href={`/dashboard/prices/${price.id}/edit`}
    className="text-sm font-medium text-slate-900 hover:underline"
  >
    Editar
  </Link>
</td>

              </tr>
            ))}
          </tbody>
        </table>

        {filteredPrices.length === 0 && (
          <div className="p-8 text-center text-sm text-slate-500">
            No se encontraron precios con esos filtros.
          </div>
        )}
      </div>
    </div>
  );
}