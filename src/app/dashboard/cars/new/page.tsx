import Link from "next/link";
import CarForm from "@/components/cars/CarForm";

export default function NewCarPage() {
  return (
    <div>
      <div className="mb-6">
        <Link
          href="/dashboard/cars"
          className="text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          ← Volver a carros
        </Link>

        <h1 className="mt-3 text-2xl font-bold text-slate-900">
          Agregar carro
        </h1>

        <p className="mt-1 text-sm text-slate-600">
          Registra la información principal del vehículo.
        </p>
      </div>

      <CarForm mode="create" />
    </div>
  );
}