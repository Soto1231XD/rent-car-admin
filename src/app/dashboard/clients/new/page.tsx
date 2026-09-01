import Link from "next/link";
import ClientForm from "@/components/clients/ClientForm";
import { getLead } from "@/lib/api";
import { Lead } from "@/types/lead";
import { formatCarLabel } from "@/lib/car-label";

type Props = {
  searchParams: Promise<{
    fromLead?: string;
  }>;
};

export default async function NewClientPage({ searchParams }: Props) {
  const { fromLead } = await searchParams;
  const lead = fromLead ? await getLead(fromLead) : null;

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/dashboard/clients"
          className="text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          ← Volver a clientes
        </Link>

        <h1 className="mt-3 text-2xl font-bold text-slate-900">
          Agregar cliente
        </h1>

        <p className="mt-1 text-sm text-slate-600">
          {lead
            ? "Completa los datos que falten para convertir esta solicitud en cliente."
            : "Registra la información principal del cliente."}
        </p>
      </div>

      <ClientForm
        mode="create"
        leadId={lead?.id}
        initialData={
          lead
            ? {
                fullName: lead.fullName,
                phone: lead.phone,
                email: lead.email ?? undefined,
                notes: buildLeadNotes(lead),
              }
            : undefined
        }
      />
    </div>
  );
}

function buildLeadNotes(lead: Lead) {
  const parts = [`Convertido desde solicitud web.`];

  parts.push(
    `Vehículo de interés: ${lead.car ? formatCarLabel(lead.car) : "No especificado"}.`
  );

  if (lead.pickupDate || lead.returnDate) {
    parts.push(
      `Fechas: ${lead.pickupDate ?? "?"} – ${lead.returnDate ?? "?"}.`
    );
  }

  if (lead.message) {
    parts.push(`Mensaje: "${lead.message}".`);
  }

  return parts.join(" ");
}
