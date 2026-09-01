import Link from "next/link";
import { notFound } from "next/navigation";
import MaintenanceForm from "@/components/maintenance/MaintenanceForm";
import { getCars, getMaintenance } from "@/lib/api";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditMaintenancePage({ params }: Props) {
  const { id } = await params;
  const [maintenance, cars] = await Promise.all([
    getMaintenance(id),
    getCars(),
  ]);

  if (!maintenance) {
    notFound();
  }

  const isRevision = maintenance.recordType === "REVISION";
  const redirectBase = isRevision
    ? "/dashboard/mileage-control"
    : "/dashboard/maintenance";

  return (
    <div>
      <div className="mb-6">
        <Link
          href={redirectBase}
          className="text-sm text-slate-600 hover:text-slate-900"
        >
          ← Volver a {isRevision ? "control de kilometraje" : "mantenimiento"}
        </Link>

        <h1 className="mt-3 text-2xl font-bold text-slate-900">
          Editar {isRevision ? "revisión de kilometraje" : "mantenimiento"}
        </h1>
      </div>

      <MaintenanceForm
        mode="edit"
        recordType={maintenance.recordType}
        cars={cars}
        initialData={maintenance}
        maintenanceId={maintenance.id}
        redirectBase={redirectBase}
      />
    </div>
  );
}
