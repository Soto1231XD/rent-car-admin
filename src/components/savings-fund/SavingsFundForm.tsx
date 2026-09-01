"use client";

import { ReactNode, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Car } from "@/types/car";
import { Client } from "@/types/client";
import { SavingsFundEntry } from "@/types/savings-fund";
import { formatCarLabel } from "@/lib/car-label";
import {
  createSavingsFundEntryResult,
  updateSavingsFundEntryResult,
} from "@/lib/api-client";
import FormAlert from "@/components/ui/FormAlert";
import { showErrorToast } from "@/lib/toast";
import {
  formatCurrency,
  formatCurrencyInput,
  formatCurrencyInputValue,
  normalizeCurrencyValue,
  toMoneyNumber,
} from "@/lib/format-currency";

const optionalCurrencyNumber = z.preprocess((value) => {
  const normalizedValue = normalizeCurrencyValue(value);

  return normalizedValue === "" ? undefined : normalizedValue;
}, z.coerce.number().min(0).optional());

const schema = z.object({
  date: z.string().min(1, "La fecha es obligatoria"),
  clientName: z.string().min(1, "El nombre del cliente es obligatorio"),
  incomeAmount: optionalCurrencyNumber,
  expenseAmount: optionalCurrencyNumber,
  carId: z.string().optional(),
  notes: z.string().optional(),
});

type FormData = z.output<typeof schema>;
type FormInput = z.input<typeof schema>;

const CUSTOM_CLIENT_VALUE = "__custom__";

type Props = {
  mode: "create" | "edit";
  cars: Car[];
  clients: Client[];
  initialData?: Partial<SavingsFundEntry>;
  entryId?: string;
};

export default function SavingsFundForm({
  mode,
  cars,
  clients,
  initialData,
  entryId,
}: Props) {
  const router = useRouter();
  const [submitError, setSubmitError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  // Si el nombre ya guardado no corresponde a ningún cliente registrado
  // (dato viejo, o un nombre que nunca se registró), se muestra de entrada
  // como texto libre en vez de dejarlo en blanco dentro del selector.
  const [isCustomClient, setIsCustomClient] = useState(
    () =>
      Boolean(initialData?.clientName) &&
      !clients.some((client) => client.fullName === initialData?.clientName)
  );

  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormInput, unknown, FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      date: formatDateInput(initialData?.date),
      clientName: initialData?.clientName ?? "",
      incomeAmount: formatCurrencyInputValue(initialData?.incomeAmount),
      expenseAmount: formatCurrencyInputValue(initialData?.expenseAmount),
      carId: initialData?.carId ?? "",
      notes: initialData?.notes ?? "",
    },
  });

  const clientNameField = register("clientName");

  const incomeAmountInput = useWatch({ control, name: "incomeAmount" });
  const expenseAmountInput = useWatch({ control, name: "expenseAmount" });
  const incomeValue = toMoneyNumber(
    incomeAmountInput as string | number | null | undefined
  );
  const expenseValue = toMoneyNumber(
    expenseAmountInput as string | number | null | undefined
  );
  const difference = incomeValue - expenseValue;

  const onInvalid = () => {
    const message = "Revisa los campos marcados antes de guardar el registro.";
    setSubmitError(message);
    showErrorToast(message);
  };

  const onSubmit = async (data: FormData) => {
    setSubmitError("");
    setIsSaving(true);

    const payload = {
      ...data,
      incomeAmount: data.incomeAmount ?? 0,
      expenseAmount: data.expenseAmount ?? 0,
      // Explicit null (not omitted) so switching back to "sin vehículo" on
      // edit actually clears it — an omitted key in a PATCH leaves the
      // existing DB value untouched.
      carId: data.carId || null,
    };

    const result =
      mode === "create"
        ? await createSavingsFundEntryResult(payload)
        : entryId
          ? await updateSavingsFundEntryResult(entryId, payload)
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
      `/dashboard/savings-fund?success=${mode === "create" ? "created" : "updated"}`
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

          <Field label="Nombre cliente" error={errors.clientName?.message}>
            {isCustomClient ? (
              <div className="flex gap-2">
                <input
                  {...clientNameField}
                  className="input"
                  placeholder="Ej: Carlos Ramírez"
                  autoFocus
                />
                {clients.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setValue("clientName", "");
                      setIsCustomClient(false);
                    }}
                    className="shrink-0 rounded-lg border border-slate-300 px-3 text-xs font-medium text-slate-700 hover:bg-slate-100"
                  >
                    Elegir de la lista
                  </button>
                )}
              </div>
            ) : (
              <select
                name={clientNameField.name}
                ref={clientNameField.ref}
                onBlur={clientNameField.onBlur}
                onChange={(event) => {
                  if (event.target.value === CUSTOM_CLIENT_VALUE) {
                    setValue("clientName", "");
                    setIsCustomClient(true);
                    return;
                  }
                  clientNameField.onChange(event);
                }}
                className="input"
              >
                <option value="">Selecciona un cliente</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.fullName}>
                    {client.fullName}
                  </option>
                ))}
                <option value={CUSTOM_CLIENT_VALUE}>Otro (escribir nombre)</option>
              </select>
            )}
          </Field>

          <Field label="Daño del carro (ingreso)" error={errors.incomeAmount?.message}>
            <input
              type="text"
              inputMode="decimal"
              {...register("incomeAmount")}
              onInput={formatCurrencyInput}
              className="input"
              placeholder="500"
            />
            <span className="mt-1 block text-xs text-slate-500">
              Lo que se le cobró al cliente por el daño causado al vehículo.
            </span>
          </Field>

          <Field label="Costo de reparación (egreso)" error={errors.expenseAmount?.message}>
            <input
              type="text"
              inputMode="decimal"
              {...register("expenseAmount")}
              onInput={formatCurrencyInput}
              className="input"
              placeholder="100"
            />
            <span className="mt-1 block text-xs text-slate-500">
              Lo que realmente costó reparar el daño.
            </span>
          </Field>

          <Field label="Auto (opcional)" error={errors.carId?.message}>
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
        </div>
      </section>

      <section className="rounded-2xl bg-white p-4 shadow sm:p-6">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Resumen</h2>

        <div className="grid gap-4 sm:grid-cols-3">
          <SummaryItem label="Daño del carro" value={formatCurrency(incomeValue)} />
          <SummaryItem label="Costo de reparación" value={formatCurrency(expenseValue)} />
          <SummaryItem
            label="Ahorro"
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
