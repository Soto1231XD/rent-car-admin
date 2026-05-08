import Link from "next/link";
import PriceForm from "@/components/prices/PriceForm";

export default function NewPricePage() {
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
          Nuevo precio
        </h1>

        <p className="mt-1 text-sm text-slate-600">
          Registra una nueva tarifa para una unidad.
        </p>
      </div>

      <PriceForm mode="create" />
    </div>
  );
}