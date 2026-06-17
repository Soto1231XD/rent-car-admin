import Link from "next/link";
import { notFound } from "next/navigation";
import ExtraExpenseForm from "@/components/extra-expenses/ExtraExpenseForm";
import { getCars, getExtraExpense } from "@/lib/api";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditExtraExpensePage({ params }: Props) {
  const { id } = await params;
  const [extraExpense, cars] = await Promise.all([
    getExtraExpense(id),
    getCars(),
  ]);

  if (!extraExpense) {
    notFound();
  }

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
          Editar gasto extra
        </h1>
      </div>

      <ExtraExpenseForm
        mode="edit"
        cars={cars}
        initialData={extraExpense}
        extraExpenseId={extraExpense.id}
      />
    </div>
  );
}
