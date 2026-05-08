import Link from "next/link";
import PricesTable from "@/components/prices/PricesTable";
import { carPrices } from "@/lib/mock-data";

export default function PricesPage() {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Precios
          </h1>

          <p className="mt-1 text-sm text-slate-600">
            Consulta tarifas, depósitos, capacidad y disponibilidad de cada unidad.
          </p>
        </div>

        <Link
          href="/dashboard/prices/new"
          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
        >
          Nuevo precio
        </Link>
      </div>

      <PricesTable prices={carPrices} />
    </div>
  );
}