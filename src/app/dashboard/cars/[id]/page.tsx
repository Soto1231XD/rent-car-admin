import Link from "next/link";
import { cars } from "@/lib/mock-data";


type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function CarDetailPage({ params }: Props) {
  const { id } = await params;

  const car = cars.find((car) => car.id === Number(id));

  if (!car) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Carro no encontrado
        </h1>

        <Link
          href="/dashboard/cars"
          className="mt-4 inline-block text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          ← Volver a carros
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <Link
            href="/dashboard/cars"
            className="text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            ← Volver a carros
          </Link>

          <h1 className="mt-3 text-2xl font-bold text-slate-900">
            {car.brand} {car.model}
          </h1>

          <p className="mt-1 text-sm text-slate-600">
            Información detallada del vehículo.
          </p>
        </div>

        <Link
          href={`/dashboard/cars/${car.id}/edit`}
          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
        >
          Editar carro
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="rounded-2xl bg-white p-6 shadow lg:col-span-2">
          <h2 className="mb-5 text-lg font-semibold text-slate-900">
            Datos generales
          </h2>

          <div className="grid gap-4 md:grid-cols-2">
            <Info label="Marca" value={car.brand} />
            <Info label="Modelo" value={car.model} />
            <Info label="Año" value={car.year} />
            <Info label="Placa" value={car.plate} />
            <Info label="Color" value={car.color} />
            <Info label="Transmisión" value={car.transmission} />
            <Info label="Combustible" value={car.fuelType} />
            <Info label="Pasajeros" value={car.passengers} />
          </div>

          <div className="mt-6">
            <p className="text-sm font-medium text-slate-500">Descripción</p>
            <p className="mt-1 text-sm text-slate-800">
              {car.description}
            </p>
          </div>
        </section>

        <section className="rounded-2xl bg-white p-6 shadow">
          <h2 className="mb-5 text-lg font-semibold text-slate-900">
            Estado y precios
          </h2>

          <div className="space-y-4">
            <Info label="Estado" value={car.status} />
            <Info
              label="Precio diario"
              value={`$${car.dailyPrice.toLocaleString("es-MX")} MXN`}
            />
            <Info
              label="Precio semanal"
              value={`$${car.weeklyPrice.toLocaleString("es-MX")} MXN`}
            />
            <Info
              label="Precio mensual"
              value={`$${car.monthlyPrice.toLocaleString("es-MX")} MXN`}
            />
          </div>
        </section>
      </div>

      <section className="mt-6 rounded-2xl bg-white p-6 shadow">
        <h2 className="text-lg font-semibold text-slate-900">
          Historial
        </h2>

        <p className="mt-2 text-sm text-slate-600">
          Aquí se mostrará el historial de rentas, mantenimientos y bloqueos del vehículo.
        </p>
      </section>
    </div>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div>
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}