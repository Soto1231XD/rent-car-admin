import Link from "next/link";
import { rentals } from "@/lib/mock-data";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function RentalDetailPage({ params }: Props) {
  const { id } = await params;

  const rental = rentals.find((rental) => rental.id === Number(id));

  if (!rental) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Renta no encontrada
        </h1>

        <Link
          href="/dashboard/rentals"
          className="mt-4 inline-block text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          ← Volver a rentas
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <Link
            href="/dashboard/rentals"
            className="text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            ← Volver a rentas
          </Link>

          <h1 className="mt-3 text-2xl font-bold text-slate-900">
            Renta #{rental.id}
          </h1>

          <p className="mt-1 text-sm text-slate-600">
            Información detallada de la renta.
          </p>
        </div>

        <Link
          href={`/dashboard/rentals/${rental.id}/edit`}
          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
        >
          Editar renta
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="rounded-2xl bg-white p-6 shadow lg:col-span-2">
          <h2 className="mb-5 text-lg font-semibold text-slate-900">
            Datos de la renta
          </h2>

          <div className="grid gap-4 md:grid-cols-2">
            <Info label="Cliente" value={rental.clientName} />
            <Info label="Vehículo" value={rental.carName} />
            <Info label="Fecha de entrega" value={rental.startDate} />
            <Info label="Fecha de devolución" value={rental.endDate} />
            <Info
              label="Total"
              value={`$${rental.totalPrice.toLocaleString("es-MX")} MXN`}
            />
            <Info label="Estado" value={rental.status} />
          </div>
        </section>

        <section className="rounded-2xl bg-white p-6 shadow">
  <h2 className="mb-2 text-lg font-semibold text-slate-900">
    Documentos de renta
  </h2>

  <p className="mb-5 text-sm text-slate-600">
    Genera los documentos relacionados con esta renta.
  </p>

  <div className="space-y-3">
    <button
      type="button"
      
      className="w-full rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
    >
      Generar contrato de arrendamiento
    </button>

    <button
      type="button"
      
      className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
    >
      Generar carta responsiva
    </button>

    <button
      type="button"
      
      className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
    >
      Generar inventario vehicular
    </button>

    <button
      type="button"
      
      className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
    >
      Generar ticket
    </button>
  </div>
</section>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl bg-white p-6 shadow">
          <h2 className="mb-5 text-lg font-semibold text-slate-900">
            Resumen de pagos
          </h2>

          <div className="space-y-4">
            <Info
              label="Total de la renta"
              value={`$${rental.totalPrice.toLocaleString("es-MX")} MXN`}
            />
            <Info label="Pagado" value="$0 MXN" />
            <Info
              label="Saldo pendiente"
              value={`$${rental.totalPrice.toLocaleString("es-MX")} MXN`}
            />
          </div>
        </section>

       <section className="rounded-2xl bg-white p-6 shadow">
  <h2 className="mb-5 text-lg font-semibold text-slate-900">
    Historial de documentos
  </h2>

  <div className="space-y-3 text-sm text-slate-700">
    <div className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3">
      <span>Contrato de arrendamiento</span>
      <span className="text-slate-400">Pendiente</span>
    </div>

    <div className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3">
      <span>Carta responsiva</span>
      <span className="text-slate-400">Pendiente</span>
    </div>

    <div className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3">
      <span>Inventario vehicular</span>
      <span className="text-slate-400">Pendiente</span>
    </div>

    <div className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3">
      <span>Ticket</span>
      <span className="text-slate-400">Pendiente</span>
    </div>
  </div>
</section>
      </div>
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