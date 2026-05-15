"use client";

import { ReactNode, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Car } from "@/types/car";
import { Maintenance } from "@/types/maintenance";
import {
  createMaintenanceResult,
  updateMaintenanceResult,
} from "@/lib/api-client";
import FormAlert from "@/components/ui/FormAlert";
import { showErrorToast } from "@/lib/toast";

const schema = z.object({
  carId: z.string().min(1, "Selecciona un vehículo"),
  serviceType: z.string().min(1, "El tipo de servicio es obligatorio"),
  cost: z.coerce.number().min(0, "El costo no puede ser negativo"),
  date: z.string().min(1, "La fecha es obligatoria"),
  status: z.enum(["PENDIENTE", "EN_PROGRESO", "COMPLETADO"]),
  notes: z.string().optional(),
});

type FormData = z.output<typeof schema>;
type FormInput = z.input<typeof schema>;

type Props = {
  mode: "create" | "edit";
  cars: Car[];
  initialData?: Partial<Maintenance>;
  maintenanceId?: string;
};

export default function MaintenanceForm({
  mode,
  cars,
  initialData,
  maintenanceId,
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
      serviceType: initialData?.serviceType ?? "",
      cost: initialData?.cost ?? undefined,
      date: formatDateInput(initialData?.date),
      status: initialData?.status ?? "PENDIENTE",
      notes: initialData?.notes ?? "",
    },
  });

  const onInvalid = () => {
    const message =
      "Revisa los campos marcados antes de guardar el mantenimiento.";
    setSubmitError(message);
    showErrorToast(message);
  };

  const onSubmit = async (data: FormData) => {
    setSubmitError("");
    setIsSaving(true);

    const result =
      mode === "create"
        ? await createMaintenanceResult(data)
        : maintenanceId
          ? await updateMaintenanceResult(maintenanceId, data)
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
      `/dashboard/maintenance?success=${
        mode === "create" ? "created" : "updated"
      }`
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
                  {car.brand} {car.model} {car.year} - {car.plate}
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
              type="number"
              {...register("cost")}
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
              ? "Guardar mantenimiento"
              : "Actualizar mantenimiento"}
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
