"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import UnifiedRentalDocument from "@/components/documents/UnifiedRentalDocument";
import { rentals } from "@/lib/mock-data";

export default function UnifiedRentalDocumentPage() {
  const params = useParams();

  const rental = rentals.find((rental) => rental.id === Number(params.id));

  if (!rental) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="rounded-2xl bg-white p-8 shadow">
          <h1 className="text-xl font-bold text-slate-900">
            Documento no encontrado
          </h1>

          <Link
            href="/dashboard/rentals"
            className="mt-4 inline-block text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            ← Volver a rentas
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 p-6 print:bg-white print:p-0">
      <div className="mx-auto mb-4 flex max-w-[816px] justify-between print:hidden">
        <Link
          href={`/dashboard/rentals/${rental.id}`}
          className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
        >
          ← Volver
        </Link>

        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
        >
          Imprimir / Guardar PDF
        </button>
      </div>

      <UnifiedRentalDocument rental={rental} />
    </main>
  );
}