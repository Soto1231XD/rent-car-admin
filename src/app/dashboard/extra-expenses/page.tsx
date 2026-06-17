import Link from "next/link";
import ExtraExpensesTable from "@/components/extra-expenses/ExtraExpensesTable";
import { getExtraExpenses } from "@/lib/api";

type Props = {
  searchParams: Promise<{
    success?: string;
  }>;
};

export default async function ExtraExpensesPage({ searchParams }: Props) {
  await searchParams;
  const extraExpenses = await getExtraExpenses();

  return (
    <div>
      <div className="mb-6 space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Gastos extras
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Control de gastos operativos fuera del mantenimiento formal.
            </p>
          </div>

          <Link
            href="/dashboard/extra-expenses/new"
            className="inline-flex w-full justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm text-white sm:w-auto"
          >
            Nuevo gasto extra
          </Link>
        </div>
      </div>

      <ExtraExpensesTable extraExpenses={extraExpenses} />
    </div>
  );
}
