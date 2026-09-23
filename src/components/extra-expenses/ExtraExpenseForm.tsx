"use client";

import { FormEvent, ReactNode, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Car } from "@/types/car";
import { ExtraExpense } from "@/types/extra-expense";
import { formatCarLabel } from "@/lib/car-label";
import {
  createExtraExpenseResult,
  updateExtraExpenseResult,
} from "@/lib/api-client";
import FormAlert from "@/components/ui/FormAlert";
import { showErrorToast } from "@/lib/toast";
import {
  formatCurrencyInput,
  formatCurrencyInputValue,
  normalizeCurrencyValue,
} from "@/lib/format-currency";

const schema = z.object({
  carId: z.string().optional(),
  concept: z.string().min(1, "El concepto es obligatorio"),
  cost: z.preprocess(
    normalizeCurrencyValue,
    z.coerce.number().min(0, "El costo no puede ser negativo")
  ),
  date: z.string().min(1, "La fecha es obligatoria"),
  status: z.enum(["PENDIENTE", "PAGADO", "CANCELADO"]),
  paidBy: z.enum(["CLIENTE", "EMPRESA"]),
  notes: z.string().optional(),
});

type FormData = z.output<typeof schema>;
type FormInput = z.input<typeof schema>;

type Props = {
  mode: "create" | "edit";
  cars: Car[];
  initialData?: Partial<ExtraExpense>;
  extraExpenseId?: string;
};

export default function ExtraExpenseForm({
  mode,
  cars,
  initialData,
  extraExpenseId,
}: Props) {
  const router = useRouter();
  const [submitError, setSubmitError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormInput, unknown, FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      carId: initialData?.carId ?? "",
      concept: initialData?.concept ?? "",
      cost: formatCurrencyInputValue(initialData?.cost),
      date: formatDateInput(initialData?.date),
      status: initialData?.status ?? "PENDIENTE",
      paidBy: initialData?.paidBy ?? "EMPRESA",
      notes: initialData?.notes ?? "",
    },
  });

  const onInvalid = () => {
    const message = "Revisa los campos marcados antes de guardar el gasto extra.";
    setSubmitError(message);
    showErrorToast(message);
  };

  const onSubmit = async (data: FormData) => {
    setSubmitError("");
    setIsSaving(true);

    const payload = {
      ...data,
      // Explicit null (not omitted) so switching an expense back to "sin
      // vehículo" on edit actually clears it — an omitted key in a PATCH
      // leaves the existing DB value untouched.
      carId: data.carId || null,
    };

    const result =
      mode === "create"
        ? await createExtraExpenseResult(payload)
        : extraExpenseId
          ? await updateExtraExpenseResult(extraExpenseId, payload)
          : { data: null, error: "No se encontro el gasto extra a actualizar." };

    setIsSaving(false);

    if (!result.data) {
      const message =
        result.error ??
        "No se pudo guardar el gasto extra. Revisa los datos e intenta de nuevo.";
      setSubmitError(message);
      showErrorToast(message);
      return;
    }

    router.refresh();
    router.push(
      `/dashboard/extra-expenses?success=${
        mode === "create" ? "created" : "updated"
      }`
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-6">
      <section className="rounded-2xl bg-white p-4 shadow sm:p-6">
        <h2 className="mb-6 text-lg font-semibold text-slate-900">
          {mode === "create" ? "Registrar gasto extra" : "Editar gasto extra"}
        </h2>

        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Vehículo (opcional)" error={errors.carId?.message}>
            <select {...register("carId")} className="input">
              <option value="">Sin vehículo asociado</option>
              {cars.map((car) => (
                <option key={car.id} value={car.id}>
                  {formatCarLabel(car)}
                  {car.plate ? ` - ${car.plate}` : ""}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Concepto" error={errors.concept?.message}>
            <input
              {...register("concept")}
              className="input"
              placeholder="Llanta ponchada"
            />
          </Field>

          <Field label="Costo" error={errors.cost?.message}>
            <input
              type="text"
              inputMode="decimal"
              {...register("cost")}
              onInput={formatCurrencyInput}
              className="input"
              placeholder="650"
            />
          </Field>

          <Field label="Fecha" error={errors.date?.message}>
            <input type="date" {...register("date")} className="input" />
          </Field>

          <Field label="Estado" error={errors.status?.message}>
            <select {...register("status")} className="input">
              <option value="PENDIENTE">Pendiente</option>
              <option value="PAGADO">Pagado</option>
              <option value="CANCELADO">Cancelado</option>
            </select>
          </Field>

          <Field
            label="¿El gasto lo cubre el cliente o la empresa?"
            error={errors.paidBy?.message}
          >
            <select {...register("paidBy")} className="input">
              <option value="EMPRESA">Empresa</option>
              <option value="CLIENTE">Cliente</option>
            </select>
            <p className="mt-1 text-xs text-slate-500">
              Si lo cubre el cliente, este gasto no se suma en Dashboard,
              Historial mensual, Control mensual ni Carros aparte.
            </p>
          </Field>

          <div className="md:col-span-2">
            <Field label="Comentarios / Observaciones" error={errors.notes?.message}>
              <textarea
                {...register("notes")}
                className="input min-h-24 resize-none"
                placeholder="Ej: Se compro una llanta nueva, servicio de grua, lavado especial..."
              />
            </Field>
          </div>
        </div>
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
              ? "Guardar gasto extra"
              : "Actualizar gasto extra"}
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

function formatDateInput(value?: string) {
  if (!value) {
    return "";
  }

  return value.slice(0, 10);
}

