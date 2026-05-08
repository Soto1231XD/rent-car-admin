import Link from "next/link";
import PriceForm from "@/components/prices/PriceForm";
import { carPrices } from "@/lib/mock-data";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditPricePage({ params }: Props) {
  const { id } = await params;

  const price = carPrices.find((price) => price.id === Number(id));

  if (!price) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Precio no encontrado
        </h1>

        <Link
          href="/dashboard/prices"
          className="mt-4 inline-block text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          ← Volver a precios
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/dashboard/prices"
          className="text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          ← Volver a precios
        </Link>

        <h1 className="mt-3 text-2xl font-bold text-slate-900">
          Editar precio
        </h1>

        <p className="mt-1 text-sm text-slate-600">
          Actualiza la tarifa de {price.model}.
        </p>
      </div>

      <PriceForm mode="edit" initialData={price} priceId={id} />
    </div>
  );
}