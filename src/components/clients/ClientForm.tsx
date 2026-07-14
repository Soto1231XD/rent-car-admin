"use client";

import { ChangeEvent, ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { IdCard, UploadCloud, X } from "lucide-react";
import { Client } from "@/types/client";
import {
  createClientResult,
  updateClientResult,
  uploadClientIdentificationImageResult,
} from "@/lib/api-client";
import { getAssetUrl } from "@/lib/assets";
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
  type: z.enum(["CLIENTE", "COMISIONISTA"]),
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
  const [existingIdImage, setExistingIdImage] = useState(
    initialData?.idDocumentImage ?? null
  );
  const [selectedIdFile, setSelectedIdFile] = useState<File | null>(null);
  const [idImagePreviewUrl, setIdImagePreviewUrl] = useState<string | null>(
    null
  );

  useEffect(() => {
    if (!selectedIdFile) {
      setIdImagePreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(selectedIdFile);
    setIdImagePreviewUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [selectedIdFile]);

  const handleIdImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      setSelectedIdFile(file);
    }

    event.target.value = "";
  };

  const handleRemoveIdImage = () => {
    setSelectedIdFile(null);
    setExistingIdImage(null);
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ClientFormInput, unknown, ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      fullName: initialData?.fullName ?? "",
      type: initialData?.type ?? "CLIENTE",
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

    const shouldClearIdImage =
      !selectedIdFile && !existingIdImage && Boolean(initialData?.idDocumentImage);
    const payload = {
      ...data,
      ...(shouldClearIdImage ? { idDocumentImage: null } : {}),
    };

    const result =
      mode === "create"
        ? await createClientResult(payload)
        : clientId
          ? await updateClientResult(clientId, payload)
          : { data: null, error: "No se encontró el cliente a actualizar." };

    if (!result.data) {
      setIsSaving(false);
      const message =
        result.error ??
        "No se pudo guardar el cliente. Revisa los datos e intenta de nuevo.";
      setSubmitError(message);
      showErrorToast(message);
      return;
    }

    const uploadResult = selectedIdFile
      ? await uploadClientIdentificationImageResult(result.data.id, selectedIdFile)
      : { data: result.data, error: null };

    setIsSaving(false);

    if (!uploadResult.data) {
      const message =
        uploadResult.error ??
        "El cliente se guardó, pero no se pudo subir la imagen de identificación.";
      setSubmitError(message);
      showErrorToast(message);
      return;
    }

    router.refresh();
    router.push(
      `/dashboard/clients/${uploadResult.data.id}?success=${
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

          <Field label="Tipo de cliente" required error={errors.type?.message}>
            <select {...register("type")} className="input">
              <option value="CLIENTE">Cliente</option>
              <option value="COMISIONISTA">Comisionista</option>
            </select>
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

          <div className="md:col-span-2">
            <span className="mb-1 block text-sm font-medium text-slate-700">
              Foto de la identificación
            </span>

            {idImagePreviewUrl || existingIdImage ? (
              <div className="mt-1 flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-3">
                <div
                  className="h-24 w-36 shrink-0 rounded-xl bg-slate-100 bg-cover bg-center ring-1 ring-slate-200"
                  style={{
                    backgroundImage: `url("${
                      idImagePreviewUrl ?? getAssetUrl(existingIdImage ?? "")
                    }")`,
                  }}
                />
                <div className="flex flex-1 flex-col gap-2 py-1">
                  <p className="text-sm font-medium text-slate-900">
                    {selectedIdFile ? selectedIdFile.name : "Identificación guardada"}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <label
                      htmlFor="client-id-image"
                      className="inline-flex w-fit cursor-pointer items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                    >
                      <UploadCloud size={14} />
                      Cambiar imagen
                    </label>
                    <button
                      type="button"
                      onClick={handleRemoveIdImage}
                      className="inline-flex w-fit items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                    >
                      <X size={14} />
                      Quitar
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <label
                htmlFor="client-id-image"
                className="mt-1 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-5 py-6 text-center transition hover:border-slate-500 hover:bg-slate-100"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-sm ring-1 ring-slate-200">
                  <IdCard size={20} />
                </span>
                <span className="mt-2 text-sm font-semibold text-slate-900">
                  Subir foto de la identificación
                </span>
                <span className="mt-1 max-w-md text-xs leading-5 text-slate-500">
                  Opcional. INE, pasaporte u otro documento. Formatos JPG, PNG o WEBP.
                </span>
              </label>
            )}

            <input
              id="client-id-image"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleIdImageChange}
              className="sr-only"
            />
          </div>
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
