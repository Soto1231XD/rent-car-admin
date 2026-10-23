import Link from "next/link";
import { Calendar, ShieldCheck, Tag } from "lucide-react";
import PricesTable from "@/components/prices/PricesTable";
import SummaryCard from "@/components/ui/SummaryCard";
import { getCars } from "@/lib/api";
import { formatCurrency } from "@/lib/format-currency";

export default async function PricesPage() {
  const cars = await getCars();

  // Promedios informativos de las tarifas configuradas — no es dinero ya
  // cobrado, solo una referencia rápida de cómo están puestos los precios.
  const average = (values: number[]) =>
    values.length > 0 ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;

  const averageDailyPrice = average(cars.map((car) => car.dailyPrice));
  const averageHighSeasonPrice = average(cars.map((car) => car.highSeasonPrice));
  const averageDeposit = average(cars.map((car) => car.deposit));

  return (
    <div>
      <div className="mb-6 space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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

        <div className="grid gap-4 sm:grid-cols-3">
          <SummaryCard
            title="Precio promedio por día"
            value={formatCurrency(averageDailyPrice)}
            detail={`Sobre ${cars.length} ${cars.length === 1 ? "carro" : "carros"}`}
            icon={<Tag />}
          />
          <SummaryCard
            title="Promedio en temporada alta"
            value={formatCurrency(averageHighSeasonPrice)}
            detail="Tarifa configurada por día"
            icon={<Calendar />}
          />
          <SummaryCard
            title="Depósito promedio"
            value={formatCurrency(averageDeposit)}
            detail="Por vehículo"
            icon={<ShieldCheck />}
          />
        </div>
      </div>

      <PricesTable cars={cars} />
    </div>
  );
}
