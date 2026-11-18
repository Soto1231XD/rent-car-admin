"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { FileText, Plus, Trash2, UploadCloud, X } from "lucide-react";
import { Client } from "@/types/client";
import { Quote } from "@/types/quote";
import FormAlert from "@/components/ui/FormAlert";
import {
  addClientDocumentResult,
  createRentalFromQuoteResult,
  CreateRentalFromQuotePayload,
} from "@/lib/api-client";
import {
  formatCurrencyInput,
  formatCurrencyInputValue,
  toMoneyNumber,
} from "@/lib/format-currency";
import { showErrorToast } from "@/lib/toast";

// Mismas sugerencias de etiqueta que ClientForm.tsx -- "Otro" permite
// escribir cualquier etiqueta libre.
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

type Props = {
  quote: Quote;
  clients: Client[];
  isOpen: boolean;
  onClose: () => void;
  onCreated: (rentalId: string) => void;
};

export default function CreateRentalFromQuoteModal({
  quote,
  clients,
  isOpen,
  onClose,
  onCreated,
}: Props) {
  const [clientMode, setClientMode] = useState<"existing" | "new">(
    clients.length > 0 ? "existing" : "new"
  );
  const [clientId, setClientId] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [address, setAddress] = useState("");
  const [advancePayment, setAdvancePayment] = useState("");
  const [depositAmount, setDepositAmount] = useState(
    formatCurrencyInputValue(quote.deposit)
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Documentos del cliente nuevo (identificación, comprobante, etc.) -- solo
  // aplica cuando clientMode === "new"; se suben hasta que la renta se crea,
  // igual que en ClientForm.tsx.
  const [pendingDocuments, setPendingDocuments] = useState<PendingDocument[]>([]);
  const [documentLabelChoice, setDocumentLabelChoice] = useState(
    DOCUMENT_LABEL_PRESETS[0]
  );
  const [customDocumentLabel, setCustomDocumentLabel] = useState("");
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [documentError, setDocumentError] = useState("");

  const isComisionista = quote.renterType === "COMISIONISTA";

  const handleDocumentFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    setDocumentFile(event.target.files?.[0] ?? null);
  };

  const handleAddDocument = () => {
    const label =
      documentLabelChoice === "Otro" ? customDocumentLabel.trim() : documentLabelChoice;

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
      "quote-rental-document-file"
    ) as HTMLInputElement | null;
    if (fileInput) {
      fileInput.value = "";
    }
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

  useEffect(() => {
    return () => {
      pendingDocuments.forEach((document) => URL.revokeObjectURL(document.previewUrl));
    };
    // Solo se ejecuta al desmontar: revoca todas las previews creadas.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isSubmitting) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen || typeof document === "undefined") {
    return null;
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");

    if (clientMode === "existing" && !clientId) {
      setError("Selecciona un cliente existente.");
      return;
    }

    if (clientMode === "new") {
      if (!fullName.trim() || !phone.trim()) {
        setError("Nombre y teléfono son obligatorios para el cliente nuevo.");
        return;
      }

      if (!isComisionista && !idNumber.trim()) {
        setError("La identificación es obligatoria para clientes que no son comisionistas.");
        return;
      }
    }

    const payload: CreateRentalFromQuotePayload =
      clientMode === "existing"
        ? { clientId }
        : {
            fullName: fullName.trim(),
            phone: phone.trim(),
            email: email.trim() || undefined,
            idNumber: idNumber.trim() || undefined,
            address: address.trim() || undefined,
          };

    payload.advancePayment = advancePayment ? toMoneyNumber(advancePayment) : undefined;
    payload.depositAmount = depositAmount ? toMoneyNumber(depositAmount) : undefined;

    setIsSubmitting(true);
    const result = await createRentalFromQuoteResult(quote.id, payload);

    if (!result.data) {
      setIsSubmitting(false);
      setError(result.error ?? "No se pudo crear la renta. Intenta de nuevo.");
      return;
    }

    if (clientMode === "new" && pendingDocuments.length > 0) {
      const documentErrors: string[] = [];

      for (const document of pendingDocuments) {
        const uploadResult = await addClientDocumentResult(
          result.data.clientId,
          document.label,
          document.file
        );
        if (!uploadResult.data) {
          documentErrors.push(
            uploadResult.error ?? `No se pudo subir "${document.label}".`
          );
        }
      }

      if (documentErrors.length > 0) {
        showErrorToast(
          `La renta se creó, pero hubo problemas al subir documentos: ${documentErrors.join(" ")}`
        );
      }
    }

    setIsSubmitting(false);

    onCreated(result.data.id);
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-rental-from-quote-title"
      onMouseDown={() => {
        if (!isSubmitting) onClose();
      }}
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl ring-1 ring-slate-200 sm:p-6"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="create-rental-from-quote-title" className="text-lg font-semibold text-slate-900">
              Crear renta desde {quote.folio}
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              El auto, las fechas y el precio se toman de la cotización. Solo falta el cliente.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed"
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {error && <FormAlert message={error} />}

          <div className="flex gap-2 rounded-xl bg-slate-100 p-1 text-sm font-medium">
            <button
              type="button"
              onClick={() => setClientMode("existing")}
              className={`flex-1 rounded-lg px-3 py-1.5 ${
                clientMode === "existing" ? "bg-white text-slate-900 shadow" : "text-slate-500"
              }`}
            >
              Cliente existente
            </button>
            <button
              type="button"
              onClick={() => setClientMode("new")}
              className={`flex-1 rounded-lg px-3 py-1.5 ${
                clientMode === "new" ? "bg-white text-slate-900 shadow" : "text-slate-500"
              }`}
            >
              Cliente nuevo
            </button>
          </div>

          {clientMode === "existing" ? (
            <div className="space-y-2">
              <select
                value={clientId}
                onChange={(event) => setClientId(event.target.value)}
                className="input"
              >
                <option value="">Selecciona un cliente</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.fullName} · {client.phone}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Nombre completo *">
                <input
                  type="text"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  className="input"
                />
              </Field>
              <Field label="Teléfono *">
                <input
                  type="text"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  className="input"
                />
              </Field>
              <Field label="Correo">
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="input"
                />
              </Field>
              <Field label={isComisionista ? "Identificación" : "Identificación *"}>
                <input
                  type="text"
                  value={idNumber}
                  onChange={(event) => setIdNumber(event.target.value)}
                  className="input"
                />
              </Field>
              <Field label="Dirección" className="sm:col-span-2">
                <input
                  type="text"
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                  className="input"
                />
              </Field>

              <div className="sm:col-span-2">
                <span className="mb-1 block text-sm font-medium text-slate-700">
                  Documentos del cliente
                </span>
                <p className="mb-3 text-xs leading-5 text-slate-500">
                  Opcional. Identificación, comprobante de domicilio, itinerario de
                  vuelo o reserva de hospedaje. Formatos JPG, PNG, WEBP o PDF.
                </p>

                {pendingDocuments.length > 0 && (
                  <ul className="mb-3 space-y-2">
                    {pendingDocuments.map((document) => (
                      <li
                        key={document.key}
                        className="flex items-center gap-3 rounded-xl border border-dashed border-blue-300 bg-blue-50/40 p-3"
                      >
                        {document.file.type === "application/pdf" ? (
                          <div className="flex h-14 w-20 shrink-0 items-center justify-center rounded-lg bg-slate-100 ring-1 ring-slate-200">
                            <FileText size={22} className="text-slate-500" />
                          </div>
                        ) : (
                          <div
                            className="h-14 w-20 shrink-0 rounded-lg bg-slate-100 bg-cover bg-center ring-1 ring-slate-200"
                            style={{ backgroundImage: `url("${document.previewUrl}")` }}
                          />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-slate-900">
                            {document.label}
                          </p>
                          <p className="truncate text-xs text-slate-500">
                            {document.file.name} · se subirá al crear la renta
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
                      <div className="min-w-0">
                        <span className="mb-1 block text-xs font-medium text-slate-600">
                          Archivo
                        </span>
                        <label
                          htmlFor="quote-rental-document-file"
                          className="flex h-[42px] min-w-0 cursor-pointer items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-700 hover:bg-slate-100"
                        >
                          <UploadCloud size={14} className="shrink-0" />
                          <span className="min-w-0 flex-1 truncate">
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
                      htmlFor="quote-rental-document-file"
                      className="mt-3 flex min-w-0 cursor-pointer items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-100"
                    >
                      <FileText size={14} className="shrink-0" />
                      <span className="min-w-0 flex-1 truncate">
                        {documentFile ? documentFile.name : "Seleccionar archivo"}
                      </span>
                    </label>
                  )}

                  <input
                    id="quote-rental-document-file"
                    type="file"
                    accept="image/png,image/jpeg,image/webp,application/pdf"
                    onChange={handleDocumentFileChange}
                    className="sr-only"
                  />

                  {documentError && (
                    <p className="mt-2 text-sm text-red-600">{documentError}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Anticipo recibido">
              <input
                type="text"
                inputMode="decimal"
                value={advancePayment}
                onChange={(event) => setAdvancePayment(event.target.value)}
                onInput={formatCurrencyInput}
                placeholder="0"
                className="input"
              />
            </Field>
            <Field label="Depósito en garantía">
              <input
                type="text"
                inputMode="decimal"
                value={depositAmount}
                onChange={(event) => setDepositAmount(event.target.value)}
                onInput={formatCurrencyInput}
                className="input"
              />
            </Field>
          </div>

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {isSubmitting ? "Creando..." : "Crear renta"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block text-sm ${className}`}>
      <span className="mb-1 block font-medium text-slate-700">{label}</span>
      {children}
    </label>
  );
}
