"use client";

import { ReactNode, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Client } from "@/types/client";
import { createClientResult, updateClientResult } from "@/lib/api-client";
import FormAlert from "@/components/ui/FormAlert";
import { showErrorToast } from "@/lib/toast";

const optionalText = z
  .string()
  .trim()
  .optional()
  .transform((value) => value || undefined);

const optionalEmail = z
  .string()
  .trim()
  .optional()
  .refine(
    (value) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    "Correo inválido"
  )
  .transform((value) => value || undefined);

const optionalPhone = z
  .string()
  .trim()
  .optional()
  .refine(
    (value) => !value || value.length >= 7,
    "El teléfono debe tener al menos 7 dígitos"
  )
  .transform((value) => value || undefined);

const clientSchema = z.object({
  fullName: z.string().min(1, "El nombre es obligatorio"),
  email: optionalEmail,
  phone: z.string().min(7, "El teléfono debe tener al menos 7 dígitos"),
  idNumber: z.string().min(1, "La identificación es obligatoria"),
  driverLicenseNumber: optionalText,
  emergencyContactName: optionalText,
  emergencyContactPhone: optionalPhone,
  notes: optionalText,
});

export type ClientFormData = z.infer<typeof clientSchema>;
type ClientFormInput = z.input<typeof clientSchema>;

type ClientFormProps = {
  mode: "create" | "edit";
  initialData?: Partial<Client>;
  clientId?: string;
};

export default function ClientForm({
  mode,
  initialData,
  clientId,
}: ClientFormProps) {
  const router = useRouter();
  const [submitError, setSubmitError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ClientFormInput, unknown, ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      fullName: initialData?.fullName ?? "",
      email: initialData?.email ?? "",
      phone: initialData?.phone ?? "",
      idNumber: initialData?.idNumber ?? "",
      driverLicenseNumber: initialData?.driverLicenseNumber ?? "",
      emergencyContactName: initialData?.emergencyContactName ?? "",
      emergencyContactPhone: initialData?.emergencyContactPhone ?? "",
      notes: initialData?.notes ?? "",
    },
  });

  const onInvalid = () => {
    const message = "Revisa los campos marcados antes de guardar el cliente.";
    setSubmitError(message);
    showErrorToast(message);
  };

  const onSubmit = async (data: ClientFormData) => {
    setSubmitError("");
    setIsSaving(true);

    const result =
      mode === "create"
        ? await createClientResult(data)
        : clientId
          ? await updateClientResult(clientId, data)
          : { data: null, error: "No se encontró el cliente a actualizar." };

    setIsSaving(false);

    if (!result.data) {
      const message =
        result.error ??
        "No se pudo guardar el cliente. Revisa los datos e intenta de nuevo.";
      setSubmitError(message);
      showErrorToast(message);
      return;
    }

    router.refresh();
    router.push(
      `/dashboard/clients/${result.data.id}?success=${
        mode === "create" ? "created" : "updated"
      }`
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-6">
      <section className="rounded-2xl bg-white p-4 shadow sm:p-6">
        <div className="mb-6 space-y-2">
          <h2 className="text-lg font-semibold text-slate-900">
            Información del cliente
          </h2>
          <p className="text-sm text-slate-500">
            Los campos que tengan <span className="font-semibold text-red-600">*</span> son obligatorios.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Nombre completo" required error={errors.fullName?.message}>
            <input
              {...register("fullName")}
              className="input"
              placeholder="Carlos Ramírez"
            />
          </Field>

          <Field label="Correo electrónico" error={errors.email?.message}>
            <input
              type="email"
              {...register("email")}
              className="input"
              placeholder="cliente@email.com"
            />
          </Field>

          <Field label="Teléfono" required error={errors.phone?.message}>
            <input {...register("phone")} className="input" placeholder="9981234567" />
          </Field>

          <Field label="Identificación" required error={errors.idNumber?.message}>
            <input {...register("idNumber")} className="input" placeholder="INE / Pasaporte" />
          </Field>

          <Field label="Licencia de conducir" error={errors.driverLicenseNumber?.message}>
            <input
              {...register("driverLicenseNumber")}
              className="input"
              placeholder="LIC-123456"
            />
          </Field>

        </div>
      </section>

      <section className="rounded-2xl bg-white p-4 shadow sm:p-6">
        <h2 className="mb-6 text-lg font-semibold text-slate-900">
          Contacto de emergencia
        </h2>

        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Nombre del contacto" error={errors.emergencyContactName?.message}>
            <input
              {...register("emergencyContactName")}
              className="input"
              placeholder="María Ramírez"
            />
          </Field>

          <Field label="Teléfono del contacto" error={errors.emergencyContactPhone?.message}>
            <input
              {...register("emergencyContactPhone")}
              className="input"
              placeholder="9987654321"
            />
          </Field>
        </div>
      </section>

      <section className="rounded-2xl bg-white p-4 shadow sm:p-6">
        <h2 className="mb-6 text-lg font-semibold text-slate-900">
          Notas adicionales
        </h2>

        <Field label="Notas" error={errors.notes?.message}>
          <textarea
            {...register("notes")}
            className="input min-h-32 resize-none"
            placeholder="Observaciones del cliente..."
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
              ? "Guardar cliente"
              : "Actualizar cliente"}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  required = false,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">
        {label}
        {required && <span className="ml-1 text-red-600">*</span>}
      </span>
      {children}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </label>
  );
}
