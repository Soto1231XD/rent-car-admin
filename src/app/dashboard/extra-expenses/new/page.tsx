import Link from "next/link";
import ExtraExpenseForm from "@/components/extra-expenses/ExtraExpenseForm";
import { getCars } from "@/lib/api";

export default async function NewExtraExpensePage() {
  const cars = await getCars();

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/dashboard/extra-expenses"
          className="text-sm text-slate-600 hover:text-slate-900"
        >
          ← Volver a gastos extras
        </Link>

        <h1 className="mt-3 text-2xl font-bold text-slate-900">
          Nuevo gasto extra
        </h1>
      </div>

      <ExtraExpenseForm mode="create" cars={cars} />
    </div>
  );
}
