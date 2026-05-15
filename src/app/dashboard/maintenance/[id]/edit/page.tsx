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

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/dashboard/maintenance"
          className="text-sm text-slate-600 hover:text-slate-900"
        >
          ← Volver a mantenimiento
        </Link>

        <h1 className="mt-3 text-2xl font-bold text-slate-900">
          Editar mantenimiento
        </h1>
      </div>

      <MaintenanceForm
        mode="edit"
        cars={cars}
        initialData={maintenance}
        maintenanceId={maintenance.id}
      />
    </div>
  );
}
