import Link from "next/link";
import MembershipsTable from "@/components/memberships/MembershipsTable";
import { getMemberships } from "@/lib/api";

type Props = {
  searchParams: Promise<{
    success?: string;
  }>;
};

export default async function MembershipsPage({ searchParams }: Props) {
  await searchParams;
  const memberships = await getMemberships();

  return (
    <div>
      <div className="mb-6 space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Membresías</h1>
            <p className="mt-1 text-sm text-slate-600">
              Administra las membresías de los clientes y su estado de pago.
            </p>
          </div>

          <Link
            href="/dashboard/memberships/new"
            className="inline-flex w-full justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 sm:w-auto"
          >
            Agregar membresía
          </Link>
        </div>
      </div>

      <MembershipsTable memberships={memberships} />
    </div>
  );
}
