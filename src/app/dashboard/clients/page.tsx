import Link from "next/link";
import ClientsTable from "@/components/clients/ClientsTable";
import { getClients } from "@/lib/api";

type Props = {
  searchParams: Promise<{
    success?: string;
  }>;
};

export default async function ClientsPage({ searchParams }: Props) {
  await searchParams;
  const clients = await getClients();

  return (
    <div>
      <div className="mb-6 space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Clientes
            </h1>

            <p className="mt-1 text-sm text-slate-600">
              Administra la información de los clientes registrados.
            </p>
          </div>

          <Link
            href="/dashboard/clients/new"
            className="inline-flex w-full justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 sm:w-auto"
          >
            Agregar cliente
          </Link>
        </div>
      </div>

      <ClientsTable clients={clients} />
    </div>
  );
}
