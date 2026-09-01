"use client";

import { useMemo, useState } from "react";
import writeExcelFile from "write-excel-file/browser";
import { Download } from "lucide-react";
import DeleteResourceButton from "@/components/ui/DeleteResourceButton";
import AddGeneralExpenseButton from "@/components/dashboard/AddGeneralExpenseButton";
import { MonthlyBreakdownEntry } from "@/types/monthly-breakdown";
import { GeneralExpense } from "@/types/general-expense";
import { AveoLedger } from "@/types/aveo";
import { formatCurrency as formatMoney } from "@/lib/format-currency";
import { showErrorToast } from "@/lib/toast";

type Props = {
  entries: MonthlyBreakdownEntry[];
  generalExpenses: GeneralExpense[];
  aveoLedgers: AveoLedger[];
};

type AveoMonthlyRow = {
  carId: string;
  carName: string;
  income: number;
  expenses: number;
  difference: number;
};

// Cada carro "aparte" tiene su propia tablita con su propio color, para
// diferenciarlos de un vistazo. Se asigna en el orden en que llegan los
// ledgers (que el backend ya entrega ordenados por antigüedad), así el
// primer carro marcado como aparte (el Aveo) siempre cae en el mismo color
// aunque se agreguen más carros después.
const CAR_PALETTE = [
  {
    header: "bg-amber-500",
    theadBg: "bg-amber-50",
    theadText: "text-amber-800",
    border: "border-amber-200",
    excel: "#f59e0b",
  },
  {
    header: "bg-purple-500",
    theadBg: "bg-purple-50",
    theadText: "text-purple-800",
    border: "border-purple-200",
    excel: "#a855f7",
  },
  {
    header: "bg-teal-500",
    theadBg: "bg-teal-50",
    theadText: "text-teal-800",
    border: "border-teal-200",
    excel: "#14b8a6",
  },
  {
    header: "bg-rose-500",
    theadBg: "bg-rose-50",
    theadText: "text-rose-800",
    border: "border-rose-200",
    excel: "#f43f5e",
  },
  {
    header: "bg-indigo-500",
    theadBg: "bg-indigo-50",
    theadText: "text-indigo-800",
    border: "border-indigo-200",
    excel: "#6366f1",
  },
  {
    header: "bg-lime-600",
    theadBg: "bg-lime-50",
    theadText: "text-lime-800",
    border: "border-lime-200",
    excel: "#65a30d",
  },
] as const;

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

const HEADER_ROW_COLOR = "#06b6d4";
const TOTAL_ROW_COLOR = "#f1f5f9";
const SINGLE_TABLE_COLUMN_WIDTHS = [{ width: 30 }, { width: 16 }, { width: 16 }, { width: 18 }];

function headerCell(value: string, options?: { background?: string }) {
  return {
    value,
    fontWeight: "bold" as const,
    backgroundColor: options?.background ?? HEADER_ROW_COLOR,
    textColor: "#ffffff",
    align: "center" as const,
  };
}

function labelCell(value: string, options?: { bold?: boolean; background?: string }) {
  return {
    value,
    ...(options?.bold ? { fontWeight: "bold" as const } : {}),
    ...(options?.background ? { backgroundColor: options.background } : {}),
  };
}

function moneyCell(value: number, options?: { bold?: boolean; background?: string }) {
  return {
    value,
    type: Number,
    format: "#,##0.00",
    align: "right" as const,
    ...(options?.bold ? { fontWeight: "bold" as const } : {}),
    ...(options?.background ? { backgroundColor: options.background } : {}),
  };
}

function blankCell(options?: { background?: string }) {
  return {
    value: undefined,
    ...(options?.background ? { backgroundColor: options.background } : {}),
  };
}

export default function MonthlyBreakdownTable({
  entries,
  generalExpenses,
  aveoLedgers,
}: Props) {
  const [selectedMonthKey, setSelectedMonthKey] = useState("");
  const [exportScope, setExportScope] = useState<"all" | "general" | "aparte">("all");

  const carColors = useMemo(() => {
    const map = new Map<string, (typeof CAR_PALETTE)[number]>();
    let index = 0;

    for (const ledger of aveoLedgers) {
      if (!map.has(ledger.car.id)) {
        map.set(ledger.car.id, CAR_PALETTE[index % CAR_PALETTE.length]);
        index += 1;
      }
    }

    return map;
  }, [aveoLedgers]);

  const aveoMonthly = useMemo(() => {
    const map = new Map<string, AveoMonthlyRow[]>();

    for (const ledger of aveoLedgers) {
      const perMonth = new Map<string, { income: number; expenses: number }>();

      for (const movement of ledger.movements) {
        const date = new Date(movement.date);
        const key = `${date.getUTCFullYear()}-${date.getUTCMonth() + 1}`;
        const bucket = perMonth.get(key) ?? { income: 0, expenses: 0 };

        if (movement.type === "income") {
          bucket.income += movement.amount;
        } else {
          bucket.expenses += movement.amount;
        }

        perMonth.set(key, bucket);
      }

      for (const [key, totals] of perMonth.entries()) {
        const rows = map.get(key) ?? [];
        rows.push({
          carId: ledger.car.id,
          carName: ledger.car.name,
          income: totals.income,
          expenses: totals.expenses,
          difference: totals.income - totals.expenses,
        });
        map.set(key, rows);
      }
    }

    return map;
  }, [aveoLedgers]);

  const allMonthKeys = useMemo(() => {
    const keys = new Set<string>(entries.map((entry) => `${entry.year}-${entry.month}`));
    for (const key of aveoMonthly.keys()) {
      keys.add(key);
    }

    return Array.from(keys).sort((a, b) => {
      const [aYear, aMonth] = a.split("-").map(Number);
      const [bYear, bMonth] = b.split("-").map(Number);

      return aYear !== bYear ? bYear - aYear : bMonth - aMonth;
    });
  }, [entries, aveoMonthly]);

  const expensesByMonth = useMemo(() => {
    const map = new Map<string, GeneralExpense[]>();

    for (const expense of generalExpenses) {
      const date = new Date(expense.date);
      const year = date.getUTCFullYear();
      const month = date.getUTCMonth() + 1;
      const key = `${year}-${month}`;
      const list = map.get(key) ?? [];
      list.push(expense);
      map.set(key, list);
    }

    return map;
  }, [generalExpenses]);

  const entriesByKey = useMemo(
    () => new Map(entries.map((entry) => [`${entry.year}-${entry.month}`, entry])),
    [entries]
  );

  const monthOptions = useMemo(
    () =>
      allMonthKeys.map((key) => {
        const [year, month] = key.split("-").map(Number);
        return { key, label: `${MONTH_NAMES[month]} ${year}` };
      }),
    [allMonthKeys]
  );

  const filteredMonthKeys = useMemo(() => {
    if (!selectedMonthKey) {
      return allMonthKeys;
    }

    return allMonthKeys.filter((key) => key === selectedMonthKey);
  }, [allMonthKeys, selectedMonthKey]);

  const monthKeysForExport = useMemo(() => {
    return filteredMonthKeys.filter((key) => {
      if (exportScope === "general") {
        return entriesByKey.has(key);
      }
      if (exportScope === "aparte") {
        return (aveoMonthly.get(key) ?? []).length > 0;
      }
      return true;
    });
  }, [filteredMonthKeys, exportScope, entriesByKey, aveoMonthly]);

  const handleDownloadExcel = async () => {
    type Cell =
      | ReturnType<typeof headerCell>
      | ReturnType<typeof moneyCell>
      | ReturnType<typeof labelCell>
      | ReturnType<typeof blankCell>;

    const blankRow = (): Cell[] => [blankCell(), blankCell(), blankCell(), blankCell()];

    const sheets = monthKeysForExport.map((key) => {
      const [year, month] = key.split("-").map(Number);
      const entry = exportScope === "aparte" ? undefined : entriesByKey.get(key);
      const aveoRowsForMonth =
        exportScope === "general" ? [] : aveoMonthly.get(key) ?? [];

      const monthExpenses = expensesByMonth.get(key) ?? [];
      const payrollEntries = monthExpenses.filter((e) => e.type === "NOMINA");
      const otherEntries = monthExpenses.filter((e) => e.type === "OTROS");
      const totalStyle = { bold: true, background: TOTAL_ROW_COLOR };

      const mainRows: Cell[][] = entry
        ? [
            [
              headerCell("Vehículo"),
              headerCell("Ingresos"),
              headerCell("Egresos"),
              headerCell("Total de renta"),
            ],
            ...entry.cars.map((car) => [
              labelCell(car.carName),
              moneyCell(car.income),
              moneyCell(car.expenses),
              moneyCell(car.net),
            ]),
            [
              labelCell("Nómina", { bold: true }),
              blankCell(),
              moneyCell(entry.payroll, { bold: true }),
              blankCell(),
            ],
            ...payrollEntries.map((item) => [
              labelCell(`  ${formatDate(item.date)}${item.notes ? ` - ${item.notes}` : ""}`),
              blankCell(),
              moneyCell(item.amount),
              blankCell(),
            ]),
            [
              labelCell("Otros", { bold: true }),
              blankCell(),
              moneyCell(entry.other, { bold: true }),
              blankCell(),
            ],
            ...otherEntries.map((item) => [
              labelCell(`  ${formatDate(item.date)}${item.notes ? ` - ${item.notes}` : ""}`),
              blankCell(),
              moneyCell(item.amount),
              blankCell(),
            ]),
            [
              labelCell("Total", totalStyle),
              moneyCell(entry.totals.income, totalStyle),
              moneyCell(entry.totals.expenses, totalStyle),
              moneyCell(entry.totals.net, totalStyle),
            ],
          ]
        : [];

      // Cada carro aparte se apila como su propia tablita, con su propio
      // color de encabezado (el mismo que se ve en pantalla) y su propia
      // fila de "Total" — igual que la tabla de Renta de autos.
      const aparteBlocks: Cell[][] = aveoRowsForMonth.flatMap((row, index) => {
        const color = carColors.get(row.carId)?.excel ?? "#f59e0b";
        const totalStyle = { bold: true, background: TOTAL_ROW_COLOR };
        const block: Cell[][] = [
          [
            headerCell("Vehículo", { background: color }),
            headerCell("Ingreso", { background: color }),
            headerCell("Egreso", { background: color }),
            headerCell("Diferencia", { background: color }),
          ],
          [
            labelCell(row.carName),
            moneyCell(row.income),
            moneyCell(row.expenses),
            moneyCell(row.difference),
          ],
          [
            labelCell("Total", totalStyle),
            moneyCell(row.income, totalStyle),
            moneyCell(row.expenses, totalStyle),
            moneyCell(row.difference, totalStyle),
          ],
        ];

        return index === 0 ? block : [blankRow(), ...block];
      });

      let finalRows: Cell[][];

      if (exportScope === "general") {
        finalRows = mainRows;
      } else if (exportScope === "aparte") {
        finalRows = aparteBlocks;
      } else {
        finalRows =
          mainRows.length > 0 && aparteBlocks.length > 0
            ? [...mainRows, blankRow(), ...aparteBlocks]
            : [...mainRows, ...aparteBlocks];
      }

      return {
        data: finalRows,
        sheet: `${MONTH_NAMES[month]} ${year}`.slice(0, 31),
        columns: SINGLE_TABLE_COLUMN_WIDTHS,
      };
    });

    const monthSuffix = selectedMonthKey
      ? monthOptions
          .find((option) => option.key === selectedMonthKey)
          ?.label.replace(" ", "-")
      : "todos-los-meses";
    const scopeSuffix =
      exportScope === "general"
        ? "control-general"
        : exportScope === "aparte"
          ? "carros-aparte"
          : "completo";
    const fileSuffix = `${monthSuffix}-${scopeSuffix}`;

    try {
      await writeExcelFile(sheets).toFile(`control-mensual-${fileSuffix}.xlsx`);
    } catch {
      showErrorToast("No se pudo generar el archivo de Excel. Intenta de nuevo.");
    }
  };

  if (entries.length === 0 && aveoMonthly.size === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
        Aún no hay rentas completadas o gastos pagados registrados para calcular
        el control mensual.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="block sm:w-64">
          <span className="mb-1 block text-sm font-medium text-slate-700">
            Filtrar por mes
          </span>
          <select
            value={selectedMonthKey}
            onChange={(event) => setSelectedMonthKey(event.target.value)}
            className="input"
          >
            <option value="">Todos los meses</option>
            {monthOptions.map((option) => (
              <option key={option.key} value={option.key}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block sm:w-56">
          <span className="mb-1 block text-sm font-medium text-slate-700">
            Descargar
          </span>
          <select
            value={exportScope}
            onChange={(event) =>
              setExportScope(event.target.value as "all" | "general" | "aparte")
            }
            className="input"
          >
            <option value="all">Todo (Control general + Carros aparte)</option>
            <option value="general">Solo Control general</option>
            <option value="aparte">Solo Carros aparte</option>
          </select>
        </label>

        <button
          type="button"
          onClick={handleDownloadExcel}
          disabled={monthKeysForExport.length === 0}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          <Download size={16} />
          Descargar Excel
        </button>
      </div>

      <div className="space-y-8">
      {filteredMonthKeys.map((key) => {
        const entry = entriesByKey.get(key);
        const aveoRows = aveoMonthly.get(key);
        const [year, month] = key.split("-").map(Number);
        const monthExpenses = expensesByMonth.get(key) ?? [];
        const payrollEntries = monthExpenses.filter((e) => e.type === "NOMINA");
        const otherEntries = monthExpenses.filter((e) => e.type === "OTROS");
        const defaultDate = defaultDateForMonth(year, month);

        return (
          <div key={key} className="space-y-3">
            {entry && (
              <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="bg-cyan-500 px-6 py-3">
                  <h2 className="text-lg font-bold uppercase text-white">
                    Renta de autos {MONTH_NAMES[entry.month]} {entry.year}
                  </h2>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[720px] text-left text-sm">
                    <thead className="bg-slate-50 text-slate-600">
                      <tr>
                        <th className="px-6 py-3">Vehículo</th>
                        <th className="px-6 py-3">Ingresos</th>
                        <th className="px-6 py-3">Egresos</th>
                        <th className="px-6 py-3">Total de renta</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y">
                      {entry.cars.map((car) => (
                        <tr key={car.carId}>
                          <td className="px-6 py-3 font-medium text-slate-900">
                            {car.carName}
                          </td>
                          <td className="px-6 py-3 text-slate-900">
                            {formatMoney(car.income)}
                          </td>
                          <td className="px-6 py-3 text-slate-900">
                            {formatMoney(car.expenses)}
                          </td>
                          <td className="px-6 py-3 font-semibold text-slate-900">
                            {formatMoney(car.net)}
                          </td>
                        </tr>
                      ))}

                      <ExpenseCategoryRows
                        label="Nómina"
                        type="NOMINA"
                        total={entry.payroll}
                        entries={payrollEntries}
                        defaultDate={defaultDate}
                      />
                      <ExpenseCategoryRows
                        label="Otros"
                        type="OTROS"
                        total={entry.other}
                        entries={otherEntries}
                        defaultDate={defaultDate}
                      />

                      <tr className="bg-slate-50 font-bold text-slate-900">
                        <td className="px-6 py-3">Total</td>
                        <td className="px-6 py-3">{formatMoney(entry.totals.income)}</td>
                        <td className="px-6 py-3">{formatMoney(entry.totals.expenses)}</td>
                        <td className="px-6 py-3">{formatMoney(entry.totals.net)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {aveoRows?.map((row) => {
              const color = carColors.get(row.carId) ?? CAR_PALETTE[0];

              return (
                <section
                  key={row.carId}
                  className={`overflow-hidden rounded-2xl border ${color.border} bg-white shadow-sm`}
                >
                  <div className={`${color.header} px-6 py-2.5`}>
                    <h3 className="text-sm font-bold uppercase text-white">
                      {row.carName} (aparte) — {MONTH_NAMES[month]} {year}
                    </h3>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[560px] text-left text-sm">
                      <thead className={`${color.theadBg} ${color.theadText}`}>
                        <tr>
                          <th className="px-6 py-2.5">Vehículo</th>
                          <th className="px-6 py-2.5">Ingresos</th>
                          <th className="px-6 py-2.5">Egresos</th>
                          <th className="px-6 py-2.5">Diferencia</th>
                        </tr>
                      </thead>

                      <tbody className="divide-y">
                        <tr>
                          <td className="px-6 py-2.5 font-medium text-slate-900">
                            {row.carName}
                          </td>
                          <td className="px-6 py-2.5 text-slate-900">
                            {formatMoney(row.income)}
                          </td>
                          <td className="px-6 py-2.5 text-slate-900">
                            {formatMoney(row.expenses)}
                          </td>
                          <td className="px-6 py-2.5 text-slate-900">
                            {formatMoney(row.difference)}
                          </td>
                        </tr>

                        <tr className="bg-slate-50 font-bold text-slate-900">
                          <td className="px-6 py-3">Total</td>
                          <td className="px-6 py-3">{formatMoney(row.income)}</td>
                          <td className="px-6 py-3">{formatMoney(row.expenses)}</td>
                          <td className="px-6 py-3">{formatMoney(row.difference)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </section>
              );
            })}
          </div>
        );
      })}
      </div>
    </div>
  );
}

function ExpenseCategoryRows({
  label,
  type,
  total,
  entries,
  defaultDate,
}: {
  label: string;
  type: "NOMINA" | "OTROS";
  total: number;
  entries: GeneralExpense[];
  defaultDate: string;
}) {
  return (
    <>
      <tr>
        <td className="px-6 py-3 font-medium text-slate-900">{label}</td>
        <td className="px-6 py-3 text-slate-400">—</td>
        <td className="px-6 py-3 text-slate-900">{formatMoney(total)}</td>
        <td className="px-6 py-3">
          <AddGeneralExpenseButton type={type} label={label} defaultDate={defaultDate} />
        </td>
      </tr>

      {entries.map((item) => (
        <tr key={item.id} className="bg-slate-50/60 text-xs text-slate-600">
          <td className="px-6 py-2 pl-10" colSpan={2}>
            {formatDate(item.date)}
            {item.notes ? ` · ${item.notes}` : ""}
          </td>
          <td className="px-6 py-2">{formatMoney(item.amount)}</td>
          <td className="px-6 py-2">
            <DeleteResourceButton
              id={item.id}
              resourceType="generalExpense"
              resourceName={`${label} · ${formatDate(item.date)}`}
              redirectTo="/dashboard/monthly-breakdown"
            />
          </td>
        </tr>
      ))}
    </>
  );
}

function defaultDateForMonth(year: number, month: number) {
  return `${year}-${String(month).padStart(2, "0")}-01`;
}

function formatDate(value: string) {
  return value.slice(0, 10);
}
