"use client";

import { ReactNode, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Car } from "@/types/car";
import { InsurancePolicy } from "@/types/insurance-policy";
import { formatCarLabel } from "@/lib/car-label";
import {
  createInsurancePolicyResult,
  deleteInsurancePolicyResult,
  SaveInsurancePolicyPayload,
  updateInsurancePolicyResult,
} from "@/lib/api-client";
import FormAlert from "@/components/ui/FormAlert";
import { showErrorToast } from "@/lib/toast";

// Un solo formulario por vehículo: el seguro siempre se captura completo, y
// el Smart Tag es un agregado opcional — si el carro cuenta con uno, solo
// se pide su fecha de vigencia; si no, no se pide nada más. Se puede volver
// a editar el vehículo después para agregarlo si se olvidó al capturar.
const schema = z
  .object({
    carId: z.string().min(1, "Selecciona un vehículo"),
    contractDate: z.string().min(1, "La fecha de contrato es obligatoria"),
    expirationDate: z.string().min(1, "La fecha de vigencia es obligatoria"),
    policyNumber: z.string().min(1, "El número de póliza es obligatorio"),
    company: z.string().min(1, "La compañía es obligatoria"),
    servicePhone: z.string().optional(),
    notes: z.string().optional(),
    hasSmartTag: z.boolean(),
    smartTagExpirationDate: z.string().optional(),
  })
  .refine(
    (data) => !data.hasSmartTag || Boolean(data.smartTagExpirationDate),
    {
      message: "La fecha de vigencia del Smart Tag es obligatoria",
      path: ["smartTagExpirationDate"],
    }
  );

type FormData = z.output<typeof schema>;
type FormInput = z.input<typeof schema>;

type Props = {
  mode: "create" | "edit";
  cars: Car[];
  initialData?: Partial<InsurancePolicy>;
  insurancePolicyId?: string;
  initialSmartTag?: InsurancePolicy;
};

export default function InsurancePolicyForm({
  mode,
  cars,
  initialData,
  insurancePolicyId,
  initialSmartTag,
}: Props) {
  const router = useRouter();
  const [submitError, setSubmitError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const smartTagId = initialSmartTag?.id;

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormInput, unknown, FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      carId: initialData?.carId ?? "",
      contractDate: formatDateInput(initialData?.contractDate ?? undefined),
      expirationDate: formatDateInput(initialData?.expirationDate),
      policyNumber: initialData?.policyNumber ?? "",
      company: initialData?.company ?? "",
      servicePhone: initialData?.servicePhone ?? "",
      notes: initialData?.notes ?? "",
      hasSmartTag: Boolean(initialSmartTag),
      smartTagExpirationDate: formatDateInput(
        initialSmartTag?.expirationDate ?? undefined
      ),
    },
  });

  const hasSmartTag = watch("hasSmartTag");

  const onInvalid = () => {
    const message = "Revisa los campos marcados antes de guardar la póliza.";
    setSubmitError(message);
    showErrorToast(message);
  };

  const onSubmit = async (data: FormData) => {
    setSubmitError("");
    setIsSaving(true);

    const seguroPayload: SaveInsurancePolicyPayload = {
      carId: data.carId,
      type: "SEGURO",
      contractDate: data.contractDate,
      expirationDate: data.expirationDate,
      policyNumber: data.policyNumber,
      company: data.company,
      servicePhone: data.servicePhone,
      notes: data.notes,
    };

    const seguroResult = insurancePolicyId
      ? await updateInsurancePolicyResult(insurancePolicyId, seguroPayload)
      : await createInsurancePolicyResult(seguroPayload);

    if (!seguroResult.data) {
      setIsSaving(false);
      const message =
        seguroResult.error ??
        "No se pudo guardar la póliza. Revisa los datos e intenta de nuevo.";
      setSubmitError(message);
      showErrorToast(message);
      return;
    }

    let smartTagError = "";

    if (data.hasSmartTag && data.smartTagExpirationDate) {
      const smartTagPayload: SaveInsurancePolicyPayload = {
        carId: data.carId,
        type: "SMART_TAG",
        expirationDate: data.smartTagExpirationDate,
      };

      const smartTagResult = smartTagId
        ? await updateInsurancePolicyResult(smartTagId, smartTagPayload)
        : await createInsurancePolicyResult(smartTagPayload);

      if (!smartTagResult.data) {
        smartTagError =
          smartTagResult.error ?? "No se pudo guardar el Smart Tag.";
      }
    } else if (!data.hasSmartTag && smartTagId) {
      const deleteResult = await deleteInsurancePolicyResult(smartTagId);
      if (!deleteResult.data) {
        smartTagError = deleteResult.error ?? "No se pudo quitar el Smart Tag.";
      }
    }

    setIsSaving(false);

    if (smartTagError) {
      const message = `La póliza se guardó, pero hubo un problema con el Smart Tag: ${smartTagError}`;
      setSubmitError(message);
      showErrorToast(message);
      return;
    }

    router.refresh();
    router.push(
      `/dashboard/insurance-policies?success=${
        mode === "create" ? "created" : "updated"
      }`
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-6">
      <section className="rounded-2xl bg-white p-4 shadow sm:p-6">
        <h2 className="mb-6 text-lg font-semibold text-slate-900">
          {mode === "create" ? "Registrar póliza" : "Editar póliza"}
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

          <Field label="Compañía" error={errors.company?.message}>
            <input
              {...register("company")}
              className="input"
              placeholder="Qualitas"
            />
          </Field>

          <Field label="Número de póliza" error={errors.policyNumber?.message}>
            <input
              {...register("policyNumber")}
              className="input"
              placeholder="5930598759"
            />
          </Field>

          <Field label="Fecha de contrato" error={errors.contractDate?.message}>
            <input type="date" {...register("contractDate")} className="input" />
          </Field>

          <Field label="Fecha de vigencia" error={errors.expirationDate?.message}>
            <input type="date" {...register("expirationDate")} className="input" />
          </Field>

          <Field
            label="Teléfono de servicio (opcional)"
            error={errors.servicePhone?.message}
          >
            <input
              {...register("servicePhone")}
              className="input"
              placeholder="800 911 2627"
            />
          </Field>

          <div className="md:col-span-2">
            <Field label="Notas (opcional)" error={errors.notes?.message}>
              <textarea
                {...register("notes")}
                className="input min-h-24 resize-none"
                placeholder="Observaciones adicionales..."
              />
            </Field>
          </div>
        </div>
      </section>

      <section className="rounded-2xl bg-white p-4 shadow sm:p-6">
        <h2 className="mb-2 text-lg font-semibold text-slate-900">Smart Tag</h2>
        <p className="mb-4 text-sm text-slate-500">
          Si este vehículo no cuenta con Smart Tag todavía, no pasa nada —
          puedes volver a editar esta póliza más adelante para agregarlo.
        </p>

        <label className="flex w-fit items-center gap-2.5">
          <input
            type="checkbox"
            {...register("hasSmartTag")}
            className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
          />
          <span className="text-sm font-medium text-slate-700">
            Este vehículo cuenta con Smart Tag
          </span>
        </label>

        {hasSmartTag && (
          <div className="mt-4 max-w-xs">
            <Field
              label="Fecha de vigencia del Smart Tag"
              error={errors.smartTagExpirationDate?.message}
            >
              <input
                type="date"
                {...register("smartTagExpirationDate")}
                className="input"
              />
            </Field>
          </div>
        )}
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
              ? "Guardar póliza"
              : "Actualizar póliza"}
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
