import Link from "next/link";
import SavingsFundForm from "@/components/savings-fund/SavingsFundForm";
import { getCars, getClients } from "@/lib/api";

export default async function NewSavingsFundEntryPage() {
  const [cars, clients] = await Promise.all([getCars(), getClients()]);

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
          Nuevo movimiento
        </h1>
      </div>

      <SavingsFundForm mode="create" cars={cars} clients={clients} />
    </div>
  );
}
