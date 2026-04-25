import Link from "next/link";
import ClientForm from "@/components/clients/ClientForm";
import { clients } from "@/lib/mock-data";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditClientPage({ params }: Props) {
  const { id } = await params;

  const client = clients.find((client) => client.id === Number(id));

  if (!client) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Cliente no encontrado
        </h1>

        <Link
          href="/dashboard/clients"
          className="mt-4 inline-block text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          ← Volver a clientes
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          href={`/dashboard/clients/${id}`}
          className="text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          ← Volver al detalle
        </Link>

        <h1 className="mt-3 text-2xl font-bold text-slate-900">
          Editar cliente
        </h1>

        <p className="mt-1 text-sm text-slate-600">
          Actualiza la información del cliente seleccionado.
        </p>
      </div>

      <ClientForm
        mode="edit"
        initialData={client}
        clientId={id}
      />
    </div>
  );
}