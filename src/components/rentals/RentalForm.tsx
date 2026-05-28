"use client";

import { ReactNode, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Car } from "@/types/car";
import { Client } from "@/types/client";
import { Rental } from "@/types/rental";
import { createRentalResult, updateRentalResult } from "@/lib/api-client";
import FormAlert from "@/components/ui/FormAlert";
import { showErrorToast } from "@/lib/toast";

type PriceMode = "daily" | "highSeason";

const schema = z
  .object({
    clientId: z.string().min(1, "Selecciona un cliente"),
    carId: z.string().min(1, "Selecciona un vehículo"),
    startDate: z.string().min(1, "La fecha de entrega es obligatoria"),
    endDate: z.string().min(1, "La fecha de devolución es obligatoria"),
    totalPrice: z.coerce.number().min(1, "El total es obligatorio"),
    status: z.enum(["RESERVACION", "ACTIVO", "COMPLETADO", "CANCELADO"]),
    notes: z.string().optional(),
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: "La fecha de devolución no puede ser anterior a la entrega",
    path: ["endDate"],
  });

type FormData = z.output<typeof schema>;
type FormInput = z.input<typeof schema>;

type Props = {
  mode: "create" | "edit";
  cars: Car[];
  clients: Client[];
  initialData?: Partial<Rental>;
  rentalId?: string;
};

export default function RentalForm({
  mode,
  cars,
  clients,
  initialData,
  rentalId,
}: Props) {
  const router = useRouter();
  const [submitError, setSubmitError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [priceMode, setPriceMode] = useState<PriceMode>(() =>
    inferInitialPriceMode(cars, initialData)
  );

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<FormInput, unknown, FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      clientId: initialData?.clientId ?? "",
      carId: initialData?.carId ?? "",
      startDate: formatDateInput(initialData?.startDate),
      endDate: formatDateInput(initialData?.endDate),
      totalPrice: initialData?.totalPrice ?? undefined,
      status: initialData?.status ?? "RESERVACION",
      notes: initialData?.notes ?? "",
    },
  });

  const selectedCarId = useWatch({ control, name: "carId" });
  const startDate = useWatch({ control, name: "startDate" });
  const endDate = useWatch({ control, name: "endDate" });
  const selectedCar = useMemo(
    () => cars.find((car) => car.id === selectedCarId) ?? null,
    [cars, selectedCarId]
  );

  const quote = useMemo(() => {
    if (!selectedCar || !startDate || !endDate || endDate < startDate) {
      return null;
    }

    const days = getRentalDays(startDate, endDate);
    const dailyRate =
      priceMode === "highSeason"
        ? selectedCar.highSeasonPrice ?? selectedCar.dailyPrice
        : selectedCar.dailyPrice;

    return {
      days,
      dailyRate,
      total: days * dailyRate,
      deposit: selectedCar.deposit ?? 0,
      isUsingFallbackRate:
        priceMode === "highSeason" && !selectedCar.highSeasonPrice,
    };
  }, [endDate, priceMode, selectedCar, startDate]);

  useEffect(() => {
    if (!startDate || !endDate || endDate < startDate) {
      return;
    }

    setPriceMode(isHighSeasonRange(startDate, endDate) ? "highSeason" : "daily");
  }, [endDate, startDate]);

  useEffect(() => {
    if (quote) {
      setValue("totalPrice", quote.total, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  }, [quote, setValue]);

  const onInvalid = () => {
    const message = "Revisa los campos marcados antes de guardar la renta.";
    setSubmitError(message);
    showErrorToast(message);
  };

  const onSubmit = async (data: FormData) => {
    setSubmitError("");
    setIsSaving(true);

    const payload = {
      ...data,
      priceMode: priceMode === "highSeason" ? "TEMPORADA_ALTA" : "NORMAL",
      totalPrice: quote?.total ?? data.totalPrice,
    };

    const result =
      mode === "create"
        ? await createRentalResult(payload)
        : rentalId
          ? await updateRentalResult(rentalId, payload)
          : { data: null, error: "No se encontró la renta a actualizar." };

    setIsSaving(false);

    if (!result.data) {
      const message =
        result.error ??
        "No se pudo guardar la renta. Revisa los datos e intenta de nuevo.";
      setSubmitError(message);
      showErrorToast(message);
      return;
    }

    router.refresh();
    router.push(
      `/dashboard/rentals/${result.data.id}?success=${
        mode === "create" ? "created" : "updated"
      }`
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-6">
      <section className="rounded-2xl bg-white p-4 shadow sm:p-6">
        <h2 className="mb-6 text-lg font-semibold text-slate-900">
          Información de la renta
        </h2>

        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Cliente" error={errors.clientId?.message}>
            <select {...register("clientId")} className="input">
              <option value="">Selecciona un cliente</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.fullName}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Vehículo" error={errors.carId?.message}>
            <select {...register("carId")} className="input">
              <option value="">Selecciona un vehículo</option>
              {cars.map((car) => (
                <option key={car.id} value={car.id}>
                  {car.brand} {car.model} {car.year} - {car.plate}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Fecha de entrega" error={errors.startDate?.message}>
            <input type="date" {...register("startDate")} className="input" />
          </Field>

          <Field label="Fecha de devolución" error={errors.endDate?.message}>
            <input type="date" {...register("endDate")} className="input" />
          </Field>

          <Field label="Tipo de tarifa">
            <select
              value={priceMode}
              disabled
              className="input"
            >
              <option value="daily">Precio normal</option>
              <option value="highSeason">Temporada alta</option>
            </select>
            <p className="mt-1 text-xs text-slate-500">
              Se calcula automÃ¡ticamente segÃºn las fechas seleccionadas.
            </p>
          </Field>

          <Field label="Estado de la renta" error={errors.status?.message}>
            <select {...register("status")} className="input">
              <option value="RESERVACION">Reservación</option>
              <option value="ACTIVO">Activa</option>
              <option value="COMPLETADO">Completada</option>
              <option value="CANCELADO">Cancelada</option>
            </select>
          </Field>
        </div>
      </section>

      <section className="rounded-2xl bg-white p-4 shadow sm:p-6">
        <h2 className="mb-5 text-lg font-semibold text-slate-900">
          Cálculo de renta
        </h2>

        <div className="grid gap-4 md:grid-cols-4">
          <SummaryItem label="Días" value={quote ? quote.days : "-"} />
          <SummaryItem
            label="Precio por día"
            value={quote ? formatMoney(quote.dailyRate) : "-"}
          />
          <SummaryItem
            label="Depósito sugerido"
            value={quote?.deposit ? formatMoney(quote.deposit) : "No definido"}
          />
          <SummaryItem
            label="Total"
            value={quote ? formatMoney(quote.total) : "-"}
            strong
          />
        </div>

        {quote?.isUsingFallbackRate && (
          <p className="mt-3 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800 ring-1 ring-amber-200">
            Este carro no tiene precio de temporada alta configurado. Se usó el
            precio normal.
          </p>
        )}

        <input type="hidden" {...register("totalPrice")} />
        {errors.totalPrice?.message && (
          <p className="mt-3 text-sm text-red-600">
            {errors.totalPrice.message}
          </p>
        )}
      </section>

      <section className="rounded-2xl bg-white p-4 shadow sm:p-6">
        <Field label="Notas" error={errors.notes?.message}>
          <textarea
            {...register("notes")}
            className="input min-h-28 resize-none"
            placeholder="Observaciones de la renta..."
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
          {isSaving
            ? "Guardando..."
            : mode === "create"
              ? "Guardar renta"
              : "Actualizar renta"}
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

function formatDateInput(value?: string) {
  if (!value) {
    return "";
  }

  return value.slice(0, 10);
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

function inferInitialPriceMode(
  cars: Car[],
  initialData?: Partial<Rental>
): PriceMode {
  if (initialData?.priceMode === "TEMPORADA_ALTA") {
    return "highSeason";
  }

  if (initialData?.priceMode === "NORMAL") {
    return "daily";
  }

  if (
    !initialData?.carId ||
    !initialData.startDate ||
    !initialData.endDate ||
    !initialData.totalPrice
  ) {
    return "daily";
  }

  const car = cars.find((currentCar) => currentCar.id === initialData.carId);

  if (!car?.highSeasonPrice) {
    return "daily";
  }

  const days = getRentalDays(
    formatDateInput(initialData.startDate),
    formatDateInput(initialData.endDate)
  );

  return days * car.highSeasonPrice === initialData.totalPrice
    ? "highSeason"
    : "daily";
}
