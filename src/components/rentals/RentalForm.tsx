"use client";

import { FormEvent, ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Car, CarClassification } from "@/types/car";
import { ClassificationPricing } from "@/types/classification-pricing";
import { formatCarLabel } from "@/lib/car-label";
import { Client } from "@/types/client";
import { Rental } from "@/types/rental";
import { Membership } from "@/types/membership";
import {
  createRentalResult,
  updateRentalResult,
  getMembershipResult,
  redeemMembershipDaysResult,
} from "@/lib/api-client";
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
const MINIMUM_MEMBERSHIP_REDEMPTION_DAYS = 2;

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
    depositAmount: optionalCurrencyNumber,
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
  classificationPricing: ClassificationPricing[];
  initialData?: Partial<Rental>;
  rentalId?: string;
};

export default function RentalForm({
  mode,
  cars,
  classificationPricing,
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
      depositAmount: formatCurrencyInputValue(
        initialData?.depositAmount ?? undefined
      ),
      advancePayment: formatCurrencyInputValue(initialData?.advancePayment ?? 0),
      renterType: initialData?.renterType ?? "CLIENTE",
      status: initialData?.status ?? "RESERVACION",
      notes: initialData?.notes ?? "",
      returnMileage: "",
    },
  });

  const selectedClientId = useWatch({ control, name: "clientId" });
  const selectedClient = useMemo(
    () => clients.find((client) => client.id === selectedClientId) ?? null,
    [clients, selectedClientId]
  );
  // La lista de clientes (getClients) solo trae, por cliente, la membresía
  // más reciente con id/status/renewalType -- nada más. Si está activa, se
  // pide aparte el resumen completo de días (daysSummary) ya nada más para
  // esta membresía, no para todas las de la lista.
  const activeMembership = selectedClient?.memberships?.find(
    (membership) => membership.status === "ACTIVA"
  );
  const [membershipDetails, setMembershipDetails] = useState<Membership | null>(
    null
  );
  const [wantsToRedeemDays, setWantsToRedeemDays] = useState(false);
  const [redeemDaysAmount, setRedeemDaysAmount] = useState(
    MINIMUM_MEMBERSHIP_REDEMPTION_DAYS
  );
  const [redeemNotes, setRedeemNotes] = useState("");
  // La membresía incluye por default la Clasificación A; si el socio quiere
  // un auto de otra clasificación, el formulario filtra el combo de
  // "Vehículo" a esa clasificación y el backend le suma el cargo de cambio
  // del auto elegido (Car.classificationSwapFee) al total -- ver
  // rentals.service.ts / rental-pricing.util.ts.
  const [selectedClassification, setSelectedClassification] =
    useState<CarClassification>(() => {
      const initialCar = cars.find((car) => car.id === initialData?.carId);
      return initialCar?.classification ?? "A";
    });

  // Patrón de React para "resetear estado cuando cambia algo": se ajusta
  // durante el render (no en un efecto), así no hay setState síncrono
  // dentro de un useEffect. En cuanto cambia la membresía activa detectada
  // (o deja de haber una), se limpian los datos y la intención de canje de
  // la membresía anterior.
  const [syncedMembershipId, setSyncedMembershipId] = useState<
    string | undefined
  >(undefined);
  if (activeMembership?.id !== syncedMembershipId) {
    setSyncedMembershipId(activeMembership?.id);
    setMembershipDetails(null);
    setWantsToRedeemDays(false);
    setSelectedClassification("A");
  }

  useEffect(() => {
    if (!activeMembership) {
      return;
    }

    let cancelled = false;

    getMembershipResult(activeMembership.id).then((result) => {
      if (cancelled || !result.data) return;
      setMembershipDetails(result.data);
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMembership?.id]);

  const isLoadingMembership = Boolean(activeMembership) && !membershipDetails;
  const membershipAvailableDays = membershipDetails?.daysSummary?.availableDays ?? 0;
  const canRedeemMembershipDays =
    membershipAvailableDays >= MINIMUM_MEMBERSHIP_REDEMPTION_DAYS &&
    (!membershipDetails?.daysSummary?.nextRegularRedemptionEligibleDate ||
      new Date(
        membershipDetails.daysSummary.nextRegularRedemptionEligibleDate
      ) <= new Date());

  const availableCars = activeMembership
    ? cars.filter((car) => car.classification === selectedClassification)
    : cars;

  const selectedCarId = useWatch({ control, name: "carId" });

  // Si el cliente tiene membresía y cambia la clasificación elegida, el auto
  // que tenía seleccionado puede dejar de pertenecer a esa clasificación --
  // se limpia para que el staff elija uno de la lista filtrada.
  useEffect(() => {
    if (!activeMembership) {
      return;
    }

    if (
      selectedCarId &&
      !availableCars.some((car) => car.id === selectedCarId)
    ) {
      setValue("carId", "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClassification, activeMembership?.id]);

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
  const depositInput = useWatch({ control, name: "depositAmount" });
  const depositValue = toMoneyNumber(
    depositInput as string | number | null | undefined
  );
  const isIndefinida = rentalType === "INDEFINIDA";
  const isCompletingIndefinida = isIndefinida && status === "COMPLETADO";
  const isCompleting = status === "COMPLETADO";
  const selectedCar = useMemo(
    () => cars.find((car) => car.id === selectedCarId) ?? null,
    [cars, selectedCarId]
  );
  // El depósito, a diferencia de la tarifa diaria, no depende de las
  // fechas -- se sugiere en cuanto se elige un carro, sin esperar a que la
  // renta tenga un rango de fechas válido (relevante sobre todo para
  // INDEFINIDA, donde `quote` nunca se calcula).
  const suggestedDeposit = useMemo(
    () => (selectedCar ? toMoneyNumber(selectedCar.deposit) : null),
    [selectedCar]
  );
  const priceMode = useMemo(() => {
    if (isIndefinida || !startDate || !endDate || endDate < startDate) {
      return initialPriceMode;
    }

    return isHighSeasonRange(startDate, endDate) ? "highSeason" : "daily";
  }, [endDate, initialPriceMode, isIndefinida, startDate]);

  // Cargo único de cambio de clasificación: solo aplica si el cliente tiene
  // membresía activa. Vive en el auto, no en la letra, porque autos de la
  // misma clasificación pueden cobrar distinto (ej. Jetta vs Ertiga en D).
  // La Clasificación A viene incluida sin costo SOLO como punto de partida
  // de la renta -- si se está editando una renta que ya tenía otro auto
  // asignado y se cambia por uno distinto (aunque sea A), ese cambio sí
  // tiene costo. El backend recalcula esto mismo de forma independiente
  // (nunca confía en este valor del frontend).
  const isVehicleSwap =
    mode === "edit" &&
    Boolean(initialData?.carId) &&
    selectedCarId !== initialData?.carId;
  // Si el auto no tiene su propia excepción (classificationSwapFee en
  // null), se usa el precio base configurado para su clasificación en
  // "Precios" -- mismo criterio que calculatePriceBreakdown() en el
  // backend, que es quien manda de verdad.
  const classificationFee =
    activeMembership && selectedCar && (isVehicleSwap || selectedCar.classification !== "A")
      ? (selectedCar.classificationSwapFee ??
        classificationPricing.find(
          (row) => row.classification === selectedCar.classification
        )?.swapFee ??
        0)
      : 0;

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
      total: days * dailyRate + classificationFee,
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
  }, [classificationFee, endDate, isIndefinida, priceMode, renterType, selectedCar, startDate]);

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
      : (quote ? quote.days * dailyRateValue + classificationFee : 0);

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

  // Mismo criterio que la tarifa diaria, pero depende solo del carro (no de
  // las fechas), así que corre en un efecto aparte -- aplica también para
  // INDEFINIDA, donde `quote` nunca se calcula.
  const hasSyncedInitialDeposit = useRef(false);
  useEffect(() => {
    if (!hasSyncedInitialDeposit.current) {
      hasSyncedInitialDeposit.current = true;
      return;
    }

    if (suggestedDeposit !== null) {
      setValue("depositAmount", formatCurrencyInputValue(suggestedDeposit), {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  }, [suggestedDeposit, setValue]);

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
          : (quote ? quote.days * rateForSubmit + classificationFee : 0),
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

    if (wantsToRedeemDays && activeMembership) {
      const redeemResult = await redeemMembershipDaysResult(
        activeMembership.id,
        {
          source: "REGULAR",
          days: redeemDaysAmount,
          notes: redeemNotes || undefined,
          rentalId: result.data.id,
        }
      );

      if (!redeemResult.data) {
        showErrorToast(
          redeemResult.error ??
            "La renta se guardó, pero no se pudo registrar el canje de días. Regístralo manualmente desde la membresía."
        );
      }
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

          <div>
            <Field label="Vehículo" error={errors.carId?.message}>
              <select {...register("carId")} className="input">
                <option value="">Selecciona un vehículo</option>
                {availableCars.map((car) => (
                  <option key={car.id} value={car.id}>
                    {formatCarLabel(car)}
                    {car.plate ? ` - ${car.plate}` : ""}
                  </option>
                ))}
              </select>
              {classificationFee > 0 && (
                <p className="mt-1 text-xs text-teal-700">
                  Costo adicional por cambio de clasificación:{" "}
                  <strong>{formatCurrency(classificationFee)}</strong>{" "}
                  (incluido en el total).
                </p>
              )}
            </Field>

            {activeMembership && (
              <label className="mt-4 block">
                <span className="mb-1 block text-xs font-medium text-slate-700">
                  Clasificación de auto
                </span>
                <select
                  value={selectedClassification}
                  onChange={(event) =>
                    setSelectedClassification(
                      event.target.value as CarClassification
                    )
                  }
                  className="input"
                >
                  <option value="A">A (incluida en la membresía)</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                  <option value="E">E</option>
                </select>
                <p className="mt-1 text-xs text-slate-500">
                  La membresía incluye la Clasificación A. Elegir otra
                  clasificación agrega el cargo de cambio de ese auto al
                  total.
                </p>
              </label>
            )}
          </div>

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

          <Field label="Depósito en garantía" error={errors.depositAmount?.message}>
            <input
              type="text"
              inputMode="decimal"
              {...register("depositAmount")}
              onInput={formatCurrencyInput}
              className="input"
              placeholder="0"
            />
            <p className="mt-1 text-xs text-slate-500">
              Se sugiere según el vehículo; puedes ajustarlo solo para esta renta, sin cambiar el depósito general del carro.
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

      {activeMembership && (
        <section className="rounded-2xl bg-white p-4 shadow sm:p-6">
          <h2 className="mb-5 text-lg font-semibold text-slate-900">
            Días de renta
          </h2>

          {isLoadingMembership ? (
            <p className="text-xs text-slate-500">
              Cargando días disponibles...
            </p>
          ) : membershipDetails?.daysSummary ? (
            <>
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="rounded-xl border border-teal-200 bg-teal-50 p-3">
                  <p className="text-2xl font-bold text-teal-700">
                    {membershipDetails.daysSummary.availableDays}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Disponibles ahora
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-2xl font-bold text-slate-900">
                    {membershipDetails.daysSummary.lifetimeRedeemedDays}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Usados en total
                  </p>
                </div>
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Los días no son acumulables sin límite: cada canje reinicia el
                avance de la tabla, conservando lo que haya quedado sin usar.
              </p>

              {canRedeemMembershipDays ? (
                <div className="mt-3">
                  <label className="flex items-center gap-2 text-sm text-slate-900">
                    <input
                      type="checkbox"
                      checked={wantsToRedeemDays}
                      onChange={(event) =>
                        setWantsToRedeemDays(event.target.checked)
                      }
                    />
                    Usar días de membresía en esta renta
                  </label>

                  {wantsToRedeemDays && (
                    <div className="mt-3 grid gap-3 sm:grid-cols-2 sm:max-w-md">
                      <label className="block">
                        <span className="mb-1 block text-xs font-medium text-slate-600">
                          Días a canjear
                        </span>
                        <input
                          type="number"
                          min={MINIMUM_MEMBERSHIP_REDEMPTION_DAYS}
                          max={Math.min(
                            10,
                            membershipDetails.daysSummary.availableDays
                          )}
                          value={redeemDaysAmount}
                          onChange={(event) =>
                            setRedeemDaysAmount(Number(event.target.value))
                          }
                          className="input"
                        />
                      </label>
                      <label className="block">
                        <span className="mb-1 block text-xs font-medium text-slate-600">
                          Notas (opcional)
                        </span>
                        <input
                          type="text"
                          value={redeemNotes}
                          onChange={(event) =>
                            setRedeemNotes(event.target.value)
                          }
                          className="input"
                          placeholder="Ej. 3 días de esta renta"
                        />
                      </label>
                    </div>
                  )}
                </div>
              ) : (
                <p className="mt-3 text-xs text-amber-700">
                  {membershipDetails.daysSummary.availableDays > 0
                    ? `Tiene ${membershipDetails.daysSummary.availableDays} día disponible, pero el canje mínimo es de ${MINIMUM_MEMBERSHIP_REDEMPTION_DAYS} días.`
                    : "No tiene días disponibles para canjear por ahora."}
                </p>
              )}
            </>
          ) : null}
        </section>
      )}

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
            label="Depósito en garantía"
            value={depositValue > 0 ? formatCurrency(depositValue) : "-"}
          />
          {classificationFee > 0 && (
            <SummaryItem
              label="Cambio de clasificación"
              value={formatCurrency(classificationFee)}
            />
          )}
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
