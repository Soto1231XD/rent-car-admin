"use client";

import { ChangeEvent, ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { FileText, Plus, Trash2, UploadCloud } from "lucide-react";
import { Client, ClientDocument } from "@/types/client";
import {
  addClientDocumentResult,
  convertLeadResult,
  createClientResult,
  deleteClientDocumentResult,
  updateClientResult,
} from "@/lib/api-client";
import { getAssetUrl } from "@/lib/assets";
import FormAlert from "@/components/ui/FormAlert";
import { showErrorToast } from "@/lib/toast";

// No es una lista cerrada: de vez en cuando se piden documentos distintos
// según el cliente (comprobante de domicilio si es local; itinerario de
// vuelo o reserva de hospedaje si es extranjero, etc.). Estas son solo
// sugerencias rápidas — "Otro" permite escribir cualquier etiqueta.
const DOCUMENT_LABEL_PRESETS = [
  "Identificación",
  "Comprobante de domicilio",
  "Itinerario de vuelo",
  "Reserva de hospedaje",
  "Otro",
];

type PendingDocument = {
  key: string;
  label: string;
  file: File;
  previewUrl: string;
};

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
  birthDate: optionalText,
});

export type ClientFormData = z.infer<typeof clientSchema>;
type ClientFormInput = z.input<typeof clientSchema>;

type ClientFormProps = {
  mode: "create" | "edit";
  initialData?: Partial<Client>;
  clientId?: string;
  leadId?: string;
};

export default function ClientForm({
  mode,
  initialData,
  clientId,
  leadId,
}: ClientFormProps) {
  const router = useRouter();
  const [submitError, setSubmitError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Documentos ya guardados en el cliente (solo aplica en modo edición).
  // Se quitan de esta lista al presionar "Quitar", pero el borrado real en
  // el servidor ocurre hasta guardar el formulario, igual que el resto de
  // los campos.
  const [existingDocuments, setExistingDocuments] = useState<ClientDocument[]>(
    initialData?.documents ?? []
  );
  const [removedDocumentIds, setRemovedDocumentIds] = useState<string[]>([]);

  // Documentos nuevos agregados en esta sesión de edición, pendientes de
  // subir hasta que se guarde el formulario.
  const [pendingDocuments, setPendingDocuments] = useState<PendingDocument[]>(
    []
  );
  const [documentLabelChoice, setDocumentLabelChoice] = useState(
    DOCUMENT_LABEL_PRESETS[0]
  );
  const [customDocumentLabel, setCustomDocumentLabel] = useState("");
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [documentError, setDocumentError] = useState("");

  useEffect(() => {
    return () => {
      pendingDocuments.forEach((document) => URL.revokeObjectURL(document.previewUrl));
    };
    // Solo se ejecuta al desmontar: revoca todas las previews creadas.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDocumentFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    setDocumentFile(event.target.files?.[0] ?? null);
  };

  const handleAddDocument = () => {
    const label =
      documentLabelChoice === "Otro"
        ? customDocumentLabel.trim()
        : documentLabelChoice;

    if (!label) {
      setDocumentError("Escribe una etiqueta para el documento.");
      return;
    }

    if (!documentFile) {
      setDocumentError("Selecciona un archivo para agregar.");
      return;
    }

    setDocumentError("");
    setPendingDocuments((current) => [
      ...current,
      {
        key: `${Date.now()}-${Math.random()}`,
        label,
        file: documentFile,
        previewUrl: URL.createObjectURL(documentFile),
      },
    ]);
    setDocumentFile(null);
    setCustomDocumentLabel("");
    const fileInput = window.document.getElementById(
      "client-document-file"
    ) as HTMLInputElement | null;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const handleRemoveExistingDocument = (id: string) => {
    setExistingDocuments((current) => current.filter((document) => document.id !== id));
    setRemovedDocumentIds((current) => [...current, id]);
  };

  const handleRemovePendingDocument = (key: string) => {
    setPendingDocuments((current) => {
      const removed = current.find((document) => document.key === key);
      if (removed) {
        URL.revokeObjectURL(removed.previewUrl);
      }
      return current.filter((document) => document.key !== key);
    });
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
      birthDate: formatDateInput(initialData?.birthDate),
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

    if (!result.data) {
      setIsSaving(false);
      const message =
        result.error ??
        "No se pudo guardar el cliente. Revisa los datos e intenta de nuevo.";
      setSubmitError(message);
      showErrorToast(message);
      return;
    }

    const savedClientId = result.data.id;
    const documentErrors: string[] = [];

    for (const documentId of removedDocumentIds) {
      const deleteResult = await deleteClientDocumentResult(savedClientId, documentId);
      if (!deleteResult.data) {
        documentErrors.push(
          deleteResult.error ?? "No se pudo eliminar uno de los documentos."
        );
      }
    }

    for (const document of pendingDocuments) {
      const uploadResult = await addClientDocumentResult(
        savedClientId,
        document.label,
        document.file
      );
      if (!uploadResult.data) {
        documentErrors.push(
          uploadResult.error ?? `No se pudo subir "${document.label}".`
        );
      }
    }

    setIsSaving(false);

    if (documentErrors.length > 0) {
      const message = `El cliente se guardó, pero hubo problemas con los documentos: ${documentErrors.join(" ")}`;
      setSubmitError(message);
      showErrorToast(message);
      return;
    }

    if (mode === "create" && leadId) {
      const convertResult = await convertLeadResult(leadId, savedClientId);

      if (!convertResult.data) {
        showErrorToast(
          "El cliente se guardó, pero no se pudo marcar la solicitud como convertida."
        );
      }
    }

    router.refresh();
    router.push(
      `/dashboard/clients/${savedClientId}?success=${
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

          <Field label="Fecha de nacimiento" error={errors.birthDate?.message}>
            <input type="date" {...register("birthDate")} className="input" />
          </Field>

          <div className="md:col-span-2">
            <span className="mb-1 block text-sm font-medium text-slate-700">
              Documentos del cliente
            </span>
            <p className="mb-3 text-xs leading-5 text-slate-500">
              Opcional. Agrega los documentos que apliquen: identificación,
              comprobante de domicilio (clientes locales), itinerario de vuelo
              o reserva de hospedaje (clientes extranjeros), u otro. Formatos
              JPG, PNG o WEBP.
            </p>

            {(existingDocuments.length > 0 || pendingDocuments.length > 0) && (
              <ul className="mb-3 space-y-2">
                {existingDocuments.map((document) => (
                  <li
                    key={document.id}
                    className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3"
                  >
                    <a
                      href={getAssetUrl(document.url)}
                      target="_blank"
                      rel="noreferrer"
                      className="h-14 w-20 shrink-0 rounded-lg bg-slate-100 bg-cover bg-center ring-1 ring-slate-200"
                      style={{
                        backgroundImage: `url("${getAssetUrl(document.url)}")`,
                      }}
                    />
                    <p className="flex-1 truncate text-sm font-medium text-slate-900">
                      {document.label}
                    </p>
                    <button
                      type="button"
                      onClick={() => handleRemoveExistingDocument(document.id)}
                      className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                    >
                      <Trash2 size={14} />
                      Quitar
                    </button>
                  </li>
                ))}

                {pendingDocuments.map((document) => (
                  <li
                    key={document.key}
                    className="flex items-center gap-3 rounded-xl border border-dashed border-blue-300 bg-blue-50/40 p-3"
                  >
                    <div
                      className="h-14 w-20 shrink-0 rounded-lg bg-slate-100 bg-cover bg-center ring-1 ring-slate-200"
                      style={{ backgroundImage: `url("${document.previewUrl}")` }}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-900">
                        {document.label}
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        {document.file.name} · se subirá al guardar
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemovePendingDocument(document.key)}
                      className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                    >
                      <Trash2 size={14} />
                      Quitar
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-4">
              <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-slate-600">
                    Tipo de documento
                  </span>
                  <select
                    value={documentLabelChoice}
                    onChange={(event) => setDocumentLabelChoice(event.target.value)}
                    className="input"
                  >
                    {DOCUMENT_LABEL_PRESETS.map((preset) => (
                      <option key={preset} value={preset}>
                        {preset}
                      </option>
                    ))}
                  </select>
                </label>

                {documentLabelChoice === "Otro" ? (
                  <label className="block">
                    <span className="mb-1 block text-xs font-medium text-slate-600">
                      Especifica el documento
                    </span>
                    <input
                      type="text"
                      value={customDocumentLabel}
                      onChange={(event) => setCustomDocumentLabel(event.target.value)}
                      className="input"
                      placeholder="Ej. Carta de hospedaje"
                    />
                  </label>
                ) : (
                  <div>
                    <span className="mb-1 block text-xs font-medium text-slate-600">
                      Archivo
                    </span>
                    <label
                      htmlFor="client-document-file"
                      className="flex h-[42px] cursor-pointer items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-700 hover:bg-slate-100"
                    >
                      <UploadCloud size={14} className="shrink-0" />
                      <span className="truncate">
                        {documentFile ? documentFile.name : "Seleccionar archivo"}
                      </span>
                    </label>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleAddDocument}
                  className="inline-flex h-[42px] items-center justify-center gap-1.5 rounded-xl bg-slate-900 px-4 text-sm font-medium text-white hover:bg-slate-700"
                >
                  <Plus size={16} />
                  Agregar
                </button>
              </div>

              {documentLabelChoice === "Otro" && (
                <label
                  htmlFor="client-document-file"
                  className="mt-3 flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-100"
                >
                  <FileText size={14} className="shrink-0" />
                  <span className="truncate">
                    {documentFile ? documentFile.name : "Seleccionar archivo"}
                  </span>
                </label>
              )}

              <input
                id="client-document-file"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleDocumentFileChange}
                className="sr-only"
              />

              {documentError && (
                <p className="mt-2 text-sm text-red-600">{documentError}</p>
              )}
            </div>
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

function formatDateInput(value?: string | null) {
  if (!value) {
    return "";
  }

  return value.slice(0, 10);
}
