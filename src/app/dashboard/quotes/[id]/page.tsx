import Link from "next/link";
import { getQuote } from "@/lib/api";
import DeleteResourceButton from "@/components/ui/DeleteResourceButton";

type Props = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    success?: string;
  }>;
};

export default async function QuoteDetailPage({ params, searchParams }: Props) {
  const { id } = await params;
  await searchParams;
  const quote = await getQuote(id);

  if (!quote) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Cotización no encontrada
        </h1>

        <Link
          href="/dashboard/quotes"
          className="mt-4 inline-block text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          ← Volver a cotizaciones
        </Link>
      </div>
    );
  }

  const carName = quote.car
    ? `${quote.car.brand} ${quote.car.model} ${quote.car.year}`
    : "Vehículo no disponible";

  return (
    <div>
      <div className="mb-6 space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Link
              href="/dashboard/quotes"
              className="text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              ← Volver a cotizaciones
            </Link>

            <h1 className="mt-3 text-2xl font-bold tracking-wide text-slate-900">
              {quote.folio}
            </h1>

            <p className="mt-1 text-sm text-slate-600">
              Cotización para posible cliente. No está ligada a ningún cliente
              ni renta registrada.
            </p>
          </div>

          <DeleteResourceButton
            id={quote.id}
            resourceType="quote"
            resourceName={`${quote.folio} - ${carName}`}
            redirectTo="/dashboard/quotes"
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="rounded-2xl bg-white p-4 shadow sm:p-6 lg:col-span-2">
          <h2 className="mb-5 text-lg font-semibold text-slate-900">
            Datos de la cotización
          </h2>

          <div className="grid gap-4 md:grid-cols-2">
            <Info label="Vehículo" value={carName} />
            <Info label="Días" value={quote.daysCharged} />
            <Info label="Fecha de entrega" value={formatDate(quote.startDate)} />
            <Info label="Fecha de devolución" value={formatDate(quote.endDate)} />
            <Info label="Tarifa aplicada" value={formatPriceMode(quote.priceMode)} />
            <Info label="Precio por día" value={formatMoney(quote.dailyRateApplied)} />
            <Info label="Total" value={formatMoney(quote.totalPrice)} />
            <Info label="Depósito en garantía" value={formatMoney(quote.deposit)} />
            <Info label="Cuota de entrega" value={formatMoney(quote.deliveryFee)} />
            <Info label="Cuota de devolución" value={formatMoney(quote.returnFee)} />
          </div>

          {quote.notes && (
            <div className="mt-5 border-t border-slate-100 pt-5">
              <p className="text-sm font-medium text-slate-500">
                Notas internas
              </p>
              <p className="mt-1 text-sm text-slate-700">{quote.notes}</p>
            </div>
          )}
        </section>

        <section className="rounded-2xl bg-white p-4 shadow sm:p-6">
          <h2 className="mb-2 text-lg font-semibold text-slate-900">
            Documento
          </h2>

          <p className="mb-5 text-sm text-slate-600">
            Genera el documento de cotización para enviar o entregar al
            posible cliente.
          </p>

          <Link
            href={`/print/quotes/${quote.id}`}
            className="block w-full rounded-xl bg-slate-900 px-4 py-2 text-center text-sm font-medium text-white hover:bg-slate-700"
          >
            Generar cotización
          </Link>
        </section>
      </div>
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

function formatDate(value: string) {
  return value.slice(0, 10);
}

function formatMoney(value: number) {
  return `$${value.toLocaleString("es-MX")} MXN`;
}

function formatPriceMode(priceMode: string) {
  const labels: Record<string, string> = {
    NORMAL: "Precio normal",
    TEMPORADA_ALTA: "Temporada alta",
  };

  return labels[priceMode] ?? "Precio normal";
}