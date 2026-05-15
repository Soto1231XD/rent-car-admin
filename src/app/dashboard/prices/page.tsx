import Link from "next/link";
import PricesTable from "@/components/prices/PricesTable";
import { getCars } from "@/lib/api";

export default async function PricesPage() {
  const cars = await getCars();

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Tarifas de carros
          </h1>

          <p className="mt-1 text-sm text-slate-600">
            Consulta depósitos, capacidad, precios por día, temporada alta y disponibilidad de cada unidad.
          </p>
        </div>

        <Link
          href="/dashboard/cars/new"
          className="inline-flex w-full justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 sm:w-auto"
        >
          Agregar carro
        </Link>
      </div>

      <PricesTable cars={cars} />
    </div>
  );
}
