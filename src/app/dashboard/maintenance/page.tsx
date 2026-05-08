import Link from "next/link";
import MaintenanceTable from "@/components/maintenance/MaintenanceTable";
import { maintenances } from "@/lib/mock-data";

export default function MaintenancePage() {
  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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

      <MaintenanceTable maintenances={maintenances} />
    </div>
  );
}
