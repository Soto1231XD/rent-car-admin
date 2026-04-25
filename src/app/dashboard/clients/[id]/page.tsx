import Link from "next/link";
import { clients } from "@/lib/mock-data";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ClientDetailPage({ params }: Props) {
  const { id } = await params;

  const client = clients.find((client) => client.id === Number(id));

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

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
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

        <Link
          href={`/dashboard/clients/${client.id}/edit`}
          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
        >
          Editar cliente
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="rounded-2xl bg-white p-6 shadow lg:col-span-2">
          <h2 className="mb-5 text-lg font-semibold text-slate-900">
            Datos personales
          </h2>

          <div className="grid gap-4 md:grid-cols-2">
            <Info label="Nombre completo" value={client.fullName} />
            <Info label="Correo" value={client.email} />
            <Info label="Teléfono" value={client.phone} />
            <Info label="Identificación" value={client.idNumber} />
            <Info label="Licencia" value={client.driverLicenseNumber} />
            <Info label="Dirección" value={client.address} />
          </div>
        </section>

        <section className="rounded-2xl bg-white p-6 shadow">
          <h2 className="mb-5 text-lg font-semibold text-slate-900">
            Renta actual
          </h2>

          <div className="space-y-4">
            <Info
              label="Vehículo rentado"
              value={client.rentedCar ?? "Sin vehículo asignado"}
            />
          </div>
        </section>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl bg-white p-6 shadow">
          <h2 className="mb-5 text-lg font-semibold text-slate-900">
            Contacto de emergencia
          </h2>

          <div className="space-y-4">
            <Info
              label="Nombre"
              value={client.emergencyContactName}
            />
            <Info
              label="Teléfono"
              value={client.emergencyContactPhone}
            />
          </div>
        </section>

        <section className="rounded-2xl bg-white p-6 shadow">
          <h2 className="mb-5 text-lg font-semibold text-slate-900">
            Notas
          </h2>

          <p className="text-sm text-slate-700">
            {client.notes ?? "Sin notas registradas."}
          </p>
        </section>
      </div>

      <section className="mt-6 rounded-2xl bg-white p-6 shadow">
        <h2 className="text-lg font-semibold text-slate-900">
          Historial del cliente
        </h2>

        <p className="mt-2 text-sm text-slate-600">
          Aquí se mostrará el historial de rentas, pagos y contratos relacionados con este cliente.
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