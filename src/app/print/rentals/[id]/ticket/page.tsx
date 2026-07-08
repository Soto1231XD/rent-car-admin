import Link from "next/link";
import RentalTicket from "@/components/documents/RentalTicket";
import PrintButton from "@/components/documents/PrintButton";
import { getRental } from "@/lib/api";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function PrintRentalTicketPage({ params }: Props) {
  const { id } = await params;
  const rental = await getRental(id);

  if (!rental) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="rounded-2xl bg-white p-8 shadow">
          <h1 className="text-xl font-bold text-slate-900">
            Ticket no encontrado
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
      <div className="mx-auto mb-4 flex max-w-[920px] justify-between print:hidden">
        <Link
          href={`/dashboard/rentals/${rental.id}`}
          className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
        >
          ← Volver
        </Link>
        <PrintButton label="Imprimir cotizacion" />
      </div>

      <RentalTicket rental={rental} />
    </main>
  );
}
