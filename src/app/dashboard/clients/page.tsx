import Link from "next/link";
import { clients } from "@/lib/mock-data";

export default function ClientsPage() {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Clientes</h1>
          <p className="mt-1 text-sm text-slate-600">
            Administra la información de los clientes registrados.
          </p>
        </div>

        <Link
          href="/dashboard/clients/new"
          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
        >
          Agregar cliente
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-slate-100 text-slate-600">
            <tr>
              <th className="px-6 py-4 font-semibold">Cliente</th>
               <th className="px-6 py-4 font-semibold">Vehículo Rentado</th>
              <th className="px-6 py-4 font-semibold">Teléfono</th>
              <th className="px-6 py-4 font-semibold">Correo</th>
              <th className="px-6 py-4 font-semibold">Licencia</th>
              <th className="px-6 py-4 font-semibold">Acciones</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {clients.map((client) => (
              <tr key={client.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 font-medium text-slate-900">
                  {client.fullName}
                </td>
               <td className="px-6 py-4 text-slate-600">
  {client.rentedCar ?? "Sin vehículo"}
</td>
<td className="px-6 py-4 text-slate-600">{client.phone}</td>
<td className="px-6 py-4 text-slate-600">{client.email}</td>

<td className="px-6 py-4 text-slate-600">
  {client.driverLicenseNumber}
</td>

<td className="px-6 py-4">
  <Link
    href={`/dashboard/clients/${client.id}`}
    className="text-sm font-medium text-slate-900 hover:underline"
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