import Link from "next/link";
import QRCode from "qrcode";
import { notFound } from "next/navigation";
import DeleteResourceButton from "@/components/ui/DeleteResourceButton";
import ResendMembershipPaymentLinkButton from "@/components/memberships/ResendMembershipPaymentLinkButton";
import MembershipAutoRefresh from "@/components/memberships/MembershipAutoRefresh";
import { getMembership } from "@/lib/api";
import { formatCurrency } from "@/lib/format-currency";

const STATUS_LABELS: Record<string, string> = {
  PENDIENTE: "Pendiente",
  ACTIVA: "Activa",
  GRACIA: "En gracia",
  INACTIVA: "Inactiva",
  CANCELADA: "Cancelada",
};

function getWebBaseUrl() {
  return process.env.PUBLIC_WEB_URL ?? "http://localhost:3001";
}

type Props = {
  params: Promise<{ id: string }>;
};

export default async function MembershipDetailPage({ params }: Props) {
  const { id } = await params;
  const membership = await getMembership(id);

  if (!membership) {
    notFound();
  }

  const cardUrl = `${getWebBaseUrl()}/membresia/tarjeta/${membership.id}`;
  const qrDataUrl = await QRCode.toDataURL(cardUrl, { margin: 1, width: 240 }).catch(
    () => null
  );
  const clientName = membership.client?.fullName ?? "Cliente no disponible";
  const isActionable =
    membership.status === "PENDIENTE" ||
    membership.status === "GRACIA" ||
    membership.status === "INACTIVA";

  return (
    <div>
      <MembershipAutoRefresh hasPending={membership.status === "PENDIENTE"} />

      <div className="mb-6 space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Link
              href="/dashboard/memberships"
              className="text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              ← Volver a membresías
            </Link>

            <h1 className="mt-3 text-2xl font-bold text-slate-900">
              {clientName}
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              {STATUS_LABELS[membership.status]} ·{" "}
              {membership.renewalType === "AUTOMATICA"
                ? "Renovación automática"
                : "Sin renovación automática"}
            </p>
          </div>

          <DeleteResourceButton
            id={membership.id}
            resourceType="membership"
            resourceName={`la membresía de ${clientName}`}
            redirectTo="/dashboard/memberships"
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="rounded-2xl bg-white p-4 shadow sm:p-6 lg:col-span-2">
          <h2 className="mb-5 text-lg font-semibold text-slate-900">
            Datos de la membresía
          </h2>

          <div className="grid gap-4 md:grid-cols-2">
            <Info label="Cliente" value={clientName} />
            <Info label="Teléfono" value={membership.client?.phone ?? "—"} />
            <Info label="Estado" value={STATUS_LABELS[membership.status]} />
            <Info
              label="Renovación"
              value={
                membership.renewalType === "AUTOMATICA" ? "Automática" : "Manual"
              }
            />
            <Info label="Inicio" value={formatDate(membership.startDate)} />
            <Info
              label="Vigente hasta"
              value={formatDate(membership.currentPeriodEnd)}
            />
            {membership.graceEndsAt && (
              <Info
                label="Gracia hasta"
                value={formatDate(membership.graceEndsAt)}
              />
            )}
            {membership.notes && <Info label="Notas" value={membership.notes} />}
          </div>

          {isActionable && (
            <div className="mt-6 border-t border-slate-200 pt-5">
              <h3 className="mb-2 text-sm font-semibold text-slate-900">
                Link de pago
              </h3>
              <ResendMembershipPaymentLinkButton membershipId={membership.id} />
            </div>
          )}
        </section>

        <section className="rounded-2xl bg-white p-4 text-center shadow sm:p-6">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">
            Tarjeta digital
          </h2>

          {qrDataUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={qrDataUrl} alt="Código QR de la membresía" className="mx-auto h-40 w-40" />
          )}

          <p className="mt-3 break-all text-xs text-slate-500">{cardUrl}</p>
          <p className="mt-2 text-xs text-slate-500">
            El staff puede escanearlo en mostrador; el cliente lo puede
            guardar como tarjeta digital.
          </p>
        </section>
      </div>

      <section className="mt-6 rounded-2xl bg-white p-4 shadow sm:p-6">
        <h2 className="mb-5 text-lg font-semibold text-slate-900">
          Historial de pagos
        </h2>

        {!membership.payments || membership.payments.length === 0 ? (
          <p className="text-sm text-slate-500">
            Aún no hay pagos registrados para esta membresía.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">Fecha</th>
                  <th className="px-4 py-3 font-semibold">Monto</th>
                  <th className="px-4 py-3 font-semibold">Estado</th>
                  <th className="px-4 py-3 font-semibold">Periodo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {membership.payments.map((payment) => (
                  <tr key={payment.id}>
                    <td className="px-4 py-3 text-slate-900">
                      {formatDate(payment.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-slate-900">
                      {formatCurrency(payment.amount)}
                    </td>
                    <td className="px-4 py-3 text-slate-900">{payment.status}</td>
                    <td className="px-4 py-3 text-slate-900">
                      {payment.periodStart && payment.periodEnd
                        ? `${formatDate(payment.periodStart)} – ${formatDate(payment.periodEnd)}`
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
  return value ? value.slice(0, 10) : "—";
}
