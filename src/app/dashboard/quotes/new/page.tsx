import Link from "next/link";
import QuoteForm from "@/components/quotes/QuoteForm";
import { getCars } from "@/lib/api";

export default async function NewQuotePage() {
  const cars = await getCars();

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/dashboard/quotes"
          className="text-sm text-slate-600 hover:text-slate-900"
        >
          ← Volver a cotizaciones
        </Link>

        <h1 className="mt-3 text-2xl font-bold text-slate-900">
          Nueva cotización
        </h1>
      </div>

      <QuoteForm cars={cars} />
    </div>
  );
}