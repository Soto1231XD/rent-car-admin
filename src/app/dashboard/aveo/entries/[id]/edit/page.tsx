import Link from "next/link";
import { notFound } from "next/navigation";
import AveoEntryForm from "@/components/aveo/AveoEntryForm";
import { getAveoEntry } from "@/lib/api";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditAveoEntryPage({ params }: Props) {
  const { id } = await params;
  const entry = await getAveoEntry(id);

  if (!entry || !entry.carId) {
    notFound();
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          href={`/dashboard/aveo/${entry.carId}`}
          className="text-sm text-slate-600 hover:text-slate-900"
        >
          ← Volver
        </Link>

        <h1 className="mt-3 text-2xl font-bold text-slate-900">
          Editar movimiento
        </h1>
      </div>

      <AveoEntryForm
        mode="edit"
        carId={entry.carId}
        initialData={entry}
        entryId={entry.id}
      />
    </div>
  );
}
