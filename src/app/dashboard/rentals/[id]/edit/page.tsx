import Link from "next/link";
import RentalForm from "@/components/rentals/RentalForm";
import { rentals } from "@/lib/mock-data";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditRentalPage({ params }: Props) {
  const { id } = await params;

  const rental = rentals.find((r) => r.id === Number(id));

  if (!rental) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Renta no encontrada
        </h1>

        <Link
          href="/dashboard/rentals"
          className="mt-4 inline-block text-sm text-slate-600 hover:text-slate-900"
        >
          ← Volver a rentas
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          href={`/dashboard/rentals/${id}`}
          className="text-sm text-slate-600 hover:text-slate-900"
        >
          ← Volver al detalle
        </Link>

        <h1 className="mt-3 text-2xl font-bold text-slate-900">
          Editar renta
        </h1>

        <p className="mt-1 text-sm text-slate-600">
          Actualiza la información de la renta.
        </p>
      </div>

      <RentalForm
        mode="edit"
        initialData={rental}
        rentalId={id}
      />
    </div>
  );
}