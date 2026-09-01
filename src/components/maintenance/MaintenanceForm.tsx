"use client";

import { ReactNode, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Car } from "@/types/car";
import { Maintenance } from "@/types/maintenance";
import { formatCarLabel } from "@/lib/car-label";
import {
  createMaintenanceResult,
  updateMaintenanceResult,
} from "@/lib/api-client";
import FormAlert from "@/components/ui/FormAlert";
import { showErrorToast } from "@/lib/toast";
import {
  formatCurrencyInput,
  formatCurrencyInputValue,
  normalizeCurrencyValue,
} from "@/lib/format-currency";
import { formatIntegerInput, formatIntegerInputValue } from "@/lib/format-number";

const optionalMileage = z.preprocess((value) => {
  const normalized = normalizeCurrencyValue(value);
  return normalized === "" ? undefined : normalized;
}, z.coerce.number().min(0, "El kilometraje no puede ser negativo").optional());

const optionalDateInput = z
  .string()
  .optional()
  .transform((value) => (value ? value : undefined));

const optionalCost = z.preprocess((value) => {
  const normalized = normalizeCurrencyValue(value);
  return normalized === "" ? undefined : normalized;
}, z.coerce.number().min(0, "El costo no puede ser negativo").optional());

// --- Servicio realizado (módulo Mantenimiento) ---
const serviceSchema = z.object({
  carId: z.string().min(1, "Selecciona un vehículo"),
  serviceType: z.string().min(1, "El tipo de servicio es obligatorio"),
  cost: z.preprocess(
    normalizeCurrencyValue,
    z.coerce.number().min(0, "El costo no puede ser negativo")
  ),
  date: z.string().min(1, "La fecha es obligatoria"),
  status: z.enum(["PENDIENTE", "EN_PROGRESO", "COMPLETADO"]),
  notes: z.string().optional(),
});

// --- Revisión de kilometraje (módulo Control de kilometraje) ---
// Totalmente independiente del módulo Mantenimiento — aunque comparte
// nombres de columna en la base de datos (serviceType, cost, reviewDate),
// aquí son campos propios de esta revisión, sin relación con un registro
// de Mantenimiento.
const mileageSchema = z.object({
  carId: z.string().min(1, "Selecciona un vehículo"),
  date: z.string().min(1, "La fecha es obligatoria"),
  reviewDate: optionalDateInput,
  serviceType: z.string().optional(),
  cost: optionalCost,
  serviceMileage: optionalMileage,
  previousMileage: optionalMileage,
  nextServiceMileage: optionalMileage,
  providerType: z
    .enum(["AGENCIA", "INDEPENDIENTE", ""])
    .optional()
    .transform((value) => (value ? value : undefined)),
  location: z
    .string()
    .optional()
    .transform((value) => (value?.trim() ? value.trim() : undefined)),
  includesMaterial: z
    .enum(["true", "false", ""])
    .optional()
    .transform((value) => (value ? value === "true" : undefined)),
  notes: z.string().optional(),
});

type ServiceFormData = z.output<typeof serviceSchema>;
type ServiceFormInput = z.input<typeof serviceSchema>;
type MileageFormData = z.output<typeof mileageSchema>;
type MileageFormInput = z.input<typeof mileageSchema>;

type Props = {
  mode: "create" | "edit";
  recordType: "REVISION" | "SERVICIO";
  cars: Car[];
  initialData?: Partial<Maintenance>;
  maintenanceId?: string;
  redirectBase: string;
  /** Revisiones existentes, usadas solo para autocompletar al crear una nueva. */
  revisions?: Maintenance[];
};

export default function MaintenanceForm(props: Props) {
  return props.recordType === "SERVICIO" ? (
    <ServiceForm {...props} />
  ) : (
    <MileageRevisionForm {...props} />
  );
}

function ServiceForm({
  mode,
  cars,
  initialData,
  maintenanceId,
  redirectBase,
}: Props) {
  const router = useRouter();
  const [submitError, setSubmitError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ServiceFormInput, unknown, ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      carId: initialData?.carId ?? "",
      serviceType: initialData?.serviceType ?? "",
      cost: formatCurrencyInputValue(initialData?.cost ?? undefined),
      date: formatDateInput(initialData?.date),
      status: initialData?.status ?? "PENDIENTE",
      notes: initialData?.notes ?? "",
    },
  });

  const onInvalid = () => {
    const message = "Revisa los campos marcados antes de guardar el mantenimiento.";
    setSubmitError(message);
    showErrorToast(message);
  };

  const onSubmit = async (data: ServiceFormData) => {
    setSubmitError("");
    setIsSaving(true);

    const payload = { ...data, recordType: "SERVICIO" as const };
    const result =
      mode === "create"
        ? await createMaintenanceResult(payload)
        : maintenanceId
          ? await updateMaintenanceResult(maintenanceId, payload)
          : { data: null, error: "No se encontró el mantenimiento a actualizar." };

    setIsSaving(false);

    if (!result.data) {
      const message =
        result.error ??
        "No se pudo guardar el mantenimiento. Revisa los datos e intenta de nuevo.";
      setSubmitError(message);
      showErrorToast(message);
      return;
    }

    router.refresh();
    router.push(
      `${redirectBase}?success=${mode === "create" ? "created" : "updated"}`
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-6">
      <section className="rounded-2xl bg-white p-4 shadow sm:p-6">
        <h2 className="mb-6 text-lg font-semibold text-slate-900">
          {mode === "create" ? "Registrar mantenimiento" : "Editar mantenimiento"}
        </h2>

        <div className="grid gap-5 md:grid-cols-2">
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

          <Field label="Tipo de servicio" error={errors.serviceType?.message}>
            <input
              {...register("serviceType")}
              className="input"
              placeholder="Cambio de aceite"
            />
          </Field>

          <Field label="Costo" error={errors.cost?.message}>
            <input
              type="text"
              inputMode="decimal"
              {...register("cost")}
              onInput={formatCurrencyInput}
              className="input"
              placeholder="800"
            />
          </Field>

          <Field label="Fecha" error={errors.date?.message}>
            <input type="date" {...register("date")} className="input" />
          </Field>

          <Field label="Estado" error={errors.status?.message}>
            <select {...register("status")} className="input">
              <option value="PENDIENTE">Pendiente</option>
              <option value="EN_PROGRESO">En progreso</option>
              <option value="COMPLETADO">Completado</option>
            </select>
          </Field>

          <div className="md:col-span-2">
            <Field label="Comentarios / Observaciones" error={errors.notes?.message}>
              <textarea
                {...register("notes")}
                className="input min-h-24 resize-none"
                placeholder="Ej: Se cambió aceite, filtro y se revisaron frenos..."
              />
            </Field>
          </div>
        </div>
      </section>

      {submitError && <FormAlert message={submitError} />}

      <FormActions
        isSaving={isSaving}
        mode={mode}
        onCancel={() => router.back()}
      />
    </form>
  );
}

function MileageRevisionForm({
  mode,
  cars,
  initialData,
  maintenanceId,
  redirectBase,
  revisions,
}: Props) {
  const router = useRouter();
  const [submitError, setSubmitError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<MileageFormInput, unknown, MileageFormData>({
    resolver: zodResolver(mileageSchema),
    defaultValues: {
      carId: initialData?.carId ?? "",
      date: formatDateInput(initialData?.date),
      reviewDate: formatDateInput(initialData?.reviewDate ?? undefined),
      serviceType: initialData?.serviceType ?? "",
      cost: formatCurrencyInputValue(initialData?.cost ?? undefined),
      serviceMileage: formatIntegerInputValue(
        initialData?.serviceMileage ?? undefined
      ),
      previousMileage: formatIntegerInputValue(
        initialData?.previousMileage ?? undefined
      ),
      nextServiceMileage: formatIntegerInputValue(
        initialData?.nextServiceMileage ?? undefined
      ),
      providerType: initialData?.providerType ?? "",
      location: initialData?.location ?? "",
      includesMaterial:
        initialData?.includesMaterial == null
          ? ""
          : initialData.includesMaterial
            ? "true"
            : "false",
      notes: initialData?.notes ?? "",
    },
  });

  // Última revisión registrada por vehículo (la más reciente por fecha), usada
  // solo para autocompletar al crear una nueva — el usuario que llevaba el
  // Excel reutilizaba la mayoría de estos campos y solo actualizaba el
  // kilometraje y la fecha en cada revisión.
  const latestRevisionByCarId = useMemo(() => {
    const map = new Map<string, Maintenance>();

    for (const revision of revisions ?? []) {
      if (!revision.carId) {
        continue;
      }

      const current = map.get(revision.carId);
      if (!current || revision.date > current.date) {
        map.set(revision.carId, revision);
      }
    }

    return map;
  }, [revisions]);

  const watchedCarId = useWatch({ control, name: "carId" });

  useEffect(() => {
    if (mode !== "create" || !watchedCarId) {
      return;
    }

    const lastRevision = latestRevisionByCarId.get(watchedCarId);
    if (!lastRevision) {
      return;
    }

    setValue("providerType", lastRevision.providerType ?? "");
    setValue("location", lastRevision.location ?? "");
    setValue("serviceType", lastRevision.serviceType ?? "");
    setValue(
      "includesMaterial",
      lastRevision.includesMaterial == null
        ? ""
        : lastRevision.includesMaterial
          ? "true"
          : "false"
    );
    setValue("cost", formatCurrencyInputValue(lastRevision.cost ?? undefined));
    setValue(
      "nextServiceMileage",
      formatIntegerInputValue(lastRevision.nextServiceMileage ?? undefined)
    );
  }, [mode, watchedCarId, latestRevisionByCarId, setValue]);

  const onInvalid = () => {
    const message = "Revisa los campos marcados antes de guardar la revisión.";
    setSubmitError(message);
    showErrorToast(message);
  };

  const onSubmit = async (data: MileageFormData) => {
    setSubmitError("");
    setIsSaving(true);

    const payload = { ...data, recordType: "REVISION" as const };
    const result =
      mode === "create"
        ? await createMaintenanceResult(payload)
        : maintenanceId
          ? await updateMaintenanceResult(maintenanceId, payload)
          : { data: null, error: "No se encontró la revisión a actualizar." };

    setIsSaving(false);

    if (!result.data) {
      const message =
        result.error ??
        "No se pudo guardar la revisión. Revisa los datos e intenta de nuevo.";
      setSubmitError(message);
      showErrorToast(message);
      return;
    }

    router.refresh();
    router.push(
      `${redirectBase}?success=${mode === "create" ? "created" : "updated"}`
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-6">
      <section className="rounded-2xl bg-white p-4 shadow sm:p-6">
        <h2 className="mb-6 text-lg font-semibold text-slate-900">
          {mode === "create" ? "Registrar revisión de kilometraje" : "Editar revisión de kilometraje"}
        </h2>

        <div className="grid gap-5 md:grid-cols-2">
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

          <Field label="Fecha de revisión" error={errors.date?.message}>
            <input type="date" {...register("date")} className="input" />
          </Field>

          <Field label="Fecha de servicio" error={errors.reviewDate?.message}>
            <input type="date" {...register("reviewDate")} className="input" />
          </Field>

          <Field label="Kilometraje actual" error={errors.serviceMileage?.message}>
            <input
              type="text"
              inputMode="numeric"
              {...register("serviceMileage")}
              onInput={formatIntegerInput}
              className="input"
              placeholder="45,000"
            />
          </Field>

          <Field
            label="Kilometraje antes de ingresar a servicio"
            error={errors.previousMileage?.message}
          >
            <input
              type="text"
              inputMode="numeric"
              {...register("previousMileage")}
              onInput={formatIntegerInput}
              className="input"
              placeholder="44,500"
            />
          </Field>

          <Field
            label="Kilometraje previsto para próximo servicio"
            error={errors.nextServiceMileage?.message}
          >
            <input
              type="text"
              inputMode="numeric"
              {...register("nextServiceMileage")}
              onInput={formatIntegerInput}
              className="input"
              placeholder="50,000"
            />
          </Field>

          <Field label="Agencia o independiente" error={errors.providerType?.message}>
            <select {...register("providerType")} className="input">
              <option value="">No especificado</option>
              <option value="AGENCIA">Agencia</option>
              <option value="INDEPENDIENTE">Independiente</option>
            </select>
          </Field>

          <Field label="Lugar donde se realizó" error={errors.location?.message}>
            <input
              {...register("location")}
              className="input"
              placeholder="Ej: Agencia Nissan Cancún"
            />
          </Field>

          <Field label="Incluye material" error={errors.includesMaterial?.message}>
            <select {...register("includesMaterial")} className="input">
              <option value="">No especificado</option>
              <option value="true">Sí</option>
              <option value="false">No</option>
            </select>
          </Field>

          <Field
            label="Descripción del trabajo realizado"
            error={errors.serviceType?.message}
          >
            <input
              {...register("serviceType")}
              className="input"
              placeholder="Cambio de filtros, aceite y mantenimiento"
            />
          </Field>

          <Field label="Costo del servicio" error={errors.cost?.message}>
            <input
              type="text"
              inputMode="decimal"
              {...register("cost")}
              onInput={formatCurrencyInput}
              className="input"
              placeholder="800"
            />
          </Field>

          <div className="md:col-span-2">
            <Field label="Comentarios / Observaciones" error={errors.notes?.message}>
              <textarea
                {...register("notes")}
                className="input min-h-24 resize-none"
                placeholder="Notas adicionales sobre esta revisión..."
              />
            </Field>
          </div>
        </div>
      </section>

      {submitError && <FormAlert message={submitError} />}

      <FormActions
        isSaving={isSaving}
        mode={mode}
        onCancel={() => router.back()}
      />
    </form>
  );
}

function FormActions({
  isSaving,
  mode,
  onCancel,
}: {
  isSaving: boolean;
  mode: "create" | "edit";
  onCancel: () => void;
}) {
  return (
    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
      <button
        type="button"
        onClick={onCancel}
        className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
      >
        Cancelar
      </button>

      <button
        type="submit"
        disabled={isSaving}
        className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        {isSaving ? "Guardando..." : mode === "create" ? "Guardar registro" : "Actualizar registro"}
      </button>
    </div>
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
