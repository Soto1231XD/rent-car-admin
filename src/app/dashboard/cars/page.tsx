import Link from "next/link";
import { cars} from "@/lib/mock-data";

export default function CarsPage() {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Carros
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Administra los vehículos disponibles para renta.
          </p>
        </div>

        <Link
  href="/dashboard/cars/new"
  className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
>
  Agregar carro
</Link>
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-slate-100 text-slate-600">
            <tr>
              <th className="px-6 py-4 font-semibold">Vehículo</th>
              <th className="px-6 py-4 font-semibold">Año</th>
              <th className="px-6 py-4 font-semibold">Placa</th>
              <th className="px-6 py-4 font-semibold">Estado</th>
              <th className="px-6 py-4 font-semibold">Precio diario</th>
              <th className="px-6 py-4 font-semibold">Acciones</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {cars.map((car) => (
              <tr key={car.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 font-medium text-slate-900">
                  {car.brand} {car.model}
                </td>

                <td className="px-6 py-4 text-slate-600">
                  {car.year}
                </td>

                <td className="px-6 py-4 text-slate-600">
                  {car.plate}
                </td>

                <td className="px-6 py-4">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                    {car.status}
                  </span>
                </td>

                <td className="px-6 py-4 text-slate-600">
                  ${car.dailyPrice.toLocaleString("es-MX")} MXN
                </td>

                <td className="px-6 py-4">
                  <Link
  href={`/dashboard/cars/${car.id}`}
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