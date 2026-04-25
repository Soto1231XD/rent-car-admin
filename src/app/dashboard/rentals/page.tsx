import Link from "next/link";
import { rentals } from "@/lib/mock-data";

export default function RentalsPage() {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Rentas
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Gestiona las rentas activas y pasadas.
          </p>
        </div>

        <Link
          href="/dashboard/rentals/new"
          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
        >
          Nueva renta
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100 text-slate-600">
            <tr>
              <th className="px-6 py-4">Cliente</th>
              <th className="px-6 py-4">Vehículo</th>
              <th className="px-6 py-4">Inicio</th>
              <th className="px-6 py-4">Fin</th>
              <th className="px-6 py-4">Total</th>
              <th className="px-6 py-4">Estado</th>
              <th className="px-6 py-4">Acciones</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {rentals.map((rental) => (
              <tr key={rental.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 font-medium text-slate-900">
                  {rental.clientName}
                </td>

                <td className="px-6 py-4 text-slate-900">{rental.carName}</td>

                <td className="px-6 py-4 text-slate-900">{rental.startDate}</td>

                <td className="px-6 py-4 text-slate-900">{rental.endDate}</td>

                <td className="px-6 py-4 text-slate-900">
                  ${rental.totalPrice.toLocaleString("es-MX")} MXN
                </td>

                <td className="px-6 py-4">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-900">
                    {rental.status}
                  </span>
                </td>

                <td className="px-6 py-4 text-slate-900">
                  <Link
                    href={`/dashboard/rentals/${rental.id}`}
                    className="text-sm font-medium hover:underline"
                  >
                    Ver detalle
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}