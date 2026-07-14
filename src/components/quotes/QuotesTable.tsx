"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Quote } from "@/types/quote";
import DataTableShell from "@/components/ui/DataTableShell";

type Props = {
  quotes: Quote[];
};

export default function QuotesTable({ quotes }: Props) {
  const [search, setSearch] = useState("");
  const hasFilters = search !== "";

  const filteredQuotes = useMemo(() => {
    const value = search.toLowerCase().trim();

    return quotes.filter((quote) => {
      const carName = quote.car
        ? `${quote.car.brand} ${quote.car.model} ${quote.car.year}`.toLowerCase()
        : "";

      return (
        !value ||
        quote.folio.toLowerCase().includes(value) ||
        carName.includes(value)
      );
    });
  }, [quotes, search]);

  return (
    <DataTableShell
      filters={
        <input
          type="text"
          placeholder="Buscar por folio o vehículo..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="input w-full"
        />
      }
      filteredCount={filteredQuotes.length}
      totalCount={quotes.length}
      itemLabel="cotizaciones"
      hasFilters={hasFilters}
      onClearFilters={() => setSearch("")}
      emptyTitle="No se encontraron cotizaciones"
      emptyDescription="Intenta buscar por otro folio o vehículo."
    >
      <table className="w-full min-w-[720px] border-collapse text-left text-sm">
        <thead className="bg-slate-50 text-slate-600">
          <tr>
            <th className="px-6 py-4 font-semibold">Folio</th>
            <th className="px-6 py-4 font-semibold">Vehículo</th>
            <th className="px-6 py-4 font-semibold">Periodo</th>
            <th className="px-6 py-4 font-semibold">Total</th>
            <th className="px-6 py-4 font-semibold">Generada</th>
            <th className="px-6 py-4 font-semibold">Acciones</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100">
          {filteredQuotes.map((quote) => (
            <tr key={quote.id} className="transition hover:bg-slate-50">
              <td className="px-6 py-4 font-medium tracking-wide text-slate-900">
                {quote.folio}
              </td>
              <td className="px-6 py-4 text-slate-900">
                {quote.car
                  ? `${quote.car.brand} ${quote.car.model} ${quote.car.year}`
                  : "Vehículo no disponible"}
              </td>
              <td className="px-6 py-4 text-slate-700">
                {formatDate(quote.startDate)} - {formatDate(quote.endDate)}
              </td>
              <td className="px-6 py-4 text-slate-900">
                ${quote.totalPrice.toLocaleString("es-MX")} MXN
              </td>
              <td className="px-6 py-4 text-slate-700">
                {formatDate(quote.createdAt ?? quote.startDate)}
              </td>
              <td className="px-6 py-4">
                <Link
                  href={`/dashboard/quotes/${quote.id}`}
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

function formatDate(value: string) {
  return value.slice(0, 10);
}