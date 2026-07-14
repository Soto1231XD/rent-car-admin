import Link from "next/link";
import QuotesTable from "@/components/quotes/QuotesTable";
import { getQuotes } from "@/lib/api";

type Props = {
  searchParams: Promise<{
    success?: string;
  }>;
};

export default async function QuotesPage({ searchParams }: Props) {
  await searchParams;
  const quotes = await getQuotes();

  return (
    <div>
      <div className="mb-6 space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Cotizaciones</h1>
            <p className="mt-1 text-sm text-slate-600">
              Genera cotizaciones para posibles clientes, sin crear un cliente
              ni una renta en el sistema.
            </p>
          </div>

          <Link
            href="/dashboard/quotes/new"
            className="inline-flex w-full justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 sm:w-auto"
          >
            Nueva cotización
          </Link>
        </div>
      </div>

      <QuotesTable quotes={quotes} />
    </div>
  );
}