import Link from "next/link";
import { getCars, getQuote } from "@/lib/api";
import QuoteForm from "@/components/quotes/QuoteForm";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditQuotePage({ params }: Props) {
  const { id } = await params;
  const [quote, cars] = await Promise.all([getQuote(id), getCars()]);

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

  if (quote.rental) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Esta cotización ya no se puede editar
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Ya tiene una renta creada, así que quedó congelada para no
          desincronizar los datos.
        </p>

        <Link
          href={`/dashboard/quotes/${quote.id}`}
          className="mt-4 inline-block text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          ← Volver a la cotización
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          href={`/dashboard/quotes/${quote.id}`}
          className="text-sm text-slate-600 hover:text-slate-900"
        >
          ← Volver a la cotización
        </Link>

        <h1 className="mt-3 text-2xl font-bold text-slate-900">
          Editar cotización {quote.folio}
        </h1>
      </div>

      <QuoteForm cars={cars} mode="edit" initialData={quote} quoteId={quote.id} />
    </div>
  );
}
