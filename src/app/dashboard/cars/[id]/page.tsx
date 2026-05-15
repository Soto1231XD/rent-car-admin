import Link from "next/link";
import { getCar } from "@/lib/api";
import { getAssetUrl } from "@/lib/assets";
import DeleteResourceButton from "@/components/ui/DeleteResourceButton";

type Props = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    success?: string;
  }>;
};

export default async function CarDetailPage({ params, searchParams }: Props) {
  const { id } = await params;
  await searchParams;
  const car = await getCar(id);

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

  const features = car.features ?? [];

  return (
    <div>
      <div className="mb-6 space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
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

          <div className="flex flex-col gap-2 sm:flex-row">
            <Link
              href={`/dashboard/cars/${car.id}/edit`}
              className="inline-flex w-full justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 sm:w-auto"
            >
              Editar carro
            </Link>

            <DeleteResourceButton
              id={car.id}
              resourceType="car"
              resourceName={`${car.brand} ${car.model} ${car.plate}`}
              redirectTo="/dashboard/cars"
            />
          </div>
        </div>
      </div>

      {car.images.length > 0 && (
        <section className="mb-6 overflow-hidden rounded-2xl bg-white shadow">
          <div
            className="h-64 bg-slate-200 bg-cover bg-center sm:h-80"
            style={{ backgroundImage: `url("${getAssetUrl(car.images[0])}")` }}
          />

          {car.images.length > 1 && (
            <div className="grid gap-3 p-4 sm:grid-cols-3 lg:grid-cols-5">
              {car.images.slice(1).map((image) => (
                <div
                  key={image}
                  className="h-24 rounded-xl bg-slate-200 bg-cover bg-center"
                  style={{ backgroundImage: `url("${getAssetUrl(image)}")` }}
                />
              ))}
            </div>
          )}
        </section>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="rounded-2xl bg-white p-4 shadow sm:p-6 lg:col-span-2">
          <h2 className="mb-5 text-lg font-semibold text-slate-900">
            Datos generales
          </h2>

          <div className="grid gap-4 md:grid-cols-2">
            <Info label="Marca" value={car.brand} />
            <Info label="Modelo" value={car.model} />
            <Info label="Año" value={car.year} />
            <Info label="Placa" value={car.plate} />
            <Info label="Color" value={car.color} />
            <Info label="Transmisión" value={formatTransmission(car.transmission)} />
            <Info label="Pasajeros" value={car.passengers} />
            <Info label="Imágenes" value={car.images.length} />
          </div>

          <div className="mt-6">
            <p className="text-sm font-medium text-slate-500">Descripción</p>
            <p className="mt-1 text-sm text-slate-800">
              {car.description || "Sin descripción registrada."}
            </p>
          </div>

          <div className="mt-6">
            <p className="text-sm font-medium text-slate-500">
              Características
            </p>

            {features.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {features.map((feature) => (
                  <span
                    key={feature}
                    className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            ) : (
              <p className="mt-1 text-sm text-slate-800">
                Sin características registradas.
              </p>
            )}
          </div>
        </section>

        <section className="rounded-2xl bg-white p-4 shadow sm:p-6">
          <h2 className="mb-5 text-lg font-semibold text-slate-900">
            Estado y precios
          </h2>

          <div className="space-y-4">
            <Info label="Estado" value={formatStatus(car.status)} />
            <Info
              label="Precio diario"
              value={`$${car.dailyPrice.toLocaleString("es-MX")} MXN`}
            />
            <Info
              label="Temporada alta"
              value={
                car.highSeasonPrice
                  ? `$${car.highSeasonPrice.toLocaleString("es-MX")} MXN`
                  : "No definido"
              }
            />
            <Info
              label="Depósito"
              value={
                car.deposit
                  ? `$${car.deposit.toLocaleString("es-MX")} MXN`
                  : "No definido"
              }
            />
          </div>
        </section>
      </div>

      <section className="mt-6 rounded-2xl bg-white p-4 shadow sm:p-6">
        <h2 className="text-lg font-semibold text-slate-900">Historial</h2>

        <p className="mt-2 text-sm text-slate-600">
          Aquí se mostrará el historial de rentas, mantenimientos y bloqueos del vehículo.
        </p>
      </section>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function formatTransmission(transmission: string) {
  return transmission === "AUTOMATICO" ? "Automática" : "Estándar";
}

function formatStatus(status: string) {
  const labels: Record<string, string> = {
    DISPONIBLE: "Disponible",
    RENTADO: "Rentado",
    MANTENIMIENTO: "Mantenimiento",
    NO_DISPONIBLE: "No disponible",
  };

  return labels[status] ?? status;
}
