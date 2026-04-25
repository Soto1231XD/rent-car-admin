import Link from "next/link";
import MaintenanceForm from "@/components/maintenance/MaintenanceForm";

export default function NewMaintenancePage() {
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
          Nuevo mantenimiento
        </h1>
      </div>

      <MaintenanceForm />
    </div>
  );
}