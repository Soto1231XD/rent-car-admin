import Link from "next/link";
import MileageControlTable from "@/components/maintenance/MileageControlTable";
import { getMaintenances } from "@/lib/api";

type Props = {
  searchParams: Promise<{
    success?: string;
  }>;
};

export default async function MileageControlPage({ searchParams }: Props) {
  await searchParams;
  const allMaintenances = await getMaintenances();
  const revisions = allMaintenances.filter(
    (maintenance) => maintenance.recordType === "REVISION"
  );

  return (
    <div>
      <div className="mb-6 space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Control de kilometraje
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Revisiones de kilometraje y próximo servicio previsto por vehículo.
            </p>
          </div>

          <Link
            href="/dashboard/mileage-control/new"
            className="inline-flex w-full justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm text-white sm:w-auto"
          >
            Nueva revisión
          </Link>
        </div>
      </div>

      <MileageControlTable revisions={revisions} />
    </div>
  );
}
