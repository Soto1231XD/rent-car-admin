import Link from "next/link";
import { AlertTriangle, CheckCircle2, Clock, IdCard, XCircle } from "lucide-react";
import MembershipsTable from "@/components/memberships/MembershipsTable";
import MembershipAutoRefresh from "@/components/memberships/MembershipAutoRefresh";
import SummaryCard from "@/components/ui/SummaryCard";
import { getMemberships } from "@/lib/api";

type Props = {
  searchParams: Promise<{
    success?: string;
  }>;
};

export default async function MembershipsPage({ searchParams }: Props) {
  await searchParams;
  const memberships = await getMemberships();

  const activeCount = memberships.filter((m) => m.status === "ACTIVA").length;
  const pendingCount = memberships.filter((m) => m.status === "PENDIENTE").length;
  const atRiskCount = memberships.filter(
    (m) => m.status === "INACTIVA" || m.status === "SUSPENDIDA"
  ).length;
  const cancelledCount = memberships.filter((m) => m.status === "CANCELADA").length;

  return (
    <div>
      <MembershipAutoRefresh
        hasPending={memberships.some(
          (m) => m.status === "PENDIENTE" || m.status === "INACTIVA"
        )}
      />

      <div className="mb-6 space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Membresías</h1>
            <p className="mt-1 text-sm text-slate-600">
              Administra las membresías de los clientes y su estado de pago.
            </p>
          </div>

          <Link
            href="/dashboard/memberships/new"
            className="inline-flex w-full justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 sm:w-auto"
          >
            Agregar membresía
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <SummaryCard
            title="Total membresías"
            value={memberships.length}
            detail="Registradas en el sistema"
            icon={<IdCard />}
            valueClassName="text-3xl"
          />
          <SummaryCard
            title="Activas"
            value={activeCount}
            detail="Al corriente de pago"
            icon={<CheckCircle2 />}
            valueClassName="text-3xl"
          />
          <SummaryCard
            title="Pendientes"
            value={pendingCount}
            detail="Sin primer pago confirmado"
            icon={<Clock />}
            valueClassName="text-3xl"
          />
          <SummaryCard
            title="En riesgo"
            value={atRiskCount}
            detail="En gracia o suspendidas"
            icon={<AlertTriangle />}
            valueClassName="text-3xl"
          />
          <SummaryCard
            title="Canceladas"
            value={cancelledCount}
            detail="Ya no están activas"
            icon={<XCircle />}
            valueClassName="text-3xl"
          />
        </div>
      </div>

      <MembershipsTable memberships={memberships} />
    </div>
  );
}
