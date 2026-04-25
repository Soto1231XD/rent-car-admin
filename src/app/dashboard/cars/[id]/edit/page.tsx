import Link from "next/link";
import CarForm, { CarFormData } from "@/components/cars/CarForm";
import { cars } from "@/lib/mock-data";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditCarPage({ params }: Props) {
  const { id } = await params;

  const car = cars.find((car) => car.id === Number(id));

  if (!car) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Carro no encontrado
        </h1>

        <Link
          href="/dashboard/cars"
          className="mt-4 inline-block text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          ← Volver a carros
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          href={`/dashboard/cars/${id}`}
          className="text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          ← Volver al detalle
        </Link>

        <h1 className="mt-3 text-2xl font-bold text-slate-900">
          Editar carro
        </h1>

        <p className="mt-1 text-sm text-slate-600">
          Actualiza la información del vehículo seleccionado.
        </p>
      </div>

      <CarForm mode="edit" initialData={car} carId={id} />
    </div>
  );
}