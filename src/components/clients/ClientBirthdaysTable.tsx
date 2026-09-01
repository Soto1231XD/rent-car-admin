"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import EmptyState from "@/components/ui/EmptyState";
import Pagination, { paginate } from "@/components/ui/Pagination";

export type BirthdayEntry = {
  clientId: string;
  clientName: string;
  clientPhone: string;
  birthDate: string;
  nextBirthday: string;
  daysUntil: number;
  month: number;
};

type Props = {
  entries: BirthdayEntry[];
};

const MONTH_NAMES: Record<number, string> = {
  1: "Enero",
  2: "Febrero",
  3: "Marzo",
  4: "Abril",
  5: "Mayo",
  6: "Junio",
  7: "Julio",
  8: "Agosto",
  9: "Septiembre",
  10: "Octubre",
  11: "Noviembre",
  12: "Diciembre",
};

export default function ClientBirthdaysTable({ entries }: Props) {
  const [monthFilter, setMonthFilter] = useState("");
  const [page, setPage] = useState(1);

  const monthOptions = useMemo(() => {
    const months = Array.from(new Set(entries.map((entry) => entry.month)));
    return months
      .sort((a, b) => a - b)
      .map((month) => ({ value: String(month), label: MONTH_NAMES[month] }));
  }, [entries]);

  const filteredEntries = useMemo(() => {
    if (!monthFilter) {
      return entries;
    }

    return entries.filter((entry) => String(entry.month) === monthFilter);
  }, [entries, monthFilter]);

  const { pageItems: pagedEntries, totalPages, safePage } = paginate(filteredEntries, page);

  if (entries.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <EmptyState
          title="Aún no hay cumpleaños registrados"
          description="Agrega la fecha de nacimiento en el perfil de un cliente para que aparezca aquí."
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <label className="block sm:w-64">
        <span className="mb-1 block text-sm font-medium text-slate-700">
          Filtrar por mes
        </span>
        <select
          value={monthFilter}
          onChange={(event) => {
            setMonthFilter(event.target.value);
            setPage(1);
          }}
          className="input"
        >
          <option value="">Todos los meses</option>
          {monthOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      {filteredEntries.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <EmptyState
            title="No hay cumpleaños en este mes"
            description="Prueba con otro mes o quita el filtro."
          />
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-6 py-4">Cliente</th>
                  <th className="px-6 py-4">Teléfono</th>
                  <th className="px-6 py-4">Fecha de nacimiento</th>
                  <th className="px-6 py-4">Próximo cumpleaños</th>
                  <th className="px-6 py-4">Faltan</th>
                  <th className="px-6 py-4">Acciones</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {pagedEntries.map((entry) => (
                  <tr key={entry.clientId} className="transition hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {entry.clientName}
                    </td>
                    <td className="px-6 py-4 text-slate-900">{entry.clientPhone}</td>
                    <td className="px-6 py-4 text-slate-900">
                      {formatDate(entry.birthDate)}
                    </td>
                    <td className="px-6 py-4 text-slate-900">
                      {formatDate(entry.nextBirthday)}
                    </td>
                    <td className="px-6 py-4">
                      <DaysUntilBadge daysUntil={entry.daysUntil} />
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/dashboard/clients/${entry.clientId}`}
                        className="text-sm font-medium text-slate-900 hover:underline"
                      >
                        Ver detalle
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination page={safePage} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
}

function DaysUntilBadge({ daysUntil }: { daysUntil: number }) {
  const label =
    daysUntil === 0
      ? "¡Hoy!"
      : daysUntil === 1
        ? "Mañana"
        : `En ${daysUntil} días`;

  const isSoon = daysUntil <= 7;

  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ${
        isSoon
          ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
          : "bg-slate-100 text-slate-700 ring-1 ring-slate-200"
      }`}
    >
      {label}
    </span>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-MX", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}
