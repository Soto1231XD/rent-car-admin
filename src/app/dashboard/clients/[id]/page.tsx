import Link from "next/link";
import { getClient } from "@/lib/api";
import { getAssetUrl } from "@/lib/assets";
import DeleteResourceButton from "@/components/ui/DeleteResourceButton";
import { Rental, RentalStatus } from "@/types/rental";

type Props = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    success?: string;
  }>;
};

export default async function ClientDetailPage({ params, searchParams }: Props) {
  const { id } = await params;
  await searchParams;
  const client = await getClient(id);

  if (!client) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Cliente no encontrado
        </h1>

        <Link
          href="/dashboard/clients"
          className="mt-4 inline-block text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          ← Volver a clientes
        </Link>
      </div>
    );
  }

  const rentals = client.rentals ?? [];
  const activeRental = rentals.find((rental) => rental.status === "ACTIVO");

  return (
    <div>
      <div className="mb-6 space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Link
              href="/dashboard/clients"
              className="text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              ← Volver a clientes
            </Link>

            <h1 className="mt-3 text-2xl font-bold text-slate-900">
              {client.fullName}
            </h1>

            <p className="mt-1 text-sm text-slate-600">
              Información detallada del cliente.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Link
              href={`/dashboard/clients/${client.id}/edit`}
              className="inline-flex w-full justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 sm:w-auto"
            >
              Editar cliente
            </Link>

            <DeleteResourceButton
              id={client.id}
              resourceType="client"
              resourceName={client.fullName}
              redirectTo="/dashboard/clients"
            />
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="rounded-2xl bg-white p-4 shadow sm:p-6 lg:col-span-2">
          <h2 className="mb-5 text-lg font-semibold text-slate-900">
            Datos personales
          </h2>

          <div className="grid gap-4 md:grid-cols-2">
            <Info label="Nombre completo" value={client.fullName} />
            <Info
              label="Tipo de cliente"
              value={client.type === "COMISIONISTA" ? "Comisionista" : "Cliente"}
            />
            <Info label="Correo" value={client.email || "No registrado"} />
            <Info label="Teléfono" value={client.phone} />
            <Info label="Identificación" value={client.idNumber} />
            <Info
              label="Licencia"
              value={client.driverLicenseNumber || "No registrada"}
            />
            {client.address && <Info label="Dirección" value={client.address} />}
          </div>

          {client.idDocumentImage && (
            <div className="mt-5 border-t border-slate-100 pt-5">
              <p className="mb-2 text-sm font-medium text-slate-500">
                Foto de la identificación
              </p>
              <a
                href={getAssetUrl(client.idDocumentImage)}
                target="_blank"
                rel="noreferrer"
                className="block w-fit"
              >
                <div
                  className="h-32 w-52 rounded-xl border border-slate-200 bg-slate-100 bg-cover bg-center shadow-sm transition hover:opacity-90"
                  style={{
                    backgroundImage: `url("${getAssetUrl(client.idDocumentImage)}")`,
                  }}
                />
              </a>
            </div>
          )}
        </section>

        <section className="rounded-2xl bg-white p-4 shadow sm:p-6">
          <h2 className="mb-5 text-lg font-semibold text-slate-900">
            Renta actual
          </h2>

          {activeRental ? (
            <div className="space-y-4">
              <Info label="Vehículo" value={formatCarName(activeRental)} />
              <Info
                label="Periodo"
                value={`${formatDate(activeRental.startDate)} - ${formatDate(activeRental.endDate)}`}
              />
              <Info
                label="Estado"
                value={formatRentalStatus(activeRental.status)}
              />
              <Link
                href={`/dashboard/rentals/${activeRental.id}`}
                className="inline-flex text-sm font-medium text-slate-900 hover:underline"
              >
                Ver renta
              </Link>
            </div>
          ) : (
            <p className="text-sm text-slate-600">Sin renta activa.</p>
          )}
        </section>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl bg-white p-4 shadow sm:p-6">
          <h2 className="mb-5 text-lg font-semibold text-slate-900">
            Contacto de emergencia
          </h2>

          <div className="space-y-4">
            <Info
              label="Nombre"
              value={client.emergencyContactName || "No registrado"}
            />
            <Info
              label="Teléfono"
              value={client.emergencyContactPhone || "No registrado"}
            />
          </div>
        </section>

        <section className="rounded-2xl bg-white p-4 shadow sm:p-6">
          <h2 className="mb-5 text-lg font-semibold text-slate-900">Notas</h2>

          <p className="text-sm text-slate-700">
            {client.notes ?? "Sin notas registradas."}
          </p>
        </section>
      </div>

      <section className="mt-6 rounded-2xl bg-white p-4 shadow sm:p-6">
        <h2 className="text-lg font-semibold text-slate-900">
          Historial de rentas
        </h2>

        {rentals.length === 0 ? (
          <p className="mt-2 text-sm text-slate-600">
            Este cliente todavía no tiene rentas registradas.
          </p>
        ) : (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[680px] border-collapse text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">Vehículo</th>
                  <th className="px-4 py-3 font-semibold">Periodo</th>
                  <th className="px-4 py-3 font-semibold">Estado</th>
                  <th className="px-4 py-3 font-semibold">Total</th>
                  <th className="px-4 py-3 font-semibold">Acción</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {rentals.map((rental) => (
                  <tr key={rental.id}>
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {formatCarName(rental)}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {formatDate(rental.startDate)} - {formatDate(rental.endDate)}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {formatRentalStatus(rental.status)}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {formatCurrency(rental.totalPrice)}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/dashboard/rentals/${rental.id}`}
                        className="font-medium text-slate-900 hover:underline"
                      >
                        Ver detalle
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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

function formatCarName(rental: Rental) {
  if (!rental.car) {
    return "Vehículo no disponible";
  }

  return `${rental.car.brand} ${rental.car.model} ${rental.car.year}`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-MX", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(value);
}

function formatRentalStatus(status: RentalStatus) {
  const labels: Record<RentalStatus, string> = {
    RESERVACION: "Reservación",
    ACTIVO: "Activa",
    COMPLETADO: "Completada",
    CANCELADO: "Cancelada",
  };

  return labels[status];
}
