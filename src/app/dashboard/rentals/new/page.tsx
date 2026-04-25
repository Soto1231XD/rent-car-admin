import Link from "next/link";
import RentalForm from "@/components/rentals/RentalForm";

export default function NewRentalPage() {
  return (
    <div>
      <div className="mb-6">
        <Link
          href="/dashboard/rentals"
          className="text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          ← Volver a rentas
        </Link>

        <h1 className="mt-3 text-2xl font-bold text-slate-900">
          Nueva renta
        </h1>

        <p className="mt-1 text-sm text-slate-600">
          Registra una nueva renta o reservación de vehículo.
        </p>
      </div>

      <RentalForm />
    </div>
  );
}