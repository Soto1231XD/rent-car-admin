"use client";

import { FormEvent, ReactNode, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Car } from "@/types/car";
import { createQuoteResult } from "@/lib/api-client";
import FormAlert from "@/components/ui/FormAlert";
import { showErrorToast } from "@/lib/toast";

const optionalCurrencyNumber = z.preprocess((value) => {
  const normalizedValue = normalizeCurrencyValue(value);

  return normalizedValue === "" ? undefined : normalizedValue;
}, z.coerce.number().min(0).optional());

const schema = z
  .object({
    carId: z.string().min(1, "Selecciona un vehículo"),
    startDate: z.string().min(1, "La fecha de entrega es obligatoria"),
    endDate: z.string().min(1, "La fecha de devolución es obligatoria"),
    deliveryFee: optionalCurrencyNumber,
    returnFee: optionalCurrencyNumber,
    notes: z.string().optional(),
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: "La fecha de devolución no puede ser anterior a la entrega",
    path: ["endDate"],
  });

type FormData = z.output<typeof schema>;
type FormInput = z.input<typeof schema>;

type Props = {
  cars: Car[];
};

export default function QuoteForm({ cars }: Props) {
  const router = useRouter();
  const [submitError, setSubmitError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormInput, unknown, FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      carId: "",
      startDate: "",
      endDate: "",
      deliveryFee: undefined,
      returnFee: undefined,
      notes: "",
    },
  });

  const selectedCarId = useWatch({ control, name: "carId" });
  const startDate = useWatch({ control, name: "startDate" });
  const endDate = useWatch({ control, name: "endDate" });
  const deliveryFeeInput = useWatch({ control, name: "deliveryFee" });
  const returnFeeInput = useWatch({ control, name: "returnFee" });
  const deliveryFeeValue = toMoneyNumber(
    deliveryFeeInput as string | number | null | undefined
  );
  const returnFeeValue = toMoneyNumber(
    returnFeeInput as string | number | null | undefined
  );
  const selectedCar = useMemo(
    () => cars.find((car) => car.id === selectedCarId) ?? null,
    [cars, selectedCarId]
  );

  const quote = useMemo(() => {
    if (!selectedCar || !startDate || !endDate || endDate < startDate) {
      return null;
    }

    const days = getRentalDays(startDate, endDate);
    const isHighSeason = isHighSeasonRange(startDate, endDate);
    const dailyRate =
      isHighSeason && hasMoneyValue(selectedCar.highSeasonPrice)
        ? toMoneyNumber(selectedCar.highSeasonPrice)
        : toMoneyNumber(selectedCar.dailyPrice);
    const deposit = toMoneyNumber(selectedCar.deposit);

    return {
      days,
      dailyRate,
      total: days * dailyRate,
      deposit,
      isUsingFallbackRate:
        isHighSeason && !hasMoneyValue(selectedCar.highSeasonPrice),
    };
  }, [endDate, selectedCar, startDate]);

  const onInvalid = () => {
    const message = "Revisa los campos marcados antes de generar la cotización.";
    setSubmitError(message);
    showErrorToast(message);
  };

  const onSubmit = async (data: FormData) => {
    setSubmitError("");
    setIsSaving(true);

    const result = await createQuoteResult(data);

    setIsSaving(false);

    if (!result.data) {
      const message =
        result.error ??
        "No se pudo generar la cotización. Revisa los datos e intenta de nuevo.";
      setSubmitError(message);
      showErrorToast(message);
      return;
    }

    router.refresh();
    router.push(`/dashboard/quotes/${result.data.id}?success=created`);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-6">
      <section className="rounded-2xl bg-white p-4 shadow sm:p-6">
        <div className="mb-6 space-y-2">
          <h2 className="text-lg font-semibold text-slate-900">
            Datos de la cotización
          </h2>
          <p className="text-sm text-slate-500">
            Esta cotización es para un posible cliente. No crea ningún cliente
            ni renta en el sistema.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Vehículo" error={errors.carId?.message}>
            <select {...register("carId")} className="input">
              <option value="">Selecciona un vehículo</option>
              {cars.map((car) => (
                <option key={car.id} value={car.id}>
                  {car.brand} {car.model} {car.year}
                </option>
              ))}
            </select>
          </Field>

          <div />

          <Field label="Fecha de entrega" error={errors.startDate?.message}>
            <input type="date" {...register("startDate")} className="input" />
          </Field>

          <Field label="Fecha de devolución" error={errors.endDate?.message}>
            <input type="date" {...register("endDate")} className="input" />
          </Field>

          <Field label="Cuota de entrega" error={errors.deliveryFee?.message}>
            <input
              type="text"
              inputMode="numeric"
              {...register("deliveryFee")}
              onInput={formatCurrencyInput}
              className="input"
              placeholder="0"
            />
          </Field>

          <Field label="Cuota de devolución" error={errors.returnFee?.message}>
            <input
              type="text"
              inputMode="numeric"
              {...register("returnFee")}
              onInput={formatCurrencyInput}
              className="input"
              placeholder="0"
            />
          </Field>
        </div>
      </section>

      <section className="rounded-2xl bg-white p-4 shadow sm:p-6">
        <h2 className="mb-5 text-lg font-semibold text-slate-900">
          Cálculo de la cotización
        </h2>

        <div className="grid gap-4 md:grid-cols-3">
          <SummaryItem label="Días" value={quote ? quote.days : "-"} />
          <SummaryItem
            label="Precio por día"
            value={quote ? formatMoney(quote.dailyRate) : "-"}
          />
          <SummaryItem
            label="Total renta"
            value={quote ? formatMoney(quote.total) : "-"}
          />
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-4">
          <SummaryItem
            label="Depósito sugerido"
            value={quote?.deposit ? formatMoney(quote.deposit) : "No definido"}
          />
          <SummaryItem
            label="Cuota de entrega"
            value={deliveryFeeValue > 0 ? formatMoney(deliveryFeeValue) : "-"}
          />
          <SummaryItem
            label="Cuota de devolución"
            value={returnFeeValue > 0 ? formatMoney(returnFeeValue) : "-"}
          />
          <SummaryItem
            label="Total a cubrir"
            value={
              quote
                ? formatMoney(
                    quote.total + quote.deposit + deliveryFeeValue + returnFeeValue
                  )
                : "-"
            }
            strong
          />
        </div>

        {quote?.isUsingFallbackRate && (
          <p className="mt-3 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800 ring-1 ring-amber-200">
            Este carro no tiene precio de temporada alta configurado. Se usó el
            precio normal.
          </p>
        )}
      </section>

      <section className="rounded-2xl bg-white p-4 shadow sm:p-6">
        <Field label="Notas internas" error={errors.notes?.message}>
          <textarea
            {...register("notes")}
            className="input min-h-24 resize-none"
            placeholder="Ej: prospecto contactado por WhatsApp, pregunta por el Aveo..."
          />
        </Field>
      </section>

      {submitError && <FormAlert message={submitError} />}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-xl border border-slate-300 px-5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
        >
          Cancelar
        </button>

        <button
          type="submit"
          disabled={isSaving}
          className="rounded-xl bg-slate-900 px-5 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {isSaving ? "Generando..." : "Generar cotización"}
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
  strong,
}: {
  label: string;
  value: string | number;
  strong?: boolean;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p
        className={`mt-1 text-sm ${
          strong ? "font-bold text-slate-950" : "font-semibold text-slate-800"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function getRentalDays(startDate: string, endDate: string) {
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);
  const millisecondsPerDay = 1000 * 60 * 60 * 24;
  const difference = Math.round(
    (end.getTime() - start.getTime()) / millisecondsPerDay
  );

  return Math.max(1, difference);
}

function isHighSeasonRange(startDate: string, endDate: string) {
  const days = getRentalDays(startDate, endDate);
  const start = new Date(`${startDate}T00:00:00`);

  return Array.from({ length: days }).some((_, index) => {
    const currentDate = new Date(start);
    currentDate.setDate(start.getDate() + index);

    return isHighSeasonDate(currentDate);
  });
}

function isHighSeasonDate(date: Date) {
  const monthDay = (date.getMonth() + 1) * 100 + date.getDate();

  return (
    (monthDay >= 701 && monthDay <= 831) ||
    monthDay >= 1201 ||
    monthDay <= 115 ||
    (monthDay >= 320 && monthDay <= 415)
  );
}

function formatMoney(value: number) {
  return `$${value.toLocaleString("es-MX")} MXN`;
}

function hasMoneyValue(value?: number | string | null) {
  return toMoneyNumber(value) > 0;
}

function toMoneyNumber(value?: number | string | null) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value === "string") {
    const normalizedValue = value.replace(/,/g, "").trim();
    const parsedValue = Number(normalizedValue);

    return Number.isFinite(parsedValue) ? parsedValue : 0;
  }

  return 0;
}

function normalizeCurrencyValue(value: unknown) {
  return typeof value === "string" ? value.replace(/,/g, "") : value;
}

function formatCurrencyInput(event: FormEvent<HTMLInputElement>) {
  event.currentTarget.value = formatCurrencyInputValue(event.currentTarget.value);
}

function formatCurrencyInputValue(value?: string | number | null) {
  if (value === undefined || value === null || value === "") {
    return "";
  }

  const digits = String(value).replace(/\D/g, "");

  return digits ? Number(digits).toLocaleString("es-MX") : "";
}