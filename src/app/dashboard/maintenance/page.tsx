import Link from "next/link";
import { maintenances } from "@/lib/mock-data";

export default function MaintenancePage() {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
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
          className="rounded-xl bg-slate-900 px-4 py-2 text-sm text-white"
        >
          Nuevo mantenimiento
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100 text-slate-600">
            <tr>
              <th className="px-6 py-4">Vehículo</th>
              <th className="px-6 py-4">Servicio</th>
              <th className="px-6 py-4">Fecha</th>
              <th className="px-6 py-4">Costo</th>
              <th className="px-6 py-4">Estado</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {maintenances.map((m) => (
              <tr key={m.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 text-slate-900">
                  {m.carName}
                </td>

                <td className="px-6 py-4 text-slate-900">
                  {m.serviceType}
                </td>

                <td className="px-6 py-4 text-slate-900">
                  {m.date}
                </td>

                <td className="px-6 py-4 text-slate-900">
                  ${m.cost}
                </td>

                <td className="px-6 py-4">
                  <span className="rounded-full bg-slate-100 text-black px-3 py-1 text-xs">
                    {m.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}