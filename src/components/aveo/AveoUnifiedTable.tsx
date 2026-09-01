"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";
import { AveoEntry, AveoLedger } from "@/types/aveo";
import DataTableShell from "@/components/ui/DataTableShell";
import Pagination, { paginate } from "@/components/ui/Pagination";
import DeleteResourceButton from "@/components/ui/DeleteResourceButton";
import {
  formatCurrency,
  formatCurrencyInputValue,
  toMoneyNumber,
} from "@/lib/format-currency";
import {
  setAveoRentalProfitResult,
  updateAveoEntryCompanyProfitResult,
} from "@/lib/api-client";
import { showErrorToast } from "@/lib/toast";

type RowAction = {
  resourceType: "aveoEntry" | "rental" | "extraExpense";
  resourceId: string;
  editHref: string;
};

type Row = {
  id: string;
  date: string;
  label: string;
  carName: string | null;
  amount: number;
  type: "income" | "expense";
  days?: number | null;
  companyProfit?: number | null;
  action?: RowAction;
};

type Props = {
  ledgers: AveoLedger[];
  entries: AveoEntry[];
  // Carro dueño de este módulo — usado para armar la ruta de "volver" al
  // eliminar un movimiento manual (cada carro aparte tiene su propia
  // página, ya no hay una sola "/dashboard/aveo" genérica).
  carId: string;
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

export default function AveoUnifiedTable({ ledgers, entries, carId }: Props) {
  const [typeFilter, setTypeFilter] = useState("");
  const [monthFilter, setMonthFilter] = useState("");
  const [page, setPage] = useState(1);

  const rows: Row[] = useMemo(() => {
    const result: Row[] = [];

    for (const ledger of ledgers) {
      for (const movement of ledger.movements) {
        const isIncome = movement.type === "income";
        const resourceId = isIncome ? movement.rentalId : movement.expenseId;

        result.push({
          id: `auto-${movement.type}-${resourceId}`,
          date: movement.date,
          label: movement.label,
          carName: ledger.car.name,
          amount: movement.amount,
          type: movement.type,
          days: movement.days,
          companyProfit: movement.companyProfit,
          action: resourceId
            ? isIncome
              ? {
                  resourceType: "rental",
                  resourceId,
                  editHref: `/dashboard/rentals/${resourceId}/edit`,
                }
              : {
                  resourceType: "extraExpense",
                  resourceId,
                  editHref: `/dashboard/extra-expenses/${resourceId}/edit`,
                }
            : undefined,
        });
      }
    }

    for (const entry of entries) {
      result.push({
        id: `manual-income-${entry.id}`,
        date: entry.date,
        label: entry.incomeNote || "Ingreso manual",
        carName: null,
        amount: entry.incomeAmount,
        type: "income",
        days: entry.days,
        companyProfit: entry.companyProfit,
        action: {
          resourceType: "aveoEntry",
          resourceId: entry.id,
          editHref: `/dashboard/aveo/entries/${entry.id}/edit`,
        },
      });

      for (const expense of entry.expenses) {
        result.push({
          id: `manual-expense-${expense.id}`,
          date: entry.date,
          label: expense.description,
          carName: null,
          amount: expense.amount,
          type: "expense",
        });
      }
    }

    return result.sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [ledgers, entries]);

  const monthOptions = useMemo(() => {
    const keys = new Set(
      rows.map((row) => {
        const date = new Date(row.date);
        return `${date.getUTCFullYear()}-${date.getUTCMonth() + 1}`;
      })
    );

    return Array.from(keys)
      .sort((a, b) => {
        const [aYear, aMonth] = a.split("-").map(Number);
        const [bYear, bMonth] = b.split("-").map(Number);
        return aYear !== bYear ? bYear - aYear : bMonth - aMonth;
      })
      .map((key) => {
        const [year, month] = key.split("-").map(Number);
        return { key, label: `${MONTH_NAMES[month]} ${year}` };
      });
  }, [rows]);

  const hasFilters = typeFilter !== "" || monthFilter !== "";

  const clearFilters = () => {
    setTypeFilter("");
    setMonthFilter("");
    setPage(1);
  };

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const matchesType = !typeFilter || row.type === typeFilter;

      const matchesMonth =
        !monthFilter ||
        (() => {
          const date = new Date(row.date);
          return `${date.getUTCFullYear()}-${date.getUTCMonth() + 1}` === monthFilter;
        })();

      return matchesType && matchesMonth;
    });
  }, [rows, typeFilter, monthFilter]);

  const { pageItems: pagedRows, totalPages, safePage } = paginate(filteredRows, page);

  return (
    <DataTableShell
      filters={
        <div className="grid gap-3 sm:grid-cols-2">
          <select
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value)}
            className="input"
          >
            <option value="">Todos los tipos</option>
            <option value="income">Renta</option>
            <option value="expense">Gastos</option>
          </select>

          <select
            value={monthFilter}
            onChange={(event) => setMonthFilter(event.target.value)}
            className="input"
          >
            <option value="">Todos los meses</option>
            {monthOptions.map((option) => (
              <option key={option.key} value={option.key}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      }
      filteredCount={filteredRows.length}
      totalCount={rows.length}
      itemLabel="movimientos"
      hasFilters={hasFilters}
      onClearFilters={clearFilters}
      emptyTitle="Aún no hay movimientos registrados"
      emptyDescription="Las rentas y gastos reales del auto marcado como aparte aparecen aquí solos; usa 'Agregar movimiento manual' solo para casos fuera del sistema."
      pagination={
        <Pagination page={safePage} totalPages={totalPages} onPageChange={setPage} />
      }
    >
      <table className="w-full min-w-[1320px] text-left text-sm">
        <thead className="bg-slate-50 text-slate-600">
          <tr>
            <th className="px-6 py-4 font-semibold">Fecha</th>
            <th className="px-6 py-4 font-semibold">Movimiento</th>
            <th className="px-6 py-4 font-semibold">Auto</th>
            <th className="px-6 py-4 font-semibold">Tipo</th>
            <th className="px-6 py-4 font-semibold">Días</th>
            <th className="px-6 py-4 text-right font-semibold">Monto</th>
            <th className="px-6 py-4 text-right font-semibold">Ganancia rentadora</th>
            <th className="px-6 py-4 text-right font-semibold">Neto Aveo</th>
            <th className="px-6 py-4 font-semibold">Acciones</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100">
          {pagedRows.map((row) => (
            <tr key={row.id}>
              <td className="px-6 py-4 text-slate-900">{formatDate(row.date)}</td>
              <td className="px-6 py-4 text-slate-900">{row.label}</td>
              <td className="px-6 py-4 text-slate-600">{row.carName ?? "—"}</td>
              <td className="px-6 py-4">
                <span
                  className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                    row.type === "income"
                      ? "bg-teal-50 text-teal-700"
                      : "bg-amber-50 text-amber-700"
                  }`}
                >
                  {row.type === "income" ? "Renta" : "Gastos"}
                </span>
              </td>
              <td className="px-6 py-4 text-slate-600">
                {row.days != null ? `${row.days} ${row.days === 1 ? "día" : "días"}` : "—"}
              </td>
              <td
                className={`px-6 py-4 text-right font-semibold ${
                  row.type === "income" ? "text-emerald-700" : "text-rose-700"
                }`}
              >
                {row.type === "income" ? "+" : "-"}
                {formatCurrency(row.amount)}
              </td>
              <ProfitAndNetCells row={row} />
              <td className="px-6 py-4">
                {row.action ? (
                  <div className="flex flex-wrap items-center gap-4">
                    <Link
                      href={row.action.editHref}
                      className="text-sm font-medium text-slate-600 hover:text-slate-900"
                    >
                      Editar
                    </Link>
                    <DeleteResourceButton
                      id={row.action.resourceId}
                      resourceType={row.action.resourceType}
                      resourceName={
                        row.action.resourceType === "aveoEntry"
                          ? `el movimiento del ${formatDate(row.date)}`
                          : row.label
                      }
                      redirectTo={`/dashboard/aveo/${carId}`}
                    />
                  </div>
                ) : (
                  <span className="text-xs text-slate-400">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </DataTableShell>
  );
}

// "Ganancia rentadora" se puede editar directamente desde esta tabla, sin
// pasar por el módulo de Renta o Gastos extras (que no tienen ni deben
// tener este campo) — útil cuando se olvidó capturar el monto al crear el
// registro. Solo aplica a ingresos: un gasto no tiene "ganancia".
//
// "Neto Aveo" (Monto − Ganancia rentadora) se calcula aquí mismo, en el
// mismo componente que la celda editable, para que nunca queden
// desincronizados: si se muestran por separado, la celda de Ganancia puede
// reflejar el valor recién guardado mientras Neto Aveo todavía muestra el
// dato viejo (venido de props), y eso es justo la confusión de números que
// se quiere evitar.
function ProfitAndNetCells({ row }: { row: Row }) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(formatCurrencyInputValue(row.companyProfit));
  const [isSaving, setIsSaving] = useState(false);
  // Refleja el último valor guardado de inmediato, sin esperar a que
  // router.refresh() vuelva a traer los datos del servidor — así la celda
  // siempre muestra lo que en verdad se guardó, aunque el refresco tarde o
  // no dispare un nuevo render de esta fila.
  const [savedValue, setSavedValue] = useState(row.companyProfit ?? null);

  if (row.type !== "income" || !row.action) {
    return (
      <>
        <td className="px-6 py-4 text-right text-slate-400">—</td>
        <td className="px-6 py-4 text-right text-slate-400">—</td>
      </>
    );
  }

  const netAmount = row.amount - (savedValue ?? 0);

  if (!isEditing) {
    return (
      <>
        <td className="px-6 py-4 text-right text-slate-600">
          <button
            type="button"
            onClick={() => {
              setValue(formatCurrencyInputValue(savedValue));
              setIsEditing(true);
            }}
            className="inline-flex items-center gap-1.5 text-slate-600 hover:text-slate-900"
          >
            {savedValue != null ? formatCurrency(savedValue) : "—"}
            <Pencil size={12} className="shrink-0" aria-hidden="true" />
          </button>
        </td>
        <td className="px-6 py-4 text-right font-semibold text-emerald-700">
          {formatCurrency(netAmount)}
        </td>
      </>
    );
  }

  const handleSave = async () => {
    setIsSaving(true);

    const companyProfit = toMoneyNumber(value);
    const result =
      row.action!.resourceType === "rental"
        ? await setAveoRentalProfitResult(row.action!.resourceId, companyProfit)
        : await updateAveoEntryCompanyProfitResult(
            row.action!.resourceId,
            companyProfit
          );

    setIsSaving(false);

    if (!result.data) {
      showErrorToast(
        result.error ?? "No se pudo guardar la ganancia de la rentadora."
      );
      return;
    }

    setSavedValue(companyProfit);
    setIsEditing(false);
    router.refresh();
  };

  return (
    <>
      <td className="px-6 py-4 text-right text-slate-600">
        <div className="flex items-center justify-end gap-1.5">
          <input
            type="text"
            inputMode="decimal"
            autoFocus
            value={value}
            onChange={(event) =>
              setValue(formatCurrencyInputValue(event.target.value))
            }
            className="input h-9 w-28 text-right"
            placeholder="0"
          />
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? "..." : "Guardar"}
          </button>
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            disabled={isSaving}
            className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
          >
            Cancelar
          </button>
        </div>
      </td>
      <td className="px-6 py-4 text-right font-semibold text-slate-400">
        {formatCurrency(row.amount - toMoneyNumber(value))}
      </td>
    </>
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
