import Link from "next/link";
import { notFound } from "next/navigation";
import SavingsFundForm from "@/components/savings-fund/SavingsFundForm";
import { getCars, getClients, getSavingsFundEntry } from "@/lib/api";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditSavingsFundEntryPage({ params }: Props) {
  const { id } = await params;
  const [entry, cars, clients] = await Promise.all([
    getSavingsFundEntry(id),
    getCars(),
    getClients(),
  ]);

  if (!entry) {
    notFound();
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/dashboard/savings-fund"
          className="text-sm text-slate-600 hover:text-slate-900"
        >
          ← Volver al fondo de ahorro
        </Link>

        <h1 className="mt-3 text-2xl font-bold text-slate-900">
          Editar movimiento
        </h1>
      </div>

      <SavingsFundForm
        mode="edit"
        cars={cars}
        clients={clients}
        initialData={entry}
        entryId={entry.id}
      />
    </div>
  );
}
