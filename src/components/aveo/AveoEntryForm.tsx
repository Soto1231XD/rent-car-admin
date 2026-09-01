"use client";

import { ReactNode, useState } from "react";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { AveoEntry } from "@/types/aveo";
import { createAveoEntryResult, updateAveoEntryResult } from "@/lib/api-client";
import FormAlert from "@/components/ui/FormAlert";
import { showErrorToast } from "@/lib/toast";
import {
  formatCurrency,
  formatCurrencyInput,
  formatCurrencyInputValue,
  normalizeCurrencyValue,
  toMoneyNumber,
} from "@/lib/format-currency";

const currencyNumber = (message: string) =>
  z.preprocess(normalizeCurrencyValue, z.coerce.number().min(0, message));

const optionalDays = z.preprocess(
  (value) => (value === "" || value === undefined || value === null ? undefined : value),
  z.coerce.number().int().min(1, "Debe ser al menos 1 día").optional()
);

const optionalCurrencyNumber = z.preprocess((value) => {
  const normalized = normalizeCurrencyValue(value);
  return normalized === "" ? undefined : normalized;
}, z.coerce.number().min(0, "No puede ser negativo").optional());

const schema = z.object({
  date: z.string().min(1, "La fecha es obligatoria"),
  incomeAmount: currencyNumber("El ingreso no puede ser negativo"),
  incomeNote: z.string().optional(),
  days: optionalDays,
  companyProfit: optionalCurrencyNumber,
  notes: z.string().optional(),
  expenses: z.array(
    z.object({
      amount: currencyNumber("El monto no puede ser negativo"),
      description: z.string().min(1, "La descripción es obligatoria"),
    })
  ),
});

type FormData = z.output<typeof schema>;
type FormInput = z.input<typeof schema>;

type Props = {
  mode: "create" | "edit";
  // El carro es fijo, no se pregunta en el formulario: siempre se llega
  // aquí desde el módulo de un carro específico dentro de "Carros aparte".
  carId: string;
  initialData?: Partial<AveoEntry>;
  entryId?: string;
};

export default function AveoEntryForm({
  mode,
  carId,
  initialData,
  entryId,
}: Props) {
  const router = useRouter();
  const [submitError, setSubmitError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormInput, unknown, FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      date: formatDateInput(initialData?.date),
      incomeAmount: formatCurrencyInputValue(initialData?.incomeAmount),
      incomeNote: initialData?.incomeNote ?? "",
      days: initialData?.days ?? undefined,
      companyProfit: formatCurrencyInputValue(initialData?.companyProfit),
      notes: initialData?.notes ?? "",
      expenses:
        initialData?.expenses?.map((expense) => ({
          amount: formatCurrencyInputValue(expense.amount),
          description: expense.description,
        })) ?? [],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "expenses" });

  const incomeAmountInput = useWatch({ control, name: "incomeAmount" });
  const expensesInput = useWatch({ control, name: "expenses" });
  const companyProfitInput = useWatch({ control, name: "companyProfit" });
  const incomeValue = toMoneyNumber(
    incomeAmountInput as string | number | null | undefined
  );
  const companyProfitValue = toMoneyNumber(
    companyProfitInput as string | number | null | undefined
  );
  const totalExpenses = (expensesInput ?? []).reduce(
    (sum, expense) =>
      sum + toMoneyNumber(expense?.amount as string | number | null | undefined),
    0
  );
  // La ganancia de la rentadora sale del ingreso, no se suma aparte — así
  // que la diferencia (lo que en realidad le queda al Aveo) debe restarla,
  // igual que los gastos. Ej: ingreso 1,300, ganancia rentadora 100, sin
  // gastos → diferencia 1,200 (no 1,300).
  const difference = incomeValue - companyProfitValue - totalExpenses;

  const onInvalid = () => {
    const message = "Revisa los campos marcados antes de guardar el registro.";
    setSubmitError(message);
    showErrorToast(message);
  };

  const onSubmit = async (data: FormData) => {
    setSubmitError("");
    setIsSaving(true);

    const payload = { ...data, carId };
    const result =
      mode === "create"
        ? await createAveoEntryResult(payload)
        : entryId
          ? await updateAveoEntryResult(entryId, payload)
          : { data: null, error: "No se encontró el registro a actualizar." };

    setIsSaving(false);

    if (!result.data) {
      const message =
        result.error ??
        "No se pudo guardar el registro. Revisa los datos e intenta de nuevo.";
      setSubmitError(message);
      showErrorToast(message);
      return;
    }

    router.refresh();
    router.push(
      `/dashboard/aveo/${carId}?success=${mode === "create" ? "created" : "updated"}`
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-6">
      <section className="rounded-2xl bg-white p-4 shadow sm:p-6">
        <h2 className="mb-6 text-lg font-semibold text-slate-900">
          {mode === "create" ? "Registrar movimiento" : "Editar movimiento"}
        </h2>

        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Fecha" error={errors.date?.message}>
            <input type="date" {...register("date")} className="input" />
          </Field>

          <Field label="Ingreso" error={errors.incomeAmount?.message}>
            <input
              type="text"
              inputMode="decimal"
              {...register("incomeAmount")}
              onInput={formatCurrencyInput}
              className="input"
              placeholder="1,350"
            />
          </Field>

          <Field label="Días de renta (opcional)" error={errors.days?.message}>
            <input
              type="number"
              min={1}
              step={1}
              {...register("days")}
              className="input"
              placeholder="Ej: 3"
            />
            <span className="mt-1 block text-xs text-slate-500">
              Solo si este ingreso corresponde a una renta.
            </span>
          </Field>

          <Field
            label="Ganancia de la rentadora (opcional)"
            error={errors.companyProfit?.message}
          >
            <input
              type="text"
              inputMode="decimal"
              {...register("companyProfit")}
              onInput={formatCurrencyInput}
              className="input"
              placeholder="Ej: 100"
            />
            <span className="mt-1 block text-xs text-slate-500">
              Cuánto de este ingreso le corresponde a la rentadora. Varía por
              renta, así que se captura a mano.
            </span>
          </Field>

          <div className="md:col-span-2">
            <Field label="Nota del ingreso (opcional)" error={errors.incomeNote?.message}>
              <input
                {...register("incomeNote")}
                className="input"
                placeholder="Ej: RENTA 3 DIAS"
              />
            </Field>
          </div>
        </div>
      </section>

      <section className="rounded-2xl bg-white p-4 shadow sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Gastos</h2>

          <button
            type="button"
            onClick={() => append({ amount: "", description: "" })}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            <Plus size={16} />
            Agregar gasto
          </button>
        </div>

        {fields.length === 0 ? (
          <p className="text-sm text-slate-500">
            No hay gastos registrados para este movimiento.
          </p>
        ) : (
          <div className="space-y-4">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="grid gap-3 rounded-xl border border-slate-200 p-3 sm:grid-cols-[160px_1fr_auto] sm:items-start"
              >
                <Field
                  label="Monto"
                  error={errors.expenses?.[index]?.amount?.message}
                >
                  <input
                    type="text"
                    inputMode="decimal"
                    {...register(`expenses.${index}.amount`)}
                    onInput={formatCurrencyInput}
                    className="input"
                    placeholder="150"
                  />
                </Field>

                <Field
                  label="Descripción"
                  error={errors.expenses?.[index]?.description?.message}
                >
                  <input
                    {...register(`expenses.${index}.description`)}
                    className="input"
                    placeholder="Ej: DiDi para ir a buscarlo"
                  />
                </Field>

                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="mt-6 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 sm:mt-6"
                  aria-label="Quitar gasto"
                  title="Quitar gasto"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-2xl bg-white p-4 shadow sm:p-6">
        <h2 className="mb-1 text-lg font-semibold text-slate-900">Resumen</h2>
        <p className="mb-4 text-xs text-slate-500">
          La ganancia de la rentadora sale del ingreso (no se suma aparte), así
          que la diferencia ya la descuenta, igual que los gastos.
        </p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryItem label="Ingreso" value={formatCurrency(incomeValue)} />
          <SummaryItem
            label="Ganancia de la rentadora"
            value={companyProfitInput ? formatCurrency(companyProfitValue) : "—"}
          />
          <SummaryItem label="Total de gastos" value={formatCurrency(totalExpenses)} />
          <SummaryItem
            label="Diferencia (neto Aveo)"
            value={formatCurrency(difference)}
            highlight={difference >= 0 ? "positive" : "negative"}
          />
        </div>
      </section>

      <section className="rounded-2xl bg-white p-4 shadow sm:p-6">
        <Field label="Notas (opcional)" error={errors.notes?.message}>
          <textarea
            {...register("notes")}
            className="input min-h-24 resize-none"
            placeholder="Comentarios adicionales sobre este movimiento"
          />
        </Field>
      </section>

      {submitError && <FormAlert message={submitError} />}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
        >
          Cancelar
        </button>

        <button
          type="submit"
          disabled={isSaving}
          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {isSaving
            ? "Guardando..."
            : mode === "create"
              ? "Guardar movimiento"
              : "Actualizar movimiento"}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">
        {label}
      </span>
      {children}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </label>
  );
}

function SummaryItem({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: "positive" | "negative";
}) {
  const valueClass =
    highlight === "positive"
      ? "text-emerald-700"
      : highlight === "negative"
        ? "text-rose-700"
        : "text-slate-900";

  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className={`mt-1 text-lg font-semibold ${valueClass}`}>{value}</p>
    </div>
  );
}

function formatDateInput(value?: string) {
  if (!value) {
    return "";
  }

  return value.slice(0, 10);
}
