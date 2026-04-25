import Link from "next/link";
import ClientForm from "@/components/clients/ClientForm";

export default function NewClientPage() {
  return (
    <div>
      <div className="mb-6">
        <Link
          href="/dashboard/clients"
          className="text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          ← Volver a clientes
        </Link>

        <h1 className="mt-3 text-2xl font-bold text-slate-900">
          Agregar cliente
        </h1>

        <p className="mt-1 text-sm text-slate-600">
          Registra la información principal del cliente.
        </p>
      </div>

      <ClientForm mode="create" />
    </div>
  );
}