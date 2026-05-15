import Link from "next/link";
import MaintenanceTable from "@/components/maintenance/MaintenanceTable";
import { getMaintenances } from "@/lib/api";

type Props = {
  searchParams: Promise<{
    success?: string;
  }>;
};

export default async function MaintenancePage({ searchParams }: Props) {
  await searchParams;
  const maintenances = await getMaintenances();

  return (
    <div>
      <div className="mb-6 space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Mantenimiento
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Control de servicios y estado de vehículos.
            </p>
          </div>

          <Link
            href="/dashboard/maintenance/new"
            className="inline-flex w-full justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm text-white sm:w-auto"
          >
            Nuevo mantenimiento
          </Link>
        </div>
      </div>

      <MaintenanceTable maintenances={maintenances} />
    </div>
  );
}
