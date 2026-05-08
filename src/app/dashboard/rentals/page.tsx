import Link from "next/link";
import { rentals } from "@/lib/mock-data";
import RentalsTable from "@/components/rentals/RentalsTable";

export default function RentalsPage() {
  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Rentas
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Gestiona las rentas activas y pasadas.
          </p>
        </div>

        <Link
          href="/dashboard/rentals/new"
          className="inline-flex w-full justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 sm:w-auto"
        >
          Nueva renta
        </Link>
      </div>

      <RentalsTable rentals={rentals} />
    </div>
  );
}
