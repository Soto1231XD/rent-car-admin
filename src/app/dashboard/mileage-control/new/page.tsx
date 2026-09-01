import Link from "next/link";
import MaintenanceForm from "@/components/maintenance/MaintenanceForm";
import { getCars, getMaintenances } from "@/lib/api";

type Props = {
  searchParams: Promise<{
    carId?: string;
  }>;
};

export default async function NewMileageControlPage({ searchParams }: Props) {
  const { carId } = await searchParams;
  const [cars, allMaintenances] = await Promise.all([
    getCars(),
    getMaintenances(),
  ]);
  const revisions = allMaintenances.filter(
    (maintenance) => maintenance.recordType === "REVISION"
  );

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/dashboard/mileage-control"
          className="text-sm text-slate-600 hover:text-slate-900"
        >
          ← Volver a control de kilometraje
        </Link>

        <h1 className="mt-3 text-2xl font-bold text-slate-900">
          Nueva revisión de kilometraje
        </h1>
      </div>

      <MaintenanceForm
        mode="create"
        cars={cars}
        initialData={{ carId }}
        recordType="REVISION"
        redirectBase="/dashboard/mileage-control"
        revisions={revisions}
      />
    </div>
  );
}
