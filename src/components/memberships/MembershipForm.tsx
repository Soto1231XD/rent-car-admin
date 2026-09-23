"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { Check, Copy } from "lucide-react";
import { Client } from "@/types/client";
import { createMembershipResult } from "@/lib/api-client";
import FormAlert from "@/components/ui/FormAlert";
import { showErrorToast } from "@/lib/toast";

type Props = {
  clients: Client[];
};

type RenewalType = "AUTOMATICA" | "MANUAL";

export default function MembershipForm({ clients }: Props) {
  const [clientId, setClientId] = useState("");
  const [renewalType, setRenewalType] = useState<RenewalType>("AUTOMATICA");
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{
    membershipId: string;
    checkoutUrl: string;
    clientPhone: string;
  } | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsSaving(true);

    const selectedClient = clients.find((client) => client.id === clientId);
    const response = await createMembershipResult({
      clientId,
      renewalType,
      notes: notes || undefined,
    });

    setIsSaving(false);

    if (!response.data) {
      const message =
        response.error ?? "No se pudo crear la membresía. Intenta de nuevo.";
      setError(message);
      showErrorToast(message);
      return;
    }

    setResult({
      membershipId: response.data.membership.id,
      checkoutUrl: response.data.checkoutUrl,
      clientPhone: selectedClient?.phone ?? "",
    });
  };

  if (result) {
    const whatsappUrl = result.clientPhone
      ? `https://wa.me/${result.clientPhone.replace(/\D/g, "")}?text=${encodeURIComponent(
          `Hola, aquí está tu link de pago para tu membresía Rentamivar: ${result.checkoutUrl}`
        )}`
      : null;

    return (
      <div className="rounded-2xl bg-white p-4 shadow sm:p-6">
        <h2 className="text-lg font-semibold text-slate-900">
          Membresía creada
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Comparte este link de pago con el cliente para que active su
          membresía.
        </p>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
          <input
            readOnly
            value={result.checkoutUrl}
            className="input flex-1"
            onFocus={(event) => event.currentTarget.select()}
          />
          <button
            type="button"
            onClick={async () => {
              await navigator.clipboard.writeText(result.checkoutUrl);
              setIsCopied(true);
              setTimeout(() => setIsCopied(false), 2000);
            }}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            {isCopied ? <Check size={16} /> : <Copy size={16} />}
            {isCopied ? "Copiado" : "Copiar"}
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-xl bg-[#25D366] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1fbd5a]"
            >
              Enviar por WhatsApp
            </a>
          )}
          <Link
            href={`/dashboard/memberships/${result.membershipId}`}
            className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Ver membresía
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section className="rounded-2xl bg-white p-4 shadow sm:p-6">
        <h2 className="mb-6 text-lg font-semibold text-slate-900">
          Nueva membresía
        </h2>

        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Cliente">
            <select
              required
              value={clientId}
              onChange={(event) => setClientId(event.target.value)}
              className="input"
            >
              <option value="">Selecciona un cliente</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.fullName}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Notas (opcional)">
            <input
              type="text"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              className="input"
              placeholder="Observaciones..."
            />
          </Field>
        </div>

        <fieldset className="mt-5">
          <legend className="mb-2 block text-sm font-medium text-slate-700">
            Tipo de renovación
          </legend>

          <div className="grid gap-3 sm:grid-cols-2">
            <label
              className={`flex cursor-pointer flex-col rounded-xl border p-4 text-sm transition ${
                renewalType === "AUTOMATICA"
                  ? "border-slate-900 bg-slate-50 ring-1 ring-slate-900"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <span className="flex items-center gap-2 font-semibold text-slate-900">
                <input
                  type="radio"
                  name="renewalType"
                  checked={renewalType === "AUTOMATICA"}
                  onChange={() => setRenewalType("AUTOMATICA")}
                />
                Renovación automática
              </span>
              <span className="mt-1 text-slate-600">
                El cliente autoriza su tarjeta una vez; Mercado Pago cobra
                solo cada mes.
              </span>
            </label>

            <label
              className={`flex cursor-pointer flex-col rounded-xl border p-4 text-sm transition ${
                renewalType === "MANUAL"
                  ? "border-slate-900 bg-slate-50 ring-1 ring-slate-900"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <span className="flex items-center gap-2 font-semibold text-slate-900">
                <input
                  type="radio"
                  name="renewalType"
                  checked={renewalType === "MANUAL"}
                  onChange={() => setRenewalType("MANUAL")}
                />
                Sin renovación automática
              </span>
              <span className="mt-1 text-slate-600">
                El cliente paga cada mes por su cuenta; no se guarda ninguna
                tarjeta.
              </span>
            </label>
          </div>
        </fieldset>
      </section>

      {error && <FormAlert message={error} />}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link
          href="/dashboard/memberships"
          className="rounded-xl border border-slate-300 px-5 py-2 text-center text-sm font-medium text-slate-700 hover:bg-slate-100"
        >
          Cancelar
        </Link>

        <button
          type="submit"
          disabled={isSaving}
          className="rounded-xl bg-slate-900 px-5 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {isSaving ? "Generando link de pago..." : "Crear membresía"}
        </button>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">
        {label}
      </span>
      {children}
    </label>
  );
}
