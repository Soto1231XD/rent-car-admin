"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { History, X } from "lucide-react";
import { Maintenance, MaintenanceFieldHistory, MaintenanceProviderType } from "@/types/maintenance";
import { getMaintenanceHistoryResult } from "@/lib/api-client";
import { formatCurrency } from "@/lib/format-currency";

type Props = {
  isOpen: boolean;
  maintenanceId: string;
  carName: string;
  current: Maintenance | null;
  onClose: () => void;
};

type ComparableFields = {
  date: string;
  serviceMileage: number | null;
  nextServiceMileage: number | null;
  previousMileage: number | null;
  providerType: MaintenanceProviderType | null;
  location: string | null;
  serviceType: string | null;
  includesMaterial: boolean | null;
  cost: number | null;
  reviewDate: string | null;
};

type TimelineRow = {
  key: string;
  label: string;
  isCurrent: boolean;
  fields: ComparableFields;
};

const FIELD_DEFS: {
  key: keyof ComparableFields;
  label: string;
  format: (value: ComparableFields[keyof ComparableFields]) => string;
  isDate?: boolean;
}[] = [
  { key: "date", label: "Fecha de revisión", format: (value) => formatDate(value as string | null), isDate: true },
  { key: "serviceMileage", label: "Kilometraje actual", format: (value) => formatKm(value as number | null) },
  { key: "nextServiceMileage", label: "Kilometraje previsto", format: (value) => formatKm(value as number | null) },
  { key: "previousMileage", label: "Kilometraje antes de servicio", format: (value) => formatKm(value as number | null) },
  { key: "providerType", label: "Agencia o independiente", format: (value) => formatProviderType(value as MaintenanceProviderType | null) },
  { key: "location", label: "Lugar donde se realizó", format: (value) => (value as string | null) || "-" },
  { key: "serviceType", label: "Descripción del trabajo realizado", format: (value) => (value as string | null) || "-" },
  { key: "includesMaterial", label: "Incluye material", format: (value) => formatIncludesMaterial(value as boolean | null) },
  { key: "cost", label: "Costo del servicio", format: (value) => (value != null ? formatCurrency(value as number) : "-") },
  { key: "reviewDate", label: "Fecha de servicio", format: (value) => formatDate(value as string | null), isDate: true },
];

export default function MileageHistoryDialog({
  isOpen,
  maintenanceId,
  carName,
  current,
  onClose,
}: Props) {
  const [entries, setEntries] = useState<MaintenanceFieldHistory[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setEntries(null);
    setError("");

    let cancelled = false;

    getMaintenanceHistoryResult(maintenanceId).then((result) => {
      if (cancelled) {
        return;
      }

      if (!result.data) {
        setError(result.error ?? "No se pudo cargar el historial.");
        return;
      }

      setEntries(result.data);
    });

    return () => {
      cancelled = true;
    };
  }, [isOpen, maintenanceId]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || typeof document === "undefined") {
    return null;
  }

  const timeline: TimelineRow[] = [];

  if (current) {
    timeline.push({
      key: "current",
      label: "Valor actual",
      isCurrent: true,
      fields: extractFields(current),
    });
  }

  if (entries) {
    for (const entry of entries) {
      timeline.push({
        key: entry.id,
        label: formatDateTime(entry.recordedAt),
        isCurrent: false,
        fields: extractFields(entry),
      });
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mileage-history-title"
      onMouseDown={onClose}
    >
      <div
        className="w-full max-w-6xl rounded-2xl bg-white p-5 shadow-2xl ring-1 ring-slate-200 sm:p-6"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-700">
              <History size={20} />
            </span>

            <div>
              <h2 id="mileage-history-title" className="text-lg font-semibold text-slate-900">
                Historial de cambios
              </h2>
              <p className="mt-1 text-sm text-slate-500">{carName}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-5">
          {error && <p className="text-sm text-red-600">{error}</p>}

          {!error && entries === null && (
            <p className="text-sm text-slate-500">Cargando historial...</p>
          )}

          {!error && entries && entries.length === 0 && (
            <p className="text-sm text-slate-500">
              Este registro no tiene cambios anteriores guardados todavía
            </p>
          )}

          {!error && entries && entries.length > 0 && (
            <>
              <p className="mb-3 text-xs text-slate-500">
                Los campos resaltados muestran qué cambió respecto al registro inmediatamente más reciente.
              </p>

              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full min-w-[1400px] text-left text-sm">
                  <thead className="bg-slate-50 text-slate-600">
                    <tr>
                      <th className="px-4 py-3">Momento</th>
                      {FIELD_DEFS.map((def) => (
                        <th key={def.key} className="px-4 py-3">
                          {def.label}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody className="divide-y">
                    {timeline.map((row, index) => {
                      const olderRow = timeline[index + 1];

                      return (
                        <tr key={row.key} className={row.isCurrent ? "bg-blue-50/50" : undefined}>
                          <td className="px-4 py-3 align-top text-slate-500">
                            {row.isCurrent ? (
                              <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">
                                Actual
                              </span>
                            ) : (
                              row.label
                            )}
                          </td>

                          {FIELD_DEFS.map((def) => {
                            const changed = olderRow
                              ? !fieldsEqual(row.fields[def.key], olderRow.fields[def.key], def.isDate)
                              : false;

                            return (
                              <td
                                key={def.key}
                                className={
                                  changed
                                    ? "px-4 py-3 align-top font-semibold text-amber-800 bg-amber-50"
                                    : "px-4 py-3 align-top text-slate-900"
                                }
                              >
                                {def.format(row.fields[def.key])}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

function extractFields(source: {
  date: string;
  serviceMileage?: number | null;
  nextServiceMileage?: number | null;
  previousMileage?: number | null;
  providerType?: MaintenanceProviderType | null;
  location?: string | null;
  serviceType?: string | null;
  includesMaterial?: boolean | null;
  cost?: number | null;
  reviewDate?: string | null;
}): ComparableFields {
  return {
    date: source.date,
    serviceMileage: source.serviceMileage ?? null,
    nextServiceMileage: source.nextServiceMileage ?? null,
    previousMileage: source.previousMileage ?? null,
    providerType: source.providerType ?? null,
    location: source.location ?? null,
    serviceType: source.serviceType ?? null,
    includesMaterial: source.includesMaterial ?? null,
    cost: source.cost ?? null,
    reviewDate: source.reviewDate ?? null,
  };
}

function fieldsEqual(a: unknown, b: unknown, isDate?: boolean) {
  if (isDate) {
    const dateA = a ? (a as string).slice(0, 10) : null;
    const dateB = b ? (b as string).slice(0, 10) : null;
    return dateA === dateB;
  }

  return (a ?? null) === (b ?? null);
}

function formatDate(value: string | null) {
  return value ? value.slice(0, 10) : "-";
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatKm(value: number | null) {
  return value != null ? `${value.toLocaleString("es-MX")} km` : "-";
}

function formatProviderType(providerType: MaintenanceProviderType | null) {
  if (providerType === "AGENCIA") {
    return "Agencia";
  }

  if (providerType === "INDEPENDIENTE") {
    return "Independiente";
  }

  return "-";
}

function formatIncludesMaterial(includesMaterial: boolean | null) {
  if (includesMaterial == null) {
    return "-";
  }

  return includesMaterial ? "Sí" : "No";
}
