import Link from "next/link";
import { notFound } from "next/navigation";
import AveoEntryForm from "@/components/aveo/AveoEntryForm";
import { getCar } from "@/lib/api";
import { formatCarLabel } from "@/lib/car-label";

type Props = {
  params: Promise<{
    carId: string;
  }>;
};

export default async function NewAveoEntryPage({ params }: Props) {
  const { carId } = await params;
  const car = await getCar(carId);

  if (!car || !car.excludedFromReportsAt) {
    notFound();
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          href={`/dashboard/aveo/${carId}`}
          className="text-sm text-slate-600 hover:text-slate-900"
        >
          ← Volver a {formatCarLabel(car)}
        </Link>

        <h1 className="mt-3 text-2xl font-bold text-slate-900">
          Nuevo movimiento
        </h1>
      </div>

      <AveoEntryForm mode="create" carId={carId} />
    </div>
  );
}
