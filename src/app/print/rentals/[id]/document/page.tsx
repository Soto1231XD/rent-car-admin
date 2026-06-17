import Link from "next/link";
import UnifiedRentalDocument from "@/components/documents/UnifiedRentalDocument";
import PrintButton from "@/components/documents/PrintButton";
import { getRental } from "@/lib/api";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function PrintRentalDocumentPage({ params }: Props) {
  const { id } = await params;
  const rental = await getRental(id);

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

  if (rental.renterType === "COMISIONISTA") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
        <div className="max-w-md rounded-2xl bg-white p-8 text-center shadow">
          <h1 className="text-xl font-bold text-slate-900">
            Contrato no disponible
          </h1>
          <p className="mt-3 text-sm text-slate-600">
            Esta renta pertenece a un comisionista, por lo que no genera
            contrato de arrendamiento.
          </p>
          <Link
            href={`/dashboard/rentals/${rental.id}`}
            className="mt-5 inline-block rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
          >
            Volver a la renta
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
        <PrintButton label="Imprimir / Guardar PDF" />
      </div>

      <UnifiedRentalDocument rental={rental} />
    </main>
  );
}
