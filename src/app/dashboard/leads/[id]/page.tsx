import Link from "next/link";
import { getLead } from "@/lib/api";
import LeadStatusSelect from "@/components/leads/LeadStatusSelect";
import StatusBadge from "@/components/ui/StatusBadge";
import { formatCarLabel } from "@/lib/car-label";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function LeadDetailPage({ params }: Props) {
  const { id } = await params;
  const lead = await getLead(id);

  if (!lead) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Solicitud no encontrada
        </h1>

        <Link
          href="/dashboard/leads"
          className="mt-4 inline-block text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          ← Volver a solicitudes
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href="/dashboard/leads"
            className="text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            ← Volver a solicitudes
          </Link>

          <h1 className="mt-3 text-2xl font-bold text-slate-900">
            {lead.fullName}
          </h1>

          <p className="mt-1 text-sm text-slate-600">
            Solicitud de información recibida desde el sitio web.
          </p>

          <div className="mt-2">
            <StatusBadge status={lead.status} />
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          {lead.status !== "CONVERTIDA" && (
            <>
              <LeadStatusSelect leadId={lead.id} status={lead.status} />

              <Link
                href={`/dashboard/clients/new?fromLead=${lead.id}`}
                className="inline-flex w-full justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 sm:w-auto"
              >
                Convertir en cliente
              </Link>
            </>
          )}

          {lead.status === "CONVERTIDA" && lead.convertedClientId && (
            <Link
              href={`/dashboard/clients/${lead.convertedClientId}`}
              className="inline-flex w-full justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 sm:w-auto"
            >
              Ver cliente
            </Link>
          )}
        </div>
      </div>

      <section className="rounded-2xl bg-white p-4 shadow sm:p-6">
        <h2 className="mb-5 text-lg font-semibold text-slate-900">
          Datos de contacto
        </h2>

        <div className="grid gap-4 md:grid-cols-2">
          <Info label="Nombre completo" value={lead.fullName} />
          <Info label="Teléfono" value={lead.phone} />
          <Info label="Correo" value={lead.email || "No registrado"} />
          <Info
            label="Vehículo de interés"
            value={lead.car ? formatCarLabel(lead.car) : "No especificado"}
          />
          <Info label="Fecha de entrega" value={formatDate(lead.pickupDate)} />
          <Info label="Fecha de devolución" value={formatDate(lead.returnDate)} />
        </div>

        <div className="mt-5 border-t border-slate-100 pt-5">
          <p className="text-sm font-medium text-slate-500">Mensaje</p>
          <p className="mt-1 text-sm text-slate-900">
            {lead.message || "Sin mensaje."}
          </p>
        </div>
      </section>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function formatDate(value?: string | null) {
  if (!value) {
    return "No especificada";
  }

  return new Intl.DateTimeFormat("es-MX", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}
