"use client";

import { FormEvent, ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Car } from "@/types/car";
import { formatCarLabel } from "@/lib/car-label";
import { Client } from "@/types/client";
import { Rental } from "@/types/rental";
import { createRentalResult, updateRentalResult } from "@/lib/api-client";
import FormAlert from "@/components/ui/FormAlert";
import { showErrorToast } from "@/lib/toast";
import DeliveryPointFields from "@/components/rentals/DeliveryPointFields";
import { getDeliveryFee } from "@/lib/delivery-locations";
import {
  formatCurrency,
  formatCurrencyInput,
  formatCurrencyInputValue,
  normalizeCurrencyValue,
  toMoneyNumber,
} from "@/lib/format-currency";
import { formatIntegerInput, formatIntegerInputValue } from "@/lib/format-number";

type PriceMode = "daily" | "highSeason";

const MINIMUM_RENTAL_DAYS = 2;

const optionalCurrencyNumber = z.preprocess((value) => {
  const normalizedValue = normalizeCurrencyValue(value);

  return normalizedValue === "" ? undefined : normalizedValue;
}, z.coerce.number().min(0).optional());

const schema = z
  .object({
    clientId: z.string().min(1, "Selecciona un cliente"),
    carId: z.string().min(1, "Selecciona un vehículo"),
    startDate: z.string().min(1, "La fecha de entrega es obligatoria"),
    endDate: z.string().optional(),
    rentalType: z.enum(["NORMAL", "INDEFINIDA"]),
    dailyRateApplied: optionalCurrencyNumber,
    advancePayment: optionalCurrencyNumber,
    renterType: z.enum(["CLIENTE", "COMISIONISTA"]),
    status: z.enum(["RESERVACION", "ACTIVO", "COMPLETADO", "CANCELADO"]),
    notes: z.string().optional(),
    returnMileage: optionalCurrencyNumber,
  })
  .superRefine((data, ctx) => {
    if (data.rentalType === "NORMAL") {
      if (!data.endDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "La fecha de devolución es obligatoria",
          path: ["endDate"],
        });
      } else if (data.endDate < data.startDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "La fecha de devolución no puede ser anterior a la entrega",
          path: ["endDate"],
        });
      } else if (
        data.renterType !== "COMISIONISTA" &&
        getRentalDays(data.startDate, data.endDate) < MINIMUM_RENTAL_DAYS
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `La renta mínima es de ${MINIMUM_RENTAL_DAYS} días`,
          path: ["endDate"],
        });
      }

      if (data.dailyRateApplied === undefined || data.dailyRateApplied <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "El precio por día es obligatorio",
          path: ["dailyRateApplied"],
        });
      }
    } else {
      if (data.dailyRateApplied === undefined || data.dailyRateApplied <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Ingresa la tarifa diaria para la renta indefinida",
          path: ["dailyRateApplied"],
        });
      }

      if (data.status === "COMPLETADO") {
        if (!data.endDate) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Ingresa la fecha real de devolución para completar la renta",
            path: ["endDate"],
          });
        } else if (data.endDate < data.startDate) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "La fecha de devolución no puede ser anterior a la entrega",
            path: ["endDate"],
          });
        } else if (
          data.renterType !== "COMISIONISTA" &&
          getRentalDays(data.startDate, data.endDate) < MINIMUM_RENTAL_DAYS
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `La renta mínima es de ${MINIMUM_RENTAL_DAYS} días`,
            path: ["endDate"],
          });
        }
      }
    }
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
  const [deliveryLocationId, setDeliveryLocationId] = useState(
    initialData?.deliveryLocationId ?? ""
  );
  const [deliveryPlazaId, setDeliveryPlazaId] = useState(
    initialData?.deliveryPlazaId ?? ""
  );
  const [deliveryAddress, setDeliveryAddress] = useState(
    initialData?.deliveryAddress ?? ""
  );
  const [returnLocationId, setReturnLocationId] = useState(
    initialData?.returnLocationId ?? ""
  );
  const [returnPlazaId, setReturnPlazaId] = useState(
    initialData?.returnPlazaId ?? ""
  );
  const [returnAddress, setReturnAddress] = useState(
    initialData?.returnAddress ?? ""
  );
  const deliveryFeePreview =
    getDeliveryFee(deliveryLocationId, deliveryPlazaId) +
    getDeliveryFee(returnLocationId, returnPlazaId);
  const initialPriceMode = useMemo(
    () => inferInitialPriceMode(cars, initialData),
    [cars, initialData]
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
      endDate: formatDateInput(initialData?.endDate ?? undefined),
      rentalType: initialData?.rentalType ?? "NORMAL",
      dailyRateApplied: formatCurrencyInputValue(
        initialData?.dailyRateApplied ?? undefined
      ),
      advancePayment: formatCurrencyInputValue(initialData?.advancePayment ?? 0),
      renterType: initialData?.renterType ?? "CLIENTE",
      status: initialData?.status ?? "RESERVACION",
      notes: initialData?.notes ?? "",
      returnMileage: "",
    },
  });

  const selectedCarId = useWatch({ control, name: "carId" });
  const startDate = useWatch({ control, name: "startDate" });
  const endDate = useWatch({ control, name: "endDate" });
  const rentalType = useWatch({ control, name: "rentalType" });
  const status = useWatch({ control, name: "status" });
  const renterType = useWatch({ control, name: "renterType" });
  const advancePaymentInput = useWatch({ control, name: "advancePayment" });
  const advancePaymentValue = toMoneyNumber(
    advancePaymentInput as string | number | null | undefined
  );
  const dailyRateInput = useWatch({ control, name: "dailyRateApplied" });
  const isIndefinida = rentalType === "INDEFINIDA";
  const isCompletingIndefinida = isIndefinida && status === "COMPLETADO";
  const isCompleting = status === "COMPLETADO";
  const selectedCar = useMemo(
    () => cars.find((car) => car.id === selectedCarId) ?? null,
    [cars, selectedCarId]
  );
  const priceMode = useMemo(() => {
    if (isIndefinida || !startDate || !endDate || endDate < startDate) {
      return initialPriceMode;
    }

    return isHighSeasonRange(startDate, endDate) ? "highSeason" : "daily";
  }, [endDate, initialPriceMode, isIndefinida, startDate]);

  const quote = useMemo(() => {
    if (isIndefinida || !selectedCar || !startDate || !endDate || endDate < startDate) {
      return null;
    }

    const days = getRentalDays(startDate, endDate);
    const dailyRate = getDailyRate(selectedCar, priceMode, renterType);
    const deposit = toMoneyNumber(selectedCar.deposit);

    return {
      days,
      dailyRate,
      total: days * dailyRate,
      deposit,
      isUsingFallbackRate:
        priceMode === "highSeason" &&
        renterType === "CLIENTE" &&
        !hasMoneyValue(selectedCar.highSeasonPrice),
      isUsingCommissionFallback:
        renterType === "COMISIONISTA" &&
        !hasMoneyValue(selectedCar.commissionDailyPrice) &&
        !hasMoneyValue(selectedCar.commissionHighSeasonPrice),
    };
  }, [endDate, isIndefinida, priceMode, renterType, selectedCar, startDate]);

  const completionQuote = useMemo(() => {
    if (
      !isCompletingIndefinida ||
      !startDate ||
      !endDate ||
      endDate < startDate
    ) {
      return null;
    }

    const days = getRentalDays(startDate, endDate);
    const dailyRate = toMoneyNumber(
      dailyRateInput as string | number | null | undefined
    );

    return { days, dailyRate, total: days * dailyRate };
  }, [dailyRateInput, endDate, isCompletingIndefinida, startDate]);

  const dailyRateValue = toMoneyNumber(
    dailyRateInput as string | number | null | undefined
  );
  const effectiveDailyRate = dailyRateValue;
  const effectiveTotal = isCompletingIndefinida
    ? (completionQuote?.total ?? effectiveDailyRate)
    : isIndefinida
      ? effectiveDailyRate
      : (quote ? quote.days * dailyRateValue : 0);

  // Pre-fill the daily rate with the car/date-suggested value whenever the
  // underlying selection actually changes, but skip the very first run so we
  // don't clobber a rate already loaded from initialData (edit mode) or a
  // value the user is actively typing.
  const hasSyncedInitialRate = useRef(false);
  useEffect(() => {
    if (!hasSyncedInitialRate.current) {
      hasSyncedInitialRate.current = true;
      return;
    }

    if (!isIndefinida && quote) {
      setValue("dailyRateApplied", formatCurrencyInputValue(quote.dailyRate), {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  }, [isIndefinida, quote, setValue]);

  const onInvalid = () => {
    const message = "Revisa los campos marcados antes de guardar la renta.";
    setSubmitError(message);
    showErrorToast(message);
  };

  const onSubmit = async (data: FormData) => {
    setSubmitError("");
    setIsSaving(true);

    const rateForSubmit = data.dailyRateApplied ?? 0;

    const payload = {
      ...data,
      renterType,
      rentalType,
      priceMode: isIndefinida
        ? "NORMAL"
        : priceMode === "highSeason"
          ? "TEMPORADA_ALTA"
          : "NORMAL",
      endDate:
        isIndefinida && !isCompletingIndefinida ? undefined : data.endDate,
      totalPrice: isCompletingIndefinida
        ? (completionQuote?.total ?? rateForSubmit)
        : isIndefinida
          ? rateForSubmit
          : (quote ? quote.days * rateForSubmit : 0),
      dailyRateApplied: rateForSubmit,
      advancePayment: data.advancePayment ?? 0,
      returnMileage: isCompleting ? data.returnMileage : undefined,
      deliveryLocationId,
      deliveryPlazaId,
      deliveryAddress,
      returnLocationId,
      returnPlazaId,
      returnAddress,
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

    if (result.data.mileageControlMissing) {
      const carLabel = result.data.car
        ? formatCarLabel(result.data.car)
        : "Este carro";
      showErrorToast(
        `${carLabel} no tiene Control de kilometraje. Agrégalo en el módulo de Control de kilometraje.`
      );
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
                  {formatCarLabel(car)}
                  {car.plate ? ` - ${car.plate}` : ""}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Tipo de cliente" error={errors.renterType?.message}>
            <select {...register("renterType")} className="input">
              <option value="CLIENTE">Cliente normal</option>
              <option value="COMISIONISTA">Comisionista</option>
            </select>
            <p className="mt-1 text-xs text-slate-500">
              Comisionista usa la tarifa especial configurada en el carro.
            </p>
          </Field>

          <Field label="Tipo de renta" error={errors.rentalType?.message}>
            <select {...register("rentalType")} className="input">
              <option value="NORMAL">Renta normal</option>
              <option value="INDEFINIDA">Renta indefinida</option>
            </select>
            <p className="mt-1 text-xs text-slate-500">
              La renta indefinida no tiene fecha de devolución fija y permite
              definir el precio manualmente.
            </p>
          </Field>

          <Field label="Fecha de entrega" error={errors.startDate?.message}>
            <input type="date" {...register("startDate")} className="input" />
          </Field>

          {isIndefinida && !isCompletingIndefinida ? (
            <Field label="Fecha de devolución">
              <input
                type="text"
                value="Sin fecha definida (indefinida)"
                disabled
                className="input text-slate-400"
              />
            </Field>
          ) : (
            <Field label="Fecha de devolución" error={errors.endDate?.message}>
              <input type="date" {...register("endDate")} className="input" />
              {isCompletingIndefinida && (
                <p className="mt-1 text-xs text-slate-500">
                  Ingresa la fecha real en que se devolvió el vehículo para
                  calcular el precio final según los días usados.
                </p>
              )}
            </Field>
          )}

          {!isIndefinida && (
            <Field label="Tipo de tarifa">
              <select value={priceMode} disabled className="input">
                <option value="daily">Precio normal</option>
                <option value="highSeason">Temporada alta</option>
              </select>
              <p className="mt-1 text-xs text-slate-500">
                Se calcula automáticamente según las fechas seleccionadas.
              </p>
            </Field>
          )}

          <Field
            label={isIndefinida ? "Tarifa diaria" : "Precio por día"}
            error={errors.dailyRateApplied?.message}
          >
            <input
              type="text"
              inputMode="decimal"
              {...register("dailyRateApplied")}
              onInput={formatCurrencyInput}
              className="input"
              placeholder="0"
            />
            <p className="mt-1 text-xs text-slate-500">
              {isIndefinida
                ? "Precio por día definido manualmente para esta renta."
                : "Se sugiere según el vehículo y las fechas; puedes ajustarlo solo para esta renta, sin cambiar el precio general del carro."}
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

          {isCompleting && (
            <Field
              label="Kilometraje de entrega"
              error={errors.returnMileage?.message}
            >
              <input
                type="text"
                inputMode="numeric"
                {...register("returnMileage")}
                onInput={formatIntegerInput}
                className="input"
                placeholder="45,000"
              />
              <p className="mt-1 text-xs text-slate-500">
                Kilometraje con el que se devolvió el vehículo. Actualiza el
                kilometraje actual del carro.
              </p>
            </Field>
          )}
        </div>
      </section>

      <section className="rounded-2xl bg-white p-4 shadow sm:p-6">
        <h2 className="mb-1 text-lg font-semibold text-slate-900">
          Punto de entrega y devolución
        </h2>
        <p className="mb-5 text-sm text-slate-500">
          Opcional: déjalo en &quot;No especificado&quot; si no se solicitó
          entrega en un punto en particular.
        </p>

        <div className="grid gap-5 md:grid-cols-2">
          <DeliveryPointFields
            label="Punto de entrega"
            locationId={deliveryLocationId}
            plazaId={deliveryPlazaId}
            address={deliveryAddress}
            onLocationChange={setDeliveryLocationId}
            onPlazaChange={setDeliveryPlazaId}
            onAddressChange={setDeliveryAddress}
          />

          <DeliveryPointFields
            label="Punto de devolución"
            locationId={returnLocationId}
            plazaId={returnPlazaId}
            address={returnAddress}
            onLocationChange={setReturnLocationId}
            onPlazaChange={setReturnPlazaId}
            onAddressChange={setReturnAddress}
          />
        </div>
      </section>

      <section className="rounded-2xl bg-white p-4 shadow sm:p-6">
        <h2 className="mb-5 text-lg font-semibold text-slate-900">
          Cálculo de renta
        </h2>

        <div className="grid gap-4 md:grid-cols-5">
          <SummaryItem
            label="Cliente"
            value={renterType === "COMISIONISTA" ? "Comisionista" : "Normal"}
          />
          <SummaryItem
            label="Días"
            value={
              isCompletingIndefinida
                ? (completionQuote?.days ?? "-")
                : isIndefinida
                  ? "Indefinido"
                  : quote
                    ? quote.days
                    : "-"
            }
          />
          <SummaryItem
            label="Precio por día"
            value={
              effectiveDailyRate > 0 ? formatCurrency(effectiveDailyRate) : "-"
            }
          />
          <SummaryItem
            label="Depósito sugerido"
            value={quote?.deposit ? formatCurrency(quote.deposit) : "No definido"}
          />
          {(!isIndefinida || isCompletingIndefinida) && (
            <SummaryItem
              label="Total"
              value={effectiveTotal > 0 ? formatCurrency(effectiveTotal) : "-"}
              strong
            />
          )}
        </div>

        {deliveryFeePreview > 0 && (
          <p className="mt-3 rounded-xl bg-blue-50 px-4 py-3 text-sm text-blue-800 ring-1 ring-blue-200">
            Cargo adicional por entrega/devolución:{" "}
            <strong>{formatCurrency(deliveryFeePreview)}</strong> (no incluido
            en el total de arriba; se cobra aparte).
          </p>
        )}

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Field label="Anticipo recibido" error={errors.advancePayment?.message}>
            <input
              type="text"
              inputMode="decimal"
              {...register("advancePayment")}
              onInput={formatCurrencyInput}
              className="input"
              placeholder="0"
            />
          </Field>

          <SummaryItem
            label="Saldo pendiente"
            value={
              effectiveTotal > 0
                ? formatCurrency(Math.max(effectiveTotal - advancePaymentValue, 0))
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

        {quote?.isUsingCommissionFallback && (
          <p className="mt-3 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800 ring-1 ring-amber-200">
            Este carro no tiene precio de comisionista configurado. Se usó el
            precio normal.
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

function formatDateInput(value?: string | null) {
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

function getDailyRate(
  car: Car,
  priceMode: PriceMode,
  renterType: "CLIENTE" | "COMISIONISTA"
) {
  if (renterType === "COMISIONISTA") {
    if (priceMode === "highSeason" && hasMoneyValue(car.commissionHighSeasonPrice)) {
      return toMoneyNumber(car.commissionHighSeasonPrice);
    }

    if (hasMoneyValue(car.commissionDailyPrice)) {
      return toMoneyNumber(car.commissionDailyPrice);
    }
  }

  if (priceMode === "highSeason") {
    return hasMoneyValue(car.highSeasonPrice)
      ? toMoneyNumber(car.highSeasonPrice)
      : toMoneyNumber(car.dailyPrice);
  }

  return toMoneyNumber(car.dailyPrice);
}

function hasMoneyValue(value?: number | string | null) {
  return toMoneyNumber(value) > 0;
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
